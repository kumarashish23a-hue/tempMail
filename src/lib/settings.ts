import { siteConfig } from "../config/siteConfig";
import type { AppSettings, ThemePreference } from "../types";

// ─── Demo settings (localStorage) ───────────────────────────────────────────
// Theme, default expiration, and the notifications toggle live here.
// No settings are ever sent anywhere — this is a frontend-only demo.

export const SETTINGS_KEY = "tempmail.settings.v1";

export const defaultSettings: AppSettings = {
  theme: "dark",
  defaultExpirationMinutes: siteConfig.defaultExpirationMinutes,
  notifyOnEmail: true,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/** Applies the theme to <html> and returns the effective "light" | "dark". */
export function applyThemePreference(preference: ThemePreference): "light" | "dark" {
  const systemDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const effective: "light" | "dark" =
    preference === "system" ? (systemDark ? "dark" : "light") : preference;
  document.documentElement.classList.toggle("dark", effective === "dark");
  return effective;
}
