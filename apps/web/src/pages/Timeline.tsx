import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Gantt } from "../components/Gantt";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { createTask, deleteTask, fetchTimeline } from "../lib/api";
import type { TimelineTask } from "../types/sris";

const WINDOW_STEPS = [3, 6, 12];

export function Timeline() {
  const { token, clearToken } = useAuth();
  const { t } = useI18n();
  const [tasks, setTasks] = useState<TimelineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthsAhead, setMonthsAhead] = useState<number>(6);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formPriority, setFormPriority] = useState("medium");
  const [formType, setFormType] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  async function handleCreate() {
    if (!formTitle.trim()) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: formTitle.trim(),
        priority: formPriority,
        status: "todo",
      };
      if (formDeadline) payload.deadline = formDeadline;
      if (formType.trim()) payload.task_type = formType.trim();
      if (formNotes.trim()) payload.notes = formNotes.trim();
      const newTask = await createTask(token, payload);
      setTasks((prev) => [...prev, newTask]);
      setShowForm(false);
      setFormTitle("");
      setFormDeadline("");
      setFormPriority("medium");
      setFormType("");
      setFormNotes("");
    } catch {
      // Keep form open on failure
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTask(token, id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch {
      // Ignore delete failure
    }
  }

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
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="inline-flex h-9 items-center gap-2 bg-[var(--color-ink)] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[var(--color-todai)]"
            >
              <Plus className="h-3.5 w-3.5" />
              {t.timeline.newTask}
            </button>
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

      {showForm && (
        <div className="border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mono mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                {t.timeline.titleLabel} *
              </label>
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="h-9 w-full border border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-3 text-[13px] outline-none focus:border-[var(--color-todai)]"
                placeholder="e.g. TOEFL score planning"
              />
            </div>
            <div>
              <label className="mono mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                {t.timeline.deadlineLabel}
              </label>
              <input
                type="date"
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
                className="h-9 w-full border border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-3 text-[13px] outline-none focus:border-[var(--color-todai)]"
              />
            </div>
            <div>
              <label className="mono mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                {t.timeline.priorityLabel}
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value)}
                className="h-9 w-full border border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-3 text-[13px] outline-none focus:border-[var(--color-todai)]"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="mono mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                {t.timeline.taskTypeLabel}
              </label>
              <input
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="h-9 w-full border border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-3 text-[13px] outline-none focus:border-[var(--color-todai)]"
                placeholder="e.g. TOEFL, SOP"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mono mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                {t.timeline.notesLabel}
              </label>
              <input
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="h-9 w-full border border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-3 text-[13px] outline-none focus:border-[var(--color-todai)]"
                placeholder="Optional notes"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={submitting || !formTitle.trim()}
              className="h-9 bg-[var(--color-ink)] px-5 text-[12px] font-medium text-white transition-colors hover:bg-[var(--color-todai)] disabled:opacity-50"
            >
              {submitting ? "…" : t.timeline.save}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="h-9 border border-[var(--color-hairline-strong)] px-5 text-[12px] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
            >
              {t.timeline.cancel}
            </button>
          </div>
        </div>
      )}

      {error ? (
        <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">{error}</div>
      ) : null}

      {loading && tasks.length === 0 ? (
        <div className="h-64 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
      ) : (
        <Gantt tasks={tasks} monthsAhead={monthsAhead} monthsBehind={1} />
      )}

      {tasks.length > 0 && (
        <div className="space-y-2">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">Task list</div>
          <ul className="divide-y divide-[var(--color-hairline)] border border-[var(--color-hairline)] bg-[var(--color-surface)]">
            {tasks.map((task) => (
              <li key={task.id} className="group flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`mono inline-flex h-5 items-center px-1.5 text-[10px] uppercase tracking-[0.16em] ${
                      task.priority === "high"
                        ? "bg-[var(--color-todai-soft)] text-[var(--color-todai)]"
                        : "bg-[var(--color-paper)] text-[var(--color-muted)]"
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-1 text-[13.5px] font-medium text-[var(--color-ink)]">{task.title}</div>
                  <div className="mono mt-1 text-[10.5px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                    {task.task_type ?? "Task"} · {task.deadline ?? "No deadline"}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center text-[var(--color-subtle)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--color-todai)]"
                  title={t.timeline.delete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
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
