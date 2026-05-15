import { ArrowUpRight, Globe2, Mail, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { fetchProfessors, fetchUniversities } from "../lib/api";
import type { PageKey } from "../components/AppShell";
import type { Professor, University } from "../types/sris";

export function Professors({ onNavigate }: { onNavigate?: (page: PageKey, id?: string) => void }) {
  const { token, clearToken } = useAuth();
  const { t } = useI18n();
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchProfessors(token), fetchUniversities(token)])
      .then(([profs, unis]) => {
        if (!cancelled) {
          setProfessors(profs);
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
          <span className="section-index">03 — {t.professors.title}</span>
        </div>
        <h1 className="serif mt-6 text-[44px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[60px]">
          {t.professors.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[var(--color-muted)] sm:text-[16px]">
          {t.professors.description}
        </p>
      </section>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
          ))}
        </div>
      ) : professors.length === 0 ? (
        <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-16 text-center">
          <div className="serif text-[18px] font-semibold text-[var(--color-ink)]">{t.professors.noResults}</div>
          <div className="mt-1.5 text-[13px] text-[var(--color-muted)]">{t.professors.noResultsHelper}</div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {professors.map((prof) => (
            <div key={prof.id} className="border border-[var(--color-hairline)] bg-[var(--color-surface)]">
              <div className="border-b border-[var(--color-hairline)] px-6 py-5">
                <h2 className="serif text-[22px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
                  {prof.name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[12.5px] text-[var(--color-muted)]">
                  <span className="flex items-center gap-1.5">
                    <UsersRound className="h-3 w-3 text-[var(--color-subtle)]" />
                    {onNavigate ? (
                      <button type="button" onClick={() => onNavigate("universities", prof.university_id)} className="transition-colors hover:text-[var(--color-todai)]">
                        {uniMap.get(prof.university_id) ?? prof.university_id}
                      </button>
                    ) : (
                      uniMap.get(prof.university_id) ?? prof.university_id
                    )}
                  </span>
                  {prof.title && (
                    <span className="mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                      {prof.title}
                    </span>
                  )}
                </div>
              </div>
              <div className="px-6 py-5">
                {prof.research_keywords.length > 0 && (
                  <div>
                    <div className="mono mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                      {t.professors.researchKeywords}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {prof.research_keywords.map((kw) => (
                        <span key={kw} className="mono inline-flex h-5 items-center bg-[var(--color-isct-soft)] px-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--color-isct)]">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  {prof.email && (
                    <a href={`mailto:${prof.email}`} className="inline-flex items-center gap-1.5 text-[12px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-todai)]">
                      <Mail className="h-3 w-3" />
                      {prof.email}
                    </a>
                  )}
                  {prof.website && (
                    <a href={prof.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-todai)]">
                      <Globe2 className="h-3 w-3" />
                      {t.professors.website}
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
