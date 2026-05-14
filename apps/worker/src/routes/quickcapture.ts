import type { D1Database } from "@cloudflare/workers-types";

export interface QuickCapturePayload {
  url?: string;
  title?: string;
  selection?: string;
  notes?: string;
}

export async function quickCapture(db: D1Database, payload: QuickCapturePayload): Promise<{ id: string; status: string }> {
  const url = (payload.url || "").trim();
  if (!url) throw Object.assign(new Error("url is required"), { status: 400 });

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const title = (payload.title || payload.url || "Captured link").slice(0, 280);
  const abstract = [payload.selection, payload.notes].filter(Boolean).join("\n\n").trim() || null;

  // Reuse paper_candidates so the capture lands in the same Review Queue UX.
  // Mark `source` as "manual" so the Worker's arxiv ingest will not deduplicate
  // against it, and matched_keywords carries a "bookmark" sentinel.
  await db
    .prepare(
      "insert or replace into paper_candidates (id,source_id,source,title,authors,abstract,url,published_at,matched_keywords,raw_payload,status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?,?)",
    )
    .bind(
      id,
      null,
      "manual",
      title,
      JSON.stringify([]),
      abstract,
      url,
      now,
      JSON.stringify(["bookmark"]),
      JSON.stringify(payload),
      "pending",
      now,
      now,
    )
    .run();

  return { id, status: "pending" };
}
