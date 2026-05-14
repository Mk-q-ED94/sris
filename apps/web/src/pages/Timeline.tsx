import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Gantt } from "../components/Gantt";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { fetchTimeline } from "../lib/api";
import type { TimelineTask } from "../types/sris";

const WINDOW_STEPS = [3, 6, 12];

export function Timeline() {
  const { token, clearToken } = useAuth();
  const { t } = useI18n();
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthsAhead, setMonthsAhead] = useState<number>(6);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchTimeline(token)
      .then((result) => {
        if (!cancelled) setTasks(result);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message.toLowerCase().includes("invalid api token")) clearToken();
        if (!cancelled) setError(err instanceof Error ? err.message : "Timeline request failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, clearToken]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <span className="rule-accent" />
          <span className="section-index">08 — {t.timeline.title}</span>
        </div>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="serif text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[56px]">
              {t.timeline.title}
            </h1>
            <p className="mt-3 max-w-2xl text-[14.5px] leading-[1.8] text-[var(--color-muted)]">
              {t.timeline.description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex border border-[var(--color-hairline-strong)]">
              {WINDOW_STEPS.map((step, idx) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setMonthsAhead(step)}
                  className={`mono px-3 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                    idx > 0 ? "border-l border-[var(--color-hairline-strong)]" : ""
                  } ${
                    step === monthsAhead
                      ? "bg-[var(--color-ink)] text-white"
                      : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {t.timeline.windowMonths(step)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">{error}</div>
      ) : null}

      {loading && tasks.length === 0 ? (
        <div className="h-64 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
      ) : (
        <Gantt tasks={tasks} monthsAhead={monthsAhead} monthsBehind={1} />
      )}

      <div className="flex items-center gap-6 text-[12px] text-[var(--color-muted)]">
        <span className="mono uppercase tracking-[0.18em] text-[var(--color-subtle)]">{t.timeline.legend}</span>
        <LegendItem swatch="bg-[var(--color-todai-soft)] border-[var(--color-todai)]" label={t.timeline.legendHigh} />
        <LegendItem swatch="bg-[var(--color-paper)] border-[var(--color-hairline-strong)]" label={t.timeline.legendMedium} />
        <LegendItem swatch="bg-emerald-200/60 border-emerald-400/60" label={t.timeline.legendDone} />
        <span className="mono ml-auto hidden items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-subtle)] md:inline-flex">
          <ChevronLeft className="h-3.5 w-3.5" />
          {t.timeline.prev} · {t.timeline.next}
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}

function LegendItem({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block h-3 w-5 border ${swatch}`} />
      {label}
    </span>
  );
}
