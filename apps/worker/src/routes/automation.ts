import type { D1Database } from "@cloudflare/workers-types";
import type { LlmConfig } from "../ai/extract-program";
import { runIngest, type IngestResult } from "../ingest";
import { runPatrol } from "./patrol";
import { patrolSource } from "./patrol";
import { enrichPendingCandidates } from "./enrichment";
import { runConflictDetection } from "./conflict";
import { runConfidenceUpdate } from "./confidence";

export interface AutomationRunOptions {
  scope: "all" | "sources" | "candidates" | "resources" | "ai";
  force: boolean;
  dryRun: boolean;
  triggeredBy: "cron" | "manual" | "api";
}

export interface AutomationRunResult {
  id: string;
  run_type: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  triggered_by: string;
  sources_checked: number;
  candidates_created: number;
  candidates_enriched: number;
  resources_extracted: number;
  conflicts_detected: number;
  failed_count: number;
  llm_input_tokens: number;
  llm_output_tokens: number;
  error_summary: string | null;
}

export async function runAutomation(
  db: D1Database,
  llmConfig: LlmConfig | null,
  options: AutomationRunOptions,
): Promise<AutomationRunResult> {
  const runId = crypto.randomUUID();
  const now = new Date().toISOString();
  const runType = options.scope;

  // Prevent overlapping runs
  const existing = await db
    .prepare("select id from automation_runs where status = 'running' and started_at > datetime('now', '-30 minutes')")
    .first<{ id: string }>();
  if (existing && !options.force) {
    return {
      id: existing.id,
      run_type: runType,
      status: "running",
      started_at: now,
      finished_at: null,
      triggered_by: options.triggeredBy,
      sources_checked: 0,
      candidates_created: 0,
      candidates_enriched: 0,
      resources_extracted: 0,
      conflicts_detected: 0,
      failed_count: 0,
      llm_input_tokens: 0,
      llm_output_tokens: 0,
      error_summary: "Another run is already in progress. Use force=1 to override.",
    };
  }

  // Mark stale running as failed
  if (existing) {
    await db
      .prepare("update automation_runs set status = 'failed', error_summary = 'Superseded by forced run', finished_at = ?, updated_at = ? where id = ?")
      .bind(now, now, existing.id)
      .run();
  }

  // Create run record
  await db
    .prepare(
      "insert into automation_runs (id, run_type, status, started_at, triggered_by, created_at, updated_at) values (?,?,?,?,?,?,?)",
    )
    .bind(runId, runType, "running", now, options.triggeredBy, now, now)
    .run();

  if (options.dryRun) {
    const counts = await estimateDryRun(db, options.scope);
    await db
      .prepare("update automation_runs set status = 'succeeded', finished_at = ?, updated_at = ? where id = ?")
      .bind(now, now, runId)
      .run();
    return { id: runId, run_type: runType, status: "succeeded", started_at: now, finished_at: now, triggered_by: options.triggeredBy, ...counts, error_summary: "dry run — no actions taken" };
  }

  // Execute sub-steps based on scope
  const acc = {
    sources_checked: 0,
    candidates_created: 0,
    candidates_enriched: 0,
    resources_extracted: 0,
    conflicts_detected: 0,
    failed_count: 0,
    llm_input_tokens: 0,
    llm_output_tokens: 0,
  };
  const errors: string[] = [];

  const shouldRun = (step: "ingest" | "patrol" | "enrich" | "conflict" | "confidence"): boolean => {
    if (options.scope === "all") return true;
    if (options.scope === "sources") return step === "ingest" || step === "patrol";
    if (options.scope === "candidates") return step === "enrich";
    if (options.scope === "resources") return step === "conflict" || step === "confidence";
    if (options.scope === "ai") return step === "enrich" || step === "conflict";
    return false;
  };

  // Step: Ingest
  if (shouldRun("ingest")) {
    try {
      const ingestResult: IngestResult = await runIngest(db);
      acc.sources_checked += ingestResult.sources_checked;
      acc.candidates_created += ingestResult.candidates_created;
      await createRunItem(db, runId, "system", null, "ingest", "succeeded");
    } catch (e) {
      acc.failed_count++;
      errors.push(`ingest: ${e instanceof Error ? e.message : String(e)}`);
      await createRunItem(db, runId, "system", null, "ingest", "failed", e instanceof Error ? e.message : String(e));
    }
  }

  // Step: Patrol
  if (shouldRun("patrol")) {
    try {
      const patrolResult = await runPatrolWithTracking(db, runId, options.force);
      acc.sources_checked += patrolResult.checked;
      acc.candidates_created += patrolResult.changed;
      acc.failed_count += patrolResult.failed;
      await createRunItem(db, runId, "system", null, "patrol", patrolResult.failed > 0 ? "partial" : "succeeded");
    } catch (e) {
      acc.failed_count++;
      errors.push(`patrol: ${e instanceof Error ? e.message : String(e)}`);
      await createRunItem(db, runId, "system", null, "patrol", "failed", e instanceof Error ? e.message : String(e));
    }
  }

  // Step: Enrichment
  if (shouldRun("enrich")) {
    try {
      const enrichResult = await enrichPendingCandidates(db, llmConfig, runId);
      acc.candidates_enriched += enrichResult.enriched;
      acc.failed_count += enrichResult.failed;
      acc.llm_input_tokens += enrichResult.llm_input;
      acc.llm_output_tokens += enrichResult.llm_output;
      await createRunItem(db, runId, "system", null, "enrich", enrichResult.failed > 0 ? "partial" : "succeeded");
    } catch (e) {
      acc.failed_count++;
      errors.push(`enrichment: ${e instanceof Error ? e.message : String(e)}`);
      await createRunItem(db, runId, "system", null, "enrich", "failed", e instanceof Error ? e.message : String(e));
    }
  }

  // Step: Conflict detection
  if (shouldRun("conflict")) {
    try {
      const conflictResult = await runConflictDetection(db, llmConfig);
      acc.conflicts_detected += conflictResult.detected;
      await createRunItem(db, runId, "system", null, "conflict_detect", "succeeded");
    } catch (e) {
      acc.failed_count++;
      errors.push(`conflict: ${e instanceof Error ? e.message : String(e)}`);
      await createRunItem(db, runId, "system", null, "conflict_detect", "failed", e instanceof Error ? e.message : String(e));
    }
  }

  // Step: Confidence update
  if (shouldRun("confidence")) {
    try {
      const confResult = await runConfidenceUpdate(db);
      acc.resources_extracted += confResult.updated;
      await createRunItem(db, runId, "system", null, "confidence", "succeeded");
    } catch (e) {
      acc.failed_count++;
      errors.push(`confidence: ${e instanceof Error ? e.message : String(e)}`);
      await createRunItem(db, runId, "system", null, "confidence", "failed", e instanceof Error ? e.message : String(e));
    }
  }

  // Determine final status
  const totalSteps = [shouldRun("ingest"), shouldRun("patrol"), shouldRun("enrich"), shouldRun("conflict"), shouldRun("confidence")].filter(Boolean).length;
  const finalStatus = acc.failed_count === 0 ? "succeeded" : acc.failed_count < totalSteps ? "partial_success" : "failed";
  const finishedAt = new Date().toISOString();
  const errorSummary = errors.length ? errors.join("; ") : null;

  await db
    .prepare(
      `update automation_runs set status = ?, finished_at = ?, sources_checked = ?, candidates_created = ?, candidates_enriched = ?, resources_extracted = ?, conflicts_detected = ?, failed_count = ?, llm_input_tokens = ?, llm_output_tokens = ?, error_summary = ?, updated_at = ? where id = ?`,
    )
    .bind(finalStatus, finishedAt, acc.sources_checked, acc.candidates_created, acc.candidates_enriched, acc.resources_extracted, acc.conflicts_detected, acc.failed_count, acc.llm_input_tokens, acc.llm_output_tokens, errorSummary, finishedAt, runId)
    .run();

  return {
    id: runId,
    run_type: runType,
    status: finalStatus,
    started_at: now,
    finished_at: finishedAt,
    triggered_by: options.triggeredBy,
    ...acc,
    error_summary: errorSummary,
  };
}

async function runPatrolWithTracking(
  db: D1Database,
  runId: string,
  force: boolean,
): Promise<{ checked: number; changed: number; failed: number }> {
  const rows = await db
    .prepare("select id, source_type, url, check_frequency, last_checked_at from radar_sources where enabled = 1 and source_type != 'arxiv' and url is not null and url != ''")
    .all<{ id: string; source_type: string; url: string; check_frequency: string | null; last_checked_at: string | null }>();

  let checked = 0;
  let changed = 0;
  let failed = 0;
  const now = new Date().toISOString();

  for (const source of rows.results || []) {
    const isDue = force || checkDue(source.check_frequency, source.last_checked_at);
    if (!isDue) continue;

    const result = await patrolSource(db, source.id);
    checked++;

    // Update source tracking fields
    if (result.status === "failed") {
      failed++;
      await db
        .prepare("update radar_sources set consecutive_failures = consecutive_failures + 1, last_error = ?, last_run_at = ?, last_run_id = ?, updated_at = ? where id = ?")
        .bind(`Patrol failed at ${now}`, now, runId, now, source.id)
        .run();
    } else {
      if (result.status === "changed") {
        changed++;
        await db
          .prepare("update radar_sources set consecutive_failures = 0, last_error = null, last_candidate_created_at = ?, last_run_at = ?, last_run_id = ?, updated_at = ? where id = ?")
          .bind(now, now, runId, now, source.id)
          .run();
      } else {
        await db
          .prepare("update radar_sources set consecutive_failures = 0, last_error = null, last_run_at = ?, last_run_id = ?, updated_at = ? where id = ?")
          .bind(now, runId, now, source.id)
          .run();
      }
    }

    await createRunItem(db, runId, "source", source.id, "patrol", result.status === "failed" ? "failed" : "succeeded");
  }

  // Mark stale
  await db
    .prepare("update radar_sources set patrol_status = 'stale' where enabled = 1 and source_type != 'arxiv' and url is not null and url != '' and patrol_status = 'ok' and last_checked_at < datetime('now', '-14 day')")
    .run();

  return { checked, changed, failed };
}

function checkDue(frequency: string | null, lastCheckedAt: string | null): boolean {
  if (!frequency || frequency === "manual") return false;
  if (!lastCheckedAt) return true;
  const last = new Date(lastCheckedAt).getTime();
  const daysSince = (Date.now() - last) / (1000 * 60 * 60 * 24);
  if (frequency === "daily") return daysSince >= 1;
  if (frequency === "weekly") return daysSince >= 7;
  if (frequency === "monthly") return daysSince >= 30;
  return daysSince >= 7;
}

async function createRunItem(
  db: D1Database,
  runId: string,
  itemType: string,
  itemId: string | null,
  step: string,
  status: string,
  errorMessage?: string,
): Promise<void> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db
    .prepare("insert into automation_run_items (id, run_id, item_type, item_id, step, status, finished_at, error_message, created_at) values (?,?,?,?,?,?,?,?,?)")
    .bind(id, runId, itemType, itemId, step, status, now, errorMessage ?? null, now)
    .run();
}

async function estimateDryRun(
  db: D1Database,
  scope: string,
): Promise<Omit<AutomationRunResult, "id" | "run_type" | "status" | "started_at" | "finished_at" | "triggered_by" | "error_summary">> {
  let sourcesChecked = 0;
  let candidatesCreated = 0;
  let candidatesEnriched = 0;
  let resourcesExtracted = 0;
  let conflictsDetected = 0;

  if (scope === "all" || scope === "sources") {
    const arxivSources = await db.prepare("select count(*) as cnt from radar_sources where enabled = 1 and source_type = 'arxiv'").first<{ cnt: number }>();
    sourcesChecked += arxivSources?.cnt ?? 0;

    const patrolDue = await db.prepare("select count(*) as cnt from radar_sources where enabled = 1 and source_type != 'arxiv' and url is not null and url != ''").first<{ cnt: number }>();
    sourcesChecked += patrolDue?.cnt ?? 0;
  }

  if (scope === "all" || scope === "candidates" || scope === "ai") {
    const pendingEnrich = await db.prepare("select count(*) as cnt from paper_candidates where status = 'pending' and enrichment_status = 'pending'").first<{ cnt: number }>();
    candidatesEnriched = pendingEnrich?.cnt ?? 0;
  }

  if (scope === "all" || scope === "resources" || scope === "ai") {
    const openConflicts = await db.prepare("select count(*) as cnt from conflicts where status = 'open'").first<{ cnt: number }>();
    conflictsDetected = openConflicts?.cnt ?? 0;
  }

  return { sources_checked: sourcesChecked, candidates_created: candidatesCreated, candidates_enriched: candidatesEnriched, resources_extracted: resourcesExtracted, conflicts_detected: conflictsDetected, failed_count: 0, llm_input_tokens: 0, llm_output_tokens: 0 };
}
