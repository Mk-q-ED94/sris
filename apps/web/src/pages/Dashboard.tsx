import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FlaskConical,
  GraduationCap,
  Inbox,
  RefreshCw,
  University,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { UniversityCarousel } from "../components/UniversityCarousel";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { fetchDashboard } from "../lib/api";
import { compactNumber, formatDate } from "../lib/format";
import type { Locale, MetricKey } from "../i18n/locales";
import type { DashboardSummary, Paper, PaperCandidate, TimelineTask } from "../types/sris";

const metricConfig: Array<{ key: MetricKey; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "universities", icon: University },
  { key: "programs", icon: GraduationCap },
  { key: "professors", icon: UsersRound },
  { key: "labs", icon: FlaskConical },
  { key: "papers", icon: BookOpen },
  { key: "pending_candidates", icon: Inbox },
  { key: "timeline_tasks", icon: CalendarClock },
];

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
      {/* Hero */}
      <section>
        <div className="flex items-center gap-3">
          <span className="rule-accent" />
          <span className="section-index">01 — Overview</span>
        </div>
        <div className="mt-6 grid gap-10 xl:grid-cols-[1.4fr_1fr] xl:items-end">
          <div>
            <h1 className="serif text-[44px] font-semibold leading-[1.08] tracking-[-0.02em] text-[var(--color-ink)] sm:text-[64px]">
              {t.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[var(--color-muted)] sm:text-[16px]">
              {t.heroBody}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-0 border-y border-[var(--color-hairline-strong)]">
            <HeroStat label={t.hero.pending} value={data?.counts.pending_candidates ?? 0} helper={t.hero.pendingHelper} accent />
            <HeroStat label={t.hero.tasks90d} value={data?.upcoming_tasks.length ?? 0} helper={t.hero.tasksHelper} />
            <HeroStat label={t.hero.completion} value={`${completion}%`} helper={t.hero.completionHelper} />
          </div>
        </div>
      </section>

      <UniversityCarousel onSelect={onOpenUniversity} />

      {/* Metrics */}
      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="section-index">03 — Database</span>
            <span className="h-px w-12 bg-[var(--color-hairline-strong)]" />
            <span className="mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
              {loading ? "loading" : "current"}
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

      {/* Recent papers + Timeline */}
      <section className="grid gap-8 xl:grid-cols-[1.45fr_1fr]">
        <Panel
          index="04"
          title={t.panels.recentPapers[0]}
          subtitle={t.panels.recentPapers[1]}
          action={
            <button onClick={load} className="mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-todai)]">
              <RefreshCw className="h-3 w-3" />
              {t.refresh}
            </button>
          }
        >
          <PaperList papers={data?.recent_papers ?? []} loading={loading} t={t} />
        </Panel>
        <Panel index="05" title={t.panels.timeline[0]} subtitle={t.panels.timeline[1]}>
          <Timeline tasks={data?.upcoming_tasks ?? []} loading={loading} t={t} />
        </Panel>
      </section>

      {/* Review + System status */}
      <section className="grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <Panel index="06" title={t.panels.review[0]} subtitle={t.panels.review[1]}>
          <CandidateList candidates={data?.pending_candidates ?? []} loading={loading} t={t} />
        </Panel>
        <Panel index="07" title={t.panels.status[0]} subtitle={t.panels.status[1]}>
          <SystemStatus data={data} loading={loading} t={t} />
        </Panel>
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
  action?: React.ReactNode;
  children: React.ReactNode;
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

function PaperList({ papers, loading, t }: { papers: Paper[]; loading: boolean; t: Locale }) {
  if (loading) return <SkeletonRows />;
  if (!papers.length) return <EmptyState title={t.noPapersTitle} helper={t.noPapersHelper} />;
  return (
    <ul className="divide-y divide-[var(--color-hairline)]">
      {papers.slice(0, 6).map((paper) => (
        <li key={paper.id} className="py-4 first:pt-0 last:pb-0">
          <a href={paper.url} target="_blank" rel="noreferrer" className="group block">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-[14.5px] font-medium leading-[1.5] text-[var(--color-ink)] group-hover:text-[var(--color-todai)]">
                  {paper.title}
                </h3>
                <p className="mt-1.5 line-clamp-1 text-[12.5px] text-[var(--color-muted)]">
                  {paper.authors.join(", ") || t.unknownAuthors}
                </p>
                {paper.keywords.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {paper.keywords.slice(0, 4).map((keyword) => (
                      <span
                        key={keyword}
                        className="mono inline-flex h-5 items-center bg-[var(--color-isct-soft)] px-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--color-isct)]"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-shrink-0 flex-col items-end gap-2 text-[11px]">
                <span className="mono uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                  {paper.venue ?? paper.source ?? "arXiv"} {paper.year ? `· ${paper.year}` : ""}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[var(--color-subtle)] transition-colors group-hover:text-[var(--color-todai)]" />
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Timeline({ tasks, loading, t }: { tasks: TimelineTask[]; loading: boolean; t: Locale }) {
  if (loading) return <SkeletonRows />;
  if (!tasks.length) return <EmptyState title={t.noTasksTitle} helper={t.noTasksHelper} />;
  return (
    <ul className="divide-y divide-[var(--color-hairline)]">
      {tasks.slice(0, 7).map((task) => {
        const priorityKey = (task.priority === "high" || task.priority === "low" ? task.priority : "medium") as
          | "high"
          | "medium"
          | "low";
        const Icon = task.status === "done" ? CheckCircle2 : Clock3;
        return (
          <li key={task.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
            <Icon
              className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                task.status === "done" ? "text-emerald-600" : "text-[var(--color-subtle)]"
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="truncate text-[14px] font-medium text-[var(--color-ink)]">{task.title}</h3>
                <span
                  className={`mono inline-flex h-5 flex-shrink-0 items-center px-1.5 text-[10px] uppercase tracking-[0.16em] ${
                    priorityKey === "high"
                      ? "bg-[var(--color-todai-soft)] text-[var(--color-todai)]"
                      : "bg-[var(--color-paper)] text-[var(--color-muted)]"
                  }`}
                >
                  {t.priorities[priorityKey]}
                </span>
              </div>
              <div className="mono mt-1.5 text-[11px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                {task.task_type ?? "Task"} · {formatDate(task.deadline, t.dateLocale, t.notSet)}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function CandidateList({ candidates, loading, t }: { candidates: PaperCandidate[]; loading: boolean; t: Locale }) {
  if (loading) return <SkeletonRows />;
  if (!candidates.length) return <EmptyState title={t.reviewClearedTitle} helper={t.reviewClearedHelper} />;
  return (
    <ul className="divide-y divide-[var(--color-hairline)]">
      {candidates.slice(0, 5).map((candidate) => (
        <li key={candidate.id} className="py-4 first:pt-0 last:pb-0">
          <div className="mono flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-todai)]">
            <span>{candidate.source ?? "arXiv"}</span>
            <span className="h-px w-4 bg-[var(--color-hairline-strong)]" />
            <span className="text-[var(--color-subtle)]">{formatDate(candidate.published_at, t.dateLocale, t.notSet)}</span>
          </div>
          <h3 className="mt-2 line-clamp-2 text-[14.5px] font-medium leading-[1.5] text-[var(--color-ink)]">
            {candidate.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-[12.5px] leading-[1.65] text-[var(--color-muted)]">
            {candidate.abstract}
          </p>
        </li>
      ))}
    </ul>
  );
}

function SystemStatus({ data, loading, t }: { data: DashboardSummary | null; loading: boolean; t: Locale }) {
  const items = [
    { label: t.status.db, value: loading ? t.status.checking : t.status.connected, ok: true },
    { label: t.status.arxiv, value: t.status.pendingFmt(data?.pending_candidates.length ?? 0), ok: true },
    { label: t.status.ai, value: t.status.aiReserved, ok: false },
    { label: t.status.cron, value: t.status.cronSchedule, ok: true },
  ];

  return (
    <ul className="divide-y divide-[var(--color-hairline)]">
      {items.map((item) => (
        <li key={item.label} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
          <div className="flex items-center gap-3">
            <span
              className={`h-1.5 w-1.5 rounded-full ${item.ok ? "bg-emerald-500" : "bg-[var(--color-subtle)]"}`}
            />
            <span className="text-[13px] font-medium text-[var(--color-ink)]">{item.label}</span>
          </div>
          <span className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
            {item.value}
          </span>
        </li>
      ))}
    </ul>
  );
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
