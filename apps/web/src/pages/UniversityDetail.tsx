import { ArrowLeft, ArrowUpRight, BookOpen, CalendarClock, FlaskConical, Globe2, MapPin, UsersRound, AlertTriangle, FileSearch, Lightbulb, CheckCircle2, EyeOff, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { featuredUniversities, findFeaturedUniversity } from "../data/universities";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { createGapAction, fetchUniversityDetail, updateGapAction } from "../lib/api";
import { formatDate } from "../lib/format";
import type { Program, Professor, Lab, IntelligenceResource, UniversityGap, ResourceType } from "../types/sris";

export function UniversityDetail({
  universityId,
  onBack,
  onOpenResource,
}: {
  universityId: string | null;
  onBack: () => void;
  onOpenResource?: (id: string) => void;
}) {
  const { token } = useAuth();
  const { t } = useI18n();
  const featured = findFeaturedUniversity(universityId);
  const index = featured ? featuredUniversities.findIndex((u) => u.id === featured.id) + 1 : 1;

  const [programs, setPrograms] = useState<Program[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [resources, setResources] = useState<IntelligenceResource[]>([]);
  const [gaps, setGaps] = useState<UniversityGap[]>([]);
  const [paperCount, setPaperCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const displayName = featured?.name ?? universityId ?? "University";
  const displayLocation = featured?.location ?? "";
  const displayFocus = featured?.focus ?? "";

  const loadData = useCallback(() => {
    if (!universityId) return;
    setLoading(true);
    fetchUniversityDetail(token, universityId)
      .then((data) => {
        setPrograms(data.programs);
        setProfessors(data.professors);
        setLabs(data.labs);
        setResources(data.resources);
        setGaps(data.gaps);
        setPaperCount(data.paper_count);
        setTaskCount(data.task_count);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, universityId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleGapAction(gap: UniversityGap, newStatus: string) {
    if (!universityId) return;
    try {
      if (gap.action_id) {
        await updateGapAction(token, gap.action_id, { status: newStatus });
      } else {
        await createGapAction(token, { gap_key: gap.label_key, university_id: universityId, status: newStatus });
      }
      loadData();
    } catch {
      // Silent
    }
  }

  function gapCaptureUrl(gap: UniversityGap): string {
    const typeMap: Record<string, ResourceType> = {
      no_programs_for: "program_page",
      no_professors_for: "professor_page",
      few_resources_for: "other",
      no_admission_for: "admission_notice",
      no_experience_for: "experience_post",
    };
    const resourceType = typeMap[gap.label_key] ?? "other";
    return `/#capture?&resource_type=${resourceType}&university_id=${universityId ?? ""}`;
  }

  const uniName = useMemo(() => {
    if (featured) return featured.name;
    return universityId ?? "University";
  }, [featured, universityId]);

  const resourceTypeFilter = useState<string>("all");
  const activeFilter = resourceTypeFilter[0];
  const filteredResources = activeFilter === "all"
    ? resources
    : resources.filter((r) => r.resource_type === activeFilter);
  const resourceTypes = useMemo(() => {
    const types = new Set(resources.map((r) => r.resource_type));
    return Array.from(types).sort();
  }, [resources]);

  return (
    <div className="space-y-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-todai)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t.university.backToOverview}
      </button>

      <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
        <div>
          <div className="flex items-center gap-3">
            <span className="rule-accent" />
            <span className="section-index">
              {String(index).padStart(2, "0")} — {t.university.featured}
            </span>
          </div>
          <h1 className="serif mt-6 text-[42px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[58px]">
            {uniName}
          </h1>
          <div className="mt-6 grid grid-cols-2 border-y border-[var(--color-hairline-strong)]">
            <InfoCell icon={MapPin} label={t.university.location} value={displayLocation} />
            <InfoCell icon={BookOpen} label={t.university.focus} value={displayFocus} />
          </div>

          <div className="mt-6 grid grid-cols-2 border-y border-[var(--color-hairline)]">
            <StatCell label={t.universityDetail.paperCount} value={loading ? "—" : paperCount} />
            <StatCell label={t.universityDetail.taskCount} value={loading ? "—" : taskCount} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {featured?.website && (
              <a
                href={featured.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 bg-[var(--color-ink)] px-5 text-[12.5px] font-medium text-white transition-colors hover:bg-[var(--color-todai)]"
              >
                <Globe2 className="h-4 w-4" />
                {t.university.officialSite}
              </a>
            )}
            {featured?.imageSource && (
              <a
                href={featured.imageSource}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-5 text-[12.5px] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
              >
                {t.university.imageSource}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {featured?.imageUrl && (
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden border border-[var(--color-hairline-strong)] bg-[var(--color-paper)]">
              <img src={featured.imageUrl} alt={featured.name} className="h-full w-full object-cover" />
            </div>
            <div className="mono mt-3 flex items-center justify-between text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
              <span>Image · {featured.imageCredit}</span>
              <span>{String(index).padStart(2, "0")} / {featuredUniversities.length}</span>
            </div>
          </div>
        )}
      </section>

      {/* Information Gaps */}
      {!loading && gaps.length > 0 && gaps[0]?.label_key !== "none" && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="rule-accent" />
            <span className="section-index">{t.universityDetail.gapsTitle}</span>
          </div>
          <p className="mb-4 text-[13px] leading-6 text-[var(--color-muted)]">{t.universityDetail.gapsSubtitle}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gaps.map((gap) => {
              const isResolved = gap.action_status === "resolved";
              const isIgnored = gap.action_status === "ignored";
              const isInactive = isResolved || isIgnored;
              return (
                <div key={gap.label_key} className={`border border-[var(--color-hairline)] bg-[var(--color-surface)] p-4 ${isInactive ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-2">
                    {isResolved ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : isIgnored ? (
                      <EyeOff className="h-3.5 w-3.5 text-[var(--color-subtle)]" />
                    ) : (
                      <AlertTriangle className={`h-3.5 w-3.5 ${gap.priority === "high" ? "text-[var(--color-todai)]" : "text-[var(--color-subtle)]"}`} />
                    )}
                    <span className={`text-[13px] font-medium ${isResolved ? "text-emerald-600 line-through" : isIgnored ? "text-[var(--color-subtle)]" : gap.priority === "high" ? "text-[var(--color-todai)]" : "text-[var(--color-ink)]"}`}>
                      {gapLabel(gap, t)}
                    </span>
                    {isResolved && (
                      <span className="mono inline-flex h-4 items-center bg-emerald-50 px-1 text-[8px] uppercase tracking-[0.1em] text-emerald-600">{t.universityDetail.gapResolved}</span>
                    )}
                    {isIgnored && (
                      <span className="mono inline-flex h-4 items-center bg-gray-50 px-1 text-[8px] uppercase tracking-[0.1em] text-gray-500">{t.universityDetail.gapIgnored}</span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">{gap.priority}</span>
                    <div className="flex items-center gap-2">
                      {!isInactive && (
                        <>
                          <a href={gapCaptureUrl(gap)} className="inline-flex items-center gap-1 text-[11px] text-[var(--color-todai)] transition-colors hover:underline">
                            <Lightbulb className="h-3 w-3" />
                            {t.universityDetail.captureHint}
                          </a>
                          <button type="button" onClick={() => handleGapAction(gap, "resolved")} className="inline-flex items-center gap-1 text-[11px] text-emerald-600 transition-colors hover:underline">
                            <CheckCircle2 className="h-3 w-3" />
                            {t.universityDetail.gapResolve}
                          </button>
                          <button type="button" onClick={() => handleGapAction(gap, "ignored")} className="inline-flex items-center gap-1 text-[11px] text-[var(--color-subtle)] transition-colors hover:underline">
                            <EyeOff className="h-3 w-3" />
                            {t.universityDetail.gapIgnore}
                          </button>
                        </>
                      )}
                      {isInactive && (
                        <button type="button" onClick={() => handleGapAction(gap, "open")} className="inline-flex items-center gap-1 text-[11px] text-[var(--color-todai)] transition-colors hover:underline">
                          <RotateCcw className="h-3 w-3" />
                          {t.universityDetail.gapReopen}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Programs section */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="rule-accent" />
          <span className="section-index">{t.universityDetail.programsTitle}</span>
        </div>
        {loading ? (
          <div className="h-32 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
        ) : programs.length === 0 ? (
          <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-10 text-center text-[13px] text-[var(--color-muted)]">
            {t.universityDetail.noPrograms}
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-hairline)] border border-[var(--color-hairline)] bg-[var(--color-surface)]">
            {programs.map((prog) => (
              <li key={prog.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-medium text-[var(--color-ink)]">{prog.program_name}</h3>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {prog.degree && <Badge>{prog.degree}</Badge>}
                      {prog.language && <Badge>{prog.language}</Badge>}
                    </div>
                  </div>
                  {prog.deadline && (
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1.5 text-[var(--color-todai)]">
                        <CalendarClock className="h-3 w-3" />
                        <span className="serif text-[15px] font-semibold">{formatDate(prog.deadline, t.dateLocale, t.notSet)}</span>
                      </div>
                    </div>
                  )}
                </div>
                {prog.requirements && (
                  <p className="mt-2 text-[12.5px] leading-[1.6] text-[var(--color-muted)]">{prog.requirements}</p>
                )}
                {prog.website && (
                  <a href={prog.website} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] text-[var(--color-subtle)] transition-colors hover:text-[var(--color-todai)]">
                    <Globe2 className="h-3 w-3" />{t.programs.website}<ArrowUpRight className="h-2.5 w-2.5" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Professors + Labs grid */}
      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="rule-accent" />
            <span className="section-index">{t.universityDetail.professorsTitle}</span>
          </div>
          {loading ? (
            <div className="h-32 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
          ) : professors.length === 0 ? (
            <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-10 text-center text-[13px] text-[var(--color-muted)]">
              {t.universityDetail.noProfessors}
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-hairline)] border border-[var(--color-hairline)] bg-[var(--color-surface)]">
              {professors.map((prof) => (
                <li key={prof.id} className="px-5 py-4">
                  <h3 className="text-[14px] font-medium text-[var(--color-ink)]">{prof.name}</h3>
                  {prof.title && (
                    <span className="mono mt-1 inline-block text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">{prof.title}</span>
                  )}
                  {prof.research_keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {prof.research_keywords.slice(0, 4).map((kw) => (
                        <span key={kw} className="mono inline-flex h-4 items-center bg-[var(--color-isct-soft)] px-1.5 text-[9px] uppercase tracking-[0.12em] text-[var(--color-isct)]">{kw}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex gap-3">
                    {prof.email && <a href={`mailto:${prof.email}`} className="text-[11px] text-[var(--color-subtle)] hover:text-[var(--color-todai)]">{prof.email}</a>}
                    {prof.website && <a href={prof.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-[var(--color-subtle)] hover:text-[var(--color-todai)]"><Globe2 className="h-2.5 w-2.5" />web<ArrowUpRight className="h-2.5 w-2.5" /></a>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="rule-accent" />
            <span className="section-index">{t.universityDetail.labsTitle}</span>
          </div>
          {loading ? (
            <div className="h-32 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
          ) : labs.length === 0 ? (
            <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-10 text-center text-[13px] text-[var(--color-muted)]">
              {t.universityDetail.noLabs}
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-hairline)] border border-[var(--color-hairline)] bg-[var(--color-surface)]">
              {labs.map((lab) => (
                <li key={lab.id} className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-3.5 w-3.5 text-[var(--color-subtle)]" />
                    <h3 className="text-[14px] font-medium text-[var(--color-ink)]">{lab.lab_name}</h3>
                  </div>
                  {lab.research_keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {lab.research_keywords.slice(0, 4).map((kw) => (
                        <span key={kw} className="mono inline-flex h-4 items-center bg-[var(--color-todai-soft)] px-1.5 text-[9px] uppercase tracking-[0.12em] text-[var(--color-todai)]">{kw}</span>
                      ))}
                    </div>
                  )}
                  {lab.recent_papers.length > 0 && (
                    <p className="mt-2 line-clamp-1 text-[11.5px] text-[var(--color-muted)]">{lab.recent_papers[0]}</p>
                  )}
                  {lab.website && (
                    <a href={lab.website} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] text-[var(--color-subtle)] hover:text-[var(--color-todai)]"><Globe2 className="h-2.5 w-2.5" />web<ArrowUpRight className="h-2.5 w-2.5" /></a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Intelligence Resources */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rule-accent" />
            <span className="section-index">{t.universityDetail.resourcesTitle}</span>
          </div>
          {resourceTypes.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => resourceTypeFilter[1]("all")}
                className={`mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 border ${activeFilter === "all" ? "border-[var(--color-todai)] text-[var(--color-todai)] bg-[var(--color-todai-soft)]" : "border-[var(--color-hairline)] text-[var(--color-muted)]"}`}
              >
                All
              </button>
              {resourceTypes.map((rt) => (
                <button
                  key={rt}
                  type="button"
                  onClick={() => resourceTypeFilter[1](rt)}
                  className={`mono text-[10px] uppercase tracking-[0.12em] px-2 py-1 border ${activeFilter === rt ? "border-[var(--color-todai)] text-[var(--color-todai)] bg-[var(--color-todai-soft)]" : "border-[var(--color-hairline)] text-[var(--color-muted)]"}`}
                >
                  {t.capture.classifiedTypes[rt] ?? rt}
                </button>
              ))}
            </div>
          )}
        </div>
        {loading ? (
          <div className="h-32 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
        ) : filteredResources.length === 0 ? (
          <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-10 text-center text-[13px] text-[var(--color-muted)]">
            {t.universityDetail.noResources}
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-hairline)] border border-[var(--color-hairline)] bg-[var(--color-surface)]">
            {filteredResources.map((res) => (
              <li key={res.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="mono inline-flex h-5 items-center bg-[var(--color-todai-soft)] px-1.5 text-[9px] uppercase tracking-[0.12em] text-[var(--color-todai)]">
                        {t.capture.classifiedTypes[res.resource_type] ?? res.resource_type}
                      </span>
                      {res.confidence && (
                        <span className={`mono text-[9px] uppercase tracking-[0.12em] ${res.confidence === "high" ? "text-[var(--color-todai)]" : "text-[var(--color-subtle)]"}`}>
                          {res.confidence}
                        </span>
                      )}
                      <span className={`mono inline-flex h-5 items-center px-1.5 text-[9px] uppercase tracking-[0.12em] ${res.content_text ? "bg-emerald-50 text-emerald-600" : res.excerpt ? "bg-sky-50 text-sky-600" : "bg-gray-50 text-gray-500"}`}>
                        {res.content_text ? t.universityDetail.hasSnapshot : res.excerpt ? t.universityDetail.excerptOnly : t.universityDetail.urlOnly}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-[14px] font-medium text-[var(--color-ink)]">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="transition-colors hover:text-[var(--color-todai)]"
                        onClick={(e) => {
                          if (onOpenResource) { e.preventDefault(); onOpenResource(res.id); }
                        }}
                      >
                        {res.title}
                      </a>
                    </h3>
                    {res.excerpt && (
                      <p className="mt-1 line-clamp-2 border-l-2 border-[var(--color-todai)] pl-3 text-[12px] leading-5 text-[var(--color-muted)] italic">{res.excerpt}</p>
                    )}
                    {res.relevance_note && (
                      <p className="mt-1 text-[12px] leading-5 text-[var(--color-muted)]">{res.relevance_note}</p>
                    )}
                  </div>
                  {res.created_at && (
                    <span className="mono shrink-0 text-[10px] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                      {formatDate(res.created_at, t.dateLocale, "")}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function gapLabel(gap: UniversityGap, t: Locale): string {
  const d2 = t.dashboard2;
  switch (gap.label_key) {
    case "no_programs_for": return d2.gapNoProgramsFor(t.university.featured || "");
    case "no_professors_for": return d2.gapNoProfessorsFor(t.university.featured || "");
    case "few_resources_for": return d2.gapFewResourcesFor(t.university.featured || "");
    case "no_admission_for": return d2.gapNoAdmissionFor(t.university.featured || "");
    case "no_experience_for": return d2.gapNoExperienceFor(t.university.featured || "");
    case "none": return d2.gapNone;
    default: return gap.label_key;
  }
}

import type { Locale } from "../i18n/locales";

function InfoCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="border-l border-[var(--color-hairline)] px-5 py-5 first:border-l-0">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[var(--color-subtle)]" />
        <span className="mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--color-muted)]">{label}</span>
      </div>
      <div className="serif mt-2 text-[18px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">{value}</div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border-l border-[var(--color-hairline)] px-5 py-4 first:border-l-0">
      <div className="serif text-[24px] font-semibold leading-none tabular tracking-[-0.02em] text-[var(--color-ink)]">{value}</div>
      <div className="mono mt-1.5 text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">{label}</div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center border border-[var(--color-hairline)] bg-[var(--color-paper)] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">
      {children}
    </span>
  );
}
