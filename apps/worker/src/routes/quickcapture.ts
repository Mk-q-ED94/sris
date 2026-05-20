import type { D1Database } from "@cloudflare/workers-types";
import { classifyUrl, extractDomain } from "../ingest/classify";

export interface QuickCapturePayload {
  url?: string;
  title?: string;
  selection?: string;
  notes?: string;
  excerpt?: string;
  resource_type?: string;
  university_id?: string;
  program_id?: string;
  professor_id?: string;
  relevance_note?: string;
  confidence?: string;
}

export async function quickCapture(db: D1Database, payload: QuickCapturePayload): Promise<{ id: string; status: string }> {
  const url = (payload.url || "").trim();
  if (!url) throw Object.assign(new Error("url is required"), { status: 400 });

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const title = (payload.title || payload.url || "Captured link").slice(0, 280);
  const excerpt = (payload.excerpt || payload.selection || "").trim().slice(0, 2000) || null;
  const abstract = [payload.selection, payload.notes].filter(Boolean).join("\n\n").trim() || null;

  const classification = classifyUrl(url);
  const source = classification?.source ?? "manual";
  const keywords = classification ? [...classification.keywords, "bookmark"] : ["bookmark"];
  const resourceType = payload.resource_type || classification?.resource_type || "other";
  const domainSource = extractDomain(url);

  await db
    .prepare(
      "insert or replace into paper_candidates (id,source_id,source,title,authors,abstract,url,published_at,matched_keywords,raw_payload,status,resource_type,university_id,program_id,professor_id,relevance_note,confidence,domain_source,excerpt,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    )
    .bind(
      id,
      null,
      source,
      title,
      JSON.stringify([]),
      abstract,
      url,
      now,
      JSON.stringify(keywords),
      JSON.stringify(payload),
      "pending",
      resourceType,
      payload.university_id || null,
      payload.program_id || null,
      payload.professor_id || null,
      payload.relevance_note || null,
      payload.confidence || null,
      domainSource,
      excerpt,
      now,
      now,
    )
    .run();

  return { id, status: "pending" };
}
