import type { D1Database } from "@cloudflare/workers-types";
import { httpError } from "../http";
import { normalizeCandidate, normalizePaper } from "../db/normalize";

export async function acceptCandidate(db: D1Database, id: string): Promise<Record<string, unknown>> {
  const candidate = await db
    .prepare("select * from paper_candidates where id = ?")
    .bind(id)
    .first<Record<string, unknown>>();
  if (!candidate) throw httpError(404, "Candidate not found");
  if (candidate.status !== "pending") throw httpError(409, "Candidate already reviewed");

  const now = new Date().toISOString();
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
      .prepare("update paper_candidates set status = 'accepted', reviewed_at = ?, updated_at = ? where id = ?")
      .bind(now, now, id),
  ]);
  const paper = await db
    .prepare("select * from papers where id = ?")
    .bind(paperId)
    .first<Record<string, unknown>>();
  if (!paper) throw httpError(500, "Accepted paper not found after insert");
  return normalizePaper(paper);
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
  return normalizeCandidate(candidate);
}
