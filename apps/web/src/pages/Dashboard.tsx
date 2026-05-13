import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Database,
  FlaskConical,
  GraduationCap,
  Inbox,
  RefreshCw,
  Sparkles,
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

const metricConfig: Array<{ key: MetricKey; icon: React.ComponentType<{ className?: string }>; tone: string }> = [
  { key: "universities", icon: University, tone: "from-sky-500 to-cyan-400" },
  { key: "programs", icon: GraduationCap, tone: "from-indigo-500 to-blue-400" },
  { key: "professors", icon: UsersRound, tone: "from-violet-500 to-fuchsia-400" },
  { key: "labs", icon: FlaskConical, tone: "from-emerald-500 to-teal-400" },
  { key: "papers", icon: BookOpen, tone: "from-slate-700 to-slate-500" },
  { key: "pending_candidates", icon: Inbox, tone: "from-amber-500 to-orange-400" },
  { key: "timeline_tasks", icon: CalendarClock, tone: "from-rose-500 to-pink-400" },
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
      <div className="grid min-h-[70vh] place-items-center">
        <div className="w-full max-w-xl rounded-[32px] border border-red-100 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Activity className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">{t.dashboardLoadFailed}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={load} className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white">
              {t.retry}
            </button>
            <button onClick={clearToken} className="h-11 rounded-2xl bg-slate-100 px-5 text-sm font-semibold text-slate-700">
              {t.reenterToken}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <UniversityCarousel onSelect={onOpenUniversity} />

      <section className="relative overflow-hidden rounded-[34px] border border-white/80 bg-white/75 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-7">
        <div className="absolute right-8 top-6 hidden h-32 w-32 rounded-full bg-cyan-300/20 blur-3xl sm:block" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-500">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              {t.cockpitChip}
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl">
              {t.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">{t.heroBody}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
            <HeroStat label={t.hero.pending} value={data?.counts.pending_candidates ?? 0} helper={t.hero.pendingHelper} />
            <HeroStat label={t.hero.tasks90d} value={data?.upcoming_tasks.length ?? 0} helper={t.hero.tasksHelper} />
            <HeroStat label={t.hero.completion} value={`${completion}%`} helper={t.hero.completionHelper} />
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        {metricConfig.map((metric) => {
          const Icon = metric.icon;
          const value = data?.counts[metric.key] ?? 0;
          return (
            <div
              key={metric.key}
              className="group rounded-[26px] border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${metric.tone} text-white shadow-lg shadow-slate-950/10`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-semibold tracking-[-0.03em]">{loading ? "…" : compactNumber(value)}</div>
              <div className="mt-1 text-sm font-medium text-slate-500">{t.metrics[metric.key]}</div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.75fr]">
        <Panel
          title={t.panels.recentPapers[0]}
          subtitle={t.panels.recentPapers[1]}
          action={
            <button onClick={load} className="inline-flex h-9 items-center gap-2 rounded-2xl bg-slate-100 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">
              <RefreshCw className="h-4 w-4" />
              {t.refresh}
            </button>
          }
        >
          <PaperList papers={data?.recent_papers ?? []} loading={loading} t={t} />
        </Panel>

        <Panel title={t.panels.timeline[0]} subtitle={t.panels.timeline[1]}>
          <Timeline tasks={data?.upcoming_tasks ?? []} loading={loading} t={t} />
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.82fr_1fr]">
        <Panel title={t.panels.review[0]} subtitle={t.panels.review[1]}>
          <CandidateList candidates={data?.pending_candidates ?? []} loading={loading} t={t} />
        </Panel>
        <Panel title={t.panels.status[0]} subtitle={t.panels.status[1]}>
          <SystemStatus data={data} loading={loading} t={t} />
        </Panel>
      </section>
    </div>
  );
}

function HeroStat({ label, value, helper }: { label: string; value: number | string; helper: string }) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-4">
      <div className="text-2xl font-semibold tracking-[-0.03em]">{value}</div>
      <div className="mt-1 text-sm font-semibold text-slate-700">{label}</div>
      <div className="mt-1 text-xs text-slate-400">{helper}</div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[30px] border border-white/80 bg-white/78 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.03em]">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function PaperList({ papers, loading, t }: { papers: Paper[]; loading: boolean; t: Locale }) {
  if (loading) return <SkeletonRows />;
  if (!papers.length) return <EmptyState title={t.noPapersTitle} helper={t.noPapersHelper} />;
  return (
    <div className="space-y-3">
      {papers.slice(0, 6).map((paper) => (
        <a
          key={paper.id}
          href={paper.url}
          className="group block rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-lg hover:shadow-cyan-950/5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-slate-900">{paper.title}</h3>
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">{paper.authors.join(", ") || t.unknownAuthors}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-cyan-600" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge>{paper.venue ?? paper.source ?? "arXiv"}</Badge>
            {paper.year ? <Badge>{paper.year}</Badge> : null}
            {paper.keywords.slice(0, 3).map((keyword) => (
              <Badge key={keyword} tone="blue">
                {keyword}
              </Badge>
            ))}
          </div>
        </a>
      ))}
    </div>
  );
}

function Timeline({ tasks, loading, t }: { tasks: TimelineTask[]; loading: boolean; t: Locale }) {
  if (loading) return <SkeletonRows />;
  if (!tasks.length) return <EmptyState title={t.noTasksTitle} helper={t.noTasksHelper} />;
  return (
    <div className="space-y-3">
      {tasks.slice(0, 7).map((task) => {
        const priorityKey = (task.priority === "high" || task.priority === "low" ? task.priority : "medium") as
          | "high"
          | "medium"
          | "low";
        return (
          <div key={task.id} className="flex gap-3 rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
              {task.status === "done" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock3 className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="truncate text-sm font-semibold text-slate-900">{task.title}</h3>
                <Badge tone={priorityKey === "high" ? "amber" : "slate"}>{t.priorities[priorityKey]}</Badge>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {task.task_type ?? "Task"} · {formatDate(task.deadline, t.dateLocale, t.notSet)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CandidateList({ candidates, loading, t }: { candidates: PaperCandidate[]; loading: boolean; t: Locale }) {
  if (loading) return <SkeletonRows />;
  if (!candidates.length) return <EmptyState title={t.reviewClearedTitle} helper={t.reviewClearedHelper} />;
  return (
    <div className="space-y-3">
      {candidates.slice(0, 5).map((candidate) => (
        <div key={candidate.id} className="rounded-3xl border border-amber-100 bg-amber-50/60 p-4">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge tone="amber">{candidate.source ?? "arXiv"}</Badge>
            <Badge>{formatDate(candidate.published_at, t.dateLocale, t.notSet)}</Badge>
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-6">{candidate.title}</h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{candidate.abstract}</p>
        </div>
      ))}
    </div>
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
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{item.label}</span>
            <span className={`h-2.5 w-2.5 rounded-full ${item.ok ? "bg-emerald-500" : "bg-slate-300"}`} />
          </div>
          <div className="mt-2 text-xs text-slate-500">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "blue" | "amber" }) {
  const classes = {
    slate: "border-slate-200 bg-white text-slate-500",
    blue: "border-cyan-100 bg-cyan-50 text-cyan-700",
    amber: "border-amber-100 bg-amber-100/80 text-amber-700",
  };
  return <span className={`inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-semibold ${classes[tone]}`}>{children}</span>;
}

function EmptyState({ title, helper }: { title: string; helper: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
      <Database className="mx-auto h-6 w-6 text-slate-300" />
      <div className="mt-3 text-sm font-semibold text-slate-700">{title}</div>
      <div className="mt-1 text-xs text-slate-400">{helper}</div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-3xl bg-slate-100" />
      ))}
    </div>
  );
}
