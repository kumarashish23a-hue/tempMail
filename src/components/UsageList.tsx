import { useState } from "react";
import { siteConfig } from "../config/siteConfig";
import { formatTime } from "../hooks/useCountdown";
import type { WebsiteUsage } from "../types";

interface UsageListProps {
  usages: WebsiteUsage[];
  onAdd: (website: string) => void;
  disabled?: boolean;
}

/** "Where this email was used" — mock list of websites + demo add form. */
export function UsageList({ usages, onAdd, disabled = false }: UsageListProps) {
  const [website, setWebsite] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!website.trim()) return;
    onAdd(website);
    setWebsite("");
    setShowForm(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Where this email was used
        </h3>
        {siteConfig.features.addWebsite && !disabled && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Add Website
          </button>
        )}
      </div>

      {showForm && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="example.com"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Add
          </button>
        </div>
      )}

      {usages.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">
          Not used anywhere yet. (Demo data — nothing is tracked for real.)
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="pb-2 pr-4 font-medium">Website</th>
                <th className="pb-2 pr-4 font-medium">First Seen</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {usages.map((u) => (
                <tr key={u.website}>
                  <td className="py-2.5 pr-4 font-medium text-slate-800 dark:text-slate-200">
                    {u.website}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400">
                    {formatTime(u.firstSeen)}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        u.status === "active" ? "text-green-600 dark:text-green-400" : "text-slate-400"
                      }`}
                    >
                      {u.status === "active" ? "✓ Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
