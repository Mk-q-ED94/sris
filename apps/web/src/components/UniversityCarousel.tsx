import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { featuredUniversities } from "../data/universities";
import { useI18n } from "../contexts/I18nContext";
import type { UniversityStat } from "../types/sris";

const SCROLL_SPEED_PX_PER_SEC = 28;
const MANUAL_PAUSE_MS = 6000;
const MANUAL_TRANSITION_MS = 420;
const GAP_PX = 20;

export function UniversityCarousel({ onSelect, universityStats }: { onSelect: (id: string) => void; universityStats?: UniversityStat[] }) {
  const { t } = useI18n();
  const statsMap = useMemo(() => {
    const m = new Map<string, UniversityStat>();
    if (universityStats) for (const s of universityStats) m.set(s.id, s);
    return m;
  }, [universityStats]);
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const pauseTimer = useRef<number | null>(null);
  const transitionTimer = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);

  // Duplicate the list so the loop wraps seamlessly: position 0 and position
  // `halfway` render the same visible content, so jumping between them is
  // invisible to the user.
  const carouselItems = [...featuredUniversities, ...featuredUniversities];

  useEffect(() => {
    if (paused) return;
    let lastTime: number | null = null;
    const tick = (now: number) => {
      const el = trackRef.current;
      if (!el) {
        rafRef.current = null;
        return;
      }
      if (lastTime === null) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const half = el.scrollWidth / 2;
      if (half > 0) {
        let next = posRef.current + SCROLL_SPEED_PX_PER_SEC * dt;
        if (next >= half) next -= half;
        posRef.current = next;
        el.style.transform = `translate3d(${-next}px, 0, 0)`;
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [paused]);

  const pauseTemporarily = useCallback(() => {
    setPaused(true);
    if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current);
    pauseTimer.current = window.setTimeout(() => {
      setPaused(false);
      pauseTimer.current = null;
    }, MANUAL_PAUSE_MS);
  }, []);

  const step = useCallback(
    (dir: -1 | 1) => {
      const el = trackRef.current;
      if (!el) return;
      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      const half = el.scrollWidth / 2;
      if (half <= 0) return;
      const stepX = card.offsetWidth + GAP_PX;
      let next = posRef.current + dir * stepX;
      next = ((next % half) + half) % half;
      posRef.current = next;
      el.style.transition = `transform ${MANUAL_TRANSITION_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`;
      el.style.transform = `translate3d(${-next}px, 0, 0)`;
      if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
      transitionTimer.current = window.setTimeout(() => {
        if (trackRef.current) trackRef.current.style.transition = "";
        transitionTimer.current = null;
      }, MANUAL_TRANSITION_MS + 20);
      pauseTemporarily();
    },
    [pauseTemporarily],
  );

  useEffect(() => {
    return () => {
      if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current);
      if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    };
  }, []);

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="section-index">02 — {t.carouselTagline}</div>
          <h2 className="serif mt-3 text-[26px] font-semibold tracking-[-0.015em] sm:text-[30px]">
            {t.carouselTitle}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="mono hidden text-[11px] uppercase tracking-[0.18em] text-[var(--color-subtle)] sm:inline">
            {t.carouselHint}
          </span>
          <div className="flex">
            <button
              type="button"
              aria-label="previous"
              onClick={() => step(-1)}
              className="grid h-9 w-9 place-items-center border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-todai)] hover:text-[var(--color-todai)] focus-visible:border-[var(--color-todai)] focus-visible:text-[var(--color-todai)] focus-visible:outline-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="next"
              onClick={() => step(1)}
              className="grid h-9 w-9 place-items-center border border-l-0 border-[var(--color-hairline-strong)] bg-[var(--color-surface)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-todai)] hover:text-[var(--color-todai)] focus-visible:border-[var(--color-todai)] focus-visible:text-[var(--color-todai)] focus-visible:outline-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="uni-rail-mask border-t border-b border-[var(--color-hairline)] py-6"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={pauseTemporarily}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div ref={trackRef} className="uni-rail-track flex gap-5">
          {carouselItems.map((university, index) => {
            const isClone = index >= featuredUniversities.length;
            const baseIndex = index % featuredUniversities.length;
            return (
              <button
                key={`${university.id}-${index}`}
                type="button"
                onClick={() => onSelect(university.id)}
                className="group relative w-[260px] shrink-0 text-left sm:w-[300px]"
                aria-label={university.name}
                aria-hidden={isClone || undefined}
                tabIndex={isClone ? -1 : 0}
              >
                <div className="relative aspect-[4/5] overflow-hidden border border-[var(--color-hairline-strong)] bg-[var(--color-paper)]">
                  <img
                    src={university.imageUrl}
                    alt={university.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className="mono text-[10.5px] font-medium tracking-[0.22em] text-white/85">
                      {String(baseIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px w-6 bg-white/55" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="mono text-[10.5px] uppercase tracking-[0.18em] text-white/75">
                      {university.focus}
                    </div>
                    <h3 className="serif mt-1.5 text-[24px] font-semibold leading-tight tracking-[-0.01em] text-white sm:text-[26px]">
                      {university.shortName}
                    </h3>
                    <div className="mt-1 text-[12px] text-white/75">{university.location}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[12.5px]">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="line-clamp-1 text-[var(--color-muted)]">{university.name}</span>
                    {statsMap.get(university.id) && (() => {
                      const stat = statsMap.get(university.id)!;
                      return (
                        <>
                          <span className="mono inline-flex h-4 shrink-0 items-center bg-[var(--color-paper)] border border-[var(--color-hairline)] px-1 text-[8px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
                            {t.dashboard2.cardResources(stat.resource_count)}
                          </span>
                          {stat.gap_count > 0 && (
                            <span className="mono inline-flex h-4 shrink-0 items-center bg-[var(--color-todai-soft)] border border-[var(--color-todai)]/30 px-1 text-[8px] uppercase tracking-[0.1em] text-[var(--color-todai)]">
                              {t.dashboard2.cardGaps(stat.gap_count)}
                            </span>
                          )}
                          {stat.latest_update && (
                            <span className="mono shrink-0 text-[8px] uppercase tracking-[0.1em] text-[var(--color-subtle)]">
                              {t.dashboard2.cardUpdated(daysBetween(stat.latest_update))}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <span className="mono inline-flex items-center gap-1 text-[var(--color-todai)] opacity-0 transition-opacity group-hover:opacity-100">
                    OPEN
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function daysBetween(isoDate: string): number {
  const then = new Date(isoDate.slice(0, 10) + "T00:00:00Z").getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / 86_400_000));
}
