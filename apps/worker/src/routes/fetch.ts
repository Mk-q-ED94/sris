export interface FetchedContent {
  title: string;
  description: string | null;
  content_text: string;
  raw_snapshot: string | null;
  final_url: string;
  status: number;
}

const MAX_CONTENT_TEXT = 50_000;
const MAX_RAW_SNAPSHOT = 200_000;

export async function fetchUrlContent(url: string): Promise<FetchedContent | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "SRIS/1.0 (Research Intelligence Bot)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) return null;

    const html = await response.text();
    if (!html) return null;

    const title = extractTag(html, "title") || "";
    const description = extractMeta(html, "description");
    const contentText = extractBodyText(html);

    return {
      title: title.slice(0, 500),
      description: description ? description.slice(0, 500) : null,
      content_text: contentText.slice(0, MAX_CONTENT_TEXT),
      raw_snapshot: html.length <= MAX_RAW_SNAPSHOT ? html : html.slice(0, MAX_RAW_SNAPSHOT),
      final_url: response.url || url,
      status: response.status,
    };
  } catch {
    return null;
  }
}

function extractTag(html: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = re.exec(html);
  return match ? match[1]!.replace(/<[^>]+>/g, "").trim() : null;
}

function extractMeta(html: string, name: string): string | null {
  const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`, "i");
  const match = re.exec(html);
  if (match) return match[1]!.trim();
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`, "i");
  const match2 = re2.exec(html);
  return match2 ? match2[1]!.trim() : null;
}

function extractBodyText(html: string): string {
  let body = html;
  const bodyMatch = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
  if (bodyMatch) body = bodyMatch[1]!;

  body = body.replace(/<script[\s\S]*?<\/script>/gi, "");
  body = body.replace(/<style[\s\S]*?<\/style>/gi, "");
  body = body.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  body = body.replace(/<header[\s\S]*?<\/header>/gi, "");
  body = body.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  body = body.replace(/<form[\s\S]*?<\/form>/gi, "");

  body = body.replace(/<br\s*\/?>/gi, "\n");
  body = body.replace(/<\/p>/gi, "\n");
  body = body.replace(/<\/li>/gi, "\n");
  body = body.replace(/<\/div>/gi, "\n");
  body = body.replace(/<[^>]+>/g, "");

  body = body.replace(/&nbsp;/gi, " ");
  body = body.replace(/&amp;/gi, "&");
  body = body.replace(/&lt;/gi, "<");
  body = body.replace(/&gt;/gi, ">");
  body = body.replace(/&quot;/gi, '"');
  body = body.replace(/&#\d+;/g, "");
  body = body.replace(/&\w+;/g, "");

  body = body.replace(/[ \t]+/g, " ");
  body = body.replace(/\n{3,}/g, "\n\n");

  return body.trim();
}
