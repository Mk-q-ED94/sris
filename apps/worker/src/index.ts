import type { D1Database, ExecutionContext } from "@cloudflare/workers-types";
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
import { summarizeResourceRoute } from "./routes/summarize-content";
import { generateMatchReason } from "./ai/match-reason";
import { runAutomation, type AutomationRunOptions } from "./routes/automation";
import { enrichCandidate } from "./routes/enrichment";

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
        const ingestResult = await runIngest(env.DB);
        // Wrap in automation run for tracking
        ctx.waitUntil(
          (async () => {
            try {
              const runId = crypto.randomUUID();
              const now = new Date().toISOString();
              await env.DB.prepare(
                "insert into automation_runs (id, run_type, status, started_at, finished_at, triggered_by, sources_checked, candidates_created, created_at, updated_at) values (?,?,?,?,?,?,?,?,?,?)"
              ).bind(runId, "sources", "succeeded", now, now, "api", ingestResult.sources_checked, ingestResult.candidates_created, now, now).run();
            } catch { /* non-critical */ }
          })()
        );
        return json(ingestResult);
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
          ctx.waitUntil(enrichCandidate(env.DB, result.id, llmConfigOrNull(env)));
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

      const summarizeMatch = url.pathname.match(/^\/api\/resources\/([^/]+)\/summarize$/);
      if (summarizeMatch && request.method === "POST") {
        const apply = url.searchParams.get("apply") === "1";
        return json(await summarizeResourceRoute(env, summarizeMatch[1]!, apply));
      }

      // User profile (single-row, id = 'me')
      if (url.pathname === "/api/user-profile") {
        if (request.method === "GET") {
          const row = await env.DB.prepare("SELECT * FROM user_profile WHERE id = 'me'").first<Record<string, unknown>>();
          return json(row ?? { id: "me", research_background: null, target_fields: null });
        }
        if (request.method === "PATCH") {
          const body = (await request.json()) as { research_background?: string; target_fields?: string };
          await env.DB.prepare(
            "INSERT INTO user_profile (id, research_background, target_fields, updated_at) VALUES ('me', ?, ?, ?) ON CONFLICT(id) DO UPDATE SET research_background = excluded.research_background, target_fields = excluded.target_fields, updated_at = excluded.updated_at"
          ).bind(body.research_background ?? null, body.target_fields ?? null, new Date().toISOString()).run();
          const updated = await env.DB.prepare("SELECT * FROM user_profile WHERE id = 'me'").first<Record<string, unknown>>();
          return json(updated);
        }
      }

      // AI match reason routes
      const profMatchRouteMatch = url.pathname.match(/^\/api\/professors\/([^/]+)\/match$/);
      if (profMatchRouteMatch && request.method === "POST") {
        const profId = profMatchRouteMatch[1]!;
        const llmConfig = llmConfigOrNull(env);
        if (!llmConfig) return json({ error: "LLM not configured" }, 503);
        const prof = await env.DB.prepare("SELECT * FROM professors WHERE id = ?").bind(profId).first<Record<string, unknown>>();
        if (!prof) return json({ error: "Professor not found" }, 404);
        const profile = await env.DB.prepare("SELECT * FROM user_profile WHERE id = 'me'").first<{ research_background?: string | null; target_fields?: string | null }>();
        if (!profile?.research_background) return json({ error: "User profile not set" }, 400);
        const kwArr = (() => { try { return JSON.parse(String(prof.research_keywords ?? "[]")) as string[]; } catch { return []; } })();
        const details = [
          prof.title ? `Title: ${prof.title}` : "",
          kwArr.length ? `Research keywords: ${kwArr.join(", ")}` : "",
          prof.notes ? `Notes: ${prof.notes}` : "",
        ].filter(Boolean).join("\n");
        const reason = await generateMatchReason(llmConfig, { entity_type: "professor", entity_name: String(prof.name), entity_details: details, research_background: profile.research_background, target_fields: profile.target_fields ?? "" });
        const apply = url.searchParams.get("apply") !== "0";
        if (apply) await env.DB.prepare("UPDATE professors SET match_reason = ?, updated_at = ? WHERE id = ?").bind(reason, new Date().toISOString(), profId).run();
        return json({ id: profId, match_reason: reason, applied: apply });
      }

      const progMatchRouteMatch = url.pathname.match(/^\/api\/programs\/([^/]+)\/match$/);
      if (progMatchRouteMatch && request.method === "POST") {
        const progId = progMatchRouteMatch[1]!;
        const llmConfig = llmConfigOrNull(env);
        if (!llmConfig) return json({ error: "LLM not configured" }, 503);
        const prog = await env.DB.prepare("SELECT * FROM programs WHERE id = ?").bind(progId).first<Record<string, unknown>>();
        if (!prog) return json({ error: "Program not found" }, 404);
        const profile = await env.DB.prepare("SELECT * FROM user_profile WHERE id = 'me'").first<{ research_background?: string | null; target_fields?: string | null }>();
        if (!profile?.research_background) return json({ error: "User profile not set" }, 400);
        const details = [
          prog.degree ? `Degree: ${prog.degree}` : "",
          prog.language ? `Language: ${prog.language}` : "",
          prog.requirements ? `Requirements: ${prog.requirements}` : "",
          prog.scholarship ? `Scholarship: ${prog.scholarship}` : "",
          prog.notes ? `Notes: ${prog.notes}` : "",
        ].filter(Boolean).join("\n");
        const reason = await generateMatchReason(llmConfig, { entity_type: "program", entity_name: String(prog.program_name), entity_details: details, research_background: profile.research_background, target_fields: profile.target_fields ?? "" });
        const apply = url.searchParams.get("apply") !== "0";
        if (apply) await env.DB.prepare("UPDATE programs SET match_reason = ?, updated_at = ? WHERE id = ?").bind(reason, new Date().toISOString(), progId).run();
        return json({ id: progId, match_reason: reason, applied: apply });
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

      // Automation run routes
      if (url.pathname === "/api/automation/run" && request.method === "POST") {
        const scope = (url.searchParams.get("scope") || "all") as AutomationRunOptions["scope"];
        const force = url.searchParams.get("force") === "1";
        const dryRun = url.searchParams.get("dry_run") === "1";
        return json(await runAutomation(env.DB, llmConfigOrNull(env), { scope, force, dryRun, triggeredBy: "manual" }));
      }

      if (url.pathname === "/api/automation/runs" && request.method === "GET") {
        const limit = Math.min(20, parseInt(url.searchParams.get("limit") || "10"));
        const rows = await listRows(env.DB, "automation_runs", null, [], `started_at desc limit ${limit}`);
        return json(rows.map((r) => normalizeRow(r, ["details_json"])));
      }

      const automationRunMatch = url.pathname.match(/^\/api\/automation\/runs\/([^/]+)$/);
      if (automationRunMatch && request.method === "GET") {
        const runId = automationRunMatch[1]!;
        const run = await env.DB.prepare("select * from automation_runs where id = ?").bind(runId).first<Record<string, unknown>>();
        if (!run) return json({ error: "Run not found" }, 404);
        const items = await listRows(env.DB, "automation_run_items", "run_id = ?", [runId], "created_at asc");
        return json({ run: normalizeRow(run, ["details_json"]), items: items.map((r) => normalizeRow(r, ["details_json"])) });
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
        await enrichCandidate(env.DB, id, llmConfigOrNull(env));
        const updated = await env.DB.prepare("select * from paper_candidates where id = ?").bind(id).first<Record<string, unknown>>();
        return json(normalizeIntelligenceCandidate(updated!));
      }

      const candidateEnrichMatch = url.pathname.match(/^\/api\/candidates\/([^/]+)\/enrich$/);
      if (candidateEnrichMatch && request.method === "POST") {
        const id = candidateEnrichMatch[1]!;
        return json(await enrichCandidate(env.DB, id, llmConfigOrNull(env)));
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

      if (url.pathname === "/api/program-requirements" && request.method === "GET") {
        const programsRes = await env.DB.prepare(
          "select * from programs where match_reason is not null order by deadline asc, program_name asc"
        ).all<Record<string, unknown>>();
        const universitiesRes = await env.DB.prepare(
          "select id, name, location, website from universities"
        ).all<Record<string, unknown>>();
        const uniMap = new Map<string, Record<string, unknown>>();
        for (const u of universitiesRes.results) uniMap.set(String(u.id), u);

        const results: Record<string, unknown>[] = [];
        for (const prog of programsRes.results) {
          const progId = String(prog.id);
          const uniId = String(prog.university_id);
          let resource = await env.DB.prepare(
            "select id, title, url, resource_status, extracted_facts, extracted_at, resource_type from intelligence_resources where program_id = ? and extraction_status = 'succeeded' and extracted_facts is not null order by extracted_at desc limit 1"
          ).bind(progId).first<Record<string, unknown>>();
          if (!resource) {
            resource = await env.DB.prepare(
              "select id, title, url, resource_status, extracted_facts, extracted_at, resource_type from intelligence_resources where university_id = ? and resource_type in ('program_page', 'admission_notice') and extraction_status = 'succeeded' and extracted_facts is not null order by extracted_at desc limit 1"
            ).bind(uniId).first<Record<string, unknown>>();
          }
          let extracted_fields: unknown = null;
          if (resource && typeof resource.extracted_facts === "string") {
            try { extracted_fields = JSON.parse(resource.extracted_facts); } catch { extracted_fields = null; }
          }
          results.push({
            program: prog,
            university: uniMap.get(uniId) ?? { id: uniId, name: uniId, location: null, website: null },
            extracted_fields,
            source_resource: resource ? {
              id: resource.id,
              title: resource.title,
              url: resource.url,
              resource_type: resource.resource_type,
              resource_status: resource.resource_status ?? null,
              extracted_at: resource.extracted_at ?? null,
            } : null,
          });
        }
        return json(results);
      }

      if (url.pathname === "/api/universities/summary" && request.method === "GET") {
        const rows = await env.DB.prepare(`
          SELECT u.id, u.name, u.location, u.website,
            (SELECT COUNT(*) FROM programs WHERE university_id = u.id) as program_count,
            (SELECT COUNT(*) FROM professors WHERE university_id = u.id) as professor_count,
            (SELECT COUNT(*) FROM labs WHERE university_id = u.id) as lab_count,
            (SELECT COUNT(*) FROM intelligence_resources WHERE university_id = u.id) as resource_count,
            (SELECT MAX(created_at) FROM intelligence_resources WHERE university_id = u.id) as latest_resource_at
          FROM universities u ORDER BY u.name ASC
        `).all<Record<string, unknown>>();
        return json(rows.results);
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
        const admissionCount = await countEvidenceByType(env.DB, uniId, "admission_notice");
        const experienceCount = await countEvidenceByType(env.DB, uniId, "experience_post");
        // Granular gap checks
        const programsWithDeadline = progCount > 0 ? await countRows(env.DB, "programs", "university_id = ? and deadline is not null", [uniId]) : 1;
        const programsWithRequirements = progCount > 0 ? await countRows(env.DB, "programs", "university_id = ? and requirements is not null and requirements != ''", [uniId]) : 1;
        const labPageCount = (profCount > 0 || labCount > 0) ? await countRows(env.DB, "intelligence_resources", "university_id = ? and resource_type in ('lab_page','professor_page')", [uniId]) : 1;

        interface GapItem { label_key: string; priority: "high" | "medium" | "low"; action_id?: string | null; action_status?: string | null; resolved_by?: string | null; }
        const gaps: GapItem[] = [];
        if (progCount === 0) gaps.push({ label_key: "no_programs_for", priority: "high" });
        if (profCount === 0 && labCount === 0) gaps.push({ label_key: "no_professors_for", priority: "high" });
        if (progCount > 0 && programsWithDeadline === 0) gaps.push({ label_key: "no_deadline_for", priority: "high" });
        if (resourceCount < 3) gaps.push({ label_key: "few_resources_for", priority: "medium" });
        if (admissionCount === 0) gaps.push({ label_key: "no_admission_for", priority: "medium" });
        if (progCount > 0 && programsWithRequirements === 0) gaps.push({ label_key: "no_materials_for", priority: "medium" });
        if ((profCount > 0 || labCount > 0) && labPageCount === 0) gaps.push({ label_key: "no_lab_direction_for", priority: "medium" });
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
    ctx.waitUntil(
      runAutomation(env.DB, llmConfigOrNull(env), {
        scope: "all",
        force: false,
        dryRun: false,
        triggeredBy: "cron",
      })
    );
  },
};

async function countEvidenceByType(db: D1Database, universityId: string, resourceType: string): Promise<number> {
  const row = await db
    .prepare(
      `select count(*) as cnt from (
        select id from paper_candidates where university_id = ? and resource_type = ? and status != 'ignored'
        union all
        select id from intelligence_resources where university_id = ? and resource_type = ?
      )`,
    )
    .bind(universityId, resourceType, universityId, resourceType)
    .first<{ cnt: number }>();
  return row?.cnt ?? 0;
}
