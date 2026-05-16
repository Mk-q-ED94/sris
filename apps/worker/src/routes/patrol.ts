import type { D1Database } from "@cloudflare/workers-types";
import { fetchUrlContent } from "./fetch";

const SOURCE_TYPE_TO_RESOURCE_TYPE: Record<string, string> = {
  official: "official_page",
  program_page: "program_page",
  professor_page: "professor_page",
  lab_page: "lab_page",
  admission: "admission_notice",
  forum: "experience_post",
  video: "video",
};

function computeHash(contentText: string): string {
  return String(contentText.length) + ":" + contentText.slice(0, 200);
}

export async function patrolSource(
  db: D1Database,
  sourceId: string,
): Promise<{ status: string; changed: boolean }> {
  const source = await db
    .prepare("select * from radar_sources where id = ?")
    .bind(sourceId)
    .first<Record<string, unknown>>();
  if (!source) return { status: "not_found", changed: false };

  const sourceType = String(source.source_type ?? "");
  if (sourceType === "arxiv") return { status: "skipped_arxiv", changed: false };

  const url = source.url ? String(source.url) : null;
  if (!url) return { status: "skipped_no_url", changed: false };

  const previousHash = source.content_hash ? String(source.content_hash) : null;
  const result = await fetchUrlContent(url);
  const now = new Date().toISOString();

  if (!result) {
    await db
      .prepare(
        "update radar_sources set patrol_status = 'failed', last_checked_at = ?, updated_at = ? where id = ?",
      )
      .bind(now, now, sourceId)
      .run();
    return { status: "failed", changed: false };
  }

  const newHash = computeHash(result.content_text);
  const changed = previousHash !== null && previousHash !== newHash;
  const patrolStatus = changed ? "changed" : "ok";

  await db
    .prepare(
      "update radar_sources set patrol_status = ?, last_http_status = ?, last_title = ?, content_hash = ?, last_checked_at = ?, last_changed_at = ?, updated_at = ? where id = ?",
    )
    .bind(
      patrolStatus,
      result.status,
      result.title,
      newHash,
      now,
      changed ? now : (source.last_changed_at ? String(source.last_changed_at) : null),
      now,
      sourceId,
    )
    .run();

  if (changed) {
    const resourceType = SOURCE_TYPE_TO_RESOURCE_TYPE[sourceType] || "other";
    const candidateId = `patrol-${sourceId}-${Date.now()}`;
    const universityId = source.university_id ? String(source.university_id) : null;
    const confidence = source.confidence ? String(source.confidence) : null;

    await db
      .prepare(
        `insert into paper_candidates (id, source_id, source, title, url, resource_type, university_id, confidence, content_text, excerpt, raw_snapshot, snapshot_at, status, matched_keywords, authors)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', '[]', '[]')`,
      )
      .bind(
        candidateId,
        sourceId,
        `patrol:${source.name ?? sourceId}`,
        result.title || String(source.name ?? sourceId),
        url,
        resourceType,
        universityId,
        confidence,
        result.content_text,
        result.description,
        result.raw_snapshot,
        now,
      )
      .run();
  }

  return { status: patrolStatus, changed };
}

export async function runPatrol(
  db: D1Database,
): Promise<{ checked: number; changed: number; failed: number }> {
  const rows = await db
    .prepare(
      "select id, source_type, url, check_frequency, last_checked_at from radar_sources where enabled = 1 and source_type != 'arxiv' and url is not null and url != ''",
    )
    .all<{
      id: string;
      source_type: string;
      url: string;
      check_frequency: string | null;
      last_checked_at: string | null;
    }>();

  let checked = 0;
  let changed = 0;
  let failed = 0;

  for (const source of rows.results || []) {
    if (!isDue(source.check_frequency, source.last_checked_at)) continue;

    const result = await patrolSource(db, source.id);
    checked++;
    if (result.status === "changed") changed++;
    if (result.status === "failed") failed++;
  }

  // Mark stale sources
  await db
    .prepare(
      "update radar_sources set patrol_status = 'stale' where enabled = 1 and source_type != 'arxiv' and url is not null and url != '' and patrol_status = 'ok' and last_checked_at < datetime('now', '-14 day')",
    )
    .run();

  return { checked, changed, failed };
}

function isDue(
  frequency: string | null,
  lastCheckedAt: string | null,
): boolean {
  if (!frequency || frequency === "manual") return false;
  if (!lastCheckedAt) return true;

  const last = new Date(lastCheckedAt).getTime();
  const now = Date.now();
  const daysSince = (now - last) / (1000 * 60 * 60 * 24);

  if (frequency === "daily") return daysSince >= 1;
  if (frequency === "weekly") return daysSince >= 7;
  return daysSince >= 7;
}
