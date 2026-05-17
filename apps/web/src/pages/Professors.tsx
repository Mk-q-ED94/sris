import { ArrowUpRight, ChevronDown, ChevronUp, Globe2, Mail, Sparkles, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { fetchProfessors, fetchUniversities, fetchUserProfile, matchProfessor, updateUserProfile } from "../lib/api";
import type { PageKey } from "../components/AppShell";
import type { Professor, University, UserProfile } from "../types/sris";

export function Professors({ onNavigate }: { onNavigate?: (page: PageKey, id?: string) => void }) {
  const { token, clearToken } = useAuth();
  const { t } = useI18n();
  const p = t.professors;
  const up = t.userProfile;

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile panel state
  const [profileOpen, setProfileOpen] = useState(false);
  const [bgDraft, setBgDraft] = useState("");
  const [fieldsDraft, setFieldsDraft] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Per-professor matching state
  const [matching, setMatching] = useState<Record<string, boolean>>({});
  const [matchingAll, setMatchingAll] = useState(false);
  const [localReasons, setLocalReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchProfessors(token), fetchUniversities(token), fetchUserProfile(token)])
      .then(([profs, unis, prof]) => {
        if (!cancelled) {
          setProfessors(profs);
          setUniversities(unis);
          setProfile(prof);
          setBgDraft(prof.research_background ?? "");
          setFieldsDraft(prof.target_fields ?? "");
          if (!prof.research_background) setProfileOpen(true);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message.toLowerCase().includes("invalid api token")) clearToken();
        if (!cancelled) setError(err instanceof Error ? err.message : "Request failed");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, clearToken]);

  const uniMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of universities) map.set(u.id, u.name);
    return map;
  }, [universities]);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const updated = await updateUserProfile(token, { research_background: bgDraft, target_fields: fieldsDraft });
      setProfile(updated);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch { /* silent */ } finally { setSavingProfile(false); }
  }

  async function handleMatch(profId: string) {
    if (!profile?.research_background || matching[profId]) return;
    setMatching((m) => ({ ...m, [profId]: true }));
    try {
      const result = await matchProfessor(token, profId);
      setLocalReasons((r) => ({ ...r, [profId]: result.match_reason }));
      setProfessors((ps) => ps.map((p) => p.id === profId ? { ...p, match_reason: result.match_reason } : p));
    } catch { /* silent */ } finally { setMatching((m) => ({ ...m, [profId]: false })); }
  }

  async function handleMatchAll() {
    if (!profile?.research_background || matchingAll) return;
    setMatchingAll(true);
    for (const prof of professors) {
      if (matching[prof.id]) continue;
      setMatching((m) => ({ ...m, [prof.id]: true }));
      try {
        const result = await matchProfessor(token, prof.id);
        setLocalReasons((r) => ({ ...r, [prof.id]: result.match_reason }));
        setProfessors((ps) => ps.map((p) => p.id === prof.id ? { ...p, match_reason: result.match_reason } : p));
      } catch { /* skip this one */ } finally { setMatching((m) => ({ ...m, [prof.id]: false })); }
    }
    setMatchingAll(false);
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
          <span className="section-index">03 — {p.title}</span>
        </div>
        <h1 className="serif mt-6 text-[44px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[60px]">
          {p.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[var(--color-muted)] sm:text-[16px]">
          {p.description}
        </p>
      </section>

      {/* Research profile panel */}
      <div className="border border-[var(--color-hairline-strong)] bg-[var(--color-surface)]">
        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          className="flex w-full items-center justify-between px-6 py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-[var(--color-todai)]" />
            <span className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)]">{up.panelTitle}</span>
            {profile?.research_background && (
              <span className="mono inline-flex h-4 items-center bg-emerald-50 px-1.5 text-[9px] uppercase tracking-[0.12em] text-emerald-600">
                {t.userProfile.saved}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {profile?.research_background && !matchingAll && professors.length > 0 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); void handleMatchAll(); }}
                className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-todai)] hover:underline"
              >
                {p.matchAll}
              </button>
            )}
            {matchingAll && <span className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-subtle)]">{p.matching}</span>}
            {profileOpen ? <ChevronUp className="h-4 w-4 text-[var(--color-subtle)]" /> : <ChevronDown className="h-4 w-4 text-[var(--color-subtle)]" />}
          </div>
        </button>
        {profileOpen && (
          <div className="border-t border-[var(--color-hairline)] px-6 py-5 space-y-4">
            <p className="text-[13px] text-[var(--color-muted)]">{up.panelBody}</p>
            <div>
              <label className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">{up.backgroundLabel}</label>
              <textarea
                value={bgDraft}
                onChange={(e) => setBgDraft(e.target.value)}
                rows={3}
                placeholder={up.backgroundPlaceholder}
                className="mt-2 block w-full resize-y border border-[var(--color-hairline-strong)] bg-[var(--color-paper)] p-3 text-[13px] leading-6 outline-none focus:border-[var(--color-todai)]"
              />
            </div>
            <div>
              <label className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">{up.fieldsLabel}</label>
              <input
                value={fieldsDraft}
                onChange={(e) => setFieldsDraft(e.target.value)}
                placeholder={up.fieldsPlaceholder}
                className="mt-2 block h-10 w-full border border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-3 text-[13px] outline-none focus:border-[var(--color-todai)]"
              />
            </div>
            <button
              type="button"
              onClick={saveProfile}
              disabled={savingProfile}
              className="inline-flex h-9 items-center bg-[var(--color-ink)] px-4 text-[12px] font-medium text-white hover:bg-[var(--color-todai)] disabled:opacity-50"
            >
              {profileSaved ? up.saved : savingProfile ? "…" : up.save}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
          ))}
        </div>
      ) : professors.length === 0 ? (
        <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-16 text-center">
          <div className="serif text-[18px] font-semibold text-[var(--color-ink)]">{p.noResults}</div>
          <div className="mt-1.5 text-[13px] text-[var(--color-muted)]">{p.noResultsHelper}</div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {professors.map((prof) => {
            const reason = localReasons[prof.id] ?? prof.match_reason;
            const isMatching = matching[prof.id] ?? false;
            return (
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
                        {p.researchKeywords}
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

                  {/* Match reason */}
                  {reason ? (
                    <div className="mt-4 border-l-2 border-[var(--color-todai)] bg-[var(--color-todai-soft)] px-4 py-3">
                      <div className="mono mb-1.5 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-[var(--color-todai)]">
                        <Sparkles className="h-2.5 w-2.5" />
                        {p.matchReason}
                      </div>
                      <p className="text-[12.5px] leading-[1.65] text-[var(--color-ink)]">{reason}</p>
                      {profile?.research_background && (
                        <button
                          type="button"
                          onClick={() => handleMatch(prof.id)}
                          disabled={isMatching}
                          className="mt-2 mono text-[9px] uppercase tracking-[0.12em] text-[var(--color-subtle)] hover:text-[var(--color-todai)] disabled:opacity-50"
                        >
                          {isMatching ? p.matching : "↺ re-match"}
                        </button>
                      )}
                    </div>
                  ) : profile?.research_background ? (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => handleMatch(prof.id)}
                        disabled={isMatching}
                        className="inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-subtle)] hover:text-[var(--color-todai)] disabled:opacity-50"
                      >
                        <Sparkles className={`h-3 w-3 ${isMatching ? "animate-pulse" : ""}`} />
                        {isMatching ? p.matching : p.matchButton}
                      </button>
                    </div>
                  ) : null}

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
                        {p.website}
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
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
