import { ArrowUpRight, CalendarClock, ChevronDown, ChevronUp, Globe2, GraduationCap, Languages, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { fetchPrograms, fetchUniversities, fetchUserProfile, matchProgram, updateUserProfile } from "../lib/api";
import { formatDate } from "../lib/format";
import type { Program, University, UserProfile } from "../types/sris";

export function Programs() {
  const { token, clearToken } = useAuth();
  const { t } = useI18n();
  const p = t.programs;
  const up = t.userProfile;

  const [programs, setPrograms] = useState<Program[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [bgDraft, setBgDraft] = useState("");
  const [fieldsDraft, setFieldsDraft] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [matching, setMatching] = useState<Record<string, boolean>>({});
  const [matchingAll, setMatchingAll] = useState(false);
  const [localReasons, setLocalReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchPrograms(token), fetchUniversities(token), fetchUserProfile(token)])
      .then(([progs, unis, prof]) => {
        if (!cancelled) {
          setPrograms(progs);
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

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const updated = await updateUserProfile(token, { research_background: bgDraft, target_fields: fieldsDraft });
      setProfile(updated);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch { /* silent */ } finally { setSavingProfile(false); }
  }

  async function handleMatch(progId: string) {
    if (!profile?.research_background || matching[progId]) return;
    setMatching((m) => ({ ...m, [progId]: true }));
    try {
      const result = await matchProgram(token, progId);
      setLocalReasons((r) => ({ ...r, [progId]: result.match_reason }));
      setPrograms((ps) => ps.map((pg) => pg.id === progId ? { ...pg, match_reason: result.match_reason } : pg));
    } catch { /* silent */ } finally { setMatching((m) => ({ ...m, [progId]: false })); }
  }

  async function handleMatchAll() {
    if (!profile?.research_background || matchingAll) return;
    setMatchingAll(true);
    for (const prog of programs) {
      if (matching[prog.id]) continue;
      setMatching((m) => ({ ...m, [prog.id]: true }));
      try {
        const result = await matchProgram(token, prog.id);
        setLocalReasons((r) => ({ ...r, [prog.id]: result.match_reason }));
        setPrograms((ps) => ps.map((pg) => pg.id === prog.id ? { ...pg, match_reason: result.match_reason } : pg));
      } catch { /* skip */ } finally { setMatching((m) => ({ ...m, [prog.id]: false })); }
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
          <span className="section-index">05 — {p.title}</span>
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
                {up.saved}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {profile?.research_background && !matchingAll && programs.length > 0 && (
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
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-16 text-center">
          <div className="serif text-[18px] font-semibold text-[var(--color-ink)]">{p.noResults}</div>
          <div className="mt-1.5 text-[13px] text-[var(--color-muted)]">{p.noResultsHelper}</div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPrograms.map((prog) => {
            const days = deadlineDays(prog.deadline);
            const urgent = days !== null && days >= 0 && days <= 30;
            const overdue = days !== null && days < 0;
            const reason = localReasons[prog.id] ?? prog.match_reason;
            const isMatching = matching[prog.id] ?? false;
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
                            onClick={() => handleMatch(prog.id)}
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
                          onClick={() => handleMatch(prog.id)}
                          disabled={isMatching}
                          className="inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-subtle)] hover:text-[var(--color-todai)] disabled:opacity-50"
                        >
                          <Sparkles className={`h-3 w-3 ${isMatching ? "animate-pulse" : ""}`} />
                          {isMatching ? p.matching : p.matchButton}
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="p-6">
                    {prog.deadline && (
                      <div>
                        <div className="mono mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">
                          {p.deadline}
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
                          <span className="text-[var(--color-muted)]">{p.scholarship}:</span>{" "}
                          <span className="text-[var(--color-ink)]">{prog.scholarship}</span>
                        </div>
                      )}
                      {prog.tuition != null && (
                        <div className="text-[12.5px]">
                          <span className="text-[var(--color-muted)]">{p.tuition}:</span>{" "}
                          <span className="text-[var(--color-ink)]">¥{prog.tuition.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    {prog.website && (
                      <div className="mt-5">
                        <a href={prog.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-todai)]">
                          <Globe2 className="h-3 w-3" />
                          {p.website}
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
