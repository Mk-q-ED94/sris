import { ArrowUpRight, MapPin } from "lucide-react";
import { featuredUniversities } from "../data/universities";

export function UniversityCarousel({ onSelect }: { onSelect: (id: string) => void }) {
  const carouselItems = [...featuredUniversities, ...featuredUniversities];

  return (
    <section className="university-hero-bleed relative -mx-4 -mt-5 overflow-hidden px-4 pb-4 pt-8 sm:-mx-7 sm:-mt-8 sm:px-7 sm:pb-6 sm:pt-10 lg:-mx-10 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(14,165,233,0.18),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(246,248,251,0.12)_62%,rgba(246,248,251,0))]" />
      <div className="relative mb-3 flex items-end justify-between gap-4 sm:mb-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-600">Target schools</div>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-5xl">目标院校快速入口</h2>
        </div>
        <div className="hidden text-right text-sm leading-6 text-slate-400 sm:block">
          自动轮播 · 点击进入院校信息
        </div>
      </div>

      <div className="university-carousel-mask relative">
        <div className="university-edge-blur university-edge-blur-left" />
        <div className="university-edge-blur university-edge-blur-right" />
        <div className="university-carousel-track flex w-max gap-7 py-7 sm:gap-8 sm:py-9">
          {carouselItems.map((university, index) => (
            <button
              key={`${university.id}-${index}`}
              type="button"
              onClick={() => onSelect(university.id)}
              className="university-card group relative w-[320px] shrink-0 text-left sm:w-[430px] xl:w-[500px]"
              aria-label={`打开 ${university.name} 院校信息`}
            >
              <div className="relative h-[220px] overflow-hidden rounded-[34px] bg-slate-200 shadow-[0_34px_90px_rgba(15,23,42,0.28)] ring-1 ring-white/70 transition duration-500 group-hover:-translate-y-3 group-hover:rotate-[0.6deg] group-hover:shadow-[0_46px_110px_rgba(8,47,73,0.26)] sm:h-[280px] xl:h-[320px]">
                <img src={university.imageUrl} alt={university.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/78 via-slate-950/18 to-white/10" />
                <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                  <span className="rounded-full border border-white/35 bg-white/20 px-4 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-md sm:text-sm">
                    {university.focus}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-lg transition group-hover:bg-cyan-300 sm:h-12 sm:w-12">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-3xl font-semibold tracking-[-0.055em] text-white sm:text-5xl">{university.shortName}</h3>
                  <div className="mt-3 flex items-center gap-2 text-base font-medium text-white/78">
                    <MapPin className="h-5 w-5" />
                    {university.location}
                  </div>
                </div>
              </div>
              <div className="university-reflection pointer-events-none relative mx-8 h-20 overflow-hidden rounded-b-[34px] opacity-40 blur-[0.2px] sm:h-24">
                <img src={university.imageUrl} alt="" className="h-[220px] w-full origin-top scale-y-[-1] object-cover sm:h-[280px] xl:h-[320px]" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-white/8 via-[#f6f8fb]/72 to-[#f6f8fb]" />
              </div>
              <div className="mx-12 -mt-14 h-12 rounded-full bg-slate-950/20 blur-3xl transition group-hover:bg-cyan-950/20" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
