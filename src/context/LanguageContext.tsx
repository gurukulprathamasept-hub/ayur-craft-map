import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export type Lang = "en" | "hi";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  /**
   * Resolve a display name based on current language preference.
   * Falls back to the English name if Hindi is missing or language is "en".
   */
  displayName: (en: string, hi?: string | null) => string;
  /**
   * Render "English / देवनागरी" when both exist (used in printed BMR & detail views).
   */
  bothNames: (en: string, hi?: string | null) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "ayurrm.lang";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "hi" ? "hi" : "en";
  });

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch { /* noop */ }
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const displayName = useCallback((en: string, hi?: string | null) => {
    const trimmedHi = (hi || "").trim();
    if (lang === "hi" && trimmedHi) return trimmedHi;
    return en;
  }, [lang]);

  const bothNames = useCallback((en: string, hi?: string | null) => {
    const trimmedHi = (hi || "").trim();
    if (!trimmedHi) return en;
    return `${en} / ${trimmedHi}`;
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, displayName, bothNames }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
};
