import { CheckCircle2, Inbox, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { acceptCandidate, fetchReviewCandidates, ignoreCandidate } from "../lib/api";
import { formatDate } from "../lib/format";
import type { PaperCandidate } from "../types/sris";

export function Review() {
  const { token, clearToken } = useAuth();
  const { t } = useI18n();
  const [candidates, setCandidates] = useState<PaperCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchReviewCandidates(token)
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
  }, [token, clearToken]);

  async function handleAccept(id: string) {
    setActionId(id);
    try {
      await acceptCandidate(token, id);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
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
      setCandidates((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // Keep the card on failure
    } finally {
      setActionId(null);
    }
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
          <span className="section-index">07 — {t.review2.title}</span>
        </div>
        <h1 className="serif mt-6 text-[44px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[60px]">
          {t.review2.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[var(--color-muted)] sm:text-[16px]">
          {t.review2.description}
        </p>
      </section>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-6 py-16 text-center">
          <div className="serif text-[18px] font-semibold text-[var(--color-ink)]">{t.review2.noResults}</div>
          <div className="mt-1.5 text-[13px] text-[var(--color-muted)]">{t.review2.noResultsHelper}</div>
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
                    <span className="text-[var(--color-todai)]">{candidate.source ?? "candidate"}</span>
                    <span className="h-px w-4 bg-[var(--color-hairline-strong)]" />
                    <span>{formatDate(candidate.published_at, t.dateLocale, t.notSet)}</span>
                  </div>
                  <h2 className="serif text-[20px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
                    {candidate.title}
                  </h2>
                  {candidate.authors.length > 0 && (
                    <p className="mt-2 line-clamp-1 text-[12.5px] text-[var(--color-muted)]">
                      {candidate.authors.join(", ")}
                    </p>
                  )}
                  {candidate.abstract && (
                    <p className="mt-3 line-clamp-3 text-[13.5px] leading-[1.7] text-[var(--color-muted)]">
                      {candidate.abstract}
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
                      onClick={() => handleAccept(candidate.id)}
                      disabled={acting}
                      className="inline-flex h-9 items-center gap-2 bg-[var(--color-ink)] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[var(--color-todai)] disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {acting ? t.review2.accepting : t.review2.accept}
                    </button>
                    <button
                      onClick={() => handleIgnore(candidate.id)}
                      disabled={acting}
                      className="inline-flex h-9 items-center gap-2 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-4 text-[12px] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {acting ? t.review2.ignoring : t.review2.ignore}
                    </button>
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
