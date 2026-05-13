export interface PaperCandidate {
  title: string;
  authors: string[];
  abstract: string;
  url: string;
  published_at: string | null;
  raw_payload: Record<string, unknown>;
}

export function keywordMatches(paper: { title: string; abstract: string }, keywords: string[]): string[] {
  const haystack = `${paper.title} ${paper.abstract}`.toLowerCase();
  return keywords.filter((keyword) => haystack.includes(String(keyword).toLowerCase()));
}

export function cleanXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function textBetween(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return cleanXml(match?.[1] || "");
}
