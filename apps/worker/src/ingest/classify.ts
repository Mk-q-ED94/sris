export interface ClassificationResult {
  source: string;
  resource_type: string;
  keywords: string[];
}

export function classifyUrl(url: string): ClassificationResult | null {
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

export function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function canonicalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}${u.pathname}`.replace(/\/+$/, "");
  } catch {
    return url;
  }
}

const SOURCE_TYPE_RESOURCE_MAP: Record<string, string> = {
  official: "official_page",
  program_page: "program_page",
  admission: "admission_notice",
  professor_page: "professor_page",
  lab_page: "lab_page",
  forum: "experience_post",
  video: "video",
  arxiv: "paper",
  scholar: "paper",
  conference: "other",
  calendar: "other",
};

export function inferResourceType(
  sourceType: string | null,
  url: string,
  title: string,
  contentText: string | null,
): string {
  // If source_type has a direct mapping, use it
  if (sourceType && SOURCE_TYPE_RESOURCE_MAP[sourceType]) {
    return SOURCE_TYPE_RESOURCE_MAP[sourceType]!;
  }

  // Try URL-based classification
  const urlClass = classifyUrl(url);
  if (urlClass) return urlClass.resource_type;

  // Content-based heuristics
  const lower = (title + " " + (contentText || "")).toLowerCase();
  if (lower.includes("admission") || lower.includes("application") || lower.includes("nyushi")) return "admission_notice";
  if (lower.includes("program") || lower.includes("course") || lower.includes("curriculum")) return "program_page";
  if (lower.includes("professor") || lower.includes("faculty") || lower.includes("lab")) return "professor_page";
  if (lower.includes("research") && lower.includes("laboratory")) return "lab_page";
  if (lower.includes("experience") || lower.includes("経験") || lower.includes("合格")) return "experience_post";

  return "other";
}
