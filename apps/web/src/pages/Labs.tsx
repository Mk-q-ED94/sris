import { ArrowUpRight, BookOpen, FlaskConical, Globe2, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { fetchLabs, fetchProfessors, fetchUniversities } from "../lib/api";
import type { PageKey } from "../components/AppShell";
import type { Lab, Professor, University } from "../types/sris";

export function Labs({ onNavigate }: { onNavigate?: (page: PageKey, id?: string) => void }) {
  const { token, clearToken } = useAuth();
  const { t } = useI18n();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchLabs(token), fetchUniversities(token), fetchProfessors(token)])
      .then(([l, u, p]) => {
        if (!cancelled) {
          setLabs(l);
          setUniversities(u);
          setProfessors(p);
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

  const profMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of professors) map.set(p.id, p.name);
    return map;
  }, [professors]);

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
          <span className="section-index">04 — {t.labs.title}</span>
        </div>
        <h1 className="serif mt-6 text-[44px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[60px]">
          {t.labs.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[var(--color-muted)] sm:text-[16px]">
          {t.labs.description}
        </p>
      </section>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
          ))}
        </div>
      ) : labs.length === 0 ? (
        <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-16 text-center">
          <div className="serif text-[18px] font-semibold text-[var(--color-ink)]">{t.labs.noResults}</div>
          <div className="mt-1.5 text-[13px] text-[var(--color-muted)]">{t.labs.noResultsHelper}</div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {labs.map((lab) => (
            <div key={lab.id} className="border border-[var(--color-hairline)] bg-[var(--color-surface)]">
              <div className="border-b border-[var(--color-hairline)] px-6 py-5">
                <h2 className="serif text-[22px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
                  {lab.lab_name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[12.5px] text-[var(--color-muted)]">
                  <span className="flex items-center gap-1.5">
                    <FlaskConical className="h-3 w-3 text-[var(--color-subtle)]" />
                    {onNavigate ? (
                      <button type="button" onClick={() => onNavigate("universities", lab.university_id)} className="transition-colors hover:text-[var(--color-todai)]">
                        {uniMap.get(lab.university_id) ?? lab.university_id}
                      </button>
                    ) : (
                      uniMap.get(lab.university_id) ?? lab.university_id
                    )}
                  </span>
                  {lab.professor_id && (
                    <span className="flex items-center gap-1.5">
                      <UsersRound className="h-3 w-3 text-[var(--color-subtle)]" />
                      {onNavigate ? (
                        <button type="button" onClick={() => onNavigate("universities", lab.university_id)} className="transition-colors hover:text-[var(--color-todai)]">
                          {profMap.get(lab.professor_id) ?? lab.professor_id}
                        </button>
                      ) : (
                        profMap.get(lab.professor_id) ?? lab.professor_id
                      )}
                    </span>
                  )}
                </div>
              </div>
              <div className="px-6 py-5">
                {lab.research_keywords.length > 0 && (
                  <div>
                    <div className="mono mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                      {t.labs.researchKeywords}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {lab.research_keywords.map((kw) => (
                        <span key={kw} className="mono inline-flex h-5 items-center bg-[var(--color-isct-soft)] px-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--color-isct)]">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {lab.recent_papers.length > 0 && (
                  <div className="mt-4">
                    <div className="mono mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                      {t.labs.recentPapers}
                    </div>
                    <ul className="divide-y divide-[var(--color-hairline)]">
                      {lab.recent_papers.slice(0, 3).map((paper, idx) => (
                        <li key={idx} className="flex items-center gap-2 py-2 first:pt-0 last:pb-0 text-[13px] text-[var(--color-muted)]">
                          <BookOpen className="h-3 w-3 shrink-0 text-[var(--color-subtle)]" />
                          <span className="truncate">{paper}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  {lab.website && (
                    <a href={lab.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-todai)]">
                      <Globe2 className="h-3 w-3" />
                      {t.labs.website}
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
