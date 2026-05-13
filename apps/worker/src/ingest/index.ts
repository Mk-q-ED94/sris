import type { D1Database } from "@cloudflare/workers-types";
import { parseJson } from "../db/normalize";
import { buildArxivUrl, fetchArxivPapers } from "./arxiv";
import type { PaperCandidate } from "./shared";
import { keywordMatches } from "./shared";

export interface RadarSource {
  id: string;
  name: string;
  source_type: string;
  url: string | null;
  query: string | null;
  keywords: string;
  enabled: number;
}

export interface IngestResult {
  sources_checked: number;
  candidates_created: number;
  candidates_skipped: number;
}

export type SourceAdapter = (source: RadarSource) => Promise<PaperCandidate[] | null>;

const ADAPTERS: Record<string, SourceAdapter> = {
  arxiv: async (source) => {
    const feedUrl = source.url || buildArxivUrl(source.query || "machine learning");
    return fetchArxivPapers(feedUrl);
  },
};

export async function runIngest(db: D1Database): Promise<IngestResult> {
  const supportedTypes = Object.keys(ADAPTERS);
  const placeholders = supportedTypes.map(() => "?").join(",");
  const sources =
    (
      await db
        .prepare(`select * from radar_sources where enabled = 1 and source_type in (${placeholders})`)
        .bind(...supportedTypes)
        .all<RadarSource>()
    ).results || [];

  let created = 0;
  let skipped = 0;

  for (const source of sources) {
    const adapter = ADAPTERS[source.source_type];
    if (!adapter) {
      skipped += 1;
      continue;
    }
    const papers = await adapter(source);
    if (!papers) {
      skipped += 1;
      continue;
    }
    const sourceKeywords = parseJson<string[]>(source.keywords, []);
    for (const paper of papers) {
      const inserted = await tryInsertCandidate(db, source, paper, sourceKeywords);
      if (inserted) created += 1;
      else skipped += 1;
    }
    await db
      .prepare("update radar_sources set last_run_at = ?, updated_at = ? where id = ?")
      .bind(new Date().toISOString(), new Date().toISOString(), source.id)
      .run();
  }

  return { sources_checked: sources.length, candidates_created: created, candidates_skipped: skipped };
}

async function tryInsertCandidate(
  db: D1Database,
  source: RadarSource,
  paper: PaperCandidate,
  sourceKeywords: string[],
): Promise<boolean> {
  const existingPaper = await db.prepare("select id from papers where url = ?").bind(paper.url).first();
  if (existingPaper) return false;
  const matches = keywordMatches(paper, sourceKeywords);
  if (sourceKeywords.length && !matches.length) return false;
  try {
    const now = new Date().toISOString();
    await db
      .prepare(
        "insert into paper_candidates (id,source_id,source,title,authors,abstract,url,published_at,matched_keywords,raw_payload,status,created_at,updated_at) values (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      )
      .bind(
        crypto.randomUUID(),
        source.id,
        source.name,
        paper.title,
        JSON.stringify(paper.authors),
        paper.abstract,
        paper.url,
        paper.published_at,
        JSON.stringify(matches),
        JSON.stringify(paper.raw_payload),
        "pending",
        now,
        now,
      )
      .run();
    return true;
  } catch (error) {
    console.error("ingest: failed to insert paper_candidate", { url: paper.url, error });
    return false;
  }
}
