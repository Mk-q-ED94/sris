import { ArrowLeft, ArrowUpRight, BookOpen, Globe2, MapPin, Sparkles } from "lucide-react";
import { featuredUniversities, findFeaturedUniversity } from "../data/universities";

export function UniversityDetail({
  universityId,
  onBack,
}: {
  universityId: string | null;
  onBack: () => void;
}) {
  const university = findFeaturedUniversity(universityId) ?? featuredUniversities[0];

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-10 items-center gap-2 rounded-2xl bg-white/80 px-4 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200/70 transition hover:bg-white hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        返回总览
      </button>

      <section className="overflow-hidden rounded-[34px] border border-white/80 bg-white/75 shadow-[0_28px_90px_rgba(15,23,42,0.10)] backdrop-blur-xl">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[340px] overflow-hidden lg:min-h-[520px]">
            <img src={university.imageUrl} alt={university.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/74 via-slate-950/18 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/18 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
                <Sparkles className="h-4 w-4" />
                Featured target
              </div>
              <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.055em] text-white sm:text-6xl">{university.name}</h1>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard icon={MapPin} label="地点" value={university.location} />
              <InfoCard icon={BookOpen} label="关注方向" value={university.focus} />
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-5">
              <h2 className="text-lg font-semibold tracking-[-0.03em]">申请情报笔记</h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                这里会承接后续完整院校数据库：项目、教授、实验室、论文信号、DDL 和申请材料状态都会聚合到这个视图。当前版本先把入口和视觉骨架打通。
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={university.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5"
              >
                <Globe2 className="h-4 w-4" />
                官方网站
              </a>
              <a
                href={university.imageSource}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:text-slate-950"
              >
                图片来源
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <p className="mt-5 text-xs text-slate-400">Image: {university.imageCredit}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}
