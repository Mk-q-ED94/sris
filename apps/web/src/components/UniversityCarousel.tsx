import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { featuredUniversities } from "../data/universities";
import { useI18n } from "../contexts/I18nContext";

const AUTO_INTERVAL_MS = 4500;
const MANUAL_PAUSE_MS = 6000;
const GAP_PX = 20;

export function UniversityCarousel({ onSelect }: { onSelect: (id: string) => void }) {
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const pauseTimer = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);

  const step = useCallback((dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    const stepX = card.offsetWidth + GAP_PX;
    const max = el.scrollWidth - el.clientWidth;
    let next: number;
    if (dir === 1) {
      next = el.scrollLeft >= max - 4 ? 0 : el.scrollLeft + stepX;
    } else {
      next = el.scrollLeft <= 4 ? max : el.scrollLeft - stepX;
    }
    el.scrollTo({ left: next, behavior: "smooth" });
  }, []);

  const pauseTemporarily = useCallback(() => {
    setPaused(true);
    if (pauseTimer.current) window.clearTimeout(pauseTimer.current);
    pauseTimer.current = window.setTimeout(() => setPaused(false), MANUAL_PAUSE_MS);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => step(1), AUTO_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, step]);

  useEffect(() => {
    return () => {
      if (pauseTimer.current) window.clearTimeout(pauseTimer.current);
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
              onClick={() => {
                pauseTemporarily();
                step(-1);
              }}
              className="grid h-9 w-9 place-items-center border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-todai)] hover:text-[var(--color-todai)] focus-visible:border-[var(--color-todai)] focus-visible:text-[var(--color-todai)] focus-visible:outline-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="next"
              onClick={() => {
                pauseTemporarily();
                step(1);
              }}
              className="grid h-9 w-9 place-items-center border border-l-0 border-[var(--color-hairline-strong)] bg-[var(--color-surface)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-todai)] hover:text-[var(--color-todai)] focus-visible:border-[var(--color-todai)] focus-visible:text-[var(--color-todai)] focus-visible:outline-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-b border-[var(--color-hairline)] py-6">
        <div
          ref={trackRef}
          role="region"
          aria-label={t.carouselTitle}
          className="uni-rail-scroll flex gap-5"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={pauseTemporarily}
          onWheel={pauseTemporarily}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {featuredUniversities.map((university, index) => (
            <button
              key={university.id}
              type="button"
              onClick={() => onSelect(university.id)}
              className="group relative w-[260px] shrink-0 snap-start text-left sm:w-[300px]"
              aria-label={university.name}
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
                    {String(index + 1).padStart(2, "0")}
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
                <span className="line-clamp-1 text-[var(--color-muted)]">{university.name}</span>
                <span className="mono inline-flex items-center gap-1 text-[var(--color-todai)] opacity-0 transition-opacity group-hover:opacity-100">
                  OPEN
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
