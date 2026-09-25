import { useCallback, useEffect, useState } from "react";
import { loadSettings, saveSettings } from "../lib/settings";
import type { ThemePreference } from "../types";

/** Theme state shared by the header toggle and the settings page. */
export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(
    () => loadSettings().theme,
  );
  const [systemDark, setSystemDark] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  // Derived during render — never set inside an effect.
  const effective: "light" | "dark" =
    preference === "system" ? (systemDark ? "dark" : "light") : preference;

  // Sync the <html> class with the effective theme.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", effective === "dark");
  }, [effective]);

  // Follow OS theme changes while "System" is selected.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    saveSettings({ ...loadSettings(), theme: next });
  }, []);

  const toggle = useCallback(() => {
    const next: ThemePreference = effective === "dark" ? "light" : "dark";
    setPreferenceState(next);
    saveSettings({ ...loadSettings(), theme: next });
  }, [effective]);

  return { preference, effective, setPreference, toggle };
}
