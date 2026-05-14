import type { D1Database } from "@cloudflare/workers-types";

export interface SearchHit {
  type: "university" | "program" | "professor" | "lab" | "paper" | "candidate" | "task";
  id: string;
  title: string;
  subtitle: string | null;
  hint: string | null;
}

interface SearchSpec {
  table: string;
  type: SearchHit["type"];
  primary: string;
  secondary: string | null;
  hint: string | null;
  fields: string[];
  filter?: string;
}

const SPECS: SearchSpec[] = [
  { table: "universities", type: "university", primary: "name", secondary: "location", hint: "notes", fields: ["name", "location", "notes"] },
  { table: "programs", type: "program", primary: "program_name", secondary: "degree", hint: "requirements", fields: ["program_name", "degree", "language", "requirements"] },
  { table: "professors", type: "professor", primary: "name", secondary: "title", hint: "research_keywords", fields: ["name", "title", "research_keywords", "notes"] },
  { table: "labs", type: "lab", primary: "lab_name", secondary: "website", hint: "research_keywords", fields: ["lab_name", "research_keywords", "notes"] },
  { table: "papers", type: "paper", primary: "title", secondary: "venue", hint: "abstract", fields: ["title", "abstract", "authors", "keywords"] },
  { table: "paper_candidates", type: "candidate", primary: "title", secondary: "source", hint: "abstract", fields: ["title", "abstract", "authors"], filter: "status = 'pending'" },
  { table: "timeline_tasks", type: "task", primary: "title", secondary: "task_type", hint: "notes", fields: ["title", "task_type", "notes"] },
];

const LIMIT_PER_TYPE = 4;

export async function globalSearch(db: D1Database, query: string): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  const needle = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
  const results: SearchHit[] = [];

  for (const spec of SPECS) {
    const conditions = spec.fields.map((f) => `${f} LIKE ? ESCAPE '\\'`).join(" OR ");
    const filter = spec.filter ? ` AND ${spec.filter}` : "";
    const sql = `SELECT * FROM ${spec.table} WHERE (${conditions})${filter} LIMIT ${LIMIT_PER_TYPE}`;
    const params = spec.fields.map(() => needle);
    const rows = (await db.prepare(sql).bind(...params).all<Record<string, unknown>>()).results || [];
    for (const row of rows) {
      results.push({
        type: spec.type,
        id: String(row.id ?? ""),
        title: String(row[spec.primary] ?? "(untitled)"),
        subtitle: spec.secondary ? (row[spec.secondary] ? String(row[spec.secondary]) : null) : null,
        hint: spec.hint && row[spec.hint] ? truncate(String(row[spec.hint]), 120) : null,
      });
    }
  }

  return results;
}

function truncate(value: string, max: number): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length <= max ? cleaned : cleaned.slice(0, max - 1) + "…";
}
