import type { ExecutionContext } from "@cloudflare/workers-types";
import type { Env } from "./env";
import { HttpError, JSON_HEADERS, json } from "./http";
import { requireApiToken, requireApiTokenOrQuery, requireCron } from "./auth";
import { initializeDatabase } from "./db/schema";
import { listRows, countRows } from "./db/queries";
import { normalizeCandidate, normalizeIntelligenceCandidate, normalizeRow } from "./db/normalize";
import { dashboard } from "./routes/dashboard";
import { acceptCandidate, ignoreCandidate, linkCandidate, markForLaterCandidate, promoteCandidate } from "./routes/review";
import { handleCrud } from "./routes/crud";
import { buildTimelineIcs } from "./routes/ical";
import { globalSearch } from "./routes/search";
import { quickCapture, type QuickCapturePayload } from "./routes/quickcapture";
import { fetchUrlContent } from "./routes/fetch";
import { patrolSource, runPatrol } from "./routes/patrol";
import { runConflictDetection, resolveConflict, verifyResource } from "./routes/conflict";
import type { LlmConfig } from "./ai/extract-program";
import { runConfidenceUpdate, computeResourceConfidence } from "./routes/confidence";
import { runIngest } from "./ingest";
import { extractAllResources, extractOneResource } from "./routes/extract";
import { suggestResourceMetaRoute } from "./routes/suggest";

function llmConfigOrNull(env: Env): LlmConfig | null {
  if (!env.LLM_API_KEY) return null;
  return { apiKey: env.LLM_API_KEY, baseUrl: env.LLM_BASE_URL || "https://api.openai.com/v1", model: env.LLM_MODEL || "gpt-4o-mini" };
}

async function fetchAndSaveCandidate(db: D1Database, id: string, url: string): Promise<void> {
  const result = await fetchUrlContent(url);
  if (!result) return;
  const now = new Date().toISOString();
  await db
    .prepare("update paper_candidates set content_text = ?, raw_snapshot = ?, snapshot_at = ?, updated_at = ? where id = ?")
    .bind(result.content_text, result.raw_snapshot, now, now, id)
    .run();
}

async function fetchAndSaveResource(db: D1Database, id: string, url: string): Promise<void> {
  const result = await fetchUrlContent(url);
  if (!result) return;
  const now = new Date().toISOString();
  await db
    .prepare("update intelligence_resources set content_text = ?, raw_snapshot = ?, snapshot_at = ?, updated_at = ? where id = ?")
    .bind(result.content_text, result.raw_snapshot, now, now, id)
    .run();
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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
        const typeFilter = url.searchParams.get("type") || undefined;
        const uniFilter = url.searchParams.get("university_id") || undefined;
        return json({ query: q, hits: await globalSearch(env.DB, q, { type: typeFilter, university_id: uniFilter }) });
      }

      if (url.pathname === "/api/quick-capture" && request.method === "POST") {
        const payload = (await request.json()) as QuickCapturePayload;
        const result = await quickCapture(env.DB, payload);
        if (payload.url) {
          ctx.waitUntil(fetchAndSaveCandidate(env.DB, result.id, payload.url));
        }
        return json(result, 201);
      }

      if (url.pathname === "/api/patrol/run" && request.method === "POST") {
        return json(await runPatrol(env.DB));
      }

      // AI extraction over admission_notice PDFs
      const extractOneMatch = url.pathname.match(/^\/api\/resources\/([^/]+)\/extract$/);
      if (extractOneMatch && request.method === "POST") {
        const force = url.searchParams.get("force") === "1";
        return json(await extractOneResource(env, extractOneMatch[1]!, { force }));
      }

      if (url.pathname === "/api/resources/extract-all" && request.method === "POST") {
        const force = url.searchParams.get("force") === "1";
        return json(await extractAllResources(env, { force }));
      }

      const suggestMatch = url.pathname.match(/^\/api\/resources\/([^/]+)\/suggest-meta$/);
      if (suggestMatch && request.method === "POST") {
        const apply = url.searchParams.get("apply") === "1";
        return json(await suggestResourceMetaRoute(env, suggestMatch[1]!, apply));
      }

      const sourcePatrolMatch = url.pathname.match(/^\/api\/sources\/([^/]+)\/patrol$/);
      if (sourcePatrolMatch && request.method === "POST") {
        return json(await patrolSource(env.DB, sourcePatrolMatch[1]!));
      }

      // Conflict & confidence routes
      if (url.pathname === "/api/conflicts/detect" && request.method === "POST") {
        return json(await runConflictDetection(env.DB, llmConfigOrNull(env)));
      }

      const conflictResolveMatch = url.pathname.match(/^\/api\/conflicts\/([^/]+)\/resolve$/);
      if (conflictResolveMatch && request.method === "PATCH") {
        const body = (await request.json()) as { status: string; resolved_value?: string; resolution_notes?: string };
        return json(await resolveConflict(env.DB, conflictResolveMatch[1]!, body));
      }

      const conflictVerifyMatch = url.pathname.match(/^\/api\/conflicts\/([^/]+)\/verify$/);
      if (conflictVerifyMatch && request.method === "POST") {
        const conflict = await env.DB.prepare("SELECT entity_id, entity_type FROM conflicts WHERE id = ?").bind(conflictVerifyMatch[1]!).first<{ entity_id: string; entity_type: string }>();
        if (!conflict) return json({ error: "Conflict not found" }, 404);
        if (conflict.entity_type === "resource" && conflict.entity_id) {
          return json(await verifyResource(env.DB, conflict.entity_id));
        }
        return json({ ok: true });
      }

      if (url.pathname === "/api/confidence/refresh" && request.method === "POST") {
        return json(await runConfidenceUpdate(env.DB));
      }

      if (url.pathname === "/api/confidence/summary" && request.method === "GET") {
        const openConflicts = await countRows(env.DB, "conflicts", "status = ?", ["open"]);
        const resolvedConflicts = await countRows(env.DB, "conflicts", "status = ?", ["resolved"]);
        const staleConflicts = await countRows(env.DB, "conflicts", "conflict_type = ? AND status = ?", ["stale_unverified", "open"]);
        const avgScore = await env.DB.prepare("SELECT AVG(confidence_score) as avg FROM intelligence_resources WHERE confidence_score IS NOT NULL").first<{ avg: number | null }>();
        const lowScoreCount = await env.DB.prepare("SELECT COUNT(*) as cnt FROM intelligence_resources WHERE confidence_score < 0.5").first<{ cnt: number }>();
        return json({ open_conflicts: openConflicts, resolved_conflicts: resolvedConflicts, stale_unverified: staleConflicts, avg_confidence: avgScore?.avg ?? null, low_confidence_count: lowScoreCount?.cnt ?? 0 });
      }

      if ((url.pathname === "/api/review/papers" || url.pathname === "/api/review/candidates") && request.method === "GET") {
        const conditions: string[] = [];
        const params: unknown[] = [];
        const status = url.searchParams.get("status") || "pending";
        conditions.push("status = ?");
        params.push(status);
        const resourceType = url.searchParams.get("resource_type");
        if (resourceType) { conditions.push("resource_type = ?"); params.push(resourceType); }
        const universityId = url.searchParams.get("university_id");
        if (universityId) { conditions.push("university_id = ?"); params.push(universityId); }
        const sourceFilter = url.searchParams.get("source");
        if (sourceFilter) { conditions.push("source = ?"); params.push(sourceFilter); }
        const where = conditions.join(" AND ");
        const rows = await listRows(env.DB, "paper_candidates", where, params, "created_at desc");
        return json(rows.map(normalizeIntelligenceCandidate));
      }

      const reviewIdMatch = url.pathname.match(/^\/api\/review\/(?:papers|candidates)\/([^/]+)\/(accept|ignore|later|promote)$/);
      if (reviewIdMatch && request.method === "POST") {
        const id = reviewIdMatch[1]!;
        const action = reviewIdMatch[2]!;
        if (action === "accept") {
          let links: { university_id?: string; program_id?: string; professor_id?: string } | undefined;
          try { links = await request.json() as typeof links; } catch { /* no body */ }
          return json(await acceptCandidate(env.DB, id, links));
        }
        if (action === "ignore") return json(await ignoreCandidate(env.DB, id));
        if (action === "later") return json(await markForLaterCandidate(env.DB, id));
        if (action === "promote") return json(await promoteCandidate(env.DB, id));
      }

      const linkMatch = url.pathname.match(/^\/api\/review\/candidates\/([^/]+)\/link$/);
      if (linkMatch && request.method === "PATCH") {
        const links = (await request.json()) as { university_id?: string; program_id?: string; professor_id?: string };
        return json(await linkCandidate(env.DB, linkMatch[1]!, links));
      }

      const candidateRefreshMatch = url.pathname.match(/^\/api\/candidates\/([^/]+)\/refresh$/);
      if (candidateRefreshMatch && request.method === "POST") {
        const id = candidateRefreshMatch[1]!;
        const row = await env.DB.prepare("select url from paper_candidates where id = ?").bind(id).first<{ url: string }>();
        if (!row?.url) return json({ error: "Candidate not found or no URL" }, 404);
        await fetchAndSaveCandidate(env.DB, id, row.url);
        const updated = await env.DB.prepare("select * from paper_candidates where id = ?").bind(id).first<Record<string, unknown>>();
        return json(normalizeIntelligenceCandidate(updated!));
      }

      const resourceRefreshMatch = url.pathname.match(/^\/api\/resources\/([^/]+)\/refresh$/);
      if (resourceRefreshMatch && request.method === "POST") {
        const id = resourceRefreshMatch[1]!;
        const row = await env.DB.prepare("select url from intelligence_resources where id = ?").bind(id).first<{ url: string }>();
        if (!row?.url) return json({ error: "Resource not found or no URL" }, 404);
        await fetchAndSaveResource(env.DB, id, row.url);
        const updated = await env.DB.prepare("select * from intelligence_resources where id = ?").bind(id).first<Record<string, unknown>>();
        return json(normalizeRow(updated!, []));
      }

      const resDetailMatch = url.pathname.match(/^\/api\/resources\/([^/]+)$/);
      if (resDetailMatch && request.method === "GET") {
        const id = resDetailMatch[1]!;
        const resource = await env.DB.prepare("select * from intelligence_resources where id = ?").bind(id).first<Record<string, unknown>>();
        if (!resource) return json({ error: "Resource not found" }, 404);
        const res = normalizeRow(resource, ["extracted_facts"]);
        let linkedUniversity = null;
        let linkedProfessor = null;
        let linkedProgram = null;
        let linkedLab = null;
        if (res.university_id) {
          const u = await env.DB.prepare("select id, name from universities where id = ?").bind(res.university_id as string).first<{ id: string; name: string }>();
          if (u) linkedUniversity = u;
        }
        if (res.professor_id) {
          const p = await env.DB.prepare("select id, name from professors where id = ?").bind(res.professor_id as string).first<{ id: string; name: string }>();
          if (p) linkedProfessor = p;
        }
        if (res.program_id) {
          const p = await env.DB.prepare("select id, program_name from programs where id = ?").bind(res.program_id as string).first<{ id: string; program_name: string }>();
          if (p) linkedProgram = p;
        }
        if (res.lab_id) {
          const l = await env.DB.prepare("select id, lab_name from labs where id = ?").bind(res.lab_id as string).first<{ id: string; lab_name: string }>();
          if (l) linkedLab = l;
        }
        return json({ resource: res, linked_university: linkedUniversity, linked_professor: linkedProfessor, linked_program: linkedProgram, linked_lab: linkedLab });
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
        const resources = (await listRows(env.DB, "intelligence_resources", "university_id = ?", [uniId], "created_at desc")).map((r) => normalizeRow(r, []));

        const profCount = professors.length;
        const labCount = labs.length;
        const progCount = programs.length;
        const resourceCount = resources.length;
        const admissionCount = await countRows(env.DB, "paper_candidates", "university_id = ? and resource_type = ? and status != 'ignored'", [uniId, "admission_notice"]);
        const experienceCount = await countRows(env.DB, "paper_candidates", "university_id = ? and resource_type = ? and status != 'ignored'", [uniId, "experience_post"]);

        interface GapItem { label_key: string; priority: "high" | "medium" | "low"; action_id?: string | null; action_status?: string | null; resolved_by?: string | null; }
        const gaps: GapItem[] = [];
        if (progCount === 0) gaps.push({ label_key: "no_programs_for", priority: "high" });
        if (profCount === 0 && labCount === 0) gaps.push({ label_key: "no_professors_for", priority: "high" });
        if (resourceCount < 3) gaps.push({ label_key: "few_resources_for", priority: "medium" });
        if (admissionCount === 0) gaps.push({ label_key: "no_admission_for", priority: "medium" });
        if (experienceCount === 0) gaps.push({ label_key: "no_experience_for", priority: "low" });
        if (!gaps.length) gaps.push({ label_key: "none", priority: "low" });

        // Attach gap_actions status
        if (uniId) {
          const actionRows = await listRows(env.DB, "gap_actions", "university_id = ?", [uniId], "created_at desc");
          for (const gap of gaps) {
            const action = actionRows.find((a) => String(a.gap_key) === gap.label_key);
            if (action) {
              gap.action_id = String(action.id);
              gap.action_status = String(action.status);
              gap.resolved_by = action.resolved_by ? String(action.resolved_by) : null;
            }
          }
        }

        return json({ university: normalizeRow(university, []), programs, professors, labs, resources, gaps, paper_count: paperCount, task_count: taskCount });
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
    ctx.waitUntil(runPatrol(env.DB));
    ctx.waitUntil(runConflictDetection(env.DB, llmConfigOrNull(env)));
    ctx.waitUntil(runConfidenceUpdate(env.DB));
  },
};
