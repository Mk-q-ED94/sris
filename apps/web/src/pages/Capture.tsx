import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Zap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { quickCapture, fetchUniversities, fetchPrograms } from "../lib/api";
import type { Program, ResourceType, University } from "../types/sris";

interface CapturePrefill {
  url: string;
  title: string;
  notes: string;
  selection: string;
}

const RESOURCE_TYPES: ResourceType[] = [
  "paper", "lab_page", "professor_page", "program_page", "official_page",
  "admission_notice", "experience_post", "video", "other",
];

function classifyUrl(url: string): { resource_type: ResourceType; source: string; reason: string } | null {
  try {
    const u = new URL(url);
    const host = u.hostname;
    const path = u.pathname.toLowerCase();

    if (host.endsWith(".ac.jp")) {
      if (path.includes("/lab") || path.includes("/research") || path.includes("/kenkyu"))
        return { resource_type: "lab_page", source: "lab-page", reason: `path includes /lab or /research on ${host}` };
      if (path.includes("/faculty") || path.includes("/member") || path.includes("/staff") || path.includes("/professor"))
        return { resource_type: "professor_page", source: "professor-page", reason: `path includes /faculty or /member on ${host}` };
      if (path.includes("/admission") || path.includes("/nyushi"))
        return { resource_type: "admission_notice", source: "admission-page", reason: `admission path on ${host}` };
      if (path.includes("/program") || path.includes("/apply"))
        return { resource_type: "program_page", source: "program-page", reason: `program or apply path on ${host}` };
      if (path.includes("/course") || path.includes("/curriculum"))
        return { resource_type: "program_page", source: "course-page", reason: `course or curriculum path on ${host}` };
      return { resource_type: "official_page", source: "university-page", reason: `official .ac.jp domain: ${host}` };
    }

    if (host.includes("arxiv.org")) return { resource_type: "paper", source: "arxiv", reason: "arxiv.org domain" };
    if (host.includes("scholar.google")) return { resource_type: "paper", source: "scholar", reason: "Google Scholar domain" };
    if (host.includes("dblp")) return { resource_type: "paper", source: "dblp", reason: "DBLP domain" };
    if (host.includes("semanticscholar")) return { resource_type: "paper", source: "semantic-scholar", reason: "Semantic Scholar domain" };
    if (host.includes("youtube.com") || host.includes("youtu.be") || host.includes("bilibili.com"))
      return { resource_type: "video", source: host, reason: `video platform: ${host}` };
    if (host.includes("zhihu.com") || host.includes("reddit.com") || host.includes("medium.com"))
      return { resource_type: "experience_post", source: host, reason: `community / blog platform: ${host}` };

    return null;
  } catch {
    return null;
  }
}

function extractDomain(url: string): string | null {
  try { return new URL(url).hostname; } catch { return null; }
}

export function Capture({ prefill, onClose }: { prefill: CapturePrefill; onClose: () => void }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const [url, setUrl] = useState(prefill.url);
  const [title, setTitle] = useState(prefill.title);
  const [notes, setNotes] = useState(prefill.notes);
  const [excerpt, setExcerpt] = useState(prefill.selection || "");
  const [resourceType, setResourceType] = useState<ResourceType>("other");
  const [universityId, setUniversityId] = useState("");
  const [programId, setProgramId] = useState("");
  const [confidence, setConfidence] = useState("");
  const [relevanceNote, setRelevanceNote] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classification = useMemo(() => classifyUrl(url.trim()), [url]);
  const domain = useMemo(() => extractDomain(url.trim()), [url]);

  // Auto-set resource type from classification
  useEffect(() => {
    if (classification && !url.startsWith(prefill.url)) {
      setResourceType(classification.resource_type);
    } else if (classification && prefill.url === "") {
      setResourceType(classification.resource_type);
    }
  }, [classification, url, prefill.url]);

  // Load universities
  useEffect(() => {
    fetchUniversities(token).then(setUniversities).catch(() => {});
  }, [token]);

  // Load programs when university changes
  useEffect(() => {
    if (!universityId) { setPrograms([]); setProgramId(""); return; }
    fetchPrograms(token).then((progs) => {
      setPrograms(progs.filter((p) => p.university_id === universityId));
    }).catch(() => { setPrograms([]); });
  }, [token, universityId]);

  useEffect(() => {
    setUrl(prefill.url);
    setTitle(prefill.title);
    setNotes(prefill.notes);
    setExcerpt(prefill.selection || "");
  }, [prefill.url, prefill.title, prefill.notes, prefill.selection]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!url.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await quickCapture(token, {
        url: url.trim(),
        title: title.trim() || undefined,
        notes: notes.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        resource_type: resourceType,
        university_id: universityId || undefined,
        program_id: programId || undefined,
        confidence: confidence || undefined,
        relevance_note: relevanceNote.trim() || undefined,
      });
      setDone(true);
      window.setTimeout(onClose, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Capture failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-todai)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t.capture.cancel}
      </button>

      <div>
        <div className="flex items-center gap-3">
          <span className="rule-accent" />
          <span className="section-index">— Capture</span>
        </div>
        <h1 className="serif mt-6 text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[44px]">
          {t.capture.title}
        </h1>
        <p className="mt-3 text-[14.5px] leading-[1.8] text-[var(--color-muted)]">{t.capture.body}</p>
      </div>

      <form
        onSubmit={submit}
        className="border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] p-6 sm:p-8"
      >
        <Field label={t.capture.urlLabel} required>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            type="url"
            required
            className="block h-11 w-full border-0 border-b border-[var(--color-hairline-strong)] bg-transparent px-0 text-[14px] outline-none transition-colors focus:border-[var(--color-todai)]"
          />
          {classification ? (
            <div className="mt-2 space-y-0.5">
              <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-todai)]">
                <Zap className="h-3 w-3 shrink-0" />
                <span className="mono uppercase tracking-[0.12em]">{t.capture.classificationLabel}:</span>
                <span className="font-medium">{t.capture.classifiedTypes[classification.resource_type] ?? classification.resource_type}</span>
              </div>
              <div className="pl-5 text-[10.5px] text-[var(--color-subtle)]">{classification.reason}</div>
            </div>
          ) : null}
          {domain && (
            <div className="mt-1 text-[10.5px] text-[var(--color-subtle)]">
              {t.capture.domainLabel}: {domain}
            </div>
          )}
        </Field>

        <Field label={t.capture.resourceTypeLabel}>
          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value as ResourceType)}
            className="block h-11 w-full border-0 border-b border-[var(--color-hairline-strong)] bg-transparent px-0 text-[14px] outline-none transition-colors focus:border-[var(--color-todai)]"
          >
            {RESOURCE_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {t.capture.classifiedTypes[rt] ?? rt}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.capture.titleLabel}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            className="block h-11 w-full border-0 border-b border-[var(--color-hairline-strong)] bg-transparent px-0 text-[14px] outline-none transition-colors focus:border-[var(--color-todai)]"
          />
        </Field>

        <Field label={t.capture.universityLabel}>
          <select
            value={universityId}
            onChange={(e) => setUniversityId(e.target.value)}
            className="block h-11 w-full border-0 border-b border-[var(--color-hairline-strong)] bg-transparent px-0 text-[14px] outline-none transition-colors focus:border-[var(--color-todai)]"
          >
            <option value="">—</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </Field>

        {universityId && programs.length > 0 && (
          <Field label={t.capture.programLabel}>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="block h-11 w-full border-0 border-b border-[var(--color-hairline-strong)] bg-transparent px-0 text-[14px] outline-none transition-colors focus:border-[var(--color-todai)]"
            >
              <option value="">—</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>{p.program_name}</option>
              ))}
            </select>
          </Field>
        )}

        <Field label={t.capture.relevanceNoteLabel}>
          <input
            value={relevanceNote}
            onChange={(e) => setRelevanceNote(e.target.value)}
            type="text"
            className="block h-11 w-full border-0 border-b border-[var(--color-hairline-strong)] bg-transparent px-0 text-[14px] outline-none transition-colors focus:border-[var(--color-todai)]"
          />
        </Field>

        <Field label={t.capture.confidenceLabel}>
          <div className="flex gap-3 pt-2">
            {(["high", "medium", "low"] as const).map((level) => (
              <label key={level} className="flex items-center gap-1.5 text-[13px] text-[var(--color-muted)]">
                <input
                  type="radio"
                  name="confidence"
                  value={level}
                  checked={confidence === level}
                  onChange={() => setConfidence(level)}
                  className="accent-[var(--color-todai)]"
                />
                {level === "high" ? t.review2.confidenceHigh : level === "low" ? t.review2.confidenceLow : t.review2.confidenceMedium}
              </label>
            ))}
          </div>
        </Field>

        <Field label={t.capture.notesLabel}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="block w-full resize-y border border-[var(--color-hairline-strong)] bg-[var(--color-paper)] p-3 text-[13.5px] leading-6 outline-none transition-colors focus:border-[var(--color-todai)]"
          />
        </Field>

        <Field label={t.capture.excerptLabel}>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={4}
            placeholder={t.capture.excerptPlaceholder}
            className="block w-full resize-y border border-[var(--color-hairline-strong)] bg-[var(--color-paper)] p-3 text-[13.5px] leading-6 outline-none transition-colors focus:border-[var(--color-todai)]"
          />
        </Field>

        {error ? (
          <div className="mt-4 border border-rose-200 bg-rose-50 px-3 py-2 text-[12.5px] text-rose-700">{error}</div>
        ) : null}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 border border-[var(--color-hairline-strong)] px-4 text-[12.5px] font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            {t.capture.cancel}
          </button>
          <button
            type="submit"
            disabled={submitting || done}
            className="inline-flex h-10 items-center gap-2 bg-[var(--color-ink)] px-5 text-[12.5px] font-medium text-white transition-colors hover:bg-[var(--color-todai)] disabled:opacity-60"
          >
            {done ? <Check className="h-4 w-4" /> : null}
            {done ? t.capture.success : t.capture.submit}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="mt-6 block first:mt-0">
      <span className="mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
        {label}
        {required ? " *" : ""}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
