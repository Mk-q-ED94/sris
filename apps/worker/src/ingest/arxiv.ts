import type { PaperCandidate } from "./shared";
import { cleanXml, textBetween } from "./shared";

export function buildArxivUrl(query: string): string {
  return `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
    query,
  )}&start=0&max_results=25&sortBy=submittedDate&sortOrder=descending`;
}

export function parseArxivFeed(xml: string): PaperCandidate[] {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((match) => match[1] ?? "");
  return entries
    .map((entry): PaperCandidate => {
      const title = textBetween(entry, "title");
      const abstract = textBetween(entry, "summary");
      const publishedAt = textBetween(entry, "published");
      const authors = [...entry.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>\s*<\/author>/g)].map((match) =>
        cleanXml(match[1] ?? ""),
      );
      const alternate = entry.match(/<link[^>]+rel="alternate"[^>]+href="([^"]+)"/);
      const id = textBetween(entry, "id");
      const url = alternate?.[1] || id;
      return {
        title,
        authors,
        abstract,
        url,
        published_at: publishedAt || null,
        raw_payload: { title, authors, abstract, url, published_at: publishedAt || null },
      };
    })
    .filter((paper) => paper.title && paper.url);
}

export async function fetchArxivPapers(feedUrl: string): Promise<PaperCandidate[] | null> {
  const response = await fetch(feedUrl, { headers: { "user-agent": "SRIS/0.1" } });
  if (!response.ok) return null;
  return parseArxivFeed(await response.text());
}
