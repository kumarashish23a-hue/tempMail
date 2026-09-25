import { useState } from "react";
import { siteConfig } from "../config/siteConfig";
import { loadSettings } from "../lib/settings";
import { createTemporaryEmail } from "../services/emailService";
import type { TemporaryEmail } from "../types";

interface EmailGeneratorProps {
  /** Called with the new demo address after "Generate Email" is clicked. */
  onCreated: (account: TemporaryEmail) => void;
}

/** Card with duration picker, optional custom username, and generate button. */
export function EmailGenerator({ onCreated }: EmailGeneratorProps) {
  const [duration, setDuration] = useState<string>(() =>
    String(loadSettings().defaultExpirationMinutes),
  );
  const [customMinutes, setCustomMinutes] = useState("45");
  const [username, setUsername] = useState("");

  const handleGenerate = () => {
    let minutes: number;
    if (duration === "custom") {
      minutes = Math.max(1, parseInt(customMinutes, 10) || 60);
    } else {
      minutes = parseInt(duration, 10);
    }
    // Allow pasting a full address — only the part before "@" is used.
    const cleanUsername = username.trim().split("@")[0].replace(/\s+/g, "");
    const account = createTemporaryEmail({
      username: cleanUsername || undefined,
      durationMinutes: minutes,
    });
    onCreated(account);
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        Create Temporary Email
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Pick how long the address stays active, then generate it. Demo only — no
        real emails are received.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="duration" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email duration
          </label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={inputClass}
          >
            {siteConfig.durations.map((d) => (
              <option key={d.minutes} value={String(d.minutes)}>
                {d.label}
              </option>
            ))}
            {siteConfig.allowCustomDuration && <option value="custom">Custom</option>}
          </select>
          {duration === "custom" && (
            <input
              type="number"
              min={1}
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              className={`${inputClass} mt-2`}
              placeholder="Minutes"
              aria-label="Custom duration in minutes"
            />
          )}
        </div>

        {siteConfig.allowCustomUsername && (
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email name <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Random"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-400">
              Leave empty for a random name, e.g. <span className="font-mono">myname@{siteConfig.domain}</span>
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 sm:w-auto sm:px-8"
      >
        Generate Email
      </button>
    </div>
  );
}
