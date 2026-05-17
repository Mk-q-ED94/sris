import { ArrowUpRight, BookOpen, ExternalLink, Inbox, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { fetchPapers, fetchReviewCandidates } from "../lib/api";
import type { PageKey } from "../components/AppShell";
import type { IntelligenceCandidate, Paper } from "../types/sris";

type Tab = "all" | "confirmed" | "candidates";

function oneWeekAgo(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
}

export function Papers({ onNavigate }: { onNavigate?: (page: PageKey) => void }) {
  const { token, clearToken } = useAuth();
  const { t } = useI18n();
  const p = t.papersPage;

  const [papers, setPapers] = useState<Paper[]>([]);
  const [candidates, setCandidates] = useState<IntelligenceCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchPapers(token),
      fetchReviewCandidates(token, { resource_type: "paper", status: "pending" }),
    ])
      .then(([pps, cands]) => {
        if (!cancelled) {
          setPapers(pps);
          setCandidates(cands);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message.toLowerCase().includes("invalid api token")) clearToken();
        if (!cancelled) setError(err instanceof Error ? err.message : "Request failed");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, clearToken]);

  const weekCutoff = oneWeekAgo();
  const thisWeek = useMemo(() => {
    const pp = papers.filter((p) => p.published_at && new Date(p.published_at) >= weekCutoff).length;
    const cc = candidates.filter((c) => c.published_at && new Date(c.published_at) >= weekCutoff).length;
    return pp + cc;
  }, [papers, candidates, weekCutoff]);

  const filteredPapers = useMemo(() => {
    if (!filter.trim()) return papers;
    const q = filter.toLowerCase();
    return papers.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.authors.join(" ").toLowerCase().includes(q) ||
      p.keywords.join(" ").toLowerCase().includes(q) ||
      (p.venue ?? "").toLowerCase().includes(q)
    );
  }, [papers, filter]);

  const filteredCandidates = useMemo(() => {
    if (!filter.trim()) return candidates;
    const q = filter.toLowerCase();
    return candidates.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.authors.join(" ").toLowerCase().includes(q) ||
      c.matched_keywords.join(" ").toLowerCase().includes(q)
    );
  }, [candidates, filter]);

  const showPapers = tab === "all" || tab === "confirmed";
  const showCandidates = tab === "all" || tab === "candidates";

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
          <span className="section-index">06 — {p.title}</span>
        </div>
        <h1 className="serif mt-6 text-[44px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[60px]">
          {p.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[var(--color-muted)] sm:text-[16px]">
          {p.description}
        </p>
      </section>

      {/* Metrics */}
      {!loading && (
        <div className="grid grid-cols-3 divide-x divide-[var(--color-hairline)] border border-[var(--color-hairline)] bg-[var(--color-surface)]">
          {[
            { label: p.confirmedLabel, value: papers.length },
            { label: p.pendingLabel, value: candidates.length },
            { label: p.thisWeekLabel, value: thisWeek },
          ].map(({ label, value }) => (
            <div key={label} className="px-6 py-4">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">{label}</div>
              <div className="mt-1 text-[28px] font-semibold tabular-nums text-[var(--color-ink)]">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab + filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex border border-[var(--color-hairline-strong)]">
          {(["all", "confirmed", "candidates"] as Tab[]).map((tk) => (
            <button
              key={tk}
              type="button"
              onClick={() => setTab(tk)}
              className={`mono h-8 px-3 text-[10px] uppercase tracking-[0.12em] transition-colors ${tab === tk ? "bg-[var(--color-ink)] text-white" : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"}`}
            >
              {tk === "all" ? p.tabAll : tk === "confirmed" ? p.tabConfirmed : p.tabCandidates}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-subtle)]" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={p.filterPlaceholder}
            className="h-9 w-full border border-[var(--color-hairline-strong)] bg-[var(--color-paper)] pl-8 pr-3 text-[13px] outline-none focus:border-[var(--color-todai)]"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-px">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Confirmed papers */}
          {showPapers && (
            <div>
              {tab === "all" && (
                <div className="mono mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
                  <BookOpen className="h-3 w-3" />
                  {p.tabConfirmed}
                  <span className="text-[var(--color-ink)]">{filteredPapers.length}</span>
                </div>
              )}
              {filteredPapers.length === 0 ? (
                <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-12">
                  <div className="serif text-[17px] font-semibold text-[var(--color-ink)]">{p.noPapers}</div>
                  <p className="mt-1.5 max-w-md text-[13px] leading-[1.75] text-[var(--color-muted)]">{p.noPapersHelper}</p>
                  <button
                    type="button"
                    onClick={() => onNavigate?.("review")}
                    className="mt-4 inline-flex h-8 items-center gap-2 border border-[var(--color-hairline-strong)] px-3 text-[11.5px] font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  >
                    <Inbox className="h-3.5 w-3.5" />
                    {p.goToReview}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-hairline)] border border-[var(--color-hairline)] bg-[var(--color-surface)]">
                  {filteredPapers.map((paper) => (
                    <PaperRow key={paper.id} paper={paper} labels={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pending candidates */}
          {showCandidates && (
            <div>
              {tab === "all" && (
                <div className="mono mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
                  <Inbox className="h-3 w-3" />
                  {p.tabCandidates}
                  <span className="text-[var(--color-ink)]">{filteredCandidates.length}</span>
                </div>
              )}
              {filteredCandidates.length === 0 ? (
                <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-12">
                  <div className="serif text-[17px] font-semibold text-[var(--color-ink)]">{p.noCandidates}</div>
                  <p className="mt-1.5 max-w-md text-[13px] leading-[1.75] text-[var(--color-muted)]">{p.noCandidatesHelper}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate?.("sources")}
                      className="inline-flex h-8 items-center gap-2 bg-[var(--color-ink)] px-3 text-[11.5px] font-medium text-white hover:bg-[var(--color-todai)]"
                    >
                      {p.addArxivSource}
                    </button>
                    <button
                      type="button"
                      onClick={() => { window.location.hash = "#capture"; }}
                      className="inline-flex h-8 items-center gap-2 border border-[var(--color-hairline-strong)] px-3 text-[11.5px] font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                    >
                      {p.capturePaper}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-hairline)] border border-[var(--color-hairline)] bg-[var(--color-surface)]">
                  {filteredCandidates.map((c) => (
                    <CandidateRow key={c.id} candidate={c} onReview={() => onNavigate?.("review")} labels={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No results from filter */}
          {!loading && filter.trim() && filteredPapers.length === 0 && filteredCandidates.length === 0 && (
            <div className="border border-[var(--color-hairline)] bg-[var(--color-paper)] px-6 py-8 text-center text-[13px] text-[var(--color-muted)]">
              {p.noResults} — {p.noResultsHelper}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PaperRow({ paper, labels }: { paper: Paper; labels: ReturnType<typeof useI18n>["t"]["papersPage"] }) {
  return (
    <div className="group flex flex-wrap items-start gap-x-6 gap-y-1.5 px-6 py-4 hover:bg-[var(--color-paper)]">
      <div className="min-w-0 flex-1">
        <a
          href={paper.url}
          target="_blank"
          rel="noreferrer"
          className="text-[13.5px] font-semibold text-[var(--color-ink)] hover:text-[var(--color-todai)] transition-colors line-clamp-2"
        >
          {paper.title}
        </a>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-[var(--color-muted)]">
          {paper.authors.length > 0 && <span>{paper.authors.slice(0, 3).join(", ")}{paper.authors.length > 3 ? " …" : ""}</span>}
          {paper.venue && <span className="text-[var(--color-subtle)]">· {paper.venue}</span>}
          {paper.year && <span className="text-[var(--color-subtle)]">· {paper.year}</span>}
        </div>
        {paper.keywords.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {paper.keywords.slice(0, 5).map((kw) => (
              <span key={kw} className="mono inline-flex h-4 items-center bg-[var(--color-isct-soft)] px-1.5 text-[9px] uppercase tracking-[0.1em] text-[var(--color-isct)]">
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5">
        <a
          href={paper.url}
          target="_blank"
          rel="noreferrer"
          className="mono inline-flex h-7 items-center gap-1 border border-[var(--color-hairline-strong)] px-2.5 text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)] hover:border-[var(--color-todai)] hover:text-[var(--color-todai)]"
        >
          <ExternalLink className="h-3 w-3" />
          {labels.openUrl}
        </a>
      </div>
    </div>
  );
}

function CandidateRow({
  candidate,
  onReview,
  labels,
}: {
  candidate: IntelligenceCandidate;
  onReview: () => void;
  labels: ReturnType<typeof useI18n>["t"]["papersPage"];
}) {
  return (
    <div className="group flex flex-wrap items-start gap-x-6 gap-y-1.5 px-6 py-4 hover:bg-[var(--color-paper)]">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-semibold text-[var(--color-ink)] line-clamp-2">{candidate.title}</span>
          <span className="mono inline-flex h-4 shrink-0 items-center border border-amber-300 bg-amber-50 px-1.5 text-[9px] uppercase tracking-[0.1em] text-amber-700">
            {labels.candidateBadge}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-[var(--color-muted)]">
          {candidate.authors.length > 0 && <span>{candidate.authors.slice(0, 3).join(", ")}{candidate.authors.length > 3 ? " …" : ""}</span>}
          {candidate.source && <span className="text-[var(--color-subtle)]">· {candidate.source}</span>}
        </div>
        {candidate.matched_keywords.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {candidate.matched_keywords.slice(0, 5).map((kw) => (
              <span key={kw} className="mono inline-flex h-4 items-center bg-[var(--color-isct-soft)] px-1.5 text-[9px] uppercase tracking-[0.1em] text-[var(--color-isct)]">
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5">
        <a
          href={candidate.url}
          target="_blank"
          rel="noreferrer"
          className="mono inline-flex h-7 items-center gap-1 border border-[var(--color-hairline-strong)] px-2.5 text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)] hover:border-[var(--color-todai)] hover:text-[var(--color-todai)]"
        >
          <ExternalLink className="h-3 w-3" />
          {labels.openUrl}
        </a>
        <button
          type="button"
          onClick={onReview}
          className="mono inline-flex h-7 items-center gap-1 border border-[var(--color-hairline-strong)] px-2.5 text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)] hover:border-[var(--color-todai)] hover:text-[var(--color-todai)]"
        >
          <ArrowUpRight className="h-3 w-3" />
          {labels.openReview}
        </button>
      </div>
    </div>
  );
}
