import type { D1Database } from "@cloudflare/workers-types";
import { TABLES } from "../db/tables";
import { listRows, createRow } from "../db/queries";
import { normalizeRow } from "../db/normalize";
import { json } from "../http";

export async function handleCrud(
  db: D1Database,
  request: Request,
  pathname: string,
): Promise<Response | null> {
  for (const config of Object.values(TABLES)) {
    if (pathname !== config.path) continue;
    if (request.method === "GET") {
      const rows = await listRows(db, config.table, null, [], config.order);
      return json(rows.map((row) => normalizeRow(row, config.jsonFields)));
    }
    if (request.method === "POST") {
      const payload = (await request.json()) as Record<string, unknown>;
      return json(await createRow(db, config, payload), 201);
    }
  }
  return null;
}
