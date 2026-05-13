import { ArrowUpRight, MapPin } from "lucide-react";
import { featuredUniversities } from "../data/universities";
import { useI18n } from "../contexts/I18nContext";

export function UniversityCarousel({ onSelect }: { onSelect: (id: string) => void }) {
  const { t } = useI18n();
  const carouselItems = [...featuredUniversities, ...featuredUniversities];

  return (
    <section className="university-rail relative">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-600">
            {t.carouselTagline}
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
            {t.carouselTitle}
          </h2>
        </div>
        <div className="hidden text-right text-xs leading-5 text-slate-400 sm:block">{t.carouselHint}</div>
      </div>

      <div className="university-rail-mask relative">
        <div className="university-rail-track flex w-max gap-4 py-2">
          {carouselItems.map((university, index) => (
            <button
              key={`${university.id}-${index}`}
              type="button"
              onClick={() => onSelect(university.id)}
              className="group relative w-[260px] shrink-0 text-left sm:w-[300px] xl:w-[340px]"
              aria-label={`${university.name}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 shadow-[0_8px_28px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_14px_38px_rgba(15,23,42,0.16)]">
                <img
                  src={university.imageUrl}
                  alt={university.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/72 via-slate-950/10 to-transparent" />
                <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                  {university.focus}
                </span>
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm opacity-0 transition group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">
                    {university.shortName}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-white/85">
                    <MapPin className="h-3.5 w-3.5" />
                    {university.location}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
