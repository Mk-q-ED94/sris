import { CheckCircle2, Clock, Inbox, RefreshCw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import {
  acceptCandidate,
  enrichCandidateApi,
  fetchReviewCandidates,
  fetchUniversities,
  ignoreCandidate,
  markForLaterCandidate,
  promoteCandidate,
  type ReviewFilter,
} from "../lib/api";
import { formatDate } from "../lib/format";
import type { IntelligenceCandidate, ResourceType, University } from "../types/sris";

const RESOURCE_TYPES: ResourceType[] = [
  "paper", "lab_page", "professor_page", "program_page", "official_page",
  "admission_notice", "experience_post", "video", "other",
];

const TYPE_COLORS: Record<string, string> = {
  paper: "bg-[var(--color-isct-soft)] text-[var(--color-isct)]",
  lab_page: "bg-[var(--color-todai-soft)] text-[var(--color-todai)]",
  professor_page: "bg-[var(--color-todai-soft)] text-[var(--color-todai)]",
  program_page: "bg-emerald-50 text-emerald-700",
  official_page: "bg-sky-50 text-sky-700",
  admission_notice: "bg-amber-50 text-amber-700",
  experience_post: "bg-purple-50 text-purple-700",
  video: "bg-rose-50 text-rose-700",
  other: "bg-gray-50 text-gray-600",
};

export function Review() {
  const { token, clearToken } = useAuth();
  const { t } = useI18n();
  const [candidates, setCandidates] = useState<IntelligenceCandidate[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [reenrichingId, setReenrichingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "later">("pending");
  const [filterType, setFilterType] = useState<string>("");
  const [filterUni, setFilterUni] = useState<string>("");

  useEffect(() => {
    fetchUniversities(token).then(setUniversities).catch(() => {});
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const filter: ReviewFilter = { status: tab };
    if (filterType) filter.resource_type = filterType;
    if (filterUni) filter.university_id = filterUni;
    fetchReviewCandidates(token, filter)
      .then((result) => {
        if (!cancelled) setCandidates(result);
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
  }, [token, tab, filterType, filterUni, clearToken]);

  function removeCandidate(id: string) {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleAccept(id: string) {
    setActionId(id);
    try {
      await acceptCandidate(token, id);
      removeCandidate(id);
    } catch {
      // Keep the card on failure
    } finally {
      setActionId(null);
    }
  }

  async function handleIgnore(id: string) {
    setActionId(id);
    try {
      await ignoreCandidate(token, id);
      removeCandidate(id);
    } catch {
      // Keep the card on failure
    } finally {
      setActionId(null);
    }
  }

  async function handleLater(id: string) {
    setActionId(id);
    try {
      await markForLaterCandidate(token, id);
      removeCandidate(id);
    } catch {
      // Keep the card on failure
    } finally {
      setActionId(null);
    }
  }

  async function handlePromote(id: string) {
    setActionId(id);
    try {
      await promoteCandidate(token, id);
      removeCandidate(id);
    } catch {
      // Keep the card on failure
    } finally {
      setActionId(null);
    }
  }

  async function handleReenrich(id: string) {
    setReenrichingId(id);
    try {
      await enrichCandidateApi(token, id);
      // Reload the review list to reflect updated enrichment status
      const filter: ReviewFilter = { status: tab };
      if (filterType) filter.resource_type = filterType;
      if (filterUni) filter.university_id = filterUni;
      const result = await fetchReviewCandidates(token, filter);
      setCandidates(result);
    } catch {
      // Keep the card as-is on failure
    } finally {
      setReenrichingId(null);
    }
  }

  const uniMap = new Map(universities.map((u) => [u.id, u.name]));

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
          <span className="section-index">07 — {t.review2.title}</span>
        </div>
        <h1 className="serif mt-6 text-[44px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[60px]">
          {t.review2.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[var(--color-muted)] sm:text-[16px]">
          {t.review2.description}
        </p>
      </section>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 border-y border-[var(--color-hairline)] py-4">
        {/* Tab toggle */}
        <div className="flex border border-[var(--color-hairline)]">
          <button
            type="button"
            onClick={() => setTab("pending")}
            className={`px-4 py-2 text-[12px] font-medium transition-colors ${tab === "pending" ? "bg-[var(--color-ink)] text-white" : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"}`}
          >
            {t.review2.pendingTab}
          </button>
          <button
            type="button"
            onClick={() => setTab("later")}
            className={`px-4 py-2 text-[12px] font-medium transition-colors ${tab === "later" ? "bg-[var(--color-ink)] text-white" : "bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"}`}
          >
            {t.review2.laterTab}
          </button>
        </div>

        {/* Resource type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-9 border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 text-[12px] text-[var(--color-muted)] outline-none transition-colors focus:border-[var(--color-todai)]"
        >
          <option value="">{t.review2.allTypes}</option>
          {RESOURCE_TYPES.map((rt) => (
            <option key={rt} value={rt}>
              {t.capture.classifiedTypes[rt] ?? rt}
            </option>
          ))}
        </select>

        {/* University filter */}
        <select
          value={filterUni}
          onChange={(e) => setFilterUni(e.target.value)}
          className="h-9 border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 text-[12px] text-[var(--color-muted)] outline-none transition-colors focus:border-[var(--color-todai)]"
        >
          <option value="">{t.review2.allUniversities}</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-16 text-center">
          <div className="serif text-[18px] font-semibold text-[var(--color-ink)]">
            {tab === "later" ? t.review2.noLaterResults : t.review2.noResults}
          </div>
          <div className="mt-1.5 text-[13px] text-[var(--color-muted)]">
            {tab === "later" ? t.review2.noLaterResultsHelper : t.review2.noResultsHelper}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate) => {
            const acting = actionId === candidate.id;
            return (
              <div key={candidate.id} className="border border-[var(--color-hairline)] bg-[var(--color-surface)]">
                <div className="px-6 py-5">
                  <div className="mono mb-3 flex flex-wrap items-center gap-2 text-[10.5px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                    <Inbox className="h-3 w-3 text-[var(--color-todai)]" />
                    <span className={`mono inline-flex h-5 items-center px-1.5 text-[9px] uppercase tracking-[0.12em] ${TYPE_COLORS[candidate.resource_type] ?? TYPE_COLORS.other!}`}>
                      {t.capture.classifiedTypes[candidate.resource_type] ?? candidate.resource_type}
                    </span>
                    <span className={`mono inline-flex h-5 items-center px-1.5 text-[9px] uppercase tracking-[0.12em] ${candidate.content_text ? "bg-emerald-50 text-emerald-600" : candidate.excerpt ? "bg-sky-50 text-sky-600" : "bg-gray-50 text-gray-500"}`}>
                      {candidate.content_text ? t.review2.hasContent : candidate.excerpt ? t.review2.hasExcerpt : t.review2.urlOnly}
                    </span>
                    <span className="h-px w-4 bg-[var(--color-hairline-strong)]" />
                    <span>{candidate.source ?? "candidate"}</span>
                    <span className="h-px w-4 bg-[var(--color-hairline-strong)]" />
                    <span>{formatDate(candidate.published_at, t.dateLocale, t.notSet)}</span>
                    {candidate.domain_source && (
                      <>
                        <span className="h-px w-4 bg-[var(--color-hairline-strong)]" />
                        <span>{candidate.domain_source}</span>
                      </>
                    )}
                  </div>
                  <h2 className="serif flex flex-wrap items-center gap-2 text-[20px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
                    {candidate.title}
                    {candidate.enrichment_status && (
                      <span
                        className={`mono inline-flex h-5 items-center gap-1 px-1.5 text-[9px] uppercase tracking-[0.12em] ${
                          candidate.enrichment_status === "succeeded"
                            ? "bg-emerald-50 text-emerald-600"
                            : candidate.enrichment_status === "running"
                              ? "bg-sky-50 text-sky-600"
                              : candidate.enrichment_status === "partial"
                                ? "bg-amber-50 text-amber-700"
                                : candidate.enrichment_status === "failed"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {candidate.enrichment_status === "running" && (
                          <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                        )}
                        {candidate.enrichment_status}
                      </span>
                    )}
                  </h2>
                  {candidate.university_id && uniMap.has(candidate.university_id) && (
                    <p className="mt-1.5 text-[12.5px] text-[var(--color-todai)]">
                      {uniMap.get(candidate.university_id)}
                    </p>
                  )}
                  {candidate.authors.length > 0 && (
                    <p className="mt-2 line-clamp-1 text-[12.5px] text-[var(--color-muted)]">
                      {candidate.authors.join(", ")}
                    </p>
                  )}
                  {(candidate.abstract || candidate.relevance_note) && (
                    <p className="mt-3 line-clamp-3 text-[13.5px] leading-[1.7] text-[var(--color-muted)]">
                      {candidate.relevance_note || candidate.abstract}
                    </p>
                  )}
                  {candidate.excerpt && (
                    <p className="mt-2 line-clamp-2 border-l-2 border-[var(--color-todai)] pl-3 text-[12.5px] leading-[1.6] text-[var(--color-muted)] italic">
                      {candidate.excerpt.length > 200 ? candidate.excerpt.slice(0, 200) + "…" : candidate.excerpt}
                    </p>
                  )}
                  {candidate.confidence && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--color-subtle)]">
                      <span className="mono uppercase tracking-[0.12em]">{t.capture.confidenceLabel}:</span>
                      <span className={candidate.confidence === "high" ? "text-emerald-600" : candidate.confidence === "low" ? "text-[var(--color-todai)]" : "text-[var(--color-muted)]"}>
                        {candidate.confidence === "high" ? t.review2.confidenceHigh : candidate.confidence === "low" ? t.review2.confidenceLow : t.review2.confidenceMedium}
                      </span>
                    </div>
                  )}
                  {candidate.decision_impact && (
                    <p className="mt-2 line-clamp-1 text-[12.5px] leading-[1.6] text-[var(--color-muted)]">
                      {candidate.decision_impact}
                    </p>
                  )}
                  {candidate.matched_keywords.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {candidate.matched_keywords.map((kw) => (
                        <span key={kw} className="mono inline-flex h-5 items-center bg-[var(--color-todai-soft)] px-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--color-todai)]">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 flex items-center gap-3 border-t border-[var(--color-hairline)] pt-4">
                    <button
                      onClick={() => tab === "later" ? handlePromote(candidate.id) : handleAccept(candidate.id)}
                      disabled={acting}
                      className="inline-flex h-9 items-center gap-2 bg-[var(--color-ink)] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[var(--color-todai)] disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {tab === "later" ? (acting ? t.review2.latering : t.review2.promote) : (acting ? t.review2.accepting : t.review2.accept)}
                    </button>
                    {tab === "pending" && (
                      <>
                        <button
                          onClick={() => handleLater(candidate.id)}
                          disabled={acting}
                          className="inline-flex h-9 items-center gap-2 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-4 text-[12px] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] disabled:opacity-50"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {acting ? t.review2.latering : t.review2.later}
                        </button>
                        <button
                          onClick={() => handleIgnore(candidate.id)}
                          disabled={acting}
                          className="inline-flex h-9 items-center gap-2 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-4 text-[12px] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          {acting ? t.review2.ignoring : t.review2.ignore}
                        </button>
                      </>
                    )}
                    {candidate.enrichment_status === "failed" && (
                      <button
                        onClick={() => handleReenrich(candidate.id)}
                        disabled={reenrichingId === candidate.id}
                        className="inline-flex h-9 items-center gap-2 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-4 text-[12px] font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${reenrichingId === candidate.id ? "animate-spin" : ""}`} />
                        {reenrichingId === candidate.id ? "Re-enriching…" : "Re-enrich"}
                      </button>
                    )}
                    {candidate.url && (
                      <a
                        href={candidate.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mono ml-auto text-[10.5px] uppercase tracking-[0.16em] text-[var(--color-subtle)] transition-colors hover:text-[var(--color-todai)]"
                      >
                        Source →
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
