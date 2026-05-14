import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { searchGlobal } from "../lib/api";
import type { SearchHit } from "../types/sris";

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const { token } = useAuth();
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHits([]);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = window.setTimeout(async () => {
      try {
        const res = await searchGlobal(token, trimmed);
        setHits(res.hits);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => window.clearTimeout(handle);
  }, [query, token, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-2xl border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="flex items-center gap-3 border-b border-[var(--color-hairline)] px-5 py-4">
          <Search className="h-4 w-4 text-[var(--color-subtle)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 border-0 bg-transparent text-[14.5px] outline-none placeholder:text-[var(--color-subtle)]"
          />
          <span className="mono hidden text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-subtle)] sm:inline">
            ESC
          </span>
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center text-[var(--color-subtle)] hover:text-[var(--color-ink)] sm:hidden"
            aria-label="close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading && hits.length === 0 ? (
            <div className="px-5 py-10 text-center text-[12.5px] text-[var(--color-subtle)]">{t.loading}</div>
          ) : query.trim() === "" ? (
            <div className="px-5 py-10 text-center text-[12.5px] text-[var(--color-subtle)]">{t.searchHint}</div>
          ) : hits.length === 0 ? (
            <div className="px-5 py-10 text-center text-[12.5px] text-[var(--color-subtle)]">{t.searchEmpty}</div>
          ) : (
            <ul className="divide-y divide-[var(--color-hairline)]">
              {hits.map((hit) => (
                <li key={`${hit.type}-${hit.id}`} className="px-5 py-3 hover:bg-[var(--color-paper)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="line-clamp-1 text-[14px] font-medium text-[var(--color-ink)]">{hit.title}</div>
                      {hit.subtitle ? (
                        <div className="line-clamp-1 mt-0.5 text-[12px] text-[var(--color-muted)]">{hit.subtitle}</div>
                      ) : null}
                      {hit.hint ? (
                        <div className="line-clamp-1 mt-1 text-[11.5px] text-[var(--color-subtle)]">{hit.hint}</div>
                      ) : null}
                    </div>
                    <span className="mono inline-flex h-5 flex-shrink-0 items-center px-1.5 text-[10px] uppercase tracking-[0.16em] text-[var(--color-todai)]">
                      {t.entityType[hit.type]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
