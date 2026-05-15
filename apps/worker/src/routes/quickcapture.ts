import type { D1Database } from "@cloudflare/workers-types";

export interface QuickCapturePayload {
  url?: string;
  title?: string;
  selection?: string;
  notes?: string;
  resource_type?: string;
  university_id?: string;
  program_id?: string;
  professor_id?: string;
  relevance_note?: string;
  confidence?: string;
}

function classifyUrl(url: string): { source: string; resource_type: string; keywords: string[] } | null {
  try {
    const u = new URL(url);
    const host = u.hostname;
    const path = u.pathname.toLowerCase();

    if (host.endsWith(".ac.jp")) {
      if (path.includes("/lab") || path.includes("/research") || path.includes("/kenkyu"))
        return { source: "lab-page", resource_type: "lab_page", keywords: ["lab", "auto-classified"] };
      if (path.includes("/faculty") || path.includes("/member") || path.includes("/staff") || path.includes("/professor"))
        return { source: "professor-page", resource_type: "professor_page", keywords: ["professor", "auto-classified"] };
      if (path.includes("/program") || path.includes("/admission") || path.includes("/apply") || path.includes("/nyushi"))
        return { source: "program-page", resource_type: path.includes("/admission") || path.includes("/nyushi") ? "admission_notice" : "program_page", keywords: ["program", "auto-classified"] };
      if (path.includes("/course") || path.includes("/curriculum"))
        return { source: "course-page", resource_type: "program_page", keywords: ["course", "auto-classified"] };
      return { source: "university-page", resource_type: "official_page", keywords: ["university", "auto-classified"] };
    }

    if (host.includes("arxiv.org")) return { source: "arxiv", resource_type: "paper", keywords: ["paper", "auto-classified"] };
    if (host.includes("scholar.google")) return { source: "scholar", resource_type: "paper", keywords: ["paper", "auto-classified"] };
    if (host.includes("dblp")) return { source: "dblp", resource_type: "paper", keywords: ["paper", "auto-classified"] };
    if (host.includes("semanticscholar")) return { source: "semantic-scholar", resource_type: "paper", keywords: ["paper", "auto-classified"] };

    if (host.includes("youtube.com") || host.includes("youtu.be") || host.includes("bilibili.com"))
      return { source: host, resource_type: "video", keywords: ["video", "auto-classified"] };

    if (host.includes("zhihu.com") || host.includes("reddit.com") || host.includes("medium.com"))
      return { source: host, resource_type: "experience_post", keywords: ["experience", "auto-classified"] };

    return null;
  } catch {
    return null;
  }
}

function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
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
  const resourceType = payload.resource_type || classification?.resource_type || "other";
  const domainSource = extractDomain(url);

  await db
    .prepare(
      "insert or replace into paper_candidates (id,source_id,source,title,authors,abstract,url,published_at,matched_keywords,raw_payload,status,resource_type,university_id,program_id,professor_id,relevance_note,confidence,domain_source,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
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
      now,
      now,
    )
    .run();

  return { id, status: "pending" };
}
