import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n, LANG_LABELS } from "../contexts/I18nContext";
import type { LangCode } from "../i18n/locales";

export function TokenGate() {
  const { saveToken } = useAuth();
  const { t, lang, setLang } = useI18n();
  const [token, setToken] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (token.trim()) saveToken(token.trim());
  }

  return (
    <main className="min-h-[100dvh] bg-[var(--color-paper)] text-[var(--color-ink)]">
      <header className="border-b border-[var(--color-hairline)]">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-5 sm:px-10">
          <div className="flex items-baseline gap-2">
            <div className="h-3 w-3 bg-[var(--color-todai)]" />
            <span className="serif text-[20px] font-semibold tracking-[-0.01em]">SRIS</span>
            <span className="mono ml-3 hidden text-[10px] uppercase tracking-[0.26em] text-[var(--color-muted)] sm:inline">
              Research Intelligence
            </span>
          </div>
          <select
            value={lang}
            onChange={(event) => setLang(event.target.value as LangCode)}
            className="h-9 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-3 text-[12.5px] font-medium"
            aria-label="language"
          >
            {(Object.keys(LANG_LABELS) as LangCode[]).map((code) => (
              <option key={code} value={code}>
                {LANG_LABELS[code]}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-[1320px] gap-12 px-6 py-16 sm:px-10 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <div className="flex items-center gap-3 mono text-[11px] uppercase tracking-[0.26em] text-[var(--color-todai)]">
            <span className="rule-accent" />
            <span>00 — Access</span>
          </div>
          <h1 className="serif mt-6 text-[44px] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)] sm:text-[60px]">
            {t.tokenGate.title}
          </h1>
          <p className="mt-6 max-w-xl text-[15.5px] leading-[1.8] text-[var(--color-muted)]">
            {t.tokenGate.body}
          </p>
          <div className="mt-10 hairline-t pt-6">
            <div className="mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
              Stack
            </div>
            <div className="mt-2 text-[13px] text-[var(--color-muted)]">{t.tokenGate.chip}</div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="self-center border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] p-8 sm:p-10"
        >
          <div className="mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--color-todai)]">
            Private Access
          </div>
          <h2 className="serif mt-2 text-[26px] font-semibold tracking-[-0.01em]">{t.tokenGate.formTitle}</h2>
          <p className="mt-3 text-[13px] leading-6 text-[var(--color-muted)]">{t.tokenGate.formBody}</p>
          <label className="mt-8 block">
            <span className="mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
              {t.tokenGate.fieldLabel}
            </span>
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder={t.tokenGate.placeholder}
              className="mt-2 block h-12 w-full border-0 border-b border-[var(--color-hairline-strong)] bg-transparent px-0 text-[15px] outline-none transition-colors focus:border-[var(--color-todai)]"
            />
          </label>
          <button className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 bg-[var(--color-ink)] px-5 text-[13.5px] font-medium tracking-wide text-white transition-colors hover:bg-[var(--color-todai)]">
            {t.tokenGate.submit}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </section>
    </main>
  );
}
