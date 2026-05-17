import { ArrowUpRight, BookmarkPlus, ExternalLink, MapPin, Search, SortAsc } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { fetchUniversitySummary } from "../lib/api";
import type { PageKey } from "../components/AppShell";
import type { UniversitySummary } from "../types/sris";

type SortKey = "name" | "updated" | "resources" | "gaps";

function daysAgo(iso: string | null): number {
  if (!iso) return 9999;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function gapCount(u: UniversitySummary): number {
  let n = 0;
  if (u.program_count === 0) n += 2;       // high: no programs
  if (u.professor_count === 0 && u.lab_count === 0) n += 2; // high: no professors
  if (u.resource_count < 3) n += 1;         // medium: few resources
  return n;
}

function GapBadges({ u, labels }: { u: UniversitySummary; labels: { gapHigh: string; gapMedium: string } }) {
  const badges: { label: string; cls: string }[] = [];
  if (u.program_count === 0) badges.push({ label: labels.gapHigh, cls: "bg-red-50 text-red-600" });
  if (u.professor_count === 0 && u.lab_count === 0) badges.push({ label: labels.gapHigh, cls: "bg-red-50 text-red-600" });
  if (u.resource_count < 3) badges.push({ label: labels.gapMedium, cls: "bg-amber-50 text-amber-600" });
  if (!badges.length) return null;
  return (
    <>
      {badges.map((b, i) => (
        <span key={i} className={`mono inline-flex h-4 items-center px-1.5 text-[9px] uppercase tracking-[0.12em] ${b.cls}`}>
          {b.label}
        </span>
      ))}
    </>
  );
}

export function Universities({
  onNavigate,
}: {
  onNavigate?: (page: PageKey, id?: string) => void;
}) {
  const { token, clearToken } = useAuth();
  const { t } = useI18n();
  const p = t.universitiesPage;

  const [unis, setUnis] = useState<UniversitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("name");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchUniversitySummary(token)
      .then((data) => { if (!cancelled) setUnis(data); })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message.toLowerCase().includes("invalid api token")) clearToken();
        if (!cancelled) setError(err instanceof Error ? err.message : "Request failed");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, clearToken]);

  const filtered = useMemo(() => {
    let list = unis;
    if (filter.trim()) {
      const q = filter.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || (u.location ?? "").toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (sort === "updated") return daysAgo(a.latest_resource_at) - daysAgo(b.latest_resource_at);
      if (sort === "resources") return b.resource_count - a.resource_count;
      if (sort === "gaps") return gapCount(b) - gapCount(a);
      return a.name.localeCompare(b.name);
    });
  }, [unis, filter, sort]);

  const totalResources = useMemo(() => unis.reduce((s, u) => s + u.resource_count, 0), [unis]);
  const highGaps = useMemo(() => unis.filter((u) => u.program_count === 0 || (u.professor_count === 0 && u.lab_count === 0)).length, [unis]);

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
          <span className="section-index">02 — {p.title}</span>
        </div>
        <h1 className="serif mt-6 text-[44px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[60px]">
          {p.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[var(--color-muted)] sm:text-[16px]">
          {p.description}
        </p>
      </section>

      {/* Metrics bar */}
      {!loading && unis.length > 0 && (
        <div className="grid grid-cols-3 divide-x divide-[var(--color-hairline)] border border-[var(--color-hairline)] bg-[var(--color-surface)]">
          {[
            { label: p.totalLabel, value: unis.length },
            { label: p.resourcesLabel, value: totalResources },
            { label: p.highGapsLabel, value: highGaps },
          ].map(({ label, value }) => (
            <div key={label} className="px-6 py-4">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">{label}</div>
              <div className="mt-1 text-[28px] font-semibold tabular-nums text-[var(--color-ink)]">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter + sort */}
      {!loading && unis.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-subtle)]" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={p.filterPlaceholder}
              className="h-9 w-full border border-[var(--color-hairline-strong)] bg-[var(--color-paper)] pl-8 pr-3 text-[13px] outline-none focus:border-[var(--color-todai)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <SortAsc className="h-3.5 w-3.5 text-[var(--color-subtle)]" />
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">{p.sortLabel}</span>
            {(["name", "updated", "resources", "gaps"] as SortKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setSort(k)}
                className={`mono h-7 px-2.5 text-[10px] uppercase tracking-[0.12em] transition-colors ${sort === k ? "bg-[var(--color-ink)] text-white" : "border border-[var(--color-hairline-strong)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"}`}
              >
                {k === "name" ? p.sortName : k === "updated" ? p.sortUpdated : k === "resources" ? p.sortResources : p.sortGaps}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-px">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse border border-[var(--color-hairline)] bg-[var(--color-paper)]" />
          ))}
        </div>
      ) : filtered.length === 0 && unis.length === 0 ? (
        /* Empty state */
        <div className="border border-dashed border-[var(--color-hairline-strong)] bg-[var(--color-paper)] px-8 py-16">
          <div className="serif text-[20px] font-semibold text-[var(--color-ink)]">{p.noData}</div>
          <p className="mt-2 max-w-lg text-[13px] leading-[1.75] text-[var(--color-muted)]">{p.noDataHelper}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate?.("sources")}
              className="inline-flex h-9 items-center gap-2 bg-[var(--color-ink)] px-4 text-[12px] font-medium text-white hover:bg-[var(--color-todai)]"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              {p.noDataAction1}
            </button>
            <button
              type="button"
              onClick={() => { window.location.hash = "#capture"; }}
              className="inline-flex h-9 items-center gap-2 border border-[var(--color-hairline-strong)] px-4 text-[12px] font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              {p.noDataAction2}
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-[var(--color-hairline)] bg-[var(--color-paper)] px-6 py-8 text-center text-[13px] text-[var(--color-muted)]">
          {p.noResults ?? "No matching universities"}
        </div>
      ) : (
        /* University list */
        <div className="divide-y divide-[var(--color-hairline)] border border-[var(--color-hairline)] bg-[var(--color-surface)]">
          {filtered.map((u) => {
            const days = daysAgo(u.latest_resource_at);
            const updatedStr = u.latest_resource_at
              ? days === 0 ? "today" : days === 1 ? "1d ago" : `${days}d ago`
              : p.neverUpdated;
            return (
              <div key={u.id} className="group flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4 hover:bg-[var(--color-paper)]">
                {/* Name + location */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <button
                    type="button"
                    onClick={() => onNavigate?.("universities", u.id)}
                    className="truncate text-left text-[14px] font-semibold text-[var(--color-ink)] hover:text-[var(--color-todai)] transition-colors"
                  >
                    {u.name}
                  </button>
                  {u.location && (
                    <span className="mt-0.5 flex items-center gap-1 text-[11.5px] text-[var(--color-subtle)]">
                      <MapPin className="h-3 w-3" />
                      {u.location}
                    </span>
                  )}
                </div>

                {/* Count chips */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: p.resourcesLabel, value: u.resource_count },
                    { label: p.programsLabel, value: u.program_count },
                    { label: p.professorsLabel, value: u.professor_count },
                    { label: p.labsLabel, value: u.lab_count },
                  ].map(({ label, value }) => (
                    <span key={label} className="mono inline-flex h-6 items-center gap-1 border border-[var(--color-hairline)] px-2 text-[10px] text-[var(--color-muted)]">
                      <span className="font-semibold text-[var(--color-ink)]">{value}</span>
                      <span className="uppercase tracking-[0.1em]">{label}</span>
                    </span>
                  ))}
                </div>

                {/* Gap badges */}
                <div className="flex items-center gap-1.5">
                  <GapBadges u={u} labels={{ gapHigh: p.gapHigh, gapMedium: p.gapMedium }} />
                </div>

                {/* Updated */}
                <div className="mono text-[10.5px] text-[var(--color-subtle)] tabular-nums w-20 text-right shrink-0">
                  {updatedStr}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onNavigate?.("universities", u.id)}
                    className="mono inline-flex h-7 items-center gap-1 border border-[var(--color-hairline-strong)] px-2.5 text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)] hover:border-[var(--color-todai)] hover:text-[var(--color-todai)]"
                  >
                    {p.openDetail}
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                  {u.website && (
                    <a
                      href={u.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mono inline-flex h-7 items-center gap-1 border border-[var(--color-hairline-strong)] px-2.5 text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)] hover:border-[var(--color-todai)] hover:text-[var(--color-todai)]"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
