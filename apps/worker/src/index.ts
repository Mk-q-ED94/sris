import type { ExecutionContext } from "@cloudflare/workers-types";
import type { Env } from "./env";
import { HttpError, JSON_HEADERS, json } from "./http";
import { requireApiToken, requireApiTokenOrQuery, requireCron } from "./auth";
import { initializeDatabase } from "./db/schema";
import { listRows, countRows } from "./db/queries";
import { normalizeCandidate, normalizeRow } from "./db/normalize";
import { dashboard } from "./routes/dashboard";
import { acceptCandidate, ignoreCandidate } from "./routes/review";
import { handleCrud } from "./routes/crud";
import { buildTimelineIcs } from "./routes/ical";
import { globalSearch } from "./routes/search";
import { quickCapture, type QuickCapturePayload } from "./routes/quickcapture";
import { runIngest } from "./ingest";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: JSON_HEADERS });
    }

    const url = new URL(request.url);
    try {
      if (!url.pathname.startsWith("/api/")) {
        if (!env.ASSETS) {
          return json({ error: "Assets binding is not configured" }, 500);
        }
        return env.ASSETS.fetch(request);
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

      // iCal feed accepts ?token=API_TOKEN so calendar clients without
      // an Authorization header can subscribe.
      if (url.pathname === "/api/timeline.ics" && request.method === "GET") {
        requireApiTokenOrQuery(request, env);
        const ics = await buildTimelineIcs(env.DB, url.origin);
        return new Response(ics, {
          headers: {
            "content-type": "text/calendar; charset=utf-8",
            "cache-control": "private, max-age=60",
          },
        });
      }

      requireApiToken(request, env);

      if (url.pathname === "/api/dashboard" && request.method === "GET") {
        return json(await dashboard(env.DB));
      }

      if (url.pathname === "/api/search" && request.method === "GET") {
        const q = url.searchParams.get("q") || "";
        return json({ query: q, hits: await globalSearch(env.DB, q) });
      }

      if (url.pathname === "/api/quick-capture" && request.method === "POST") {
        const payload = (await request.json()) as QuickCapturePayload;
        return json(await quickCapture(env.DB, payload), 201);
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

      const uniDetailMatch = url.pathname.match(/^\/api\/universities\/([^/]+)$/);
      if (uniDetailMatch && request.method === "GET") {
        const uniId = uniDetailMatch[1]!;
        const university = await env.DB.prepare("select * from universities where id = ?").bind(uniId).first<Record<string, unknown>>();
        if (!university) return json({ error: "University not found" }, 404);
        const programs = (await listRows(env.DB, "programs", "university_id = ?", [uniId], "deadline asc, program_name asc")).map((r) => normalizeRow(r, []));
        const professors = (await listRows(env.DB, "professors", "university_id = ?", [uniId], "name asc")).map((r) => normalizeRow(r, ["research_keywords"]));
        const labs = (await listRows(env.DB, "labs", "university_id = ?", [uniId], "lab_name asc")).map((r) => normalizeRow(r, ["research_keywords", "recent_papers"]));
        const paperCount = await countRows(env.DB, "papers");
        const taskCount = await countRows(env.DB, "timeline_tasks", "related_university_id = ?", [uniId]);
        return json({ university: normalizeRow(university, []), programs, professors, labs, paper_count: paperCount, task_count: taskCount });
      }

      const crudResponse = await handleCrud(env.DB, request, url.pathname);
      if (crudResponse) return crudResponse;

      return json({ error: "Not found" }, 404);
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status);
      if (error && typeof error === "object" && "status" in error) {
        const tagged = error as { status?: unknown; message?: unknown };
        if (typeof tagged.status === "number") {
          const msg = typeof tagged.message === "string" ? tagged.message : "Bad request";
          return json({ error: msg }, tagged.status);
        }
      }
      console.error("worker: unhandled error", error);
      const message = error instanceof Error ? error.message : "Internal error";
      return json({ error: message }, 500);
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runIngest(env.DB));
  },
};
