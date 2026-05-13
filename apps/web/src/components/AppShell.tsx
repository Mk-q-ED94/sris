import {
  BookOpen,
  CalendarDays,
  FlaskConical,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Radar,
  Search,
  Sparkles,
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
    <div className="min-h-[100dvh] bg-[#f6f8fb] text-slate-950">
      <div className="fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_12%_10%,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_75%_4%,rgba(99,102,241,0.14),transparent_30%)]" />
      <div className="relative grid min-h-[100dvh] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-white/70 bg-white/70 px-4 py-5 shadow-[1px_0_0_rgba(148,163,184,0.16)] backdrop-blur-xl lg:block">
          <div className="mb-7 flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-[-0.03em]">{t.brand.name}</div>
              <div className="text-xs font-medium text-slate-500">{t.brand.subtitle}</div>
            </div>
          </div>

          <div className="mb-4 flex h-10 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 text-sm text-slate-400">
            <Search className="h-4 w-4" />
            {t.search}
          </div>

          <nav className="space-y-1">
            {NAV_ORDER.map((key) => {
              const Icon = navIcons[key];
              const active = key === activePage;
              return (
                <button
                  key={key}
                  onClick={() => onNavigate(key)}
                  className={`flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                      : "text-slate-500 hover:bg-white hover:text-slate-950"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.nav[key]}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-5 left-4 right-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
              <div className="text-sm font-semibold">{t.asiaShanghai}</div>
              <div className="mt-1 text-xs leading-5 text-slate-500">{t.privateMode}</div>
              <select
                value={lang}
                onChange={(event) => setLang(event.target.value as LangCode)}
                className="mt-4 h-9 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
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
                className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                <LogOut className="h-4 w-4" />
                {t.logout}
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-white/70 bg-white/55 px-4 py-3 backdrop-blur-xl sm:px-7 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">{t.brand.name}</div>
              <div className="flex items-center gap-2">
                <select
                  value={lang}
                  onChange={(event) => setLang(event.target.value as LangCode)}
                  className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold"
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
                  className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold"
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
          <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-7 sm:py-8 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
