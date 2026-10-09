import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { translations, type Locale } from "../i18n";

type Translations = typeof translations.en;
type LanguageContextValue = {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  t: translations.en,
  setLocale: () => {},
});

const STORAGE_KEY = "upbhokta-setu-locale";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "hi") return stored;
    } catch {
      // localStorage unavailable
    }
    return "en";
  });

  const setLocale = useCallback((newLocale: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // Swallow
    }
    setLocaleState(newLocale);
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
