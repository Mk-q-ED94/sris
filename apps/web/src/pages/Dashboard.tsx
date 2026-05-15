import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  Clock3,
  FileSearch,
  FlaskConical,
  GraduationCap,
  Inbox,
  RefreshCw,
  Rss,
  Tags,
  University,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { UniversityCarousel } from "../components/UniversityCarousel";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import type { Locale, MetricKey } from "../i18n/locales";
import { fetchDashboard } from "../lib/api";
import { compactNumber, formatDate } from "../lib/format";
import type { CoverageItem, DashboardSummary, GapItem, Paper, PaperCandidate, TimelineTask } from "../types/sris";

const metricConfig: Array<{ key: MetricKey; icon: ComponentType<{ className?: string }> }> = [
  { key: "universities", icon: University },
  { key: "programs", icon: GraduationCap },
  { key: "professors", icon: UsersRound },
  { key: "labs", icon: FlaskConical },
  { key: "papers", icon: BookOpen },
  { key: "pending_candidates", icon: Inbox },
  { key: "timeline_tasks", icon: CalendarClock },
];

type CountItem = { label: string; count: number };
type ResourceStreamItem = {
  id: string;
  title: string;
  type: "candidate" | "paper" | "capture";
  source: string;
  date?: string | null;
  status: string;
  url?: string;
  keywords: string[];
};
type ApplicationSignals = {
  completion: number;
  nextTask: TimelineTask | null;
  urgentTasks: TimelineTask[];
  overdueTasks: TimelineTask[];
};
type IntelligenceInsights = {
  inboxTotal: number;
  manualCaptures: PaperCandidate[];
  sourceCounts: CountItem[];
  keywordCounts: CountItem[];
  coverage: CoverageItem[];
  gaps: GapItem[];
  stream: ResourceStreamItem[];
  application: ApplicationSignals;
};

export function Dashboard({ onOpenUniversity }: { onOpenUniversity: (id: string) => void }) {
  const { token, clearToken } = useAuth();
  const { t } = useI18n();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchDashboard(token));
    } catch (err) {
      if (err instanceof Error && err.message.toLowerCase().includes("invalid api token")) {
        clearToken();
      }
      setError(err instanceof Error ? err.message : "Dashboard request failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const completion = useMemo(() => {
    if (!data) return 0;
    const done = data.upcoming_tasks.filter((task) => task.status === "done").length;
    return data.upcoming_tasks.length ? Math.round((done / data.upcoming_tasks.length) * 100) : 0;
  }, [data]);
  const insights = useMemo(() => buildIntelligenceInsights(data, completion), [data, completion]);

  if (error) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="w-full max-w-xl border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] p-10 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center bg-[var(--color-todai-soft)] text-[var(--color-todai)]">
            <Activity className="h-4 w-4" />
          </div>
          <div className="section-index">Error</div>
          <h1 className="serif mt-2 text-[24px] font-semibold tracking-[-0.01em]">{t.dashboardLoadFailed}</h1>
          <p className="mt-2 text-[13px] leading-6 text-[var(--color-muted)]">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={load} className="h-10 bg-[var(--color-ink)] px-5 text-[12.5px] font-medium text-white hover:bg-[var(--color-todai)]">
              {t.retry}
            </button>
            <button onClick={clearToken} className="h-10 border border-[var(--color-hairline-strong)] px-5 text-[12.5px] font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]">
              {t.reenterToken}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-14">
      <section>
        <div className="flex items-center gap-3">
          <span className="rule-accent" />
          <span className="section-index">01 — {t.dashboard2.heroLabel}</span>
        </div>
        <div className="mt-6 grid gap-10 xl:grid-cols-[1.4fr_1fr] xl:items-end">
          <div>
            <h1 className="serif text-[44px] font-semibold leading-[1.08] tracking-[-0.02em] text-[var(--color-ink)] sm:text-[64px]">
              {t.dashboard2.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[var(--color-muted)] sm:text-[16px]">
              {t.dashboard2.heroBody}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-0 border-y border-[var(--color-hairline-strong)]">
            <HeroStat label={t.dashboard2.heroStatInbox} value={insights.inboxTotal} helper="Review queue" accent />
            <HeroStat label={t.dashboard2.heroStatEntries} value={(data?.counts.papers ?? 0) + insights.inboxTotal} helper="Papers + candidates" />
            <HeroStat label={t.dashboard2.heroStatSources} value={insights.sourceCounts.length} helper="Source mix" />
          </div>
        </div>
      </section>

      <UniversityCarousel onSelect={onOpenUniversity} />

      <section className="grid gap-8 xl:grid-cols-[1.25fr_0.95fr]">
        <IntelligenceInbox insights={insights} loading={loading} onRefresh={load} t={t} />
        <InformationGaps insights={insights} loading={loading} t={t} onOpenUniversity={onOpenUniversity} />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <SourceCoverage insights={insights} loading={loading} t={t} />
        <KeywordRadar insights={insights} loading={loading} t={t} />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.35fr_0.85fr]">
        <ResourceStream insights={insights} loading={loading} t={t} />
        <ApplicationSignalsPanel signals={insights.application} loading={loading} t={t} />
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="section-index">07 — {t.dashboard2.dbLabel}</span>
            <span className="h-px w-12 bg-[var(--color-hairline-strong)]" />
            <span className="mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
              {loading ? t.dashboard2.dbLoading : t.dashboard2.dbCurrent}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 border border-[var(--color-hairline)] sm:grid-cols-3 lg:grid-cols-7">
          {metricConfig.map((metric, idx) => {
            const Icon = metric.icon;
            const value = data?.counts[metric.key] ?? 0;
            const isAccent = metric.key === "pending_candidates" && value > 0;
            return (
              <div
                key={metric.key}
                className={`relative border-b border-r border-[var(--color-hairline)] bg-[var(--color-surface)] p-5 transition-colors hover:bg-[var(--color-paper)] [&:nth-child(7n)]:border-r-0 ${
                  idx >= metricConfig.length - (metricConfig.length % 7 || 7) ? "lg:border-b-0" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <Icon className={`h-3.5 w-3.5 ${isAccent ? "text-[var(--color-todai)]" : "text-[var(--color-subtle)]"}`} />
                </div>
                <div className={`serif mt-5 text-[36px] font-semibold leading-none tabular tracking-[-0.02em] ${isAccent ? "text-[var(--color-todai)]" : "text-[var(--color-ink)]"}`}>
                  {loading ? "—" : compactNumber(value)}
                </div>
                <div className="mt-2 text-[12.5px] text-[var(--color-muted)]">{t.metrics[metric.key]}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function HeroStat({
  label,
  value,
  helper,
  accent,
}: {
  label: string;
  value: number | string;
  helper: string;
  accent?: boolean;
}) {
  return (
    <div className="border-l border-[var(--color-hairline)] px-5 py-5 first:border-l-0">
      <div className={`serif text-[28px] font-semibold leading-none tabular tracking-[-0.02em] ${accent ? "text-[var(--color-todai)]" : "text-[var(--color-ink)]"}`}>
        {value}
      </div>
      <div className="mt-3 text-[12.5px] font-medium text-[var(--color-ink)]">{label}</div>
      <div className="mono mt-1 text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
        {helper}
      </div>
    </div>
  );
}

function Panel({
  index,
  title,
  subtitle,
  action,
  children,
}: {
  index: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="border border-[var(--color-hairline)] bg-[var(--color-surface)]">
      <div className="flex items-end justify-between gap-4 border-b border-[var(--color-hairline)] px-6 py-5">
        <div>
          <div className="section-index">{index}</div>
          <h2 className="serif mt-2 text-[20px] font-semibold tracking-[-0.01em]">{title}</h2>
          <p className="mt-1 text-[12.5px] text-[var(--color-muted)]">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function IntelligenceInbox({
  insights,
  loading,
  onRefresh,
  t,
}: {
  insights: IntelligenceInsights;
  loading: boolean;
  onRefresh: () => void;
  t: Locale;
}) {
  return (
    <section className="border border-[var(--color-hairline)] bg-[var(--color-surface)]">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-[var(--color-hairline)] p-6 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="section-index">03 — {t.dashboard2.inboxLabel}</div>
            <button onClick={onRefresh} className="mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-todai)]">
              <RefreshCw className="h-3 w-3" />
              {t.refresh}
            </button>
          </div>
          <h2 className="serif max-w-2xl text-[30px] font-semibold leading-tight tracking-[-0.015em] sm:text-[38px]">
            {loading ? t.dashboard2.inboxLoading : t.dashboard2.inboxCountFmt(insights.inboxTotal)}
          </h2>
          <p className="mt-4 max-w-2xl text-[13.5px] leading-[1.8] text-[var(--color-muted)]">
            {t.dashboard2.inboxBody}
          </p>
          <div className="mt-6 grid grid-cols-3 border-y border-[var(--color-hairline)]">
            <BriefStat label={t.dashboard2.inboxPending} value={loading ? "—" : insights.inboxTotal} />
            <BriefStat label={t.dashboard2.inboxManualCaptures} value={loading ? "—" : insights.manualCaptures.length} />
            <BriefStat label={t.dashboard2.inboxSourceTypes} value={loading ? "—" : insights.sourceCounts.length} />
          </div>
        </div>
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Rss className="h-4 w-4 text-[var(--color-todai)]" />
            <span className="mono text-[10.5px] uppercase tracking-[0.2em] text-[var(--color-todai)]">Source Mix</span>
          </div>
          <ul className="divide-y divide-[var(--color-hairline)]">
            {(loading ? [] : insights.sourceCounts).slice(0, 5).map((source) => (
              <li key={source.label} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <span className="truncate text-[13.5px] font-medium text-[var(--color-ink)]">{source.label}</span>
                <span className="mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--color-todai)]">{source.count}</span>
              </li>
            ))}
            {!loading && !insights.sourceCounts.length ? (
              <li className="py-3 text-[13px] text-[var(--color-muted)]">{t.dashboard2.inboxEmptySource}</li>
            ) : null}
            {loading ? <li className="py-3 text-[13px] text-[var(--color-muted)]">{t.dashboard2.inboxLoadingSource}</li> : null}
          </ul>
        </div>
      </div>
    </section>
  );
}

function BriefStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border-l border-[var(--color-hairline)] px-4 py-4 first:border-l-0">
      <div className="serif text-[28px] font-semibold leading-none tabular tracking-[-0.02em]">{value}</div>
      <div className="mono mt-2 text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">{label}</div>
    </div>
  );
}

function InformationGaps({ insights, loading, t, onOpenUniversity }: { insights: IntelligenceInsights; loading: boolean; t: Locale; onOpenUniversity?: (id: string) => void }) {
  return (
    <Panel index="04" title={t.dashboard2.gapsTitle} subtitle={t.dashboard2.gapsSubtitle}>
      <div className="mb-5 flex items-center gap-2">
        <FileSearch className="h-4 w-4 text-[var(--color-todai)]" />
        <span className="mono text-[10.5px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">Gap Scan</span>
      </div>
      <ul className="divide-y divide-[var(--color-hairline)]">
        {(loading ? [] : insights.gaps).map((gap) => {
          const { title, detail } = gapLabel(gap, t.dashboard2);
          return (
            <li key={`${gap.label_key}-${gap.university_id ?? ""}`} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className={`text-[13.5px] font-semibold ${gap.priority === "high" ? "text-[var(--color-todai)]" : "text-[var(--color-ink)]"}`}>
                    {gap.university_id && onOpenUniversity ? (
                      <button type="button" onClick={() => onOpenUniversity(gap.university_id!)} className="text-left transition-colors hover:text-[var(--color-todai)]">
                        {title}
                      </button>
                    ) : title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-5 text-[var(--color-muted)]">{detail}</p>
                </div>
                <span className="mono shrink-0 text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                  {gap.priority}
                </span>
              </div>
            </li>
          );
        })}
        {loading ? <li className="py-4 text-[13px] text-[var(--color-muted)]">{t.dashboard2.gapsLoading}</li> : null}
      </ul>
    </Panel>
  );
}

function SourceCoverage({ insights, loading, t }: { insights: IntelligenceInsights; loading: boolean; t: Locale }) {
  return (
    <Panel index="05" title={t.dashboard2.coverageTitle} subtitle={t.dashboard2.coverageSubtitle}>
      <div className="grid gap-px border border-[var(--color-hairline)] bg-[var(--color-hairline)] sm:grid-cols-2">
        {insights.coverage.map((item) => {
          const pct = Math.min(100, Math.round((item.value / item.target) * 100));
          const { label, hint } = coverageLabel(item.label_key, t.dashboard2);
          return (
            <div key={item.label_key} className="bg-[var(--color-surface)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[13.5px] font-semibold text-[var(--color-ink)]">{label}</div>
                  <div className="mt-1 text-[11.5px] leading-5 text-[var(--color-muted)]">{hint}</div>
                </div>
                <div className={`serif text-[26px] font-semibold leading-none ${item.tone === "weak" ? "text-[var(--color-todai)]" : "text-[var(--color-ink)]"}`}>
                  {loading ? "—" : item.value}
                </div>
              </div>
              <div className="mt-5 h-px bg-[var(--color-hairline-strong)]">
                <div className="h-px bg-[var(--color-todai)]" style={{ width: loading ? "0%" : `${pct}%` }} />
              </div>
              <div className="mono mt-2 text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                target {item.target}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function KeywordRadar({ insights, loading, t }: { insights: IntelligenceInsights; loading: boolean; t: Locale }) {
  return (
    <Panel index="06" title={t.dashboard2.radarTitle} subtitle={t.dashboard2.radarSubtitle}>
      <div className="mb-5 flex items-center gap-2">
        <Tags className="h-4 w-4 text-[var(--color-todai)]" />
        <span className="mono text-[10.5px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">Research Signals</span>
      </div>
      {loading ? (
        <SkeletonRows />
      ) : insights.keywordCounts.length ? (
        <div className="flex flex-wrap gap-2">
          {insights.keywordCounts.map((keyword, index) => (
            <span
              key={keyword.label}
              className={`inline-flex items-center gap-2 border px-2.5 py-1.5 text-[12px] ${
                index < 3
                  ? "border-[var(--color-todai)] bg-[var(--color-todai-soft)] text-[var(--color-todai)]"
                  : "border-[var(--color-hairline)] bg-[var(--color-paper)] text-[var(--color-muted)]"
              }`}
            >
              <span className="max-w-[170px] truncate">{keyword.label}</span>
              <span className="mono text-[10px] uppercase tracking-[0.14em]">{keyword.count}</span>
            </span>
          ))}
        </div>
      ) : (
        <EmptyState title={t.dashboard2.radarEmpty} helper={t.dashboard2.radarEmptyHelper} />
      )}
    </Panel>
  );
}

function ResourceStream({ insights, loading, t }: { insights: IntelligenceInsights; loading: boolean; t: Locale }) {
  return (
    <Panel index="07" title={t.dashboard2.streamTitle} subtitle={t.dashboard2.streamSubtitle}>
      {loading ? (
        <SkeletonRows />
      ) : insights.stream.length ? (
        <ul className="divide-y divide-[var(--color-hairline)]">
          {insights.stream.slice(0, 8).map((item) => (
            <li key={`${item.type}-${item.id}`} className="py-4 first:pt-0 last:pb-0">
              <a href={item.url} target="_blank" rel="noreferrer" className="group block">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mono mb-2 flex flex-wrap items-center gap-2 text-[10.5px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                      <span className={item.type === "paper" ? "text-[var(--color-isct)]" : "text-[var(--color-todai)]"}>{streamTypeLabel(item.type)}</span>
                      <span className="h-px w-4 bg-[var(--color-hairline-strong)]" />
                      <span>{item.source}</span>
                      <span>{formatDate(item.date, t.dateLocale, t.notSet)}</span>
                    </div>
                    <h3 className="line-clamp-2 text-[14.5px] font-medium leading-[1.5] text-[var(--color-ink)] group-hover:text-[var(--color-todai)]">
                      {item.title}
                    </h3>
                    {item.keywords.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.keywords.slice(0, 4).map((keyword) => (
                          <span key={keyword} className="mono inline-flex h-5 items-center bg-[var(--color-isct-soft)] px-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--color-isct)]">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--color-muted)]">{item.status}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[var(--color-subtle)] transition-colors group-hover:text-[var(--color-todai)]" />
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={t.dashboard2.streamEmpty} helper={t.dashboard2.streamEmptyHelper} />
      )}
    </Panel>
  );
}

function ApplicationSignalsPanel({
  signals,
  loading,
  t,
}: {
  signals: ApplicationSignals;
  loading: boolean;
  t: Locale;
}) {
  const nextDays = daysUntil(signals.nextTask?.deadline ?? null);
  return (
    <Panel index="08" title={t.dashboard2.signalsTitle} subtitle={t.dashboard2.signalsSubtitle}>
      <div className="mb-6 grid grid-cols-3 border-y border-[var(--color-hairline)]">
        <BriefStat label={t.dashboard2.signalsUrgent} value={loading ? "—" : signals.urgentTasks.length} />
        <BriefStat label={t.dashboard2.signalsOverdue} value={loading ? "—" : signals.overdueTasks.length} />
        <BriefStat label={t.dashboard2.signalsCompletion} value={loading ? "—" : `${signals.completion}%`} />
      </div>
      {loading ? (
        <SkeletonRows />
      ) : signals.nextTask ? (
        <div>
          <div className="mb-3 flex items-center gap-2">
            {nextDays !== null && nextDays < 0 ? (
              <AlertTriangle className="h-4 w-4 text-[var(--color-todai)]" />
            ) : (
              <Clock3 className="h-4 w-4 text-[var(--color-subtle)]" />
            )}
            <span className="mono text-[10.5px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">Next deadline</span>
          </div>
          <h3 className="text-[14px] font-semibold leading-6 text-[var(--color-ink)]">{signals.nextTask.title}</h3>
          <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
            {formatDate(signals.nextTask.deadline, t.dateLocale, t.notSet)} · {signals.nextTask.priority}
          </div>
          <p className="mt-4 text-[12.5px] leading-6 text-[var(--color-muted)]">
            {t.dashboard2.signalsBody}
          </p>
        </div>
      ) : (
        <EmptyState title={t.noTasksTitle} helper={t.noTasksHelper} />
      )}
    </Panel>
  );
}

function buildIntelligenceInsights(data: DashboardSummary | null, completion: number): IntelligenceInsights {
  const candidates = data?.pending_candidates ?? [];
  const papers = data?.recent_papers ?? [];
  const tasks = data?.upcoming_tasks ?? [];
  const activeTasks = tasks.filter((task) => task.status !== "done");
  const sortedActive = [...activeTasks].sort((a, b) => deadlineTime(a) - deadlineTime(b));
  const urgentTasks = sortedActive.filter((task) => {
    const days = daysUntil(task.deadline);
    return days !== null && days >= 0 && days <= 30;
  });
  const overdueTasks = sortedActive.filter((task) => {
    const days = daysUntil(task.deadline);
    return days !== null && days < 0;
  });
  const manualCaptures = candidates.filter(isManualCapture);
  const sourceCounts = topCounts(
    [
      ...candidates.map((candidate) => candidate.source || "candidate"),
      ...papers.map((paper) => paper.source || paper.venue || "paper"),
    ],
    6,
  );
  const keywordCounts = topCounts(
    [
      ...candidates.flatMap((candidate) => candidate.matched_keywords || []),
      ...papers.flatMap((paper) => paper.keywords || []),
    ],
    12,
  );

  return {
    inboxTotal: candidates.length,
    manualCaptures,
    sourceCounts,
    keywordCounts,
    coverage: data?.coverage ?? [],
    gaps: data?.gaps ?? [],
    stream: buildResourceStream(candidates, papers),
    application: {
      completion,
      nextTask: sortedActive[0] ?? null,
      urgentTasks,
      overdueTasks,
    },
  };
}

function coverageLabel(key: string, d2: Locale["dashboard2"]): { label: string; hint: string } {
  switch (key) {
    case "universities": return { label: d2.coverageUni, hint: d2.coverageUniHint };
    case "programs": return { label: d2.coveragePrograms, hint: d2.coverageProgramsHint };
    case "professors_labs": return { label: d2.coverageProfessors, hint: d2.coverageProfessorsHint };
    case "papers": return { label: d2.coveragePapers, hint: d2.coveragePapersHint };
    case "captures": return { label: d2.coverageCaptures, hint: d2.coverageCapturesHint };
    case "tasks": return { label: d2.coverageTasks, hint: d2.coverageTasksHint };
    default: return { label: key, hint: "" };
  }
}

function gapLabel(gap: GapItem, d2: Locale["dashboard2"]): { title: string; detail: string } {
  switch (gap.label_key) {
    case "no_programs_for": return { title: d2.gapNoProgramsFor(gap.university_name ?? ""), detail: d2.gapNoProgramsForDetail(gap.university_name ?? "") };
    case "no_professors_for": return { title: d2.gapNoProfessorsFor(gap.university_name ?? ""), detail: d2.gapNoProfessorsForDetail(gap.university_name ?? "") };
    case "few_universities": return { title: d2.gapFewUniversities, detail: d2.gapFewUniversitiesDetail };
    case "no_papers": return { title: d2.gapNoPapers, detail: d2.gapNoPapersDetail };
    case "candidate_backlog": return { title: d2.gapCandidateBacklog, detail: d2.gapCandidateBacklogDetail };
    case "no_tasks": return { title: d2.gapNoTasks, detail: d2.gapNoTasksDetail };
    case "none": return { title: d2.gapNone, detail: d2.gapNoneDetail };
    default: return { title: gap.label_key, detail: "" };
  }
}

function buildResourceStream(candidates: PaperCandidate[], papers: Paper[]): ResourceStreamItem[] {
  const candidateItems: ResourceStreamItem[] = candidates.map((candidate) => ({
    id: candidate.id,
    title: candidate.title,
    type: isManualCapture(candidate) ? "capture" : "candidate",
    source: candidate.source || "candidate",
    date: candidate.published_at,
    status: candidate.status || "pending",
    url: candidate.url,
    keywords: candidate.matched_keywords || [],
  }));
  const paperItems: ResourceStreamItem[] = papers.map((paper) => ({
    id: paper.id,
    title: paper.title,
    type: "paper",
    source: paper.venue || paper.source || "paper",
    date: paper.published_at ?? (paper.year ? `${paper.year}-01-01` : null),
    status: "in library",
    url: paper.url,
    keywords: paper.keywords || [],
  }));
  return [...candidateItems, ...paperItems].sort((a, b) => dateScore(b.date) - dateScore(a.date));
}

function isManualCapture(candidate: PaperCandidate): boolean {
  const text = `${candidate.source ?? ""} ${candidate.matched_keywords.join(" ")}`.toLowerCase();
  return text.includes("manual") || text.includes("bookmark") || text.includes("capture");
}

function streamTypeLabel(type: ResourceStreamItem["type"]): string {
  if (type === "paper") return "paper";
  if (type === "capture") return "capture";
  return "candidate";
}

function topCounts(values: string[], limit: number): CountItem[] {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const label = raw.trim();
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

function deadlineTime(task: TimelineTask): number {
  if (!task.deadline) return Number.POSITIVE_INFINITY;
  const time = new Date(`${task.deadline.slice(0, 10)}T00:00:00Z`).getTime();
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}

function dateScore(value?: string | null): number {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function daysUntil(deadline?: string | null): number | null {
  if (!deadline) return null;
  const target = new Date(`${deadline.slice(0, 10)}T00:00:00Z`).getTime();
  if (Number.isNaN(target)) return null;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Math.ceil((target - today.getTime()) / 86_400_000);
}

function EmptyState({ title, helper }: { title: string; helper: string }) {
  return (
    <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-12 text-center">
      <div className="serif text-[16px] font-semibold text-[var(--color-ink)]">{title}</div>
      <div className="mt-1.5 text-[12.5px] text-[var(--color-muted)]">{helper}</div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <ul className="divide-y divide-[var(--color-hairline)]">
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index} className="py-4">
          <div className="h-4 w-3/5 animate-pulse bg-[var(--color-paper)]" />
          <div className="mt-2 h-3 w-2/5 animate-pulse bg-[var(--color-paper)]" />
        </li>
      ))}
    </ul>
  );
}
