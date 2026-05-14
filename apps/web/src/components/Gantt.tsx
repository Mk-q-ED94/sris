import { useMemo } from "react";
import { useI18n } from "../contexts/I18nContext";
import type { TimelineTask } from "../types/sris";

interface GanttProps {
  tasks: TimelineTask[];
  monthsAhead: number;
  monthsBehind: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const ROW_HEIGHT = 40;

function startOfMonthUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonthsUTC(date: Date, n: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + n, date.getUTCDate()));
}

function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const day = value.slice(0, 10);
  const d = new Date(`${day}T00:00:00Z`);
  return isNaN(d.getTime()) ? null : d;
}

export function Gantt({ tasks, monthsAhead, monthsBehind }: GanttProps) {
  const { t } = useI18n();

  const view = useMemo(() => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const viewStart = startOfMonthUTC(addMonthsUTC(today, -monthsBehind));
    const viewEnd = startOfMonthUTC(addMonthsUTC(today, monthsAhead + 1));
    const totalDays = Math.max(1, Math.round((viewEnd.getTime() - viewStart.getTime()) / DAY_MS));

    const months: { date: Date; days: number }[] = [];
    let cursor = new Date(viewStart);
    while (cursor < viewEnd) {
      const next = addMonthsUTC(cursor, 1);
      months.push({
        date: cursor,
        days: Math.round((next.getTime() - cursor.getTime()) / DAY_MS),
      });
      cursor = next;
    }

    return { viewStart, viewEnd, totalDays, months, today };
  }, [monthsAhead, monthsBehind]);

  const positioned = useMemo(() => {
    return tasks
      .map((task) => {
        const end = parseDateOnly(task.deadline);
        if (!end) return null;
        const start = parseDateOnly(task.created_at) ?? new Date(end.getTime() - 7 * DAY_MS);
        const clippedStart = new Date(Math.max(start.getTime(), view.viewStart.getTime()));
        const clippedEnd = new Date(Math.min(end.getTime() + DAY_MS, view.viewEnd.getTime()));
        if (clippedEnd <= view.viewStart || clippedStart >= view.viewEnd) return null;
        const leftDays = (clippedStart.getTime() - view.viewStart.getTime()) / DAY_MS;
        const widthDays = Math.max(1, (clippedEnd.getTime() - clippedStart.getTime()) / DAY_MS);
        return {
          task,
          left: (leftDays / view.totalDays) * 100,
          width: (widthDays / view.totalDays) * 100,
          end,
        };
      })
      .filter((x): x is { task: TimelineTask; left: number; width: number; end: Date } => x !== null)
      .sort((a, b) => a.end.getTime() - b.end.getTime());
  }, [tasks, view]);

  const monthFmt = useMemo(
    () => new Intl.DateTimeFormat(t.dateLocale, { timeZone: "UTC", year: "numeric", month: "short" }),
    [t.dateLocale],
  );

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(t.dateLocale, { timeZone: "Asia/Shanghai", month: "short", day: "numeric" }),
    [t.dateLocale],
  );

  const todayPct = ((view.today.getTime() - view.viewStart.getTime()) / DAY_MS / view.totalDays) * 100;
  const todayVisible = todayPct >= 0 && todayPct <= 100;

  if (positioned.length === 0) {
    return (
      <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-12 text-center">
        <div className="serif text-[16px] font-semibold text-[var(--color-ink)]">{t.timeline.noTasks}</div>
      </div>
    );
  }

  const chartHeight = positioned.length * ROW_HEIGHT + 12;

  return (
    <div className="border border-[var(--color-hairline)] bg-[var(--color-surface)]">
      <div className="grid" style={{ gridTemplateColumns: "240px 1fr" }}>
        <div className="border-b border-r border-[var(--color-hairline)] px-4 py-2.5">
          <span className="mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">Task</span>
        </div>
        <div className="relative grid border-b border-[var(--color-hairline)]" style={{ gridTemplateColumns: view.months.map((m) => `${m.days}fr`).join(" ") }}>
          {view.months.map((month, i) => (
            <div
              key={i}
              className={`flex items-center border-r border-[var(--color-hairline)] px-3 py-2.5 ${
                i === view.months.length - 1 ? "border-r-0" : ""
              }`}
            >
              <span className="mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {monthFmt.format(month.date)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-r border-[var(--color-hairline)]">
          {positioned.map(({ task }) => (
            <div
              key={task.id}
              className="flex items-center border-b border-[var(--color-hairline)] px-4"
              style={{ height: ROW_HEIGHT }}
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-[var(--color-ink)]">{task.title}</div>
                <div className="mono mt-0.5 truncate text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                  {task.task_type ?? "Task"}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative" style={{ height: chartHeight }}>
          {/* Month gridlines */}
          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: view.months.map((m) => `${m.days}fr`).join(" ") }}>
            {view.months.map((_, i) => (
              <div
                key={i}
                className={`border-r border-[var(--color-hairline)] ${
                  i === view.months.length - 1 ? "border-r-0" : ""
                }`}
              />
            ))}
          </div>

          {/* Today line */}
          {todayVisible ? (
            <div
              className="pointer-events-none absolute top-0 z-10 flex h-full flex-col"
              style={{ left: `${todayPct}%` }}
            >
              <span className="mono absolute -top-[14px] left-1 whitespace-nowrap text-[9.5px] uppercase tracking-[0.18em] text-[var(--color-todai)]">
                {t.timeline.today}
              </span>
              <div className="h-full w-px bg-[var(--color-todai)] opacity-70" />
            </div>
          ) : null}

          {/* Bars */}
          {positioned.map(({ task, left, width }, idx) => {
            const isDone = task.status === "done";
            const high = task.priority === "high";
            const top = idx * ROW_HEIGHT + (ROW_HEIGHT - 18) / 2;
            return (
              <div
                key={task.id}
                className="absolute group"
                style={{ left: `${left}%`, width: `${width}%`, top, height: 18 }}
                title={`${task.title} · ${task.deadline ? dateFmt.format(new Date(task.deadline)) : ""}`}
              >
                <div
                  className={`h-full w-full border ${
                    isDone
                      ? "border-emerald-400/60 bg-emerald-200/60"
                      : high
                        ? "border-[var(--color-todai)] bg-[var(--color-todai-soft)]"
                        : "border-[var(--color-hairline-strong)] bg-[var(--color-paper)]"
                  }`}
                />
                <div
                  className={`absolute right-0 top-1/2 h-3 w-px -translate-y-1/2 ${
                    isDone ? "bg-emerald-600" : high ? "bg-[var(--color-todai)]" : "bg-[var(--color-ink)]"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
