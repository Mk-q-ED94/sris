import type { D1Database } from "@cloudflare/workers-types";
import { TABLES } from "../db/tables";
import { createRow, deleteRow, listRows, updateRow } from "../db/queries";
import { normalizeRow } from "../db/normalize";
import { json } from "../http";

export async function handleCrud(
  db: D1Database,
  request: Request,
  pathname: string,
): Promise<Response | null> {
  for (const config of Object.values(TABLES)) {
    if (pathname === config.path) {
      if (request.method === "GET") {
        const rows = await listRows(db, config.table, null, [], config.order);
        return json(rows.map((row) => normalizeRow(row, config.jsonFields)));
      }
      if (request.method === "POST") {
        const payload = (await request.json()) as Record<string, unknown>;
        return json(await createRow(db, config, payload), 201);
      }
    }
    const idMatch = pathname.match(new RegExp(`^${escapeRegex(config.path)}/([^/]+)$`));
    if (idMatch) {
      const id = idMatch[1]!;
      if (request.method === "PUT") {
        const payload = (await request.json()) as Record<string, unknown>;
        return json(await updateRow(db, config, id, payload));
      }
      if (request.method === "DELETE") {
        return json(await deleteRow(db, config.table, id));
      }
    }
  }
  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
