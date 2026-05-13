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
import { useAuth } from "../contexts/AuthContext";
import { fetchDashboard } from "../lib/api";
import { compactNumber, formatDate } from "../lib/format";
import type { DashboardSummary, Paper, PaperCandidate, TimelineTask } from "../types/sris";

const metricConfig = [
  { key: "universities", label: "院校", icon: University, tone: "from-sky-500 to-cyan-400" },
  { key: "programs", label: "项目", icon: GraduationCap, tone: "from-indigo-500 to-blue-400" },
  { key: "professors", label: "教授", icon: UsersRound, tone: "from-violet-500 to-fuchsia-400" },
  { key: "labs", label: "实验室", icon: FlaskConical, tone: "from-emerald-500 to-teal-400" },
  { key: "papers", label: "论文", icon: BookOpen, tone: "from-slate-700 to-slate-500" },
  { key: "pending_candidates", label: "待确认", icon: Inbox, tone: "from-amber-500 to-orange-400" },
  { key: "timeline_tasks", label: "任务", icon: CalendarClock, tone: "from-rose-500 to-pink-400" },
] as const;

export function Dashboard() {
  const { token, clearToken } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchDashboard(token));
    } catch (err) {
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
          <h1 className="text-2xl font-semibold tracking-[-0.03em]">无法加载总览</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={load} className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white">
              重试
            </button>
            <button onClick={clearToken} className="h-11 rounded-2xl bg-slate-100 px-5 text-sm font-semibold text-slate-700">
              重新输入 token
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[34px] border border-white/80 bg-white/75 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-7">
        <div className="absolute right-8 top-6 hidden h-32 w-32 rounded-full bg-cyan-300/20 blur-3xl sm:block" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-500">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              Research intelligence cockpit
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl">
              SGU / AI 修士申请总览
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
              把院校、教授、实验室、论文雷达和申请任务压缩成一个可扫描的每日控制台。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
            <HeroStat label="待确认论文" value={data?.counts.pending_candidates ?? 0} helper="Review queue" />
            <HeroStat label="90 天任务" value={data?.upcoming_tasks.length ?? 0} helper="Application timeline" />
            <HeroStat label="完成率" value={`${completion}%`} helper="Upcoming window" />
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
              <div className="mt-1 text-sm font-medium text-slate-500">{metric.label}</div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.75fr]">
        <Panel
          title="近期论文"
          subtitle="已进入正式库的研究信号"
          action={
            <button onClick={load} className="inline-flex h-9 items-center gap-2 rounded-2xl bg-slate-100 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">
              <RefreshCw className="h-4 w-4" />
              刷新
            </button>
          }
        >
          <PaperList papers={data?.recent_papers ?? []} loading={loading} />
        </Panel>

        <Panel title="申请窗口" subtitle="未来 90 天高优先级动作">
          <Timeline tasks={data?.upcoming_tasks ?? []} loading={loading} />
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.82fr_1fr]">
        <Panel title="待确认队列" subtitle="自动采集结果进入正式库前的缓冲区">
          <CandidateList candidates={data?.pending_candidates ?? []} loading={loading} />
        </Panel>
        <Panel title="系统状态" subtitle="面向长期运行的基础设施信号">
          <SystemStatus data={data} loading={loading} />
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

function PaperList({ papers, loading }: { papers: Paper[]; loading: boolean }) {
  if (loading) return <SkeletonRows />;
  if (!papers.length) return <EmptyState title="暂无论文" helper="运行 arXiv ingest 或在 Review Queue 接受候选论文。" />;
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
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">{paper.authors.join(", ") || "Unknown authors"}</p>
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

function Timeline({ tasks, loading }: { tasks: TimelineTask[]; loading: boolean }) {
  if (loading) return <SkeletonRows />;
  if (!tasks.length) return <EmptyState title="没有临近任务" helper="未来 90 天暂无未完成事项。" />;
  return (
    <div className="space-y-3">
      {tasks.slice(0, 7).map((task) => (
        <div key={task.id} className="flex gap-3 rounded-3xl border border-slate-200/70 bg-slate-50/70 p-4">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
            {task.status === "done" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock3 className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h3 className="truncate text-sm font-semibold text-slate-900">{task.title}</h3>
              <Badge tone={task.priority === "high" ? "amber" : "slate"}>{task.priority}</Badge>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {task.task_type ?? "Task"} · {formatDate(task.deadline)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CandidateList({ candidates, loading }: { candidates: PaperCandidate[]; loading: boolean }) {
  if (loading) return <SkeletonRows />;
  if (!candidates.length) return <EmptyState title="Review Queue 清空" helper="新的 arXiv 候选会在定时任务后出现。" />;
  return (
    <div className="space-y-3">
      {candidates.slice(0, 5).map((candidate) => (
        <div key={candidate.id} className="rounded-3xl border border-amber-100 bg-amber-50/60 p-4">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge tone="amber">{candidate.source ?? "arXiv"}</Badge>
            <Badge>{formatDate(candidate.published_at)}</Badge>
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-6">{candidate.title}</h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{candidate.abstract}</p>
        </div>
      ))}
    </div>
  );
}

function SystemStatus({ data, loading }: { data: DashboardSummary | null; loading: boolean }) {
  const items = [
    { label: "D1 数据库", value: loading ? "Checking" : "Connected", ok: true },
    { label: "arXiv Radar", value: `${data?.pending_candidates.length ?? 0} pending`, ok: true },
    { label: "AI 摘要", value: "Interface reserved", ok: false },
    { label: "Cloudflare Cron", value: "Daily 23:15 UTC", ok: true },
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
