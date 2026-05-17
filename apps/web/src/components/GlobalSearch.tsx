import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { searchGlobal } from "../lib/api";
import type { PageKey } from "./AppShell";
import type { SearchHit } from "../types/sris";

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

type TypeFilter = "all" | "university" | "program" | "professor" | "lab" | "paper" | "resource" | "task";

const RESOURCE_SUBTYPES = ["professor_page", "lab_page", "program_page", "official_page", "admission_notice", "experience_post", "paper", "video", "other"] as const;
const CONFIDENCE_LEVELS = ["official", "high", "medium", "low"] as const;

const HIT_PAGE: Record<SearchHit["type"], PageKey> = {
  university: "universities",
  professor: "professors",
  lab: "labs",
  program: "programs",
  paper: "papers",
  candidate: "review",
  task: "timeline",
  resource: "universities",
};

export function GlobalSearch({ open, onClose, onNavigate, onOpenResource }: GlobalSearchProps & { onNavigate?: (page: PageKey, id?: string) => void; onOpenResource?: (id: string) => void }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [resSubtype, setResSubtype] = useState("all");
  const [resConfidence, setResConfidence] = useState("all");
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
      setTypeFilter("all");
      setResSubtype("all");
      setResConfidence("all");
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (typeFilter !== "resource") {
      setResSubtype("all");
      setResConfidence("all");
    }
  }, [typeFilter]);

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
        const filter = typeFilter === "all" ? undefined : { type: typeFilter };
        const res = await searchGlobal(token, trimmed, filter);
        setHits(res.hits);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => window.clearTimeout(handle);
  }, [query, token, open, typeFilter]);

  const filteredHits = useMemo(() => {
    if (typeFilter !== "resource" || (resSubtype === "all" && resConfidence === "all")) return hits;
    return hits.filter((hit) => {
      if (hit.type !== "resource") return true;
      const parts = (hit.subtitle ?? "").split(" · ");
      const rt = parts[0] ?? "";
      const conf = parts[1] ?? "";
      if (resSubtype !== "all" && rt !== resSubtype) return false;
      if (resConfidence !== "all" && conf !== resConfidence) return false;
      return true;
    });
  }, [hits, typeFilter, resSubtype, resConfidence]);

  if (!open) return null;

  const filterChips: Array<{ key: TypeFilter; label: string }> = [
    { key: "all", label: t.searchFilterAll },
    { key: "university", label: t.searchFilterUniversity },
    { key: "program", label: t.searchFilterProgram },
    { key: "professor", label: t.searchFilterProfessor },
    { key: "lab", label: t.searchFilterLab },
    { key: "paper", label: t.searchFilterPaper },
    { key: "resource", label: t.searchFilterResource },
    { key: "task", label: t.searchFilterTask },
  ];

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

        <div className="flex flex-wrap gap-1.5 border-b border-[var(--color-hairline)] px-5 py-2.5">
          {filterChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setTypeFilter(chip.key)}
              className={`mono text-[9px] uppercase tracking-[0.12em] px-2 py-1 border transition-colors ${
                typeFilter === chip.key
                  ? "border-[var(--color-todai)] text-[var(--color-todai)] bg-[var(--color-todai-soft)]"
                  : "border-[var(--color-hairline)] text-[var(--color-muted)] hover:border-[var(--color-hairline-strong)]"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {typeFilter === "resource" && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-b border-[var(--color-hairline)] px-5 py-2">
            <div className="flex flex-wrap gap-1">
              {(["all", ...RESOURCE_SUBTYPES] as const).map((rt) => (
                <button
                  key={rt}
                  type="button"
                  onClick={() => setResSubtype(rt)}
                  className={`mono text-[9px] px-1.5 py-0.5 border transition-colors ${
                    resSubtype === rt
                      ? "border-[var(--color-todai)] text-[var(--color-todai)] bg-[var(--color-todai-soft)]"
                      : "border-transparent text-[var(--color-subtle)] hover:border-[var(--color-hairline)]"
                  }`}
                >
                  {rt === "all" ? t.searchFilterAll : (t.capture.classifiedTypes[rt] ?? rt)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {(["all", ...CONFIDENCE_LEVELS] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setResConfidence(c)}
                  className={`mono text-[9px] px-1.5 py-0.5 border transition-colors ${
                    resConfidence === c
                      ? "border-emerald-400 text-emerald-700 bg-emerald-50"
                      : "border-transparent text-[var(--color-subtle)] hover:border-[var(--color-hairline)]"
                  }`}
                >
                  {c === "all" ? "any conf." : c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-h-[60vh] overflow-y-auto">
          {loading && filteredHits.length === 0 ? (
            <div className="px-5 py-10 text-center text-[12.5px] text-[var(--color-subtle)]">{t.loading}</div>
          ) : query.trim() === "" ? (
            <div className="px-5 py-10 text-center text-[12.5px] text-[var(--color-subtle)]">{t.searchHint}</div>
          ) : filteredHits.length === 0 ? (
            <div className="px-5 py-10 text-center text-[12.5px] text-[var(--color-subtle)]">{t.searchEmpty}</div>
          ) : (
            <ul className="divide-y divide-[var(--color-hairline)]">
              {filteredHits.map((hit) => (
                <li
                  key={`${hit.type}-${hit.id}`}
                  className="cursor-pointer px-5 py-3 hover:bg-[var(--color-paper)]"
                  onClick={() => {
                    if (hit.type === "resource" && onOpenResource) {
                      onOpenResource(hit.id);
                    } else {
                      const page = HIT_PAGE[hit.type];
                      if (page && onNavigate) {
                        if (hit.type === "university") {
                          onNavigate("universities", hit.id);
                        } else {
                          onNavigate(page);
                        }
                      }
                    }
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="line-clamp-1 text-[14px] font-medium text-[var(--color-ink)]">{hit.title}</div>
                      </div>
                      {hit.subtitle ? (
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="line-clamp-1 text-[12px] text-[var(--color-muted)]">{hit.subtitle}</span>
                          {hit.type === "resource" && hit.subtitle && (
                            <span className="mono inline-flex h-4 shrink-0 items-center bg-[var(--color-todai-soft)] px-1 text-[8px] uppercase tracking-[0.1em] text-[var(--color-todai)]">
                              {hit.subtitle.split(" · ")[0]}
                            </span>
                          )}
                        </div>
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
