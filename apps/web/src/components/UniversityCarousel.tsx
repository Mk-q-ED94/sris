import { ArrowUpRight, MapPin } from "lucide-react";
import { featuredUniversities } from "../data/universities";

export function UniversityCarousel({ onSelect }: { onSelect: (id: string) => void }) {
  const carouselItems = [...featuredUniversities, ...featuredUniversities];

  return (
    <section className="overflow-hidden rounded-[34px] border border-white/80 bg-white/70 px-4 py-5 shadow-[0_26px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-600">Target schools</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-slate-950">目标院校快速入口</h2>
        </div>
        <div className="hidden text-right text-xs leading-5 text-slate-400 sm:block">
          自动轮播 · 点击进入院校信息
        </div>
      </div>

      <div className="university-carousel-mask relative">
        <div className="university-carousel-track flex w-max gap-5 py-5">
          {carouselItems.map((university, index) => (
            <button
              key={`${university.id}-${index}`}
              type="button"
              onClick={() => onSelect(university.id)}
              className="university-card group relative w-[270px] shrink-0 text-left sm:w-[330px]"
              aria-label={`打开 ${university.name} 院校信息`}
            >
              <div className="relative h-[190px] overflow-hidden rounded-[30px] bg-slate-200 shadow-[0_28px_70px_rgba(15,23,42,0.22)] ring-1 ring-white/70 transition duration-500 group-hover:-translate-y-2 group-hover:rotate-[0.6deg] group-hover:shadow-[0_36px_90px_rgba(8,47,73,0.24)] sm:h-[220px]">
                <img src={university.imageUrl} alt={university.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/78 via-slate-950/18 to-white/10" />
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                  <span className="rounded-full border border-white/35 bg-white/20 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                    {university.focus}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-lg transition group-hover:bg-cyan-300">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-semibold tracking-[-0.045em] text-white">{university.shortName}</h3>
                  <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-white/78">
                    <MapPin className="h-4 w-4" />
                    {university.location}
                  </div>
                </div>
              </div>
              <div className="university-reflection pointer-events-none relative mx-5 h-16 overflow-hidden rounded-b-[30px] opacity-45 blur-[0.2px]">
                <img src={university.imageUrl} alt="" className="h-[190px] w-full origin-top scale-y-[-1] object-cover sm:h-[220px]" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-white/15 via-[#f6f8fb]/70 to-[#f6f8fb]" />
              </div>
              <div className="mx-8 -mt-12 h-10 rounded-full bg-slate-950/20 blur-2xl transition group-hover:bg-cyan-950/20" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
