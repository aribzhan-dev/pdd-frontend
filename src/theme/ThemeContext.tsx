// Light or dark, available anywhere without threading a prop through.
//
// Until the student picks a side the system preference decides, and it keeps
// deciding — a laptop that switches to dark in the evening takes the app with
// it. The first explicit choice ends that: from then on the stored value wins,
// because someone who asked for dark at noon meant it.
//
// The resolved value is stamped on <html> as data-theme, so the stylesheet
// needs a single dark block rather than one for the attribute and a second
// behind a prefers-color-scheme query.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { themeStorage } from "@/lib/storage";

export type Theme = "light" | "dark";

const DARK_QUERY = "(prefers-color-scheme: dark)";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  /** True while no explicit choice has been made and the system decides. */
  isFollowingSystem: boolean;
}

const ThemeContext = createContext<ThemeState | null>(null);

function systemTheme(): Theme {
  // matchMedia is missing in some embedded webviews, and light is the safe
  // assumption there.
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function readStored(): Theme | null {
  const stored = themeStorage.get();
  return stored === "dark" || stored === "light" ? stored : null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<Theme | null>(readStored);
  const [system, setSystem] = useState<Theme>(systemTheme);

  const theme = stored ?? system;

  // Follow the system for as long as no choice has been made. The listener
  // stays attached either way: a stored choice can be made and unmade, and
  // re-subscribing on every change would be more code for no gain.
  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) =>
      setSystem(event.matches ? "dark" : "light");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // index.html stamps the attribute before the first paint; this keeps it in
  // step with every later change.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setStored(next);
    themeStorage.set(next);
  }, []);

  const toggleTheme = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [setTheme, theme],
  );

  const value = useMemo<ThemeState>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isFollowingSystem: stored === null,
    }),
    [theme, setTheme, toggleTheme, stored],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeState {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
