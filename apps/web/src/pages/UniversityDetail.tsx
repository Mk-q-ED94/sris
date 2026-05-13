import { ArrowLeft, ArrowUpRight, BookOpen, Globe2, MapPin } from "lucide-react";
import { featuredUniversities, findFeaturedUniversity } from "../data/universities";
import { useI18n } from "../contexts/I18nContext";

export function UniversityDetail({
  universityId,
  onBack,
}: {
  universityId: string | null;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const university = findFeaturedUniversity(universityId) ?? featuredUniversities[0];
  const index = featuredUniversities.findIndex((u) => u.id === university.id) + 1;

  return (
    <div className="space-y-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-todai)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t.university.backToOverview}
      </button>

      <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
        <div>
          <div className="flex items-center gap-3">
            <span className="rule-accent" />
            <span className="section-index">
              {String(index).padStart(2, "0")} — {t.university.featured}
            </span>
          </div>
          <h1 className="serif mt-6 text-[42px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[58px]">
            {university.name}
          </h1>
          <div className="mt-6 grid grid-cols-2 border-y border-[var(--color-hairline-strong)]">
            <InfoCell icon={MapPin} label={t.university.location} value={university.location} />
            <InfoCell icon={BookOpen} label={t.university.focus} value={university.focus} />
          </div>

          <div className="mt-10">
            <div className="section-index">Notes</div>
            <h2 className="serif mt-3 text-[22px] font-semibold tracking-[-0.01em]">
              {t.university.notesTitle}
            </h2>
            <p className="mt-4 text-[14px] leading-[1.85] text-[var(--color-muted)]">{t.university.notesBody}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={university.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 bg-[var(--color-ink)] px-5 text-[12.5px] font-medium text-white transition-colors hover:bg-[var(--color-todai)]"
            >
              <Globe2 className="h-4 w-4" />
              {t.university.officialSite}
            </a>
            <a
              href={university.imageSource}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-5 text-[12.5px] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
            >
              {t.university.imageSource}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden border border-[var(--color-hairline-strong)] bg-[var(--color-paper)]">
            <img src={university.imageUrl} alt={university.name} className="h-full w-full object-cover" />
          </div>
          <div className="mono mt-3 flex items-center justify-between text-[10.5px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
            <span>Image · {university.imageCredit}</span>
            <span>{String(index).padStart(2, "0")} / {featuredUniversities.length}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="border-l border-[var(--color-hairline)] px-5 py-5 first:border-l-0">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[var(--color-subtle)]" />
        <span className="mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--color-muted)]">{label}</span>
      </div>
      <div className="serif mt-2 text-[18px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">{value}</div>
    </div>
  );
}
