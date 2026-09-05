// The chosen language, available anywhere without threading a prop through
// every screen.
//
// Language reaches two places: the dictionary of interface strings, and the
// `lang` parameter on content requests. Both come from here, so the switcher
// moves them together — previously the toggle changed a prop that only the
// catalogue happened to read, which is why it looked broken everywhere else.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { strings, type Strings } from "@/i18n/strings";
import { languageStorage } from "@/lib/storage";
import type { Language } from "@/types/api";

const DEFAULT_LANGUAGE: Language = "ru";

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  /** Interface strings for the current language. */
  t: Strings;
}

const LanguageContext = createContext<LanguageState | null>(null);

function readStored(): Language {
  return languageStorage.get() === "kz" ? "kz" : DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStored);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    languageStorage.set(next);
    // The <html lang> attribute matters for screen readers and for the
    // hyphenation and font fallbacks the browser picks.
    document.documentElement.lang = next;
  }, []);

  // index.html ships with lang="ru"; a stored Kazakh choice has to correct it
  // on first paint, not only when the toggle is next used.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageState>(
    () => ({ language, setLanguage, t: strings(language) }),
    [language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageState {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}

/** Shorthand for components that only need the strings. */
export function useStrings(): Strings {
  return useLanguage().t;
}
