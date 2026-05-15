import type { D1Database } from "@cloudflare/workers-types";
import type { TableConfig } from "./tables";
import { normalizeRow } from "./normalize";

export async function listRows(
  db: D1Database,
  table: string,
  where: string | null,
  params: unknown[],
  order: string,
): Promise<Record<string, unknown>[]> {
  const sql = `select * from ${table}${where ? ` where ${where}` : ""} order by ${order}`;
  const result = await db
    .prepare(sql)
    .bind(...params)
    .all<Record<string, unknown>>();
  return result.results || [];
}

export async function countRows(
  db: D1Database,
  table: string,
  where: string | null = null,
  params: unknown[] = [],
): Promise<number> {
  const sql = `select count(*) as count from ${table}${where ? ` where ${where}` : ""}`;
  const row = await db
    .prepare(sql)
    .bind(...params)
    .first<{ count: number }>();
  return row?.count ?? 0;
}

export async function createRow(
  db: D1Database,
  config: TableConfig,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const fields = ["id", ...config.createFields, "created_at", "updated_at"];
  const values = fields.map((field) => {
    if (field === "id") return id;
    if (field === "created_at" || field === "updated_at") return now;
    if (config.jsonFields.includes(field)) return JSON.stringify(payload[field] || []);
    if (field === "enabled") return payload[field] === false ? 0 : 1;
    return payload[field] ?? null;
  });
  const placeholders = fields.map(() => "?").join(", ");
  await db
    .prepare(`insert into ${config.table} (${fields.join(", ")}) values (${placeholders})`)
    .bind(...values)
    .run();
  const row = await db
    .prepare(`select * from ${config.table} where id = ?`)
    .bind(id)
    .first<Record<string, unknown>>();
  if (!row) throw new Error(`Failed to read back inserted row in ${config.table}`);
  return normalizeRow(row, config.jsonFields);
}

export async function updateRow(
  db: D1Database,
  config: TableConfig,
  id: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const now = new Date().toISOString();
  const setClauses: string[] = [];
  const values: unknown[] = [];
  for (const field of config.createFields) {
    if (!(field in payload)) continue;
    setClauses.push(`${field} = ?`);
    if (config.jsonFields.includes(field)) {
      values.push(JSON.stringify(payload[field] ?? []));
    } else if (field === "enabled") {
      values.push(payload[field] === false ? 0 : 1);
    } else {
      values.push(payload[field] ?? null);
    }
  }
  setClauses.push("updated_at = ?");
  values.push(now);
  values.push(id);
  const result = await db
    .prepare(`update ${config.table} set ${setClauses.join(", ")} where id = ?`)
    .bind(...values)
    .run();
  if (!result.meta?.changes) throw new Error(`Row ${id} not found in ${config.table}`);
  const row = await db
    .prepare(`select * from ${config.table} where id = ?`)
    .bind(id)
    .first<Record<string, unknown>>();
  if (!row) throw new Error(`Failed to read back updated row in ${config.table}`);
  return normalizeRow(row, config.jsonFields);
}

export async function deleteRow(
  db: D1Database,
  table: string,
  id: string,
): Promise<{ ok: true }> {
  const result = await db
    .prepare(`delete from ${table} where id = ?`)
    .bind(id)
    .run();
  if (!result.meta?.changes) throw new Error(`Row ${id} not found in ${table}`);
  return { ok: true };
}
