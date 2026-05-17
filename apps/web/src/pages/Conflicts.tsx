import { AlertTriangle, BrainCircuit, Check, Eye, FileText, Link2, RefreshCw, Shield, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { fetchConflicts, detectConflicts, resolveConflict, verifyConflict, refreshConfidence, fetchConfidenceSummary } from "../lib/api";
import type { Conflict as ConflictType } from "../types/sris";
import { formatDate } from "../lib/format";

type StatusFilter = "open" | "resolved" | "ignored";
const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  url_duplicate: Link2,
  title_duplicate: FileText,
  value_mismatch: AlertTriangle,
  stale_unverified: Shield,
  ai_field_conflict: BrainCircuit,
};

export function Conflicts() {
  const { token } = useAuth();
  const { t } = useI18n();
  const [conflicts, setConflicts] = useState<ConflictType[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<{ open_conflicts: number; resolved_conflicts: number; stale_unverified: number; avg_confidence: number | null; low_confidence_count: number } | null>(null);

  function loadData() {
    setLoading(true);
    Promise.all([
      fetchConflicts(token, { status: statusFilter, conflict_type: typeFilter || undefined }),
      fetchConfidenceSummary(token),
    ])
      .then(([c, s]) => { setConflicts(c); setSummary(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, [token, statusFilter, typeFilter]);

  async function handleDetect() {
    setDetecting(true);
    try { await detectConflicts(token); } catch { /* */ }
    setDetecting(false);
    loadData();
  }

  async function handleRefresh() {
    setRefreshing(true);
    try { await refreshConfidence(token); } catch { /* */ }
    setRefreshing(false);
    loadData();
  }

  async function handleResolve(id: string, status: string, resolvedValue?: string) {
    setResolving(id);
    try {
      await resolveConflict(token, id, { status, resolved_value: resolvedValue, resolution_notes: notes[id] || undefined });
    } catch { /* */ }
    setResolving(null);
    setNotes((prev) => { const next = { ...prev }; delete next[id]; return next; });
    loadData();
  }

  async function handleVerify(id: string) {
    setResolving(id);
    try { await verifyConflict(token, id); } catch { /* */ }
    setResolving(null);
    loadData();
  }

  function typeLabel(type: string): string {
    const map: Record<string, string> = {
      url_duplicate: t.conflicts.typeUrlDuplicate,
      title_duplicate: t.conflicts.typeTitleDuplicate,
      value_mismatch: t.conflicts.typeValueMismatch,
      stale_unverified: t.conflicts.typeStaleUnverified,
      ai_field_conflict: t.conflicts.typeAiFieldConflict,
    };
    return map[type] ?? type;
  }

  function typeBadgeCls(type: string): string {
    const map: Record<string, string> = {
      url_duplicate: "bg-blue-100 text-blue-700",
      title_duplicate: "bg-purple-100 text-purple-700",
      value_mismatch: "bg-amber-100 text-amber-700",
      stale_unverified: "bg-gray-100 text-gray-600",
      ai_field_conflict: "bg-emerald-100 text-emerald-700",
    };
    return map[type] ?? "bg-gray-100 text-gray-600";
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <span className="rule-accent" />
          <span className="section-index">10 — {t.conflicts.title}</span>
        </div>
        <h1 className="serif mt-6 text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[56px]">
          {t.conflicts.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[14.5px] leading-[1.8] text-[var(--color-muted)]">
          {t.conflicts.description}
        </p>
        {summary && (
          <div className="mt-4 flex gap-6 text-[12px] text-[var(--color-muted)]">
            <span>{t.conflicts.filterOpen}: <strong className="text-[var(--color-ink)]">{summary.open_conflicts}</strong></span>
            <span>{t.conflicts.filterResolved}: <strong className="text-[var(--color-ink)]">{summary.resolved_conflicts}</strong></span>
            {summary.avg_confidence != null && (
              <span>Avg confidence: <strong className="text-[var(--color-ink)]">{(summary.avg_confidence * 100).toFixed(0)}%</strong></span>
            )}
          </div>
        )}
      </div>

      {/* Filters + actions */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rule-accent" />
            <span className="section-index">Conflicts</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Status tabs */}
            {(["open", "resolved", "ignored"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`h-8 px-3 text-[11px] font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-[var(--color-ink)] text-white"
                    : "border border-[var(--color-hairline-strong)] text-[var(--color-muted)] hover:border-[var(--color-todai)] hover:text-[var(--color-todai)]"
                }`}
              >
                {s === "open" ? t.conflicts.filterOpen : s === "resolved" ? t.conflicts.filterResolved : t.conflicts.filterIgnored}
              </button>
            ))}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8 border border-[var(--color-hairline-strong)] bg-transparent px-2 text-[11px] text-[var(--color-muted)]"
            >
              <option value="">{t.conflicts.allTypes}</option>
              <option value="url_duplicate">{t.conflicts.typeUrlDuplicate}</option>
              <option value="title_duplicate">{t.conflicts.typeTitleDuplicate}</option>
              <option value="value_mismatch">{t.conflicts.typeValueMismatch}</option>
              <option value="stale_unverified">{t.conflicts.typeStaleUnverified}</option>
              <option value="ai_field_conflict">{t.conflicts.typeAiFieldConflict}</option>
            </select>
            <button
              type="button"
              onClick={handleDetect}
              disabled={detecting}
              className="inline-flex h-8 items-center gap-1.5 border border-[var(--color-todai)] bg-[var(--color-todai-soft)] px-3 text-[11px] font-medium text-[var(--color-todai)] transition-colors hover:bg-[var(--color-todai)] hover:text-white disabled:opacity-40"
            >
              {detecting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
              {detecting ? t.conflicts.detecting : t.conflicts.detectNow}
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex h-8 items-center gap-1.5 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-3 text-[11px] font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-todai)] hover:text-[var(--color-todai)] disabled:opacity-40"
            >
              {refreshing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              {t.conflicts.runRefresh}
            </button>
          </div>
        </div>

        {/* Conflict cards */}
        {loading ? (
          <div className="h-40 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
        ) : conflicts.length === 0 ? (
          <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-10 text-center text-[13px] text-[var(--color-muted)]">
            <p>{t.conflicts.noConflicts}</p>
            <p className="mt-2 text-[12px]">{t.conflicts.noConflictsHelper}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conflicts.map((c) => {
              const Icon = TYPE_ICONS[c.conflict_type] ?? AlertTriangle;
              const isResolving = resolving === c.id;
              return (
                <div key={c.id} className="border border-[var(--color-hairline)] bg-[var(--color-surface)] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-[var(--color-subtle)]" />
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${typeBadgeCls(c.conflict_type)}`}>
                          {typeLabel(c.conflict_type)}
                        </span>
                        {c.auto_detected && (
                          <span className="text-[10px] text-[var(--color-subtle)]">{t.conflicts.autoDetected}</span>
                        )}
                      </div>
                      <p className="mt-2 text-[13px] leading-[1.7] text-[var(--color-ink)]">
                        {c.description}
                      </p>
                      {c.conflict_type === "ai_field_conflict" && c.sources_involved && c.sources_involved.length >= 2 ? (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {(c.sources_involved as { table: string; id: string; value?: string }[]).slice(0, 2).map((s, i) => (
                            <div key={i} className="border border-[var(--color-hairline)] bg-[var(--color-paper)] p-2">
                              <div className="mono mb-1 text-[9px] text-[var(--color-subtle)]">
                                {i === 0 ? "Source A" : "Source B"} · {s.id.slice(0, 10)}
                              </div>
                              <div className="text-[12px] font-medium text-[var(--color-ink)]">{s.value ?? "—"}</div>
                            </div>
                          ))}
                        </div>
                      ) : c.sources_involved && c.sources_involved.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(c.sources_involved as { table: string; id: string; value?: string }[]).map((s, i) => (
                            <span key={i} className="mono text-[10px] text-[var(--color-muted)] border border-[var(--color-hairline)] px-1.5 py-0.5">
                              {s.table}:{s.id.slice(0, 12)}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <div className="mt-2 flex gap-4 text-[11px] text-[var(--color-subtle)]">
                        <span>{t.conflicts.detectedAt}: {c.detected_at ? formatDate(c.detected_at, t.dateLocale, "—") : "—"}</span>
                        {c.resolved_at && <span>{t.conflicts.resolvedAt}: {formatDate(c.resolved_at, t.dateLocale, "—")}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    {statusFilter === "open" && (
                      <div className="flex flex-col gap-2">
                        {c.conflict_type === "stale_unverified" && (
                          <button
                            type="button"
                            onClick={() => handleVerify(c.id)}
                            disabled={isResolving}
                            className="inline-flex h-7 items-center gap-1.5 border border-[var(--color-todai)] bg-[var(--color-todai-soft)] px-2.5 text-[11px] font-medium text-[var(--color-todai)] hover:bg-[var(--color-todai)] hover:text-white disabled:opacity-40"
                          >
                            <Eye className="h-3 w-3" />
                            {t.conflicts.verify}
                          </button>
                        )}
                        {c.conflict_type === "value_mismatch" && c.sources_involved.length > 0 && (c.sources_involved as { table: string; id: string; value?: string }[]).map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleResolve(c.id, "resolved", s.value)}
                            disabled={isResolving}
                            className="inline-flex h-7 items-center gap-1.5 border border-[var(--color-hairline-strong)] px-2.5 text-[11px] font-medium text-[var(--color-muted)] hover:border-[var(--color-todai)] hover:text-[var(--color-todai)] disabled:opacity-40"
                          >
                            <Check className="h-3 w-3" />
                            {t.conflicts.keepValue}: {(s.value ?? "").slice(0, 30)}
                          </button>
                        ))}
                        {c.conflict_type === "ai_field_conflict" && c.sources_involved && (c.sources_involved as { table: string; id: string; value?: string }[]).length >= 2 && (
                          <>
                            {(c.sources_involved as { table: string; id: string; value?: string }[]).slice(0, 2).map((s, i) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => handleResolve(c.id, "resolved", s.value)}
                                disabled={isResolving}
                                className="inline-flex h-7 items-center gap-1.5 border border-[var(--color-hairline-strong)] px-2.5 text-[11px] font-medium text-[var(--color-muted)] hover:border-[var(--color-todai)] hover:text-[var(--color-todai)] disabled:opacity-40"
                              >
                                <Check className="h-3 w-3" />
                                {t.conflicts.trustSource} {i === 0 ? "A" : "B"}
                              </button>
                            ))}
                          </>
                        )}
                        {c.conflict_type !== "stale_unverified" && c.conflict_type !== "value_mismatch" && c.conflict_type !== "ai_field_conflict" && (
                          <button
                            type="button"
                            onClick={() => handleResolve(c.id, "resolved")}
                            disabled={isResolving}
                            className="inline-flex h-7 items-center gap-1.5 border border-[var(--color-todai)] bg-[var(--color-todai-soft)] px-2.5 text-[11px] font-medium text-[var(--color-todai)] hover:bg-[var(--color-todai)] hover:text-white disabled:opacity-40"
                          >
                            <Check className="h-3 w-3" />
                            {t.conflicts.resolve}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleResolve(c.id, "ignored")}
                          disabled={isResolving}
                          className="inline-flex h-7 items-center gap-1.5 border border-[var(--color-hairline-strong)] px-2.5 text-[11px] font-medium text-[var(--color-subtle)] hover:text-[var(--color-muted)] disabled:opacity-40"
                        >
                          {t.conflicts.ignore}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Resolution notes input for open conflicts */}
                  {statusFilter === "open" && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={notes[c.id] ?? ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [c.id]: e.target.value }))}
                        placeholder={t.conflicts.resolutionNotesPlaceholder}
                        className="flex-1 border border-[var(--color-hairline)] bg-[var(--color-paper)] px-3 py-1.5 text-[12px] text-[var(--color-ink)] placeholder:text-[var(--color-subtle)]"
                      />
                    </div>
                  )}

                  {/* Show resolution info for resolved/ignored */}
                  {(c.status === "resolved" || c.status === "ignored") && c.resolution_notes && (
                    <div className="mt-2 border-l-2 border-[var(--color-hairline-strong)] pl-3 text-[12px] text-[var(--color-muted)]">
                      {c.resolution_notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
