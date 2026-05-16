import type { D1Database } from "@cloudflare/workers-types";

const CONFIDENCE_BASE: Record<string, number> = {
  official: 1.0,
  high: 0.9,
  medium: 0.6,
  low: 0.3,
  unverified: 0.2,
};

function daysBetween(dateStr: string | null, fallbackStr: string): number {
  const anchor = dateStr ? new Date(dateStr) : new Date(fallbackStr);
  const now = Date.now();
  return Math.max(0, (now - anchor.getTime()) / (1000 * 60 * 60 * 24));
}

function computeDecayFactor(lastVerifiedAt: string | null, createdAt: string): number {
  const days = daysBetween(lastVerifiedAt, createdAt);
  if (days <= 30) return 1.0;
  return Math.pow(0.98, days - 30);
}

export async function computeSourceReliability(db: D1Database, sourceId: string): Promise<number> {
  const source = await db
    .prepare("SELECT patrol_status, last_checked_at, created_at FROM radar_sources WHERE id = ?")
    .bind(sourceId)
    .first<{ patrol_status: string; last_checked_at: string | null; created_at: string }>();

  if (!source) return 0.5;

  // Get or create reliability record
  let reliability = await db
    .prepare("SELECT * FROM source_reliability WHERE source_id = ?")
    .bind(sourceId)
    .first<Record<string, unknown>>();

  const now = new Date().toISOString();
  const totalChecks = reliability ? Number(reliability.total_checks ?? 0) + 1 : 1;
  const prevSuccessful = reliability ? Number(reliability.successful_checks ?? 0) : 0;
  const prevFailed = reliability ? Number(reliability.failed_checks ?? 0) : 0;
  const prevChanged = reliability ? Number(reliability.changed_checks ?? 0) : 0;

  const successful = prevSuccessful + (["ok", "changed"].includes(source.patrol_status) ? 1 : 0);
  const failed = prevFailed + (source.patrol_status === "failed" ? 1 : 0);
  const changed = prevChanged + (source.patrol_status === "changed" ? 1 : 0);

  const successRate = successful / Math.max(totalChecks, 1);
  const daysSinceCheck = daysBetween(source.last_checked_at, source.created_at);
  let stalePenalty = 0;
  if (daysSinceCheck > 30) stalePenalty = 0.5;
  else if (daysSinceCheck > 14) stalePenalty = 0.2;

  const score = Math.max(0, Math.min(1, successRate * (1 - stalePenalty)));

  const relId = reliability ? String(reliability.id) : `rel-${sourceId}`;
  await db
    .prepare(
      `INSERT OR REPLACE INTO source_reliability (id, source_id, total_checks, successful_checks, failed_checks, changed_checks, reliability_score, last_computed_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(relId, sourceId, totalChecks, successful, failed, changed, score, now, reliability ? String(reliability.created_at) : now, now)
    .run();

  await db
    .prepare("UPDATE radar_sources SET reliability_score = ?, updated_at = ? WHERE id = ?")
    .bind(score, now, sourceId)
    .run();

  return score;
}

export async function computeResourceConfidence(db: D1Database, resourceId: string): Promise<number> {
  const resource = await db
    .prepare("SELECT * FROM intelligence_resources WHERE id = ?")
    .bind(resourceId)
    .first<Record<string, unknown>>();

  if (!resource) return 0;

  // Base score from text confidence
  const confidenceText = resource.confidence ? String(resource.confidence) : "";
  let baseScore = CONFIDENCE_BASE[confidenceText] ?? 0.5;

  // Source reliability adjustment
  const sourceId = resource.candidate_id ? null : null; // No direct source_id on resources, check via candidate
  // For simplicity, use the source field to look up source reliability
  const sourceStr = resource.source ? String(resource.source) : "";
  if (sourceStr.startsWith("patrol:")) {
    const sourceName = sourceStr.replace("patrol:", "");
    const src = await db
      .prepare("SELECT reliability_score FROM radar_sources WHERE name = ?")
      .bind(sourceName)
      .first<{ reliability_score: number | null }>();
    if (src?.reliability_score != null) {
      baseScore *= (0.5 + 0.5 * src.reliability_score);
    }
  }

  // Evidence bonuses
  if (resource.content_text) baseScore += 0.1;
  if (resource.university_id || resource.program_id || resource.professor_id) baseScore += 0.05;

  // Decay
  const lastVerified = resource.confidence_last_verified ? String(resource.confidence_last_verified) : null;
  const createdAt = resource.created_at ? String(resource.created_at) : new Date().toISOString();
  const decay = computeDecayFactor(lastVerified, createdAt);
  baseScore *= decay;

  const score = Math.max(0, Math.min(1, baseScore));
  const now = new Date().toISOString();
  await db
    .prepare("UPDATE intelligence_resources SET confidence_score = ?, updated_at = ? WHERE id = ?")
    .bind(score, now, resourceId)
    .run();

  return score;
}

export async function applyConfidenceDecay(db: D1Database): Promise<{ decayed: number }> {
  let decayed = 0;

  // Find resources not verified in 30+ days
  const rows = await db
    .prepare(
      `SELECT id FROM intelligence_resources
       WHERE (confidence_last_verified IS NULL AND created_at < datetime('now', '-30 day'))
          OR (confidence_last_verified < datetime('now', '-30 day'))`,
    )
    .all<{ id: string }>();

  for (const row of rows.results || []) {
    const newScore = await computeResourceConfidence(db, row.id);
    decayed++;

    // If score dropped below 0.3, auto-create stale_unverified conflict
    if (newScore < 0.3) {
      const conflictId = `conflict-stale_unverified-resource-${row.id}-none`;
      await db
        .prepare(
          `INSERT OR IGNORE INTO conflicts (id, conflict_type, status, entity_type, entity_id, field_name, description, sources_involved, auto_detected, detected_at, created_at, updated_at)
           VALUES (?, 'stale_unverified', 'open', 'resource', ?, NULL, ?, ?, 1, datetime('now'), datetime('now'), datetime('now'))`,
        )
        .bind(conflictId, row.id, `Resource confidence decayed to ${newScore.toFixed(2)}`, JSON.stringify([{ table: "intelligence_resources", id: row.id }]))
        .run();
    }
  }

  return { decayed };
}

export async function runConfidenceUpdate(db: D1Database): Promise<{ updated: number }> {
  let updated = 0;

  // Recompute all source reliability
  const sources = await db
    .prepare("SELECT id FROM radar_sources WHERE enabled = 1 AND source_type != 'arxiv'")
    .all<{ id: string }>();
  for (const src of sources.results || []) {
    await computeSourceReliability(db, src.id);
    updated++;
  }

  // Recompute all resource confidence
  const resources = await db
    .prepare("SELECT id FROM intelligence_resources")
    .all<{ id: string }>();
  for (const res of resources.results || []) {
    await computeResourceConfidence(db, res.id);
    updated++;
  }

  // Apply decay
  const decayResult = await applyConfidenceDecay(db);
  updated += decayResult.decayed;

  return { updated };
}
