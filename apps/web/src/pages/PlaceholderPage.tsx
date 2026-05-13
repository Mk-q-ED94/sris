import type { PageKey } from "../components/AppShell";
import { useI18n } from "../contexts/I18nContext";

export function PlaceholderPage({ page }: { page: PageKey }) {
  const { t } = useI18n();
  const item = t.pages[page];
  return (
    <section className="grid min-h-[70vh] place-items-center">
      <div className="max-w-2xl rounded-[34px] border border-white/80 bg-white/75 p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mx-auto mb-5 h-2 w-16 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400" />
        <h1 className="text-4xl font-semibold tracking-[-0.05em]">{item.title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-500">{item.description}</p>
        <p className="mt-6 text-sm text-slate-400">{t.placeholderNote}</p>
      </div>
    </section>
  );
}
