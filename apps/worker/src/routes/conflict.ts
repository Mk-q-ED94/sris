import type { D1Database } from "@cloudflare/workers-types";

interface ConflictRow {
  id: string;
  conflict_type: string;
  status: string;
  entity_type: string;
  entity_id: string | null;
  field_name: string | null;
  description: string | null;
  sources_involved: string;
  auto_detected: number;
}

function conflictId(type: string, entityType: string, entityId: string | null, fieldName: string | null): string {
  return `conflict-${type}-${entityType}-${entityId ?? "none"}-${fieldName ?? "none"}`;
}

async function insertConflict(db: D1Database, row: ConflictRow): Promise<void> {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT OR IGNORE INTO conflicts (id, conflict_type, status, entity_type, entity_id, field_name, description, sources_involved, auto_detected, detected_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(row.id, row.conflict_type, row.status, row.entity_type, row.entity_id, row.field_name, row.description, row.sources_involved, row.auto_detected, now, now, now)
    .run();
}

export async function detectUrlDuplicates(db: D1Database): Promise<number> {
  let count = 0;

  // candidates vs resources
  const cr = await db
    .prepare(
      `SELECT pc.id as cand_id, pc.url, pc.title as cand_title, ir.id as res_id, ir.title as res_title
       FROM paper_candidates pc
       JOIN intelligence_resources ir ON pc.url = ir.url
       WHERE pc.status != 'ignored'`,
    )
    .all<{ cand_id: string; url: string; cand_title: string; res_id: string; res_title: string }>();
  for (const row of cr.results || []) {
    const sources = JSON.stringify([
      { table: "paper_candidates", id: row.cand_id, value: row.cand_title },
      { table: "intelligence_resources", id: row.res_id, value: row.res_title },
    ]);
    await insertConflict(db, {
      id: conflictId("url_duplicate", "resource", row.res_id, null),
      conflict_type: "url_duplicate",
      status: "open",
      entity_type: "resource",
      entity_id: row.res_id,
      field_name: null,
      description: `Same URL exists in candidates and resources: ${row.url}`,
      sources_involved: sources,
      auto_detected: 1,
    });
    count++;
  }

  // candidates vs papers
  const cp = await db
    .prepare(
      `SELECT pc.id as cand_id, pc.url, pc.title as cand_title, p.id as paper_id, p.title as paper_title
       FROM paper_candidates pc
       JOIN papers p ON pc.url = p.url
       WHERE pc.status != 'ignored'`,
    )
    .all<{ cand_id: string; url: string; cand_title: string; paper_id: string; paper_title: string }>();
  for (const row of cp.results || []) {
    const sources = JSON.stringify([
      { table: "paper_candidates", id: row.cand_id, value: row.cand_title },
      { table: "papers", id: row.paper_id, value: row.paper_title },
    ]);
    await insertConflict(db, {
      id: conflictId("url_duplicate", "paper", row.paper_id, null),
      conflict_type: "url_duplicate",
      status: "open",
      entity_type: "paper",
      entity_id: row.paper_id,
      field_name: null,
      description: `Same URL exists in candidates and papers: ${row.url}`,
      sources_involved: sources,
      auto_detected: 1,
    });
    count++;
  }

  // resources vs papers
  const rp = await db
    .prepare(
      `SELECT ir.id as res_id, ir.url, ir.title as res_title, p.id as paper_id, p.title as paper_title
       FROM intelligence_resources ir
       JOIN papers p ON ir.url = p.url`,
    )
    .all<{ res_id: string; url: string; res_title: string; paper_id: string; paper_title: string }>();
  for (const row of rp.results || []) {
    const sources = JSON.stringify([
      { table: "intelligence_resources", id: row.res_id, value: row.res_title },
      { table: "papers", id: row.paper_id, value: row.paper_title },
    ]);
    await insertConflict(db, {
      id: conflictId("url_duplicate", "resource", row.res_id, "paper"),
      conflict_type: "url_duplicate",
      status: "open",
      entity_type: "resource",
      entity_id: row.res_id,
      field_name: "paper",
      description: `Same URL exists in resources and papers: ${row.url}`,
      sources_involved: sources,
      auto_detected: 1,
    });
    count++;
  }

  return count;
}

export async function detectTitleDuplicates(db: D1Database): Promise<number> {
  let count = 0;

  const rows = await db
    .prepare(
      `SELECT a.id as id_a, a.title as title_a, b.id as id_b, b.title as title_b, 'resource' as ent_type
       FROM intelligence_resources a
       JOIN intelligence_resources b ON a.id < b.id AND LOWER(SUBSTR(a.title, 1, 80)) = LOWER(SUBSTR(b.title, 1, 80))
       UNION ALL
       SELECT pc.id, pc.title, ir.id, ir.title, 'mixed'
       FROM paper_candidates pc
       JOIN intelligence_resources ir ON LOWER(SUBSTR(pc.title, 1, 80)) = LOWER(SUBSTR(ir.title, 1, 80))
       WHERE pc.status != 'ignored'`,
    )
    .all<{ id_a: string; title_a: string; id_b: string; title_b: string; ent_type: string }>();

  for (const row of rows.results || []) {
    const sources = JSON.stringify([
      { table: row.ent_type === "mixed" ? "paper_candidates" : "intelligence_resources", id: row.id_a, value: row.title_a },
      { table: "intelligence_resources", id: row.id_b, value: row.title_b },
    ]);
    await insertConflict(db, {
      id: conflictId("title_duplicate", "resource", row.id_b, null),
      conflict_type: "title_duplicate",
      status: "open",
      entity_type: "resource",
      entity_id: row.id_b,
      field_name: null,
      description: `Similar title: "${row.title_a}" and "${row.title_b}"`,
      sources_involved: sources,
      auto_detected: 1,
    });
    count++;
  }

  return count;
}

export async function detectValueMismatches(db: D1Database): Promise<number> {
  let count = 0;

  // Programs with different deadline from admission_notice resources
  const deadlineMismatches = await db
    .prepare(
      `SELECT p.id as program_id, p.program_name, p.deadline as program_deadline,
              ir.id as resource_id, ir.title as resource_title
       FROM programs p
       JOIN intelligence_resources ir ON ir.program_id = p.id
       WHERE ir.resource_type IN ('admission_notice', 'program_page')
         AND ir.confidence_last_verified IS NULL OR ir.confidence_last_verified > datetime('now', '-90 day')`,
    )
    .all<{ program_id: string; program_name: string; program_deadline: string | null; resource_id: string; resource_title: string }>();

  const programDeadlines = new Map<string, Set<string>>();
  for (const row of deadlineMismatches.results || []) {
    if (!row.program_deadline) continue;
    const key = row.program_id;
    if (!programDeadlines.has(key)) programDeadlines.set(key, new Set());
    programDeadlines.get(key)!.add(row.program_deadline);
  }
  for (const [programId, deadlines] of programDeadlines) {
    if (deadlines.size <= 1) continue;
    const prog = await db.prepare("SELECT program_name, deadline FROM programs WHERE id = ?").bind(programId).first<{ program_name: string; deadline: string | null }>();
    if (!prog) continue;
    const sources = JSON.stringify([
      { table: "programs", id: programId, value: prog.deadline },
    ]);
    await insertConflict(db, {
      id: conflictId("value_mismatch", "program", programId, "deadline"),
      conflict_type: "value_mismatch",
      status: "open",
      entity_type: "program",
      entity_id: programId,
      field_name: "deadline",
      description: `Program "${prog.program_name}" has multiple deadline values`,
      sources_involved: sources,
      auto_detected: 1,
    });
    count++;
  }

  // Professor with different keywords from multiple professor_page resources
  const profKeywordMismatches = await db
    .prepare(
      `SELECT prof.id as professor_id, prof.name, prof.research_keywords,
              ir.id as resource_id, ir.excerpt
       FROM professors prof
       JOIN intelligence_resources ir ON ir.professor_id = prof.id
       WHERE ir.resource_type = 'professor_page'
       LIMIT 100`,
    )
    .all<{ professor_id: string; name: string; research_keywords: string; resource_id: string; excerpt: string | null }>();

  const profResources = new Map<string, string[]>();
  for (const row of profKeywordMismatches.results || []) {
    if (!profResources.has(row.professor_id)) profResources.set(row.professor_id, []);
    if (row.excerpt) profResources.get(row.professor_id)!.push(row.excerpt);
  }
  for (const [profId, excerpts] of profResources) {
    if (excerpts.length < 2) continue;
    // Check if excerpts differ (simple: compare normalized first 200 chars)
    const normalized = excerpts.map((e) => e.slice(0, 200).toLowerCase().trim());
    const unique = new Set(normalized);
    if (unique.size <= 1) continue;
    const prof = await db.prepare("SELECT name, research_keywords FROM professors WHERE id = ?").bind(profId).first<{ name: string; research_keywords: string }>();
    if (!prof) continue;
    await insertConflict(db, {
      id: conflictId("value_mismatch", "professor", profId, "research_keywords"),
      conflict_type: "value_mismatch",
      status: "open",
      entity_type: "professor",
      entity_id: profId,
      field_name: "research_keywords",
      description: `Professor "${prof.name}" has differing information across sources`,
      sources_involved: JSON.stringify([{ table: "professors", id: profId, value: prof.research_keywords }]),
      auto_detected: 1,
    });
    count++;
  }

  return count;
}

export async function detectStaleUnverified(db: D1Database): Promise<number> {
  let count = 0;

  // Resources not verified in 90+ days
  const staleResources = await db
    .prepare(
      `SELECT id, title FROM intelligence_resources
       WHERE (confidence_last_verified IS NULL AND created_at < datetime('now', '-90 day'))
          OR (confidence_last_verified < datetime('now', '-90 day'))`,
    )
    .all<{ id: string; title: string }>();

  for (const row of staleResources.results || []) {
    await insertConflict(db, {
      id: conflictId("stale_unverified", "resource", row.id, null),
      conflict_type: "stale_unverified",
      status: "open",
      entity_type: "resource",
      entity_id: row.id,
      field_name: null,
      description: `Resource "${row.title}" has not been verified in 90+ days`,
      sources_involved: JSON.stringify([{ table: "intelligence_resources", id: row.id }]),
      auto_detected: 1,
    });
    count++;
  }

  // Sources not checked in 30+ days
  const staleSources = await db
    .prepare(
      `SELECT id, name FROM radar_sources
       WHERE enabled = 1 AND source_type != 'arxiv'
         AND (last_checked_at IS NULL OR last_checked_at < datetime('now', '-30 day'))`,
    )
    .all<{ id: string; name: string }>();

  for (const row of staleSources.results || []) {
    await insertConflict(db, {
      id: conflictId("stale_unverified", "source", row.id, null),
      conflict_type: "stale_unverified",
      status: "open",
      entity_type: "source",
      entity_id: row.id,
      field_name: null,
      description: `Source "${row.name}" has not been checked in 30+ days`,
      sources_involved: JSON.stringify([{ table: "radar_sources", id: row.id }]),
      auto_detected: 1,
    });
    count++;
  }

  return count;
}

export async function runConflictDetection(db: D1Database): Promise<{ detected: number }> {
  // Close previously open auto-detected conflicts before re-detecting
  await db
    .prepare("UPDATE conflicts SET status = 'resolved', resolved_at = datetime('now'), updated_at = datetime('now') WHERE status = 'open' AND auto_detected = 1")
    .run();

  const urlDups = await detectUrlDuplicates(db);
  const titleDups = await detectTitleDuplicates(db);
  const valueMismatches = await detectValueMismatches(db);
  const stale = await detectStaleUnverified(db);

  return { detected: urlDups + titleDups + valueMismatches + stale };
}

export async function resolveConflict(
  db: D1Database,
  id: string,
  resolution: { status: string; resolved_value?: string; resolution_notes?: string },
): Promise<{ ok: boolean }> {
  const now = new Date().toISOString();
  const conflict = await db.prepare("SELECT * FROM conflicts WHERE id = ?").bind(id).first<Record<string, unknown>>();
  if (!conflict) return { ok: false };

  await db
    .prepare(
      "UPDATE conflicts SET status = ?, resolved_value = ?, resolution_notes = ?, resolved_at = ?, updated_at = ? WHERE id = ?",
    )
    .bind(resolution.status, resolution.resolved_value ?? null, resolution.resolution_notes ?? null, now, now, id)
    .run();

  // If resolved with a value and entity_type is program, write back
  if (resolution.status === "resolved" && resolution.resolved_value && conflict.entity_type === "program" && conflict.field_name && conflict.entity_id) {
    const field = String(conflict.field_name);
    if (["deadline", "tuition", "language", "requirements", "scholarship"].includes(field)) {
      await db
        .prepare(`UPDATE programs SET ${field} = ?, updated_at = ? WHERE id = ?`)
        .bind(resolution.resolved_value, now, String(conflict.entity_id))
        .run();
    }
  }

  // If resolved, mark the entity as verified
  if (resolution.status === "resolved" && conflict.entity_type === "resource" && conflict.entity_id) {
    await db
      .prepare("UPDATE intelligence_resources SET confidence_last_verified = ?, updated_at = ? WHERE id = ?")
      .bind(now, now, String(conflict.entity_id))
      .run();
  }

  return { ok: true };
}

export async function verifyResource(db: D1Database, resourceId: string): Promise<{ ok: boolean }> {
  const now = new Date().toISOString();
  await db
    .prepare("UPDATE intelligence_resources SET confidence_last_verified = ?, updated_at = ? WHERE id = ?")
    .bind(now, now, resourceId)
    .run();

  // Close any open stale_unverified conflicts for this resource
  await db
    .prepare("UPDATE conflicts SET status = 'resolved', resolved_at = ?, updated_at = ? WHERE entity_type = 'resource' AND entity_id = ? AND conflict_type = 'stale_unverified' AND status = 'open'")
    .bind(now, now, resourceId)
    .run();

  return { ok: true };
}
