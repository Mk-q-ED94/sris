import type { D1Database } from "@cloudflare/workers-types";

export interface SearchHit {
  type: "university" | "program" | "professor" | "lab" | "paper" | "candidate" | "task" | "resource";
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
  { table: "intelligence_resources", type: "resource", primary: "title", secondary: "resource_type", hint: "relevance_note", fields: ["title", "url", "relevance_note", "domain_source"] },
];

const LIMIT_PER_TYPE = 4;

export async function globalSearch(db: D1Database, query: string, filter?: { type?: string; university_id?: string }): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  const needle = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
  const results: SearchHit[] = [];

  const specsToSearch = filter?.type ? SPECS.filter((s) => s.type === filter.type) : SPECS;

  for (const spec of specsToSearch) {
    const conditions = spec.fields.map((f) => `${f} LIKE ? ESCAPE '\\'`).join(" OR ");
    const extraFilters: string[] = [];
    const extraParams: unknown[] = [];
    if (spec.filter) extraFilters.push(spec.filter);

    if (filter?.university_id && spec.table !== "universities" && spec.table !== "timeline_tasks") {
      extraFilters.push("university_id = ?");
      extraParams.push(filter.university_id);
    }

    const whereClause = extraFilters.length > 0 ? ` AND ${extraFilters.join(" AND ")}` : "";
    const sql = `SELECT * FROM ${spec.table} WHERE (${conditions})${whereClause} LIMIT ${LIMIT_PER_TYPE}`;
    const params = [...spec.fields.map(() => needle), ...extraParams];
    const rows = (await db.prepare(sql).bind(...params).all<Record<string, unknown>>()).results || [];
    for (const row of rows) {
      let subtitle: string | null = spec.secondary ? (row[spec.secondary] ? String(row[spec.secondary]) : null) : null;
      let hint: string | null = spec.hint && row[spec.hint] ? truncate(String(row[spec.hint]), 120) : null;

      if (spec.type === "resource") {
        const parts: string[] = [];
        if (row.resource_type) parts.push(String(row.resource_type));
        if (row.confidence) parts.push(String(row.confidence));
        if (parts.length) subtitle = parts.join(" · ");
        if (row.university_id) {
          const uni = await db.prepare("select name from universities where id = ?").bind(String(row.university_id)).first<{ name: string }>();
          if (uni) hint = uni.name;
        }
      }

      results.push({
        type: spec.type,
        id: String(row.id ?? ""),
        title: String(row[spec.primary] ?? "(untitled)"),
        subtitle,
        hint,
      });
    }
  }

  return results;
}

function truncate(value: string, max: number): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length <= max ? cleaned : cleaned.slice(0, max - 1) + "…";
}
