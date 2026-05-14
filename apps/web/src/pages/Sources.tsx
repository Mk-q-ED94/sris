import { useMemo, useState } from "react";
import { Bookmark, CalendarRange, Check, Copy, Radar } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { buildIcalUrl } from "../lib/api";

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

  async function copy(value: string, setter: (b: boolean) => void) {
    try {
      await navigator.clipboard.writeText(value);
      setter(true);
      window.setTimeout(() => setter(false), 1800);
    } catch {
      window.prompt("Copy", value);
    }
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

        <IntegrationCard
          icon={Radar}
          indexLabel="03"
          title={t.sources.arxivTitle}
          body={t.sources.arxivBody}
        />
      </section>
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
