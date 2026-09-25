import { useState } from "react";
import { siteConfig } from "../config/siteConfig";
import { loadSettings, saveSettings } from "../lib/settings";
import type { AppSettings, ThemePreference } from "../types";
import type { useTheme } from "../hooks/useTheme";

interface SettingsPageProps {
  theme: ReturnType<typeof useTheme>;
}

/** Route /settings — appearance, default expiration, notifications, privacy. */
export function SettingsPage({ theme }: SettingsPageProps) {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  const update = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  const themeOptions: { value: ThemePreference; label: string; hint: string }[] = [
    { value: "light", label: "Light", hint: "Bright theme" },
    { value: "dark", label: "Dark", hint: "Dark theme (default)" },
    { value: "system", label: "System", hint: "Follow your device" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>

      {/* Appearance */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">Appearance</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {themeOptions.map((opt) => {
            const selected = theme.preference === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  theme.setPreference(opt.value);
                  update({ theme: opt.value });
                }}
                className={`rounded-xl border p-3 text-left ${
                  selected
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                }`}
              >
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                  {opt.label}
                </span>
                <span className="block text-xs text-slate-400">{opt.hint}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Default expiration */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">Default expiration</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Pre-selected duration when creating a new temporary email.
        </p>
        <select
          value={String(settings.defaultExpirationMinutes)}
          onChange={(e) => update({ defaultExpirationMinutes: parseInt(e.target.value, 10) })}
          className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          {siteConfig.durations.map((d) => (
            <option key={d.minutes} value={String(d.minutes)}>
              {d.label}
            </option>
          ))}
        </select>
      </section>

      {/* Notifications */}
      {siteConfig.features.notifications && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Notifications</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Notify me when an email is received. UI only — no real notifications
                in this demo.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.notifyOnEmail}
              onClick={() => update({ notifyOnEmail: !settings.notifyOnEmail })}
              className={`relative h-6 w-11 shrink-0 rounded-full ${
                settings.notifyOnEmail ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  settings.notifyOnEmail ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </section>
      )}

      {/* Privacy */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">Privacy</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{siteConfig.demoNotice}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {siteConfig.privacyNotice}
        </p>
      </section>
    </div>
  );
}
