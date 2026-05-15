import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Zap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { quickCapture } from "../lib/api";

interface CapturePrefill {
  url: string;
  title: string;
  notes: string;
}

function classifyUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname;
    const path = u.pathname.toLowerCase();

    if (host.endsWith(".ac.jp")) {
      if (path.includes("/lab") || path.includes("/research") || path.includes("/kenkyu"))
        return "lab-page";
      if (path.includes("/faculty") || path.includes("/member") || path.includes("/staff") || path.includes("/professor"))
        return "professor-page";
      if (path.includes("/program") || path.includes("/admission") || path.includes("/apply") || path.includes("/nyushi"))
        return "program-page";
      if (path.includes("/course") || path.includes("/curriculum"))
        return "course-page";
      return "university-page";
    }

    if (host.includes("arxiv.org")) return "arxiv";
    if (host.includes("scholar.google")) return "scholar";
    if (host.includes("dblp")) return "dblp";
    if (host.includes("semanticscholar")) return "semantic-scholar";

    return null;
  } catch {
    return null;
  }
}

export function Capture({ prefill, onClose }: { prefill: CapturePrefill; onClose: () => void }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const [url, setUrl] = useState(prefill.url);
  const [title, setTitle] = useState(prefill.title);
  const [notes, setNotes] = useState(prefill.notes);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classification = useMemo(() => classifyUrl(url.trim()), [url]);

  useEffect(() => {
    setUrl(prefill.url);
    setTitle(prefill.title);
    setNotes(prefill.notes);
  }, [prefill.url, prefill.title, prefill.notes]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!url.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await quickCapture(token, { url: url.trim(), title: title.trim() || undefined, notes: notes.trim() || undefined });
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
            <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-[var(--color-todai)]">
              <Zap className="h-3 w-3" />
              <span className="mono uppercase tracking-[0.12em]">{t.capture.classificationLabel}</span>
              <span className="font-medium">{t.capture.classifiedTypes[classification] ?? classification}</span>
            </div>
          ) : null}
        </Field>
        <Field label={t.capture.titleLabel}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            className="block h-11 w-full border-0 border-b border-[var(--color-hairline-strong)] bg-transparent px-0 text-[14px] outline-none transition-colors focus:border-[var(--color-todai)]"
          />
        </Field>
        <Field label={t.capture.notesLabel}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
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
