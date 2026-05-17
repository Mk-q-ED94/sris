import { AlertTriangle, ArrowLeft, ArrowUpRight, BookOpen, Calendar, FileText, Globe2, Mail, RefreshCw, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { extractResource, fetchResourceDetail, refreshResource, updateResource, fetchUniversities, fetchProfessors, fetchPrograms, suggestResourceMeta, summarizeResource } from "../lib/api";
import type { MetaSuggestion, SummarizeResult } from "../lib/api";
import { formatDate } from "../lib/format";
import type { ExtractedProgramFields, ExtractedProfessorFields, ExtractedProgramPageFields, ExtractedLabFields, IntelligenceResource, ResourceType, University, Professor, Program, ResourceDetailResult } from "../types/sris";
import type { PageKey } from "../components/AppShell";

const RESOURCE_TYPES: ResourceType[] = [
  "paper", "lab_page", "professor_page", "program_page", "official_page",
  "admission_notice", "experience_post", "video", "other",
];

const TYPE_COLORS: Record<string, string> = {
  paper: "bg-[var(--color-isct-soft)] text-[var(--color-isct)]",
  lab_page: "bg-[var(--color-todai-soft)] text-[var(--color-todai)]",
  professor_page: "bg-[var(--color-todai-soft)] text-[var(--color-todai)]",
  program_page: "bg-emerald-50 text-emerald-700",
  official_page: "bg-sky-50 text-sky-700",
  admission_notice: "bg-amber-50 text-amber-700",
  experience_post: "bg-purple-50 text-purple-700",
  video: "bg-rose-50 text-rose-700",
  other: "bg-gray-50 text-gray-600",
};

export function ResourceDetail({
  resourceId,
  onBack,
  onNavigate,
}: {
  resourceId: string;
  onBack: () => void;
  onNavigate: (page: PageKey, id?: string) => void;
}) {
  const { token } = useAuth();
  const { t } = useI18n();
  const rd = t.resourceDetail;

  const [data, setData] = useState<ResourceDetailResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<MetaSuggestion | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryPreview, setSummaryPreview] = useState<SummarizeResult | null>(null);

  // Edit form state
  const [editType, setEditType] = useState<ResourceType>("other");
  const [editConfidence, setEditConfidence] = useState("");
  const [editRelevanceNote, setEditRelevanceNote] = useState("");
  const [editDecisionImpact, setEditDecisionImpact] = useState("");
  const [editUniversityId, setEditUniversityId] = useState("");
  const [editProfessorId, setEditProfessorId] = useState("");
  const [editProgramId, setEditProgramId] = useState("");

  const [universities, setUniversities] = useState<University[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchResourceDetail(token, resourceId)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          initEditForm(result.resource);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, resourceId]);

  useEffect(() => {
    fetchUniversities(token).then(setUniversities).catch(() => {});
    fetchProfessors(token).then(setProfessors).catch(() => {});
    fetchPrograms(token).then(setPrograms).catch(() => {});
  }, [token]);

  function initEditForm(res: IntelligenceResource) {
    setEditType(res.resource_type);
    setEditConfidence(res.confidence ?? "");
    setEditRelevanceNote(res.relevance_note ?? "");
    setEditDecisionImpact(res.decision_impact ?? "");
    setEditUniversityId(res.university_id ?? "");
    setEditProfessorId(res.professor_id ?? "");
    setEditProgramId(res.program_id ?? "");
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    try {
      const updated = await updateResource(token, data.resource.id, {
        resource_type: editType,
        confidence: editConfidence || null,
        relevance_note: editRelevanceNote || null,
        decision_impact: editDecisionImpact || null,
        university_id: editUniversityId || null,
        professor_id: editProfessorId || null,
        program_id: editProgramId || null,
      });
      setData({ ...data, resource: updated });
      setEditing(false);
    } catch {
      // Keep edit mode on failure
    } finally {
      setSaving(false);
    }
  }

  async function handleReFetch() {
    if (!data) return;
    setFetching(true);
    try {
      const updated = await refreshResource(token, data.resource.id);
      setData({ ...data, resource: updated });
    } catch {
      // Silent failure
    } finally {
      setFetching(false);
    }
  }

  async function handleExtract(force = false) {
    if (!data) return;
    setExtracting(true);
    setExtractError(null);
    try {
      const result = await extractResource(token, data.resource.id, force);
      if (result.status === "failed") {
        setExtractError(result.reason ?? "Extraction failed");
      }
      // Re-fetch the resource to pick up extracted_facts
      const refreshed = await fetchResourceDetail(token, data.resource.id);
      setData(refreshed);
      // Auto-apply suggestions for null fields after a successful extraction
      if (result.status !== "failed") {
        if (!refreshed.resource.confidence || !refreshed.resource.decision_impact) {
          try {
            const s = await suggestResourceMeta(token, data.resource.id, true);
            setSuggestion(s);
            if (s.applied.confidence || s.applied.decision_impact) {
              const again = await fetchResourceDetail(token, data.resource.id);
              setData(again);
              initEditForm(again.resource);
            }
          } catch {
            // Non-fatal
          }
        }
        // Auto-summarize if content_text present and excerpt is empty
        if (refreshed.resource.content_text && !refreshed.resource.excerpt) {
          try {
            await summarizeResource(token, data.resource.id, true);
            const again = await fetchResourceDetail(token, data.resource.id);
            setData(again);
          } catch {
            // Non-fatal
          }
        }
      }
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  }

  async function handleSuggest() {
    if (!data) return;
    setSuggesting(true);
    setSuggestion(null);
    try {
      const s = await suggestResourceMeta(token, data.resource.id, false);
      setSuggestion(s);
    } catch {
      // Ignore — user can retry
    } finally {
      setSuggesting(false);
    }
  }

  function applySuggestion() {
    if (!suggestion) return;
    setEditConfidence(suggestion.suggested_confidence);
    setEditDecisionImpact(suggestion.suggested_decision_impact);
    setEditing(true);
    setSuggestion(null);
  }

  async function handleSummarize(apply = false) {
    if (!data) return;
    setSummarizing(true);
    setSummaryPreview(null);
    try {
      const result = await summarizeResource(token, data.resource.id, apply);
      if (result.skipped_reason) return;
      if (apply && result.applied) {
        const refreshed = await fetchResourceDetail(token, data.resource.id);
        setData(refreshed);
      } else {
        setSummaryPreview(result);
      }
    } catch {
      // Silent failure
    } finally {
      setSummarizing(false);
    }
  }

  async function applySummaryPreview() {
    if (!data || !summaryPreview) return;
    setSummarizing(true);
    try {
      await summarizeResource(token, data.resource.id, true);
      const refreshed = await fetchResourceDetail(token, data.resource.id);
      setData(refreshed);
      setSummaryPreview(null);
    } catch {
      // keep preview visible on failure
    } finally {
      setSummarizing(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="h-8 w-24 animate-pulse bg-[var(--color-paper)]" />
        <div className="h-16 w-3/4 animate-pulse bg-[var(--color-paper)]" />
        <div className="h-64 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <div className="text-center">
          <p className="text-[14px] text-[var(--color-muted)]">Resource not found</p>
          <button onClick={onBack} className="mt-4 text-[12px] text-[var(--color-todai)] hover:underline">{rd.back}</button>
        </div>
      </div>
    );
  }

  const res = data.resource;

  return (
    <div className="space-y-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-todai)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {rd.back}
      </button>

      {/* Header */}
      <section>
        <div className="flex items-center gap-3">
          <span className="rule-accent" />
          <span className="section-index">Resource</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={`mono inline-flex h-5 items-center px-1.5 text-[9px] uppercase tracking-[0.12em] ${TYPE_COLORS[res.resource_type] ?? TYPE_COLORS.other!}`}>
            {t.capture.classifiedTypes[res.resource_type] ?? res.resource_type}
          </span>
          {res.confidence && (
            <span className={`mono inline-flex h-5 items-center px-1.5 text-[9px] uppercase tracking-[0.12em] ${res.confidence === "high" ? "bg-emerald-50 text-emerald-600" : res.confidence === "official" ? "bg-sky-50 text-sky-600" : "bg-gray-50 text-gray-500"}`}>
              {res.confidence}
            </span>
          )}
          {res.confidence_score != null && (
            <span className={`mono inline-flex h-5 items-center px-1.5 text-[9px] uppercase tracking-[0.12em] ${res.confidence_score >= 0.8 ? "bg-emerald-50 text-emerald-600" : res.confidence_score >= 0.5 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
              {(res.confidence_score * 100).toFixed(0)}%
            </span>
          )}
          {res.domain_source && (
            <span className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-subtle)]">{res.domain_source}</span>
          )}
          {res.source && (
            <>
              <span className="h-px w-3 bg-[var(--color-hairline-strong)]" />
              <span className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-subtle)]">{res.source}</span>
            </>
          )}
        </div>
        <h1 className="serif mt-4 text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[44px]">
          {res.title}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <a
            href={res.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-todai)] transition-colors hover:underline"
          >
            <Globe2 className="h-3.5 w-3.5" />
            {res.url.length > 80 ? res.url.slice(0, 80) + "..." : res.url}
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </section>

      {/* Low confidence warning */}
      {res.confidence_score != null && res.confidence_score < 0.5 && (
        <div className="flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Confidence score: {(res.confidence_score * 100).toFixed(0)}% — information may be stale or unreliable. Consider re-verifying.
        </div>
      )}

      {/* Content snapshot */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="rule-accent" />
          <span className="section-index">{rd.contentSection}</span>
        </div>
        {res.content_text ? (
          <div className="border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6">
            <div className="max-h-[400px] overflow-y-auto whitespace-pre-wrap text-[13.5px] leading-[1.75] text-[var(--color-muted)]">
              {res.content_text}
            </div>
            {res.snapshot_at && (
              <div className="mt-4 border-t border-[var(--color-hairline)] pt-3 mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                {rd.snapshotAt}: {formatDate(res.snapshot_at, t.dateLocale, "")}
              </div>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-8 text-center text-[13px] text-[var(--color-muted)]">
            {rd.urlOnly}
          </div>
        )}
        <div className="mt-3">
          <button
            type="button"
            onClick={handleReFetch}
            disabled={fetching}
            className="inline-flex h-9 items-center gap-2 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-4 text-[12px] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${fetching ? "animate-spin" : ""}`} />
            {fetching ? rd.fetching : rd.reFetch}
          </button>
        </div>
      </section>

      {/* AI extracted facts — admission_notice, professor_page, program_page, lab_page */}
      {(res.resource_type === "admission_notice" ||
        res.resource_type === "professor_page" ||
        res.resource_type === "program_page" ||
        res.resource_type === "lab_page") && (
        <ExtractedFactsSection
          resource={res}
          extracting={extracting}
          error={extractError}
          onExtract={handleExtract}
          dateLocale={t.dateLocale}
        />
      )}

      {/* Excerpt */}
      {(res.excerpt || res.content_text || editing) && (
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rule-accent" />
              <span className="section-index">{rd.excerptSection}</span>
            </div>
            {res.content_text && !editing && (
              <button
                type="button"
                onClick={() => handleSummarize(false)}
                disabled={summarizing}
                className="inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-subtle)] hover:text-[var(--color-todai)] disabled:opacity-50"
              >
                <Sparkles className={`h-3 w-3 ${summarizing ? "animate-pulse" : ""}`} />
                {summarizing ? rd.summarizing : rd.summarize}
              </button>
            )}
          </div>

          {/* AI summary preview callout */}
          {summaryPreview && !summaryPreview.skipped_reason && (
            <div className="mb-4 border border-[var(--color-todai)]/30 bg-[var(--color-todai-soft)] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <div className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-todai)]">{rd.summaryPreview}</div>
                  <p className="text-[13px] leading-[1.7] text-[var(--color-ink)]">{summaryPreview.summary}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    type="button"
                    onClick={applySummaryPreview}
                    disabled={summarizing}
                    className="inline-flex h-8 items-center bg-[var(--color-todai)] px-3 text-[11px] font-medium text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {rd.applySummary}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSummaryPreview(null)}
                    className="inline-flex h-8 items-center border border-[var(--color-hairline-strong)] px-3 text-[11px] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {res.excerpt ? (
            <div className="border-l-2 border-[var(--color-todai)] bg-[var(--color-surface)] px-6 py-4 text-[13.5px] leading-[1.75] text-[var(--color-muted)] italic">
              {res.excerpt}
            </div>
          ) : (
            <div className="text-[13px] text-[var(--color-subtle)]">{rd.noExcerpt}</div>
          )}
        </section>
      )}

      {/* Metadata (editable) */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rule-accent" />
            <span className="section-index">{rd.metadataSection}</span>
          </div>
          {!editing ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSuggest}
                disabled={suggesting}
                className="inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-subtle)] hover:text-[var(--color-todai)] disabled:opacity-50"
              >
                <Sparkles className={`h-3 w-3 ${suggesting ? "animate-pulse" : ""}`} />
                {suggesting ? "Thinking…" : "AI suggest"}
              </button>
              <button
                type="button"
                onClick={() => { initEditForm(res); setEditing(true); }}
                className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-todai)] hover:underline"
              >
                {rd.edit}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-8 items-center bg-[var(--color-ink)] px-3 text-[11px] font-medium text-white hover:bg-[var(--color-todai)] disabled:opacity-50"
              >
                {rd.save}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="inline-flex h-8 items-center border border-[var(--color-hairline-strong)] px-3 text-[11px] font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                {rd.cancel}
              </button>
            </div>
          )}
        </div>

        {/* AI suggestion callout */}
        {suggestion && (
          <div className="mb-5 border border-[var(--color-todai)]/30 bg-[var(--color-todai-soft)] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-2">
                <div className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-todai)]">
                  AI suggestion
                  {suggestion.impact_source === "rules_fallback" && (
                    <span className="ml-2 text-[var(--color-subtle)]">· rules fallback</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-subtle)]">Confidence:</span>
                  <span className="mono inline-flex h-5 items-center px-1.5 text-[9px] uppercase tracking-[0.12em] bg-[var(--color-todai-soft)] text-[var(--color-todai)]">
                    {suggestion.suggested_confidence}
                  </span>
                </div>
                <p className="text-[13px] leading-[1.6] text-[var(--color-ink)]">
                  {suggestion.suggested_decision_impact}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button
                  type="button"
                  onClick={applySuggestion}
                  className="inline-flex h-8 items-center bg-[var(--color-todai)] px-3 text-[11px] font-medium text-white hover:opacity-90"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestion(null)}
                  className="inline-flex h-8 items-center border border-[var(--color-hairline-strong)] px-3 text-[11px] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <MetaField label={t.capture.resourceTypeLabel}>
            {editing ? (
              <select value={editType} onChange={(e) => setEditType(e.target.value as ResourceType)} className="block h-10 w-full border-0 border-b border-[var(--color-hairline-strong)] bg-transparent text-[14px] outline-none focus:border-[var(--color-todai)]">
                {RESOURCE_TYPES.map((rt) => (
                  <option key={rt} value={rt}>{t.capture.classifiedTypes[rt] ?? rt}</option>
                ))}
              </select>
            ) : (
              <span className={`mono inline-flex h-5 items-center px-1.5 text-[9px] uppercase tracking-[0.12em] ${TYPE_COLORS[res.resource_type] ?? TYPE_COLORS.other!}`}>
                {t.capture.classifiedTypes[res.resource_type] ?? res.resource_type}
              </span>
            )}
          </MetaField>

          <MetaField label={t.capture.confidenceLabel}>
            {editing ? (
              <select value={editConfidence} onChange={(e) => setEditConfidence(e.target.value)} className="block h-10 w-full border-0 border-b border-[var(--color-hairline-strong)] bg-transparent text-[14px] outline-none focus:border-[var(--color-todai)]">
                <option value="">—</option>
                <option value="official">Official</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="unverified">Unverified</option>
              </select>
            ) : (
              <span className="text-[14px] text-[var(--color-ink)]">{res.confidence ?? "—"}</span>
            )}
          </MetaField>

          <MetaField label={t.capture.relevanceNoteLabel}>
            {editing ? (
              <textarea value={editRelevanceNote} onChange={(e) => setEditRelevanceNote(e.target.value)} rows={2} className="block w-full resize-y border border-[var(--color-hairline-strong)] bg-[var(--color-paper)] p-2 text-[13px] leading-5 outline-none focus:border-[var(--color-todai)]" />
            ) : (
              <span className="text-[13.5px] leading-[1.6] text-[var(--color-muted)]">{res.relevance_note ?? "—"}</span>
            )}
          </MetaField>

          <MetaField label="Decision Impact">
            {editing ? (
              <textarea value={editDecisionImpact} onChange={(e) => setEditDecisionImpact(e.target.value)} rows={2} className="block w-full resize-y border border-[var(--color-hairline-strong)] bg-[var(--color-paper)] p-2 text-[13px] leading-5 outline-none focus:border-[var(--color-todai)]" />
            ) : (
              <span className="text-[13.5px] leading-[1.6] text-[var(--color-muted)]">{res.decision_impact ?? "—"}</span>
            )}
          </MetaField>
        </div>
      </section>

      {/* Linked entities */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="rule-accent" />
          <span className="section-index">{rd.linkedEntities}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <LinkedEntityCard
            label={t.nav.universities}
            name={data.linked_university?.name}
            onClick={data.linked_university ? () => onNavigate("universities", data.linked_university!.id) : undefined}
          />
          <LinkedEntityCard
            label={t.nav.professors}
            name={data.linked_professor?.name}
            onClick={data.linked_professor ? () => onNavigate("professors") : undefined}
          />
          <LinkedEntityCard
            label={t.nav.programs}
            name={data.linked_program?.program_name}
            onClick={data.linked_program ? () => onNavigate("programs") : undefined}
          />
          <LinkedEntityCard
            label={t.nav.labs}
            name={data.linked_lab?.lab_name}
            onClick={data.linked_lab ? () => onNavigate("labs") : undefined}
          />
        </div>

        {/* Edit associations */}
        {editing && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3 border-t border-[var(--color-hairline)] pt-4">
            <div>
              <label className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">{t.capture.universityLabel}</label>
              <select value={editUniversityId} onChange={(e) => setEditUniversityId(e.target.value)} className="mt-1 block h-9 w-full border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-2 text-[12px] outline-none focus:border-[var(--color-todai)]">
                <option value="">—</option>
                {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">{t.capture.programLabel}</label>
              <select value={editProgramId} onChange={(e) => setEditProgramId(e.target.value)} className="mt-1 block h-9 w-full border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-2 text-[12px] outline-none focus:border-[var(--color-todai)]">
                <option value="">—</option>
                {programs.filter((p) => !editUniversityId || p.university_id === editUniversityId).map((p) => <option key={p.id} value={p.id}>{p.program_name}</option>)}
              </select>
            </div>
            <div>
              <label className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">Professor</label>
              <select value={editProfessorId} onChange={(e) => setEditProfessorId(e.target.value)} className="mt-1 block h-9 w-full border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-2 text-[12px] outline-none focus:border-[var(--color-todai)]">
                <option value="">—</option>
                {professors.filter((p) => !editUniversityId || p.university_id === editUniversityId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Timestamps */}
      <div className="border-t border-[var(--color-hairline)] pt-6">
        <div className="flex gap-6 mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
          {res.created_at && <span>Created: {formatDate(res.created_at, t.dateLocale, "")}</span>}
          {res.updated_at && <span>Updated: {formatDate(res.updated_at, t.dateLocale, "")}</span>}
        </div>
      </div>
    </div>
  );
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--color-hairline)] bg-[var(--color-surface)] p-4">
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)] mb-2">{label}</div>
      {children}
    </div>
  );
}

function LinkedEntityCard({ label, name, onClick }: { label: string; name?: string; onClick?: () => void }) {
  return (
    <div className="border border-[var(--color-hairline)] bg-[var(--color-surface)] p-4">
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">{label}</div>
      {name ? (
        <button
          type="button"
          onClick={onClick}
          className="mt-1.5 text-[14px] font-medium text-[var(--color-todai)] text-left hover:underline"
        >
          {name}
        </button>
      ) : (
        <span className="mt-1.5 block text-[13px] text-[var(--color-subtle)]">—</span>
      )}
    </div>
  );
}

// ── AI extracted facts ──────────────────────────────────────────────────

const EXTRACT_HINTS: Record<string, string> = {
  admission_notice: "Send this PDF to an LLM to extract deadlines, English test minima, quota, MEXT eligibility, and required documents.",
  professor_page: "Send this page to an LLM to extract research interests, publications, open positions, and contact info.",
  program_page: "Send this page to an LLM to extract deadlines, requirements, quota, tuition, and scholarships.",
  lab_page: "Send this page to an LLM to extract research themes, tools, recent publications, and open positions.",
};

function ExtractedFactsSection({
  resource,
  extracting,
  error,
  onExtract,
  dateLocale,
}: {
  resource: IntelligenceResource;
  extracting: boolean;
  error: string | null;
  onExtract: (force?: boolean) => void;
  dateLocale: string;
}) {
  const facts = resource.extracted_facts ?? null;
  const status = resource.extraction_status ?? "pending";
  const hint = EXTRACT_HINTS[resource.resource_type] ?? "Send this page to an LLM to extract structured facts.";

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rule-accent" />
          <span className="section-index">AI extraction</span>
          {status === "succeeded" && resource.extracted_at && (
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
              · {formatDate(resource.extracted_at, dateLocale, "")}
              {resource.extraction_model ? ` · ${resource.extraction_model}` : ""}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onExtract(facts != null)}
          disabled={extracting}
          className="inline-flex h-9 items-center gap-2 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-4 text-[12px] font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-todai)] hover:text-[var(--color-todai)] disabled:opacity-50"
        >
          <Sparkles className={`h-3.5 w-3.5 ${extracting ? "animate-pulse" : ""}`} />
          {extracting ? "Extracting…" : facts ? "Re-extract" : "Extract fields"}
        </button>
      </div>

      {error && (
        <div className="mb-3 flex items-start gap-2 border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!facts && status === "failed" && resource.extraction_error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
          Previous extraction failed: {resource.extraction_error}
        </div>
      )}

      {!facts && status !== "failed" && (
        <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-8 text-center">
          <Sparkles className="mx-auto h-5 w-5 text-[var(--color-subtle)]" />
          <p className="mt-3 text-[13px] text-[var(--color-muted)]">{hint}</p>
          <p className="mt-1.5 mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
            Cost depends on configured provider · typically ¥0.5 – ¥5 per call
          </p>
        </div>
      )}

      {facts && resource.resource_type === "admission_notice" && (
        <ExtractedFactsView facts={facts as ExtractedProgramFields} dateLocale={dateLocale} />
      )}
      {facts && resource.resource_type === "professor_page" && (
        <ExtractedProfessorView facts={facts as ExtractedProfessorFields} />
      )}
      {facts && resource.resource_type === "program_page" && (
        <ExtractedProgramPageView facts={facts as ExtractedProgramPageFields} dateLocale={dateLocale} />
      )}
      {facts && resource.resource_type === "lab_page" && (
        <ExtractedLabView facts={facts as ExtractedLabFields} />
      )}
    </section>
  );
}

function ExtractedFactsView({
  facts,
  dateLocale,
}: {
  facts: ExtractedProgramFields;
  dateLocale: string;
}) {
  const confidenceTone =
    facts.extraction_confidence >= 0.8
      ? "bg-emerald-50 text-emerald-700"
      : facts.extraction_confidence >= 0.5
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return (
    <div className="space-y-6">
      {/* Header strip — program name + confidence */}
      <div className="border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="serif text-[22px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
              {facts.program_name}
            </div>
            {(facts.graduate_school || facts.department) && (
              <div className="mt-1 text-[12.5px] text-[var(--color-muted)]">
                {[facts.graduate_school, facts.department].filter(Boolean).join(" · ")}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {facts.degree && <Pill>{facts.degree}</Pill>}
              {facts.language && <Pill>{facts.language}</Pill>}
              {facts.intake_months.length > 0 && (
                <Pill>{facts.intake_months.join(" / ")}</Pill>
              )}
              {facts.mext_eligible && <Pill tone="todai">MEXT</Pill>}
              {facts.supervisor_consent_required && <Pill tone="warn">需联系导师</Pill>}
            </div>
          </div>
          <span className={`mono inline-flex h-6 items-center px-2 text-[10px] uppercase tracking-[0.16em] ${confidenceTone}`}>
            extraction · {(facts.extraction_confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Cycles — application windows */}
      {facts.cycles.length > 0 && (
        <FactBlock icon={Calendar} title="Application cycles">
          <ul className="divide-y divide-[var(--color-hairline)]">
            {facts.cycles.map((cycle, i) => (
              <li key={i} className="py-3 first:pt-0 last:pb-0">
                <div className="text-[14px] font-medium text-[var(--color-ink)]">{cycle.cycle_name}</div>
                <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12.5px] sm:grid-cols-3">
                  <DateRow label="Application opens" iso={cycle.application_open} locale={dateLocale} />
                  <DateRow label="Application closes" iso={cycle.application_close} locale={dateLocale} highlight />
                  <DateRow label="Consent letter due" iso={cycle.consent_letter_deadline} locale={dateLocale} />
                  <DateRow label="Exam period" iso={cycle.exam_period} locale={dateLocale} />
                  <DateRow label="Result announcement" iso={cycle.result_announcement} locale={dateLocale} />
                  <DateRow label="Enrollment" iso={cycle.enrollment_date} locale={dateLocale} />
                </dl>
              </li>
            ))}
          </ul>
        </FactBlock>
      )}

      {/* Requirements */}
      <div className="grid gap-4 md:grid-cols-2">
        <FactBlock title="Language requirements">
          <dl className="space-y-2 text-[13px]">
            <FactRow label="English test" value={facts.english_test.type} />
            <FactRow label="Min score" value={facts.english_test.minimum_score?.toString()} />
            <FactRow label="Japanese required" value={facts.japanese_test.required ? "Yes" : "No"} />
            {facts.japanese_test.type && <FactRow label="JA test" value={`${facts.japanese_test.type}${facts.japanese_test.minimum_level ? ` · ${facts.japanese_test.minimum_level}` : ""}`} />}
            {facts.english_test.notes && (
              <li className="mt-2 text-[12px] leading-5 text-[var(--color-subtle)]">{facts.english_test.notes}</li>
            )}
          </dl>
        </FactBlock>

        <FactBlock title="Cost & quota">
          <dl className="space-y-2 text-[13px]">
            <FactRow label="Annual tuition" value={facts.tuition_per_year_jpy ? `¥${facts.tuition_per_year_jpy.toLocaleString()}` : null} />
            <FactRow label="Exam fee" value={facts.exam_fee_jpy ? `¥${facts.exam_fee_jpy.toLocaleString()}` : null} />
            <FactRow label="Quota" value={facts.quota?.toString()} />
            {facts.scholarships.length > 0 && (
              <li className="mt-2">
                <div className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)] mb-1">Scholarships</div>
                <div className="flex flex-wrap gap-1">
                  {facts.scholarships.map((s) => <Pill key={s}>{s}</Pill>)}
                </div>
              </li>
            )}
          </dl>
        </FactBlock>
      </div>

      {/* Required documents */}
      {facts.documents_required.length > 0 && (
        <FactBlock icon={FileText} title="Documents required">
          <ul className="flex flex-wrap gap-2">
            {facts.documents_required.map((d) => (
              <li key={d} className="inline-flex h-7 items-center border border-[var(--color-hairline)] bg-[var(--color-paper)] px-2.5 text-[12px] text-[var(--color-ink)]">
                {d}
              </li>
            ))}
          </ul>
        </FactBlock>
      )}

      {/* Free-form notes */}
      {facts.notes && (
        <FactBlock title="Notes">
          <p className="whitespace-pre-wrap text-[13px] leading-[1.65] text-[var(--color-muted)]">{facts.notes}</p>
        </FactBlock>
      )}

      {/* Things the PDF didn't answer */}
      {facts.unresolved_questions.length > 0 && (
        <div className="border-l-2 border-amber-300 bg-amber-50/40 px-5 py-4">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-amber-700">
            Unresolved · still need to look up
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.5px] text-amber-900">
            {facts.unresolved_questions.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Professor page view ──────────────────────────────────────────────────

function ExtractedProfessorView({ facts }: { facts: ExtractedProfessorFields }) {
  const confidenceTone =
    facts.extraction_confidence >= 0.8
      ? "bg-emerald-50 text-emerald-700"
      : facts.extraction_confidence >= 0.5
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return (
    <div className="space-y-6">
      <div className="border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="serif text-[22px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">{facts.full_name}</div>
            {(facts.title || facts.affiliation || facts.department) && (
              <div className="mt-1 text-[12.5px] text-[var(--color-muted)]">
                {[facts.title, facts.department, facts.affiliation].filter(Boolean).join(" · ")}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {facts.lab_name && <Pill>{facts.lab_name}</Pill>}
              {facts.open_positions && <Pill tone="todai">Open positions</Pill>}
            </div>
          </div>
          <span className={`mono inline-flex h-6 items-center px-2 text-[10px] uppercase tracking-[0.16em] ${confidenceTone}`}>
            extraction · {(facts.extraction_confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {facts.bio_snippet && (
        <div className="border-l-2 border-[var(--color-todai)] bg-[var(--color-surface)] px-6 py-4 text-[13.5px] leading-[1.75] text-[var(--color-muted)] italic">
          {facts.bio_snippet}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {facts.research_interests.length > 0 && (
          <FactBlock title="Research interests">
            <div className="flex flex-wrap gap-2">
              {facts.research_interests.map((kw) => (
                <span key={kw} className="inline-flex h-6 items-center border border-[var(--color-hairline)] bg-[var(--color-paper)] px-2.5 text-[12px] text-[var(--color-ink)]">{kw}</span>
              ))}
            </div>
          </FactBlock>
        )}

        <FactBlock icon={Mail} title="Contact">
          <dl className="space-y-2 text-[13px]">
            <FactRow label="Email" value={facts.email} />
            {facts.contact_notes && (
              <li className="text-[12px] leading-5 text-[var(--color-subtle)]">{facts.contact_notes}</li>
            )}
          </dl>
        </FactBlock>
      </div>

      {facts.recent_publications.length > 0 && (
        <FactBlock icon={BookOpen} title="Recent publications">
          <ul className="divide-y divide-[var(--color-hairline)]">
            {facts.recent_publications.map((pub, i) => (
              <li key={i} className="py-2.5 first:pt-0 last:pb-0">
                <div className="text-[13px] leading-[1.5] text-[var(--color-ink)]">{pub.title}</div>
                {(pub.year || pub.venue) && (
                  <div className="mt-0.5 mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                    {[pub.year?.toString(), pub.venue].filter(Boolean).join(" · ")}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </FactBlock>
      )}

      {facts.unresolved_questions.length > 0 && (
        <div className="border-l-2 border-amber-300 bg-amber-50/40 px-5 py-4">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-amber-700">Unresolved · still need to look up</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.5px] text-amber-900">
            {facts.unresolved_questions.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Program page view ────────────────────────────────────────────────────

function ExtractedProgramPageView({ facts, dateLocale }: { facts: ExtractedProgramPageFields; dateLocale: string }) {
  const confidenceTone =
    facts.extraction_confidence >= 0.8
      ? "bg-emerald-50 text-emerald-700"
      : facts.extraction_confidence >= 0.5
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return (
    <div className="space-y-6">
      <div className="border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="serif text-[22px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">{facts.program_name}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {facts.degree && <Pill>{facts.degree}</Pill>}
              {facts.language && <Pill>{facts.language}</Pill>}
              {facts.mext_eligible && <Pill tone="todai">MEXT</Pill>}
              {facts.supervisor_consent_required && <Pill tone="warn">需联系导师</Pill>}
            </div>
          </div>
          <span className={`mono inline-flex h-6 items-center px-2 text-[10px] uppercase tracking-[0.16em] ${confidenceTone}`}>
            extraction · {(facts.extraction_confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {facts.application_periods.length > 0 && (
        <FactBlock icon={Calendar} title="Application periods">
          <ul className="divide-y divide-[var(--color-hairline)]">
            {facts.application_periods.map((p, i) => (
              <li key={i} className="py-3 first:pt-0 last:pb-0">
                <div className="text-[14px] font-medium text-[var(--color-ink)]">{p.label}</div>
                <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12.5px]">
                  <DateRow label="Opens" iso={p.open} locale={dateLocale} />
                  <DateRow label="Closes" iso={p.close} locale={dateLocale} highlight />
                </dl>
              </li>
            ))}
          </ul>
        </FactBlock>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <FactBlock title="Costs & quota">
          <dl className="space-y-2 text-[13px]">
            <FactRow label="Annual tuition" value={facts.tuition_per_year_jpy ? `¥${facts.tuition_per_year_jpy.toLocaleString()}` : null} />
            <FactRow label="Application fee" value={facts.application_fee_jpy ? `¥${facts.application_fee_jpy.toLocaleString()}` : null} />
            <FactRow label="Quota" value={facts.quota?.toString()} />
            {facts.scholarships.length > 0 && (
              <li className="mt-2">
                <div className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)] mb-1">Scholarships</div>
                <div className="flex flex-wrap gap-1">
                  {facts.scholarships.map((s) => <Pill key={s}>{s}</Pill>)}
                </div>
              </li>
            )}
          </dl>
        </FactBlock>

        <FactBlock title="Contact">
          <dl className="space-y-2 text-[13px]">
            <FactRow label="Email" value={facts.contact_email} />
          </dl>
        </FactBlock>
      </div>

      {facts.requirements.length > 0 && (
        <FactBlock icon={FileText} title="Requirements">
          <ul className="flex flex-wrap gap-2">
            {facts.requirements.map((r) => (
              <li key={r} className="inline-flex h-7 items-center border border-[var(--color-hairline)] bg-[var(--color-paper)] px-2.5 text-[12px] text-[var(--color-ink)]">{r}</li>
            ))}
          </ul>
        </FactBlock>
      )}

      {facts.notes && (
        <FactBlock title="Notes">
          <p className="whitespace-pre-wrap text-[13px] leading-[1.65] text-[var(--color-muted)]">{facts.notes}</p>
        </FactBlock>
      )}

      {facts.unresolved_questions.length > 0 && (
        <div className="border-l-2 border-amber-300 bg-amber-50/40 px-5 py-4">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-amber-700">Unresolved · still need to look up</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.5px] text-amber-900">
            {facts.unresolved_questions.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Lab page view ────────────────────────────────────────────────────────

function ExtractedLabView({ facts }: { facts: ExtractedLabFields }) {
  const confidenceTone =
    facts.extraction_confidence >= 0.8
      ? "bg-emerald-50 text-emerald-700"
      : facts.extraction_confidence >= 0.5
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return (
    <div className="space-y-6">
      <div className="border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="serif text-[22px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">{facts.lab_name}</div>
            {(facts.pi_name || facts.department || facts.university) && (
              <div className="mt-1 text-[12.5px] text-[var(--color-muted)]">
                {[facts.pi_name, facts.department, facts.university].filter(Boolean).join(" · ")}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {facts.open_positions && <Pill tone="todai">Open positions</Pill>}
            </div>
          </div>
          <span className={`mono inline-flex h-6 items-center px-2 text-[10px] uppercase tracking-[0.16em] ${confidenceTone}`}>
            extraction · {(facts.extraction_confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {facts.research_themes.length > 0 && (
          <FactBlock title="Research themes">
            <div className="flex flex-wrap gap-2">
              {facts.research_themes.map((t) => (
                <span key={t} className="inline-flex h-6 items-center border border-[var(--color-hairline)] bg-[var(--color-paper)] px-2.5 text-[12px] text-[var(--color-ink)]">{t}</span>
              ))}
            </div>
          </FactBlock>
        )}

        {facts.tools_methods.length > 0 && (
          <FactBlock title="Tools & methods">
            <div className="flex flex-wrap gap-2">
              {facts.tools_methods.map((t) => (
                <span key={t} className="inline-flex h-6 items-center border border-[var(--color-hairline)] bg-[var(--color-paper)] px-2.5 text-[12px] text-[var(--color-ink)]">{t}</span>
              ))}
            </div>
          </FactBlock>
        )}
      </div>

      {facts.recent_publications.length > 0 && (
        <FactBlock icon={BookOpen} title="Recent publications">
          <ul className="divide-y divide-[var(--color-hairline)]">
            {facts.recent_publications.map((pub, i) => (
              <li key={i} className="py-2.5 first:pt-0 last:pb-0">
                <div className="text-[13px] leading-[1.5] text-[var(--color-ink)]">{pub.title}</div>
                {(pub.year || pub.venue) && (
                  <div className="mt-0.5 mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                    {[pub.year?.toString(), pub.venue].filter(Boolean).join(" · ")}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </FactBlock>
      )}

      <FactBlock icon={Users} title="Contact">
        <dl className="space-y-2 text-[13px]">
          <FactRow label="PI" value={facts.pi_name} />
          <FactRow label="Email" value={facts.contact_email} />
        </dl>
      </FactBlock>

      {facts.notes && (
        <FactBlock title="Notes">
          <p className="whitespace-pre-wrap text-[13px] leading-[1.65] text-[var(--color-muted)]">{facts.notes}</p>
        </FactBlock>
      )}

      {facts.unresolved_questions.length > 0 && (
        <div className="border-l-2 border-amber-300 bg-amber-50/40 px-5 py-4">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-amber-700">Unresolved · still need to look up</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[12.5px] text-amber-900">
            {facts.unresolved_questions.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function FactBlock({
  icon: Icon,
  title,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[var(--color-hairline)] bg-[var(--color-surface)] p-5">
      <div className="mb-3 flex items-center gap-2">
        {Icon && <Icon className="h-3.5 w-3.5 text-[var(--color-subtle)]" />}
        <h3 className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "todai" | "warn" }) {
  const toneClass = {
    neutral: "border-[var(--color-hairline)] bg-[var(--color-paper)] text-[var(--color-muted)]",
    todai: "border-[var(--color-todai)]/30 bg-[var(--color-todai-soft)] text-[var(--color-todai)]",
    warn: "border-amber-200 bg-amber-50 text-amber-700",
  }[tone];
  return (
    <span className={`inline-flex h-6 items-center border px-2 text-[11px] font-medium ${toneClass}`}>
      {children}
    </span>
  );
}

function FactRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <li className="flex items-baseline justify-between gap-3">
      <span className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">{label}</span>
      <span className="text-[13px] text-[var(--color-ink)] tabular">{value ?? "—"}</span>
    </li>
  );
}

function DateRow({
  label,
  iso,
  locale,
  highlight,
}: {
  label: string;
  iso: string | null;
  locale: string;
  highlight?: boolean;
}) {
  const formatted = iso ? formatDate(iso, locale, iso) : "—";
  const isUnset = !iso;
  return (
    <div className="flex flex-col">
      <dt className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-subtle)]">{label}</dt>
      <dd
        className={`text-[13px] tabular ${
          isUnset
            ? "text-[var(--color-subtle)]"
            : highlight
              ? "font-semibold text-[var(--color-todai)]"
              : "text-[var(--color-ink)]"
        }`}
      >
        {formatted}
      </dd>
    </div>
  );
}
