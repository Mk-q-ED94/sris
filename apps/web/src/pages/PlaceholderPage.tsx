import type { PageKey } from "../components/AppShell";
import { useI18n } from "../contexts/I18nContext";

const PAGE_INDEX: Record<PageKey, string> = {
  dashboard: "01",
  universities: "02",
  professors: "03",
  labs: "04",
  programs: "05",
  requirements: "06",
  papers: "07",
  review: "08",
  timeline: "09",
  sources: "10",
  conflicts: "11",
};

export function PlaceholderPage({ page }: { page: PageKey }) {
  const { t } = useI18n();
  const item = t.pages[page];
  return (
    <section className="min-h-[60vh]">
      <div className="flex items-center gap-3">
        <span className="rule-accent" />
        <span className="section-index">
          {PAGE_INDEX[page]} — {item.title}
        </span>
      </div>
      <h1 className="serif mt-6 text-[44px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[60px]">
        {item.title}
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[var(--color-muted)]">{item.description}</p>
      <div className="mt-12 border-t border-[var(--color-hairline-strong)] pt-6">
        <div className="mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">Status</div>
        <div className="mt-2 text-[13px] text-[var(--color-muted)]">{t.placeholderNote}</div>
      </div>
    </section>
  );
}
