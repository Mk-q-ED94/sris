import { ArrowUpRight, Award, BookOpen, Building2, Calendar, CheckCircle2, ClipboardList, ExternalLink, FileText, Globe2, GraduationCap, Languages, MapPin, Search, Sparkles, Wallet, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { fetchProgramRequirements } from "../lib/api";
import type { PageKey } from "../components/AppShell";
import type { ExtractedProgramFields, ExtractedProgramPageFields, ProgramRequirements } from "../types/sris";

type Tab = "cards" | "compare";
type Labels = ReturnType<typeof useI18n>["t"]["requirementsPage"];

function isFullProgramFields(f: ExtractedProgramFields | ExtractedProgramPageFields): f is ExtractedProgramFields {
  return "cycles" in f && Array.isArray((f as ExtractedProgramFields).cycles);
}

export function Requirements({ onNavigate }: { onNavigate?: (page: PageKey, id?: string) => void }) {
  const { token, clearToken } = useAuth();
  const { t } = useI18n();
  const r = t.requirementsPage;

  const [items, setItems] = useState<ProgramRequirements[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("cards");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProgramRequirements(token)
      .then((data) => { if (!cancelled) setItems(data); })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message.toLowerCase().includes("invalid api token")) clearToken();
        if (!cancelled) setError(err instanceof Error ? err.message : "Request failed");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, clearToken]);

  const filtered = useMemo(() => {
    if (!filter.trim()) return items;
    const q = filter.toLowerCase();
    return items.filter((it) =>
      it.program.program_name.toLowerCase().includes(q) ||
      it.university.name.toLowerCase().includes(q),
    );
  }, [items, filter]);

  const universitiesCount = useMemo(() => new Set(items.map((it) => it.university.id)).size, [items]);
  const avgConfidence = useMemo(() => {
    const scores = items
      .map((it) => it.extracted_fields?.extraction_confidence)
      .filter((s): s is number => typeof s === "number");
    if (!scores.length) return null;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }, [items]);

  // Group by university for cards view
  const grouped = useMemo(() => {
    const m = new Map<string, { university: ProgramRequirements["university"]; entries: ProgramRequirements[] }>();
    for (const it of filtered) {
      const key = it.university.id;
      if (!m.has(key)) m.set(key, { university: it.university, entries: [] });
      m.get(key)!.entries.push(it);
    }
    return Array.from(m.values()).sort((a, b) => a.university.name.localeCompare(b.university.name));
  }, [filtered]);

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
    <div className="space-y-8">
      {/* Header */}
      <section>
        <div className="flex items-center gap-3">
          <span className="rule-accent" />
          <span className="section-index">06 — {r.title}</span>
        </div>
        <h1 className="serif mt-6 text-[44px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[60px]">
          {r.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[var(--color-muted)] sm:text-[16px]">
          {r.description}
        </p>
      </section>

      {/* Metrics */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-3 divide-x divide-[var(--color-hairline)] border border-[var(--color-hairline)] bg-[var(--color-surface)]">
          {[
            { label: r.matchedLabel, value: items.length },
            { label: r.universitiesLabel, value: universitiesCount },
            { label: r.avgConfidence, value: avgConfidence !== null ? `${Math.round(avgConfidence * 100)}%` : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="px-6 py-4">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">{label}</div>
              <div className="mt-1 text-[28px] font-semibold tabular-nums text-[var(--color-ink)]">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs + filter */}
      {!loading && items.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex border border-[var(--color-hairline-strong)]">
            {(["cards", "compare"] as Tab[]).map((tk) => (
              <button
                key={tk}
                type="button"
                onClick={() => setTab(tk)}
                className={`mono h-8 px-3 text-[10px] uppercase tracking-[0.12em] transition-colors ${tab === tk ? "bg-[var(--color-ink)] text-white" : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"}`}
              >
                {tk === "cards" ? r.tabCards : r.tabCompare}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-subtle)]" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={r.filterPlaceholder}
              className="h-9 w-full border border-[var(--color-hairline-strong)] bg-[var(--color-paper)] pl-8 pr-3 text-[13px] outline-none focus:border-[var(--color-todai)]"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-8 py-16">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[var(--color-subtle)]" />
            <div className="serif text-[20px] font-semibold text-[var(--color-ink)]">{r.noResults}</div>
          </div>
          <p className="mt-3 max-w-2xl text-[14px] leading-[1.75] text-[var(--color-muted)]">{r.noMatchedAction}</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => onNavigate?.("programs")}
              className="inline-flex h-9 items-center gap-2 bg-[var(--color-ink)] px-4 text-[12px] font-medium text-white hover:bg-[var(--color-todai)]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t.nav.programs}
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-[var(--color-hairline)] bg-[var(--color-paper)] px-6 py-8 text-center text-[13px] text-[var(--color-muted)]">
          {r.noResults} — {r.noResultsHelper}
        </div>
      ) : tab === "cards" ? (
        <div className="space-y-10">
          {grouped.map(({ university, entries }) => (
            <section key={university.id} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[var(--color-hairline)] pb-3">
                <Building2 className="h-4 w-4 text-[var(--color-todai)]" />
                <h2 className="serif text-[22px] font-semibold text-[var(--color-ink)]">{university.name}</h2>
                {university.location && (
                  <span className="flex items-center gap-1 text-[12px] text-[var(--color-subtle)]">
                    <MapPin className="h-3 w-3" />
                    {university.location}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onNavigate?.("universities", university.id)}
                  className="mono ml-auto inline-flex h-7 items-center gap-1 border border-[var(--color-hairline-strong)] px-2.5 text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)] hover:border-[var(--color-todai)] hover:text-[var(--color-todai)]"
                >
                  <ArrowUpRight className="h-3 w-3" />
                  {t.universitiesPage.openDetail}
                </button>
              </div>
              {entries.map((entry) => (
                <ProgramCard key={entry.program.id} entry={entry} labels={r} onNavigate={onNavigate} />
              ))}
            </section>
          ))}
        </div>
      ) : (
        <CompareTable entries={filtered} labels={r} onNavigate={onNavigate} />
      )}
    </div>
  );
}

function ProgramCard({
  entry,
  labels,
  onNavigate,
}: {
  entry: ProgramRequirements;
  labels: Labels;
  onNavigate?: (page: PageKey, id?: string) => void;
}) {
  const { program, extracted_fields, source_resource } = entry;
  const full = extracted_fields && isFullProgramFields(extracted_fields) ? extracted_fields : null;
  const page = extracted_fields && !isFullProgramFields(extracted_fields) ? extracted_fields : null;

  return (
    <article className="border border-[var(--color-hairline)] bg-[var(--color-surface)]">
      {/* Header */}
      <div className="border-b border-[var(--color-hairline)] px-6 py-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="serif text-[20px] font-semibold leading-[1.2] text-[var(--color-ink)]">
              {program.program_name}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--color-muted)]">
              {program.degree && <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{program.degree}</span>}
              {program.language && <span className="flex items-center gap-1"><Languages className="h-3 w-3" />{program.language}</span>}
              {program.deadline && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{program.deadline}</span>}
              {program.website && (
                <a href={program.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[var(--color-todai)]">
                  <Globe2 className="h-3 w-3" />
                  Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          {extracted_fields && (
            <div className="mono inline-flex h-6 items-center bg-emerald-50 px-2 text-[10px] uppercase tracking-[0.1em] text-emerald-700">
              {labels.confidence} {Math.round((extracted_fields.extraction_confidence ?? 0) * 100)}%
            </div>
          )}
        </div>
      </div>

      {/* Match reason */}
      {program.match_reason && (
        <div className="border-b border-[var(--color-hairline)] border-l-2 border-l-[var(--color-todai)] bg-[var(--color-todai-soft)] px-6 py-3">
          <div className="mono mb-1 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-[var(--color-todai)]">
            <Sparkles className="h-2.5 w-2.5" />
            {labels.matchReasonLabel}
          </div>
          <p className="text-[12.5px] leading-[1.65] text-[var(--color-ink)]">{program.match_reason}</p>
        </div>
      )}

      {/* Extracted body */}
      {!extracted_fields ? (
        <div className="px-6 py-6">
          <div className="serif text-[15px] font-semibold text-[var(--color-ink)]">{labels.noExtractedFacts}</div>
          <p className="mt-1.5 max-w-xl text-[12.5px] leading-[1.65] text-[var(--color-muted)]">{labels.noExtractedFactsHelper}</p>
          <button
            type="button"
            onClick={() => { window.location.hash = "#capture"; }}
            className="mt-4 inline-flex h-8 items-center gap-2 border border-[var(--color-hairline-strong)] px-3 text-[11.5px] font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            {labels.runExtract}
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[var(--color-hairline)]">
          {/* Basics */}
          {full && (
            <Section icon={<BookOpen className="h-3.5 w-3.5" />} title={labels.sectionBasics}>
              <Field label={labels.graduateSchool} value={full.graduate_school} />
              <Field label={labels.department} value={full.department} />
              <Field label={labels.intakeMonths} value={full.intake_months.length ? full.intake_months.join(", ") : null} />
              <Field label={labels.quota} value={full.quota != null ? String(full.quota) : null} />
            </Section>
          )}

          {/* Language */}
          <Section icon={<Languages className="h-3.5 w-3.5" />} title={labels.sectionLanguage}>
            {full ? (
              <>
                <Field label={labels.englishTest} value={full.english_test.type} />
                <Field label={labels.englishMinScore} value={full.english_test.minimum_score != null ? String(full.english_test.minimum_score) : null} />
                <Field label={labels.englishNotes} value={full.english_test.notes} />
                <Field
                  label={labels.japaneseRequired}
                  value={full.japanese_test.required ? labels.yes : labels.no}
                />
                {full.japanese_test.required && (
                  <>
                    <Field label={labels.japaneseType} value={full.japanese_test.type} />
                    <Field label={labels.japaneseLevel} value={full.japanese_test.minimum_level} />
                  </>
                )}
              </>
            ) : (
              <Field label={labels.notSpecified} value={null} />
            )}
          </Section>

          {/* Application */}
          {full ? (
            <Section icon={<Calendar className="h-3.5 w-3.5" />} title={labels.sectionCycles}>
              {full.cycles.length === 0 ? (
                <Field label={labels.notSpecified} value={null} />
              ) : (
                <div className="col-span-full space-y-2.5">
                  {full.cycles.map((c, i) => (
                    <div key={i} className="border border-[var(--color-hairline)] bg-[var(--color-paper)] px-4 py-3">
                      <div className="mono mb-2 text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink)]">
                        {c.cycle_name}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] sm:grid-cols-3">
                        <Field inline label={labels.cycleApplicationOpen} value={c.application_open} />
                        <Field inline label={labels.cycleApplicationClose} value={c.application_close} />
                        <Field inline label={labels.cycleConsent} value={c.consent_letter_deadline} />
                        <Field inline label={labels.cycleExam} value={c.exam_period} />
                        <Field inline label={labels.cycleResult} value={c.result_announcement} />
                        <Field inline label={labels.cycleEnrollment} value={c.enrollment_date} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          ) : page?.application_periods?.length ? (
            <Section icon={<Calendar className="h-3.5 w-3.5" />} title={labels.applicationPeriods}>
              <div className="col-span-full space-y-1.5">
                {page.application_periods.map((p, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
                    <span className="mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-subtle)]">{p.label}</span>
                    <span className="text-[var(--color-ink)]">{p.open ?? "—"}</span>
                    <span className="text-[var(--color-subtle)]">→</span>
                    <span className="text-[var(--color-ink)]">{p.close ?? "—"}</span>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {/* Documents */}
          <Section icon={<FileText className="h-3.5 w-3.5" />} title={labels.sectionDocuments}>
            {full ? (
              <>
                <Field
                  label={labels.supervisorConsent}
                  value={full.supervisor_consent_required ? labels.yes : labels.no}
                  highlight={full.supervisor_consent_required ? "warn" : undefined}
                />
                <div className="col-span-full">
                  <div className="mono mb-1.5 text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                    {labels.documentsRequired}
                  </div>
                  {full.documents_required.length === 0 ? (
                    <span className="text-[12px] text-[var(--color-subtle)]">{labels.notSpecified}</span>
                  ) : (
                    <ul className="grid gap-1 sm:grid-cols-2">
                      {full.documents_required.map((d) => (
                        <li key={d} className="flex items-start gap-2 text-[12.5px] text-[var(--color-ink)]">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : page ? (
              <>
                <Field
                  label={labels.supervisorConsent}
                  value={page.supervisor_consent_required ? labels.yes : labels.no}
                  highlight={page.supervisor_consent_required ? "warn" : undefined}
                />
                <div className="col-span-full">
                  <div className="mono mb-1.5 text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                    {labels.requirementsList}
                  </div>
                  {page.requirements.length === 0 ? (
                    <span className="text-[12px] text-[var(--color-subtle)]">{labels.notSpecified}</span>
                  ) : (
                    <ul className="grid gap-1 sm:grid-cols-2">
                      {page.requirements.map((d) => (
                        <li key={d} className="flex items-start gap-2 text-[12.5px] text-[var(--color-ink)]">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : null}
          </Section>

          {/* Fees & scholarships */}
          <Section icon={<Wallet className="h-3.5 w-3.5" />} title={labels.sectionFees}>
            {full && (
              <>
                <Field label={labels.examFee} value={full.exam_fee_jpy != null ? `¥${full.exam_fee_jpy.toLocaleString()}` : null} />
                <Field label={labels.tuitionPerYear} value={full.tuition_per_year_jpy != null ? `¥${full.tuition_per_year_jpy.toLocaleString()}` : null} />
                <Field label={labels.mextEligible} value={full.mext_eligible ? labels.yes : labels.no} highlight={full.mext_eligible ? "good" : undefined} />
              </>
            )}
            {page && (
              <>
                <Field label={labels.examFee} value={page.application_fee_jpy != null ? `¥${page.application_fee_jpy.toLocaleString()}` : null} />
                <Field label={labels.tuitionPerYear} value={page.tuition_per_year_jpy != null ? `¥${page.tuition_per_year_jpy.toLocaleString()}` : null} />
                <Field label={labels.mextEligible} value={page.mext_eligible ? labels.yes : labels.no} highlight={page.mext_eligible ? "good" : undefined} />
              </>
            )}
          </Section>

          {((full?.scholarships?.length ?? 0) > 0 || (page?.scholarships?.length ?? 0) > 0) && (
            <Section icon={<Award className="h-3.5 w-3.5" />} title={labels.sectionScholarships}>
              <div className="col-span-full flex flex-wrap gap-1.5">
                {(full?.scholarships ?? page?.scholarships ?? []).map((s) => (
                  <span key={s} className="mono inline-flex h-5 items-center bg-amber-50 px-2 text-[10px] uppercase tracking-[0.1em] text-amber-700">
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Notes */}
          {(full?.notes || page?.notes) && (
            <Section icon={<FileText className="h-3.5 w-3.5" />} title={labels.sectionNotes}>
              <p className="col-span-full text-[12.5px] leading-[1.65] text-[var(--color-muted)]">
                {full?.notes || page?.notes}
              </p>
            </Section>
          )}

          {/* Unresolved questions */}
          {((full?.unresolved_questions?.length ?? 0) > 0 || (page?.unresolved_questions?.length ?? 0) > 0) && (
            <Section icon={<XCircle className="h-3.5 w-3.5 text-amber-600" />} title={labels.unresolvedQuestions}>
              <ul className="col-span-full space-y-1">
                {(full?.unresolved_questions ?? page?.unresolved_questions ?? []).map((q) => (
                  <li key={q} className="text-[12.5px] text-amber-700">• {q}</li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}

      {/* Source footer */}
      {source_resource && (
        <div className="border-t border-[var(--color-hairline)] bg-[var(--color-paper)] px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--color-muted)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono uppercase tracking-[0.14em] text-[var(--color-subtle)]">{labels.sourceLabel}</span>
              <button
                type="button"
                onClick={() => { window.location.hash = `#resources/${source_resource.id}`; }}
                className="text-[var(--color-ink)] hover:text-[var(--color-todai)] truncate max-w-md"
              >
                {source_resource.title}
              </button>
            </div>
            {source_resource.extracted_at && (
              <span className="mono text-[10px] text-[var(--color-subtle)]">
                {labels.extractedAt} {new Date(source_resource.extracted_at).toISOString().slice(0, 10)}
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-4">
      <div className="mono mb-3 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
        {icon}
        {title}
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, inline, highlight }: { label: string; value: string | null | undefined; inline?: boolean; highlight?: "good" | "warn" }) {
  const hl = highlight === "good" ? "text-emerald-700" : highlight === "warn" ? "text-amber-700" : "text-[var(--color-ink)]";
  if (inline) {
    return (
      <div>
        <span className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-subtle)]">{label}:</span>
        <span className={`ml-1.5 ${hl}`}>{value ?? "—"}</span>
      </div>
    );
  }
  return (
    <div className="text-[12.5px]">
      <div className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-subtle)]">{label}</div>
      <div className={`mt-0.5 ${hl}`}>{value ?? <span className="text-[var(--color-subtle)]">—</span>}</div>
    </div>
  );
}

function CompareTable({ entries, labels, onNavigate }: { entries: ProgramRequirements[]; labels: Labels; onNavigate?: (page: PageKey, id?: string) => void }) {
  return (
    <div className="overflow-x-auto border border-[var(--color-hairline)] bg-[var(--color-surface)]">
      <table className="w-full min-w-[1000px] text-[12px]">
        <thead>
          <tr className="border-b border-[var(--color-hairline)] bg-[var(--color-paper)]">
            {[labels.colProgram, labels.colUniversity, labels.colDegree, labels.colLanguage, labels.colDeadline, labels.colEnglish, labels.colJapanese, labels.colDocs, labels.colSupervisor, labels.colTuition, labels.colMext].map((c) => (
              <th key={c} className="mono px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--color-subtle)]">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const f = entry.extracted_fields;
            const full = f && isFullProgramFields(f) ? f : null;
            const page = f && !isFullProgramFields(f) ? f : null;
            const englishStr = full ? [full.english_test.type, full.english_test.minimum_score].filter(Boolean).join(" ≥ ") : "—";
            const jpStr = full ? (full.japanese_test.required ? [full.japanese_test.type, full.japanese_test.minimum_level].filter(Boolean).join(" ") || labels.yes : labels.no) : "—";
            const docsCount = full ? full.documents_required.length : page ? page.requirements.length : 0;
            const supervisor = full?.supervisor_consent_required ?? page?.supervisor_consent_required;
            const tuition = full?.tuition_per_year_jpy ?? page?.tuition_per_year_jpy;
            const mext = full?.mext_eligible ?? page?.mext_eligible;
            return (
              <tr key={entry.program.id} className="border-b border-[var(--color-hairline)] hover:bg-[var(--color-paper)]">
                <td className="px-3 py-2.5 align-top">
                  <button
                    type="button"
                    onClick={() => onNavigate?.("universities", entry.university.id)}
                    className="text-left font-semibold text-[var(--color-ink)] hover:text-[var(--color-todai)]"
                  >
                    {entry.program.program_name}
                  </button>
                </td>
                <td className="px-3 py-2.5 align-top text-[var(--color-muted)]">{entry.university.name}</td>
                <td className="px-3 py-2.5 align-top text-[var(--color-muted)]">{entry.program.degree ?? "—"}</td>
                <td className="px-3 py-2.5 align-top text-[var(--color-muted)]">{entry.program.language ?? "—"}</td>
                <td className="px-3 py-2.5 align-top mono text-[11px] text-[var(--color-ink)]">{entry.program.deadline ?? "—"}</td>
                <td className="px-3 py-2.5 align-top text-[var(--color-ink)]">{englishStr}</td>
                <td className="px-3 py-2.5 align-top text-[var(--color-ink)]">{jpStr}</td>
                <td className="px-3 py-2.5 align-top mono tabular-nums text-[var(--color-muted)]">{docsCount || "—"}</td>
                <td className="px-3 py-2.5 align-top">
                  {supervisor === true ? (
                    <span className="mono inline-flex h-5 items-center bg-amber-50 px-1.5 text-[10px] uppercase tracking-[0.1em] text-amber-700">{labels.yes}</span>
                  ) : supervisor === false ? (
                    <span className="text-[var(--color-subtle)]">{labels.no}</span>
                  ) : "—"}
                </td>
                <td className="px-3 py-2.5 align-top mono tabular-nums text-[var(--color-ink)]">{tuition != null ? `¥${tuition.toLocaleString()}` : "—"}</td>
                <td className="px-3 py-2.5 align-top">
                  {mext === true ? (
                    <span className="mono inline-flex h-5 items-center bg-emerald-50 px-1.5 text-[10px] uppercase tracking-[0.1em] text-emerald-700">{labels.yes}</span>
                  ) : mext === false ? (
                    <span className="text-[var(--color-subtle)]">{labels.no}</span>
                  ) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
