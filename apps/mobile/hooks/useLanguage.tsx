import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { translations, type Locale } from "../i18n";

type Translations = typeof translations.en;
type LanguageContextValue = {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "app_language";
const DEFAULT_LOCALE: Locale = "en";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        if (stored === "en" || stored === "hi") {
          setLocaleState(stored);
        }
      } catch {
        // SecureStore unavailable — use default
      }
      setReady(true);
    })();
  }, []);

  const setLocale = useCallback(async (newLocale: Locale) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, newLocale);
    } catch {
      // Swallow — preference is best-effort
    }
    setLocaleState(newLocale);
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{ locale, t: translations[locale], setLocale }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
