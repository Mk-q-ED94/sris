import type { D1Database } from "@cloudflare/workers-types";
import { httpError } from "../http";
import { normalizeIntelligenceCandidate, normalizePaper } from "../db/normalize";

interface LinkOptions {
  university_id?: string;
  program_id?: string;
  professor_id?: string;
}

export async function acceptCandidate(
  db: D1Database,
  id: string,
  options?: LinkOptions,
): Promise<Record<string, unknown>> {
  const candidate = await db
    .prepare("select * from paper_candidates where id = ?")
    .bind(id)
    .first<Record<string, unknown>>();
  if (!candidate) throw httpError(404, "Candidate not found");
  if (candidate.status !== "pending" && candidate.status !== "later")
    throw httpError(409, "Candidate already reviewed");

  const now = new Date().toISOString();
  const resourceType = String(candidate.resource_type || "paper");
  const uniId = options?.university_id ?? (candidate.university_id as string | null) ?? null;
  const progId = options?.program_id ?? (candidate.program_id as string | null) ?? null;
  const profId = options?.professor_id ?? (candidate.professor_id as string | null) ?? null;

  if (resourceType === "paper") {
    const paperId = crypto.randomUUID();
    const publishedAt = typeof candidate.published_at === "string" ? candidate.published_at : null;
    const publishedDate = publishedAt ? publishedAt.slice(0, 10) : null;
    const year = publishedDate ? Number(publishedDate.slice(0, 4)) : null;

    await db.batch([
      db
        .prepare(
          "insert into papers (id,title,authors,venue,year,url,source,published_at,keywords,abstract,ai_status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        )
        .bind(
          paperId,
          candidate.title,
          candidate.authors,
          "arXiv",
          year,
          candidate.url,
          candidate.source,
          publishedDate,
          candidate.matched_keywords,
          candidate.abstract,
          "pending",
          now,
          now,
        ),
      db
        .prepare(
          "update paper_candidates set status = 'accepted', reviewed_at = ?, university_id = ?, program_id = ?, professor_id = ?, updated_at = ? where id = ?",
        )
        .bind(now, uniId, progId, profId, now, id),
    ]);
    const paper = await db
      .prepare("select * from papers where id = ?")
      .bind(paperId)
      .first<Record<string, unknown>>();
    if (!paper) throw httpError(500, "Accepted paper not found after insert");
    return normalizePaper(paper);
  }

  // Non-paper: mark accepted + insert into intelligence_resources
  const resourceId = crypto.randomUUID();
  await db.batch([
    db
      .prepare(
        "update paper_candidates set status = 'accepted', reviewed_at = ?, university_id = ?, program_id = ?, professor_id = ?, updated_at = ? where id = ?",
      )
      .bind(now, uniId, progId, profId, now, id),
    db
      .prepare(
        "insert into intelligence_resources (id,candidate_id,title,url,resource_type,source,university_id,program_id,professor_id,confidence,decision_impact,relevance_note,domain_source,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      )
      .bind(
        resourceId,
        id,
        candidate.title,
        candidate.url,
        resourceType,
        candidate.source ?? null,
        uniId,
        progId,
        profId,
        candidate.confidence ?? null,
        candidate.decision_impact ?? null,
        candidate.relevance_note ?? null,
        candidate.domain_source ?? null,
        now,
        now,
      ),
  ]);

  const updated = await db
    .prepare("select * from paper_candidates where id = ?")
    .bind(id)
    .first<Record<string, unknown>>();
  if (!updated) throw httpError(500, "Accepted candidate not found after update");
  return normalizeIntelligenceCandidate(updated);
}

export async function ignoreCandidate(db: D1Database, id: string): Promise<Record<string, unknown>> {
  const now = new Date().toISOString();
  const result = await db
    .prepare("update paper_candidates set status = 'ignored', reviewed_at = ?, updated_at = ? where id = ?")
    .bind(now, now, id)
    .run();
  if (!result.meta?.changes) throw httpError(404, "Candidate not found");
  const candidate = await db
    .prepare("select * from paper_candidates where id = ?")
    .bind(id)
    .first<Record<string, unknown>>();
  if (!candidate) throw httpError(404, "Candidate not found");
  return normalizeIntelligenceCandidate(candidate);
}

export async function markForLaterCandidate(db: D1Database, id: string): Promise<Record<string, unknown>> {
  const now = new Date().toISOString();
  const result = await db
    .prepare("update paper_candidates set status = 'later', reviewed_at = ?, updated_at = ? where id = ? and status = 'pending'")
    .bind(now, now, id)
    .run();
  if (!result.meta?.changes) throw httpError(404, "Candidate not found or not pending");
  const candidate = await db
    .prepare("select * from paper_candidates where id = ?")
    .bind(id)
    .first<Record<string, unknown>>();
  if (!candidate) throw httpError(404, "Candidate not found");
  return normalizeIntelligenceCandidate(candidate);
}

export async function promoteCandidate(db: D1Database, id: string): Promise<Record<string, unknown>> {
  const now = new Date().toISOString();
  const result = await db
    .prepare("update paper_candidates set status = 'pending', reviewed_at = ?, updated_at = ? where id = ? and status = 'later'")
    .bind(now, now, id)
    .run();
  if (!result.meta?.changes) throw httpError(404, "Candidate not found or not in later status");
  const candidate = await db
    .prepare("select * from paper_candidates where id = ?")
    .bind(id)
    .first<Record<string, unknown>>();
  if (!candidate) throw httpError(404, "Candidate not found");
  return normalizeIntelligenceCandidate(candidate);
}

export async function linkCandidate(
  db: D1Database,
  id: string,
  links: LinkOptions,
): Promise<Record<string, unknown>> {
  const now = new Date().toISOString();
  const setClauses: string[] = ["updated_at = ?"];
  const values: unknown[] = [now];
  if (links.university_id !== undefined) {
    setClauses.push("university_id = ?");
    values.push(links.university_id || null);
  }
  if (links.program_id !== undefined) {
    setClauses.push("program_id = ?");
    values.push(links.program_id || null);
  }
  if (links.professor_id !== undefined) {
    setClauses.push("professor_id = ?");
    values.push(links.professor_id || null);
  }
  values.push(id);
  const result = await db
    .prepare(`update paper_candidates set ${setClauses.join(", ")} where id = ?`)
    .bind(...values)
    .run();
  if (!result.meta?.changes) throw httpError(404, "Candidate not found");
  const candidate = await db
    .prepare("select * from paper_candidates where id = ?")
    .bind(id)
    .first<Record<string, unknown>>();
  if (!candidate) throw httpError(404, "Candidate not found");
  return normalizeIntelligenceCandidate(candidate);
}
