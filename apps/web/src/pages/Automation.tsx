import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Workflow, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import type { AutomationRun, AutomationRunItem, AutomationRunScope } from "../types/sris";
import { runAutomation, fetchAutomationRuns, fetchAutomationRunDetail } from "../lib/api";

function formatDate(iso: string | null | undefined, locale: string, fallback = "—"): string {
  if (!iso) return fallback;
  try {
    return new Date(iso).toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return fallback;
  }
}

function durationLabel(started: string, finished: string | null): string {
  if (!finished) return "…";
  const ms = new Date(finished).getTime() - new Date(started).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

function statusBadge(status: string): { label: string; cls: string } {
  switch (status) {
    case "running": return { label: "Running", cls: "bg-blue-100 text-blue-700" };
    case "succeeded": return { label: "Succeeded", cls: "bg-green-100 text-green-700" };
    case "partial_success": return { label: "Partial", cls: "bg-amber-100 text-amber-700" };
    case "failed": return { label: "Failed", cls: "bg-red-100 text-red-700" };
    default: return { label: status, cls: "bg-[var(--color-hairline)] text-[var(--color-muted)]" };
  }
}

export function Automation() {
  const { token } = useAuth();
  const { t, lang } = useI18n();
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [scope, setScope] = useState<AutomationRunScope>("all");
  const [dryRun, setDryRun] = useState(false);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [runItems, setRunItems] = useState<AutomationRunItem[]>([]);

  const at = t.automation ?? {} as Record<string, string>;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRuns(await fetchAutomationRuns(token, 20));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load runs");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  async function handleRun() {
    setRunning(true);
    setError(null);
    try {
      await runAutomation(token, { scope, dryRun });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
    } finally {
      setRunning(false);
    }
  }

  async function handleExpand(runId: string) {
    if (expandedRun === runId) {
      setExpandedRun(null);
      setRunItems([]);
      return;
    }
    setExpandedRun(runId);
    try {
      const detail = await fetchAutomationRunDetail(token, runId);
      setRunItems(detail.items);
    } catch {
      setRunItems([]);
    }
  }

  const lastRun = runs[0];

  return (
    <section>
      <div className="flex items-center gap-3">
        <span className="rule-accent" />
        <span className="section-index">09 — {at.title ?? "Automation"}</span>
      </div>
      <h1 className="serif mt-6 text-[44px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[60px]">
        {at.title ?? "Automation"}
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[var(--color-muted)]">
        {at.description ?? "Manage and monitor the automated intelligence pipeline."}
      </p>

      {/* Last run status + Run now */}
      <div className="mt-8 flex flex-wrap items-center gap-4 border border-[var(--color-hairline)] bg-[var(--color-surface)] p-5">
        <div className="flex-1 min-w-[200px]">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">{at.lastRun ?? "Last run"}</div>
          {lastRun ? (
            <div className="mt-1 flex items-center gap-2">
              <span className={`mono inline-flex h-5 items-center px-1.5 text-[9px] uppercase tracking-[0.12em] ${statusBadge(lastRun.status).cls}`}>
                {statusBadge(lastRun.status).label}
              </span>
              <span className="text-[12px] text-[var(--color-muted)]">
                {formatDate(lastRun.started_at, lang)}
                {" · "}
                {durationLabel(lastRun.started_at, lastRun.finished_at)}
                {" · "}
                {lastRun.triggered_by}
              </span>
            </div>
          ) : (
            <div className="mt-1 text-[12px] text-[var(--color-muted)]">{at.noRuns ?? "No runs yet"}</div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as AutomationRunScope)}
            className="h-9 border border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-2 text-[12px]"
          >
            <option value="all">{at.scopeAll ?? "All"}</option>
            <option value="sources">{at.scopeSources ?? "Sources only"}</option>
            <option value="candidates">{at.scopeCandidates ?? "Candidates only"}</option>
            <option value="resources">{at.scopeResources ?? "Resources only"}</option>
            <option value="ai">{at.scopeAi ?? "AI steps only"}</option>
          </select>
          <label className="flex items-center gap-1 text-[11px] text-[var(--color-muted)]">
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} className="h-3.5 w-3.5" />
            {at.dryRun ?? "Dry run"}
          </label>
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="inline-flex h-9 min-w-[108px] items-center justify-center gap-2 bg-[var(--color-ink)] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[var(--color-todai)] disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${running ? "animate-spin" : ""}`} />
            {running ? (at.running ?? "Running…") : (at.runNow ?? "Run now")}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 border border-red-200 bg-red-50 px-4 py-2 text-[12px] text-red-700">{error}</div>
      )}

      {/* Runs table */}
      <div className="mt-8">
        <h2 className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">{at.runHistory ?? "Run history"}</h2>
        {loading ? (
          <div className="mt-4 h-40 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
        ) : runs.length === 0 ? (
          <div className="mt-4 text-[13px] text-[var(--color-muted)]">{at.noRuns ?? "No automation runs recorded yet."}</div>
        ) : (
          <div className="mt-4 space-y-0">
            {runs.map((run) => (
              <div key={run.id} className="border-b border-[var(--color-hairline)]">
                <button
                  type="button"
                  onClick={() => void handleExpand(run.id)}
                  className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 px-2 py-3 text-left transition-colors hover:bg-[var(--color-surface)]"
                >
                  {expandedRun === run.id ? <ChevronDown className="h-3.5 w-3.5 text-[var(--color-subtle)]" /> : <ChevronRight className="h-3.5 w-3.5 text-[var(--color-subtle)]" />}
                  <span className={`mono inline-flex h-5 items-center px-1.5 text-[9px] uppercase tracking-[0.12em] ${statusBadge(run.status).cls}`}>
                    {statusBadge(run.status).label}
                  </span>
                  <span className="text-[12.5px] font-medium">{run.run_type}</span>
                  <span className="mono text-[10px] text-[var(--color-subtle)]">{formatDate(run.started_at, lang)}</span>
                  <span className="text-[11px] text-[var(--color-muted)]">{durationLabel(run.started_at, run.finished_at)}</span>
                  <span className="mono text-[10px] text-[var(--color-subtle)]">{run.triggered_by}</span>
                  <span className="flex w-full flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--color-muted)] sm:ml-auto sm:w-auto">
                    <span>{run.sources_checked} src</span>
                    <span>{run.candidates_created} new</span>
                    <span>{run.candidates_enriched} enriched</span>
                    <span>{run.conflicts_detected} conflicts</span>
                    {run.failed_count > 0 && <span className="text-red-600">{run.failed_count} failed</span>}
                  </span>
                </button>
                {expandedRun === run.id && runItems.length > 0 && (
                  <div className="ml-10 mb-3 space-y-1">
                    {runItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-[11px]">
                        <span className={`mono inline-flex h-4 items-center px-1 text-[8px] uppercase ${statusBadge(item.status).cls}`}>
                          {item.status}
                        </span>
                        <span className="text-[var(--color-muted)]">{item.step}</span>
                        <span className="mono text-[10px] text-[var(--color-subtle)]">{item.item_type}{item.item_id ? `:${item.item_id.slice(0, 8)}` : ""}</span>
                        {item.error_message && <span className="text-red-600">{item.error_message}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {run.error_summary && (
                  <div className="ml-10 mb-3 text-[11px] text-amber-700">{run.error_summary}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
