import type { D1Database } from "@cloudflare/workers-types";

export interface QuickCapturePayload {
  url?: string;
  title?: string;
  selection?: string;
  notes?: string;
}

function classifyUrl(url: string): { source: string; keywords: string[] } | null {
  try {
    const u = new URL(url);
    const host = u.hostname;
    const path = u.pathname.toLowerCase();

    if (host.endsWith(".ac.jp")) {
      if (path.includes("/lab") || path.includes("/research") || path.includes("/kenkyu"))
        return { source: "lab-page", keywords: ["lab", "auto-classified"] };
      if (path.includes("/faculty") || path.includes("/member") || path.includes("/staff") || path.includes("/professor"))
        return { source: "professor-page", keywords: ["professor", "auto-classified"] };
      if (path.includes("/program") || path.includes("/admission") || path.includes("/apply") || path.includes("/nyushi"))
        return { source: "program-page", keywords: ["program", "auto-classified"] };
      if (path.includes("/course") || path.includes("/curriculum"))
        return { source: "course-page", keywords: ["course", "auto-classified"] };
      return { source: "university-page", keywords: ["university", "auto-classified"] };
    }

    if (host.includes("arxiv.org")) return { source: "arxiv", keywords: ["paper", "auto-classified"] };
    if (host.includes("scholar.google")) return { source: "scholar", keywords: ["paper", "auto-classified"] };
    if (host.includes("dblp")) return { source: "dblp", keywords: ["paper", "auto-classified"] };
    if (host.includes("semanticscholar")) return { source: "semantic-scholar", keywords: ["paper", "auto-classified"] };

    return null;
  } catch {
    return null;
  }
}

export async function quickCapture(db: D1Database, payload: QuickCapturePayload): Promise<{ id: string; status: string }> {
  const url = (payload.url || "").trim();
  if (!url) throw Object.assign(new Error("url is required"), { status: 400 });

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const title = (payload.title || payload.url || "Captured link").slice(0, 280);
  const abstract = [payload.selection, payload.notes].filter(Boolean).join("\n\n").trim() || null;

  const classification = classifyUrl(url);
  const source = classification?.source ?? "manual";
  const keywords = classification ? [...classification.keywords, "bookmark"] : ["bookmark"];

  await db
    .prepare(
      "insert or replace into paper_candidates (id,source_id,source,title,authors,abstract,url,published_at,matched_keywords,raw_payload,status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?,?)",
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
      now,
      now,
    )
    .run();

  return { id, status: "pending" };
}
