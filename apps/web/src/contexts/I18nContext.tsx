import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { LANG_LABELS, LOCALES, type LangCode, type Locale } from "../i18n/locales";

interface I18nContextValue {
  lang: LangCode;
  setLang: (next: LangCode) => void;
  t: Locale;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readInitialLang(): LangCode {
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem("sris_lang") : null;
  if (stored === "zh" || stored === "en" || stored === "ja") return stored;
  if (typeof navigator !== "undefined") {
    const code = navigator.language.toLowerCase();
    if (code.startsWith("ja")) return "ja";
    if (code.startsWith("en")) return "en";
  }
  return "zh";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => readInitialLang());

  const setLang = useCallback((next: LangCode) => {
    setLangState(next);
    localStorage.setItem("sris_lang", next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = LOCALES[lang].htmlLang;
  }, [lang]);

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, t: LOCALES[lang] }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export { LANG_LABELS };
