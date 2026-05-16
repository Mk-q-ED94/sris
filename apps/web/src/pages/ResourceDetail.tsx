import { AlertTriangle, ArrowLeft, ArrowUpRight, Globe2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { fetchResourceDetail, refreshResource, updateResource, fetchUniversities, fetchProfessors, fetchPrograms } from "../lib/api";
import { formatDate } from "../lib/format";
import type { IntelligenceResource, ResourceType, University, Professor, Program, ResourceDetailResult } from "../types/sris";
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

      {/* Excerpt */}
      {(res.excerpt || editing) && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="rule-accent" />
            <span className="section-index">{rd.excerptSection}</span>
          </div>
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
            <button
              type="button"
              onClick={() => { initEditForm(res); setEditing(true); }}
              className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-todai)] hover:underline"
            >
              {rd.edit}
            </button>
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
