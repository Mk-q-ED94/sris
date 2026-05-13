import { ArrowUpRight } from "lucide-react";
import { featuredUniversities } from "../data/universities";
import { useI18n } from "../contexts/I18nContext";

export function UniversityCarousel({ onSelect }: { onSelect: (id: string) => void }) {
  const { t } = useI18n();
  const carouselItems = [...featuredUniversities, ...featuredUniversities];

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="section-index">02 — {t.carouselTagline}</div>
          <h2 className="serif mt-3 text-[26px] font-semibold tracking-[-0.015em] sm:text-[30px]">
            {t.carouselTitle}
          </h2>
        </div>
        <div className="mono hidden text-right text-[11px] uppercase tracking-[0.18em] text-[var(--color-subtle)] sm:block">
          {t.carouselHint}
        </div>
      </div>

      <div className="uni-rail-mask relative border-t border-b border-[var(--color-hairline)] py-6">
        <div className="uni-rail-track flex w-max gap-5">
          {carouselItems.map((university, index) => {
            const baseIndex = index % featuredUniversities.length;
            return (
              <button
                key={`${university.id}-${index}`}
                type="button"
                onClick={() => onSelect(university.id)}
                className="group relative w-[260px] shrink-0 text-left sm:w-[300px]"
                aria-label={`${university.name}`}
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
                  <span className="text-[var(--color-muted)] line-clamp-1">{university.name}</span>
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
