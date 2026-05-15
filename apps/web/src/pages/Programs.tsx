import { ArrowUpRight, CalendarClock, Globe2, GraduationCap, Languages } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { fetchPrograms, fetchUniversities } from "../lib/api";
import { formatDate } from "../lib/format";
import type { Program, University } from "../types/sris";

export function Programs() {
  const { token, clearToken } = useAuth();
  const { t } = useI18n();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchPrograms(token), fetchUniversities(token)])
      .then(([progs, unis]) => {
        if (!cancelled) {
          setPrograms(progs);
          setUniversities(unis);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message.toLowerCase().includes("invalid api token")) clearToken();
        if (!cancelled) setError(err instanceof Error ? err.message : "Request failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, clearToken]);

  const uniMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of universities) map.set(u.id, u.name);
    return map;
  }, [universities]);

  const sortedPrograms = useMemo(() => {
    return [...programs].sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    });
  }, [programs]);

  function deadlineDays(deadline?: string | null): number | null {
    if (!deadline) return null;
    const target = new Date(`${deadline.slice(0, 10)}T00:00:00Z`).getTime();
    if (Number.isNaN(target)) return null;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return Math.ceil((target - today.getTime()) / 86_400_000);
  }

  if (error) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <div className="w-full max-w-xl border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] p-10 text-center">
          <div className="section-index">Error</div>
          <h1 className="serif mt-2 text-[24px] font-semibold">{error}</h1>
          <button onClick={() => clearToken()} className="mt-6 h-10 border border-[var(--color-hairline-strong)] px-5 text-[12.5px] font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]">
            {t.reenterToken}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center gap-3">
          <span className="rule-accent" />
          <span className="section-index">05 — {t.programs.title}</span>
        </div>
        <h1 className="serif mt-6 text-[44px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[60px]">
          {t.programs.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[var(--color-muted)] sm:text-[16px]">
          {t.programs.description}
        </p>
      </section>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-16 text-center">
          <div className="serif text-[18px] font-semibold text-[var(--color-ink)]">{t.programs.noResults}</div>
          <div className="mt-1.5 text-[13px] text-[var(--color-muted)]">{t.programs.noResultsHelper}</div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPrograms.map((prog) => {
            const days = deadlineDays(prog.deadline);
            const urgent = days !== null && days >= 0 && days <= 30;
            const overdue = days !== null && days < 0;
            return (
              <div key={prog.id} className="border border-[var(--color-hairline)] bg-[var(--color-surface)]">
                <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
                  <div className="border-b border-[var(--color-hairline)] p-6 lg:border-b-0 lg:border-r">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                        {uniMap.get(prog.university_id) ?? prog.university_id}
                      </span>
                    </div>
                    <h2 className="serif mt-3 text-[20px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
                      {prog.program_name}
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {prog.degree && (
                        <span className="inline-flex items-center gap-1.5 border border-[var(--color-hairline)] bg-[var(--color-paper)] px-2 py-1 text-[11px]">
                          <GraduationCap className="h-3 w-3 text-[var(--color-subtle)]" />
                          {prog.degree}
                        </span>
                      )}
                      {prog.language && (
                        <span className="inline-flex items-center gap-1.5 border border-[var(--color-hairline)] bg-[var(--color-paper)] px-2 py-1 text-[11px]">
                          <Languages className="h-3 w-3 text-[var(--color-subtle)]" />
                          {prog.language}
                        </span>
                      )}
                    </div>
                    {prog.requirements && (
                      <p className="mt-4 text-[13px] leading-[1.7] text-[var(--color-muted)]">
                        {prog.requirements}
                      </p>
                    )}
                  </div>
                  <div className="p-6">
                    {prog.deadline && (
                      <div>
                        <div className="mono mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                          {t.programs.deadline}
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarClock className={`h-4 w-4 ${urgent || overdue ? "text-[var(--color-todai)]" : "text-[var(--color-subtle)]"}`} />
                          <span className={`serif text-[18px] font-semibold ${urgent || overdue ? "text-[var(--color-todai)]" : "text-[var(--color-ink)]"}`}>
                            {formatDate(prog.deadline, t.dateLocale, t.notSet)}
                          </span>
                        </div>
                        {days !== null && (
                          <div className={`mono mt-1 text-[10.5px] uppercase tracking-[0.16em] ${overdue ? "text-[var(--color-todai)]" : urgent ? "text-[var(--color-todai)]" : "text-[var(--color-subtle)]"}`}>
                            {overdue ? `${Math.abs(days)}d overdue` : `${days}d remaining`}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-5 space-y-2">
                      {prog.scholarship && (
                        <div className="text-[12.5px]">
                          <span className="text-[var(--color-muted)]">{t.programs.scholarship}:</span>{" "}
                          <span className="text-[var(--color-ink)]">{prog.scholarship}</span>
                        </div>
                      )}
                      {prog.tuition != null && (
                        <div className="text-[12.5px]">
                          <span className="text-[var(--color-muted)]">{t.programs.tuition}:</span>{" "}
                          <span className="text-[var(--color-ink)]">¥{prog.tuition.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    {prog.website && (
                      <div className="mt-5">
                        <a href={prog.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-todai)]">
                          <Globe2 className="h-3 w-3" />
                          {t.programs.website}
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
