import type { ExecutionContext } from "@cloudflare/workers-types";
import type { Env } from "./env";
import { HttpError, JSON_HEADERS, htmlResponse, json } from "./http";
import { requireApiToken, requireCron } from "./auth";
import { initializeDatabase } from "./db/schema";
import { listRows } from "./db/queries";
import { normalizeCandidate } from "./db/normalize";
import { dashboard } from "./routes/dashboard";
import { acceptCandidate, ignoreCandidate } from "./routes/review";
import { handleCrud } from "./routes/crud";
import { runIngest } from "./ingest";
import APP_HTML from "./console/app.html";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: JSON_HEADERS });
    }

    const url = new URL(request.url);
    try {
      if (url.pathname === "/" || !url.pathname.startsWith("/api/")) {
        return htmlResponse(APP_HTML);
      }

      if (url.pathname === "/api/health") {
        return json({ status: "ok", service: "sris-worker", environment: env.ENVIRONMENT });
      }

      if (url.pathname === "/api/admin/init" && request.method === "POST") {
        requireCron(request, env);
        return json(await initializeDatabase(env.DB));
      }

      if (url.pathname === "/api/ingest/arxiv/run" && request.method === "POST") {
        requireCron(request, env);
        return json(await runIngest(env.DB));
      }

      requireApiToken(request, env);

      if (url.pathname === "/api/dashboard" && request.method === "GET") {
        return json(await dashboard(env.DB));
      }

      if (url.pathname === "/api/review/papers" && request.method === "GET") {
        const rows = await listRows(env.DB, "paper_candidates", "status = ?", ["pending"], "published_at desc");
        return json(rows.map(normalizeCandidate));
      }

      const acceptMatch = url.pathname.match(/^\/api\/review\/papers\/([^/]+)\/accept$/);
      if (acceptMatch && request.method === "POST") {
        return json(await acceptCandidate(env.DB, acceptMatch[1]!));
      }

      const ignoreMatch = url.pathname.match(/^\/api\/review\/papers\/([^/]+)\/ignore$/);
      if (ignoreMatch && request.method === "POST") {
        return json(await ignoreCandidate(env.DB, ignoreMatch[1]!));
      }

      const crudResponse = await handleCrud(env.DB, request, url.pathname);
      if (crudResponse) return crudResponse;

      return json({ error: "Not found" }, 404);
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status);
      console.error("worker: unhandled error", error);
      const message = error instanceof Error ? error.message : "Internal error";
      return json({ error: message }, 500);
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runIngest(env.DB));
  },
};
