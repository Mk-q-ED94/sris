import {
  BookOpen,
  CalendarDays,
  FlaskConical,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Radar,
  University,
  UsersRound,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n, LANG_LABELS } from "../contexts/I18nContext";
import type { LangCode } from "../i18n/locales";

export type PageKey =
  | "dashboard"
  | "universities"
  | "professors"
  | "labs"
  | "programs"
  | "papers"
  | "review"
  | "timeline"
  | "sources";

const navIcons: Record<PageKey, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  universities: University,
  professors: UsersRound,
  labs: FlaskConical,
  programs: GraduationCap,
  papers: BookOpen,
  review: Inbox,
  timeline: CalendarDays,
  sources: Radar,
};

const NAV_ORDER: PageKey[] = [
  "dashboard",
  "universities",
  "professors",
  "labs",
  "programs",
  "papers",
  "review",
  "timeline",
  "sources",
];

export function AppShell({
  activePage,
  onNavigate,
  children,
}: {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  children: React.ReactNode;
}) {
  const { clearToken } = useAuth();
  const { t, lang, setLang } = useI18n();

  return (
    <div className="min-h-[100dvh] bg-[var(--color-paper)] text-[var(--color-ink)]">
      <div className="grid min-h-[100dvh] lg:grid-cols-[256px_1fr]">
        <aside className="hidden border-r border-[var(--color-hairline)] bg-[var(--color-surface)] lg:flex lg:flex-col">
          <div className="px-7 pt-9 pb-7 border-b border-[var(--color-hairline)]">
            <div className="flex items-baseline gap-2">
              <div className="h-3 w-3 bg-[var(--color-todai)]" aria-hidden />
              <div className="serif text-[26px] font-semibold leading-none tracking-[-0.01em]">
                {t.brand.name}
              </div>
            </div>
            <div className="mono mt-3 text-[10.5px] uppercase tracking-[0.24em] text-[var(--color-muted)]">
              {t.brand.subtitle}
            </div>
          </div>

          <nav className="flex-1 px-3 py-5">
            {NAV_ORDER.map((key, idx) => {
              const Icon = navIcons[key];
              const active = key === activePage;
              return (
                <button
                  key={key}
                  onClick={() => onNavigate(key)}
                  className={`group relative flex h-11 w-full items-center gap-3 px-4 text-left text-[13.5px] transition-colors ${
                    active
                      ? "text-[var(--color-ink)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 transition-opacity ${
                      active ? "bg-[var(--color-todai)] opacity-100" : "opacity-0"
                    }`}
                    aria-hidden
                  />
                  <span className="mono text-[10px] text-[var(--color-subtle)] tabular w-5">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <Icon className="h-4 w-4 text-[var(--color-subtle)] group-hover:text-[var(--color-muted)]" />
                  <span className={active ? "font-semibold" : "font-medium"}>{t.nav[key]}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-[var(--color-hairline)] px-7 py-6">
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
              {t.asiaShanghai}
            </div>
            <div className="mt-2 text-[12px] leading-5 text-[var(--color-muted)]">{t.privateMode}</div>
            <select
              value={lang}
              onChange={(event) => setLang(event.target.value as LangCode)}
              className="mt-4 h-9 w-full border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-3 text-[12.5px] font-medium text-[var(--color-ink)] focus:border-[var(--color-todai)] focus:outline-none"
              aria-label="language"
            >
              {(Object.keys(LANG_LABELS) as LangCode[]).map((code) => (
                <option key={code} value={code}>
                  {LANG_LABELS[code]}
                </option>
              ))}
            </select>
            <button
              onClick={clearToken}
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] text-[12.5px] font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-todai)] hover:text-[var(--color-todai)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t.logout}
            </button>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[var(--color-hairline)] bg-[var(--color-paper)]/95 px-4 py-3 backdrop-blur sm:px-7 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <div className="h-2.5 w-2.5 bg-[var(--color-todai)]" />
                <div className="serif text-[18px] font-semibold">{t.brand.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={lang}
                  onChange={(event) => setLang(event.target.value as LangCode)}
                  className="h-9 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-2 text-[12px] font-medium"
                  aria-label="language"
                >
                  {(Object.keys(LANG_LABELS) as LangCode[]).map((code) => (
                    <option key={code} value={code}>
                      {LANG_LABELS[code]}
                    </option>
                  ))}
                </select>
                <select
                  value={activePage}
                  onChange={(event) => onNavigate(event.target.value as PageKey)}
                  className="h-9 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-2 text-[12px] font-medium"
                  aria-label="page"
                >
                  {NAV_ORDER.map((key) => (
                    <option key={key} value={key}>
                      {t.nav[key]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </header>
          <div className="mx-auto w-full max-w-[1320px] px-4 py-8 sm:px-8 sm:py-12 lg:px-14">{children}</div>
        </main>
      </div>
    </div>
  );
}
