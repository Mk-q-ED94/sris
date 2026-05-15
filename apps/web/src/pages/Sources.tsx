import { Bookmark, CalendarRange, Check, Copy, Plus, Radar, AlertTriangle, Pencil, Trash2, Globe2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { buildIcalUrl, fetchRadarSources, createRadarSource, updateRadarSource, deleteRadarSource, fetchUniversities, type RadarSource } from "../lib/api";
import { formatDate } from "../lib/format";
import type { University } from "../types/sris";

function buildBookmarklet(origin: string): string {
  const SRIS_ORIGIN = origin;
  const code = `(function(){var u=encodeURIComponent(location.href);var t=encodeURIComponent(document.title||'');var s=encodeURIComponent((window.getSelection&&getSelection().toString())||'');var w=window.open('${SRIS_ORIGIN}/#capture?url='+u+'&title='+t+'&text='+s,'_blank','width=520,height=640');if(!w)location.href='${SRIS_ORIGIN}/#capture?url='+u+'&title='+t+'&text='+s;})();`;
  return `javascript:${code}`;
}

export function Sources() {
  const { token } = useAuth();
  const { t } = useI18n();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const icalUrl = useMemo(() => buildIcalUrl(token), [token]);
  const bookmarklet = useMemo(() => buildBookmarklet(origin), [origin]);
  const [icalCopied, setIcalCopied] = useState(false);
  const [bookmarkletCopied, setBookmarkletCopied] = useState(false);

  const [sources, setSources] = useState<RadarSource[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSource, setEditingSource] = useState<RadarSource | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("arxiv");
  const [formUrl, setFormUrl] = useState("");
  const [formQuery, setFormQuery] = useState("");
  const [formKeywords, setFormKeywords] = useState("");
  const [formUniversityId, setFormUniversityId] = useState("");
  const [formConfidence, setFormConfidence] = useState("medium");
  const [formFrequency, setFormFrequency] = useState("daily");
  const [formEnabled, setFormEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  async function copy(value: string, setter: (b: boolean) => void) {
    try {
      await navigator.clipboard.writeText(value);
      setter(true);
      window.setTimeout(() => setter(false), 1800);
    } catch {
      window.prompt("Copy", value);
    }
  }

  function loadSources() {
    setLoading(true);
    Promise.all([fetchRadarSources(token), fetchUniversities(token)])
      .then(([s, u]) => { setSources(s); setUniversities(u); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadSources(); }, [token]);

  function resetForm() {
    setFormName(""); setFormType("arxiv"); setFormUrl(""); setFormQuery("");
    setFormKeywords(""); setFormUniversityId(""); setFormConfidence("medium");
    setFormFrequency("daily"); setFormEnabled(true);
    setEditingSource(null); setShowForm(false);
  }

  function startEdit(src: RadarSource) {
    setEditingSource(src);
    setFormName(src.name); setFormType(src.source_type); setFormUrl(src.url ?? "");
    setFormQuery(src.query ?? ""); setFormKeywords(src.keywords?.join(", ") ?? "");
    setFormUniversityId(src.university_id ?? ""); setFormConfidence(src.confidence ?? "medium");
    setFormFrequency(src.check_frequency ?? "daily"); setFormEnabled(src.enabled);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload: Record<string, unknown> = {
      name: formName,
      source_type: formType,
      url: formUrl || null,
      query: formQuery || null,
      keywords: formKeywords ? formKeywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
      enabled: formEnabled ? 1 : 0,
      university_id: formUniversityId || null,
      confidence: formConfidence || null,
      check_frequency: formFrequency || null,
    };
    try {
      if (editingSource) {
        await updateRadarSource(token, editingSource.id, payload);
      } else {
        await createRadarSource(token, payload);
      }
      resetForm();
      loadSources();
    } catch { /* handle error */ }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    try { await deleteRadarSource(token, id); loadSources(); } catch { /* handle error */ }
  }

  const uniMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of universities) m.set(u.id, u.name);
    return m;
  }, [universities]);

  function isStale(src: RadarSource): boolean {
    if (!src.last_run_at) return src.enabled;
    const diff = Date.now() - new Date(src.last_run_at).getTime();
    return diff > 7 * 24 * 60 * 60 * 1000;
  }

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-3">
          <span className="rule-accent" />
          <span className="section-index">09 — {t.sources.title}</span>
        </div>
        <h1 className="serif mt-6 text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[56px]">
          {t.sources.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[14.5px] leading-[1.8] text-[var(--color-muted)]">
          {t.sources.description}
        </p>
      </div>

      {/* Source table */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rule-accent" />
            <span className="section-index">Source Hub</span>
          </div>
          <button
            type="button"
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex h-9 items-center gap-2 border border-[var(--color-todai)] bg-[var(--color-todai-soft)] px-4 text-[12px] font-medium text-[var(--color-todai)] transition-colors hover:bg-[var(--color-todai)] hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            {t.sources.newSource}
          </button>
        </div>

        {loading ? (
          <div className="h-40 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
        ) : sources.length === 0 ? (
          <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-10 text-center text-[13px] text-[var(--color-muted)]">
            No sources configured. Click "New source" to add one.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[var(--color-hairline)] bg-[var(--color-surface)]">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--color-hairline-strong)] bg-[var(--color-paper)]">
                  <th className="px-4 py-3 font-medium text-[var(--color-muted)]">{t.sources.sourceNameLabel}</th>
                  <th className="px-4 py-3 font-medium text-[var(--color-muted)]">{t.sources.sourceTypeLabel}</th>
                  <th className="px-4 py-3 font-medium text-[var(--color-muted)]">{t.sources.universityLabel}</th>
                  <th className="px-4 py-3 font-medium text-[var(--color-muted)]">{t.sources.confidenceLabel}</th>
                  <th className="px-4 py-3 font-medium text-[var(--color-muted)]">{t.sources.lastRunLabel}</th>
                  <th className="px-4 py-3 font-medium text-[var(--color-muted)]">{t.sources.enabledLabel}</th>
                  <th className="px-4 py-3 font-medium text-[var(--color-muted)]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-hairline)]">
                {sources.map((src) => (
                  <tr key={src.id} className={isStale(src) ? "bg-[var(--color-todai-soft)]/30" : ""}>
                    <td className="px-4 py-3 font-medium text-[var(--color-ink)]">
                      <div className="flex items-center gap-2">
                        {isStale(src) && <AlertTriangle className="h-3 w-3 shrink-0 text-[var(--color-todai)]" />}
                        {src.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">
                      <span className="mono text-[10px] uppercase tracking-[0.12em]">
                        {t.sources.sourceTypes[src.source_type] ?? src.source_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">
                      {src.university_id ? (uniMap.get(src.university_id) ?? src.university_id) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {src.confidence ? (
                        <span className={`mono text-[10px] uppercase tracking-[0.12em] ${src.confidence === "high" ? "text-[var(--color-todai)]" : "text-[var(--color-muted)]"}`}>
                          {src.confidence}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">
                      {src.last_run_at ? formatDate(src.last_run_at, t.dateLocale, t.sources.neverRun) : (
                        <span className="text-[var(--color-todai)]">{t.sources.neverRun}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block h-2 w-2 rounded-full ${src.enabled ? "bg-green-500" : "bg-[var(--color-hairline-strong)]"}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => startEdit(src)} className="text-[var(--color-subtle)] transition-colors hover:text-[var(--color-todai)]">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => handleDelete(src.id)} className="text-[var(--color-subtle)] transition-colors hover:text-[var(--color-todai)]">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {isStale(sources.find(isStale)!) && (
          <div className="mt-3 flex items-center gap-2 border border-[var(--color-todai)]/20 bg-[var(--color-todai-soft)]/30 px-4 py-3 text-[12px] text-[var(--color-todai)]">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {t.sources.staleWarning}
          </div>
        )}
      </section>

      {/* Create / Edit form */}
      {showForm && (
        <section className="border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6">
          <h2 className="serif text-[20px] font-semibold tracking-[-0.01em]">
            {editingSource ? t.sources.editSource : t.sources.newSource}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={t.sources.sourceNameLabel}>
              <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="input-base" />
            </Field>
            <Field label={t.sources.sourceTypeLabel}>
              <select value={formType} onChange={(e) => setFormType(e.target.value)} className="input-base">
                {Object.entries(t.sources.sourceTypes).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </Field>
            <Field label="URL">
              <input type="text" value={formUrl} onChange={(e) => setFormUrl(e.target.value)} className="input-base" placeholder="https://..." />
            </Field>
            <Field label="Query">
              <input type="text" value={formQuery} onChange={(e) => setFormQuery(e.target.value)} className="input-base" />
            </Field>
            <Field label={t.sources.keywordsLabel}>
              <input type="text" value={formKeywords} onChange={(e) => setFormKeywords(e.target.value)} className="input-base" placeholder="keyword1, keyword2" />
            </Field>
            <Field label={t.sources.universityLabel}>
              <select value={formUniversityId} onChange={(e) => setFormUniversityId(e.target.value)} className="input-base">
                <option value="">—</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </Field>
            <Field label={t.sources.confidenceLabel}>
              <select value={formConfidence} onChange={(e) => setFormConfidence(e.target.value)} className="input-base">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </Field>
            <Field label={t.sources.checkFrequencyLabel}>
              <select value={formFrequency} onChange={(e) => setFormFrequency(e.target.value)} className="input-base">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="manual">Manual</option>
              </select>
            </Field>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <label className="flex items-center gap-2 text-[12.5px] text-[var(--color-muted)]">
              <input type="checkbox" checked={formEnabled} onChange={(e) => setFormEnabled(e.target.checked)} className="h-4 w-4" />
              {t.sources.enabledLabel}
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !formName}
              className="h-10 bg-[var(--color-ink)] px-5 text-[12.5px] font-medium text-white transition-colors hover:bg-[var(--color-todai)] disabled:opacity-40"
            >
              {saving ? "Saving…" : editingSource ? t.sources.editSource : t.sources.newSource}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="h-10 border border-[var(--color-hairline-strong)] px-5 text-[12.5px] font-medium text-[var(--color-muted)]"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {/* Integration cards */}
      <section className="grid gap-8 lg:grid-cols-2">
        <IntegrationCard
          icon={CalendarRange}
          indexLabel="01"
          title={t.sources.icalTitle}
          body={t.sources.icalBody}
        >
          <div className="mt-4 break-all border border-[var(--color-hairline)] bg-[var(--color-paper)] px-3 py-2 font-mono text-[11.5px] text-[var(--color-muted)]">
            {icalUrl}
          </div>
          <button
            type="button"
            onClick={() => copy(icalUrl, setIcalCopied)}
            className="mt-4 inline-flex h-10 items-center gap-2 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-4 text-[12.5px] font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-todai)] hover:text-[var(--color-todai)]"
          >
            {icalCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {icalCopied ? t.sources.icalCopied : t.sources.icalAction}
          </button>
        </IntegrationCard>

        <IntegrationCard
          icon={Bookmark}
          indexLabel="02"
          title={t.sources.captureTitle}
          body={t.sources.captureBody}
        >
          <a
            href={bookmarklet}
            onClick={(e) => e.preventDefault()}
            draggable
            className="mt-4 inline-flex h-10 cursor-grab items-center gap-2 border border-[var(--color-todai)] bg-[var(--color-todai-soft)] px-4 text-[12.5px] font-medium text-[var(--color-todai)] active:cursor-grabbing"
          >
            <Bookmark className="h-4 w-4" />
            SRIS Capture
          </a>
          <button
            type="button"
            onClick={() => copy(bookmarklet, setBookmarkletCopied)}
            className="mt-2 inline-flex h-10 items-center gap-2 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-4 text-[12.5px] font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-todai)] hover:text-[var(--color-todai)]"
          >
            {bookmarkletCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {bookmarkletCopied ? t.sources.captureCopied : t.sources.captureCopy}
          </button>
          <p className="mt-3 text-[11.5px] leading-5 text-[var(--color-subtle)]">{t.sources.captureHint}</p>
        </IntegrationCard>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">{label}</label>
      {children}
    </div>
  );
}

function IntegrationCard({
  icon: Icon,
  indexLabel,
  title,
  body,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  indexLabel: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-[var(--color-subtle)]" />
        <span className="mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--color-todai)]">
          {indexLabel}
        </span>
      </div>
      <h2 className="serif mt-4 text-[22px] font-semibold tracking-[-0.01em]">{title}</h2>
      <p className="mt-3 text-[13.5px] leading-[1.75] text-[var(--color-muted)]">{body}</p>
      {children}
    </article>
  );
}
