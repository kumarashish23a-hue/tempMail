import { timeAgo } from "../hooks/useCountdown";
import type { Email } from "../types";

interface InboxListProps {
  emails: Email[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

/** Left column of the inbox: the list of received demo emails. */
export function InboxList({ emails, selectedId, onSelect, disabled = false }: InboxListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Inbox</h3>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          Demo Inbox
        </span>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {emails.map((email) => {
          const selected = email.id === selectedId;
          return (
            <li key={email.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(email.id)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left ${
                  selected
                    ? "bg-indigo-50 dark:bg-indigo-950/40"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    email.read ? "bg-transparent" : "bg-indigo-500"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span
                      className={`truncate text-sm ${
                        email.read
                          ? "font-medium text-slate-700 dark:text-slate-300"
                          : "font-bold text-slate-900 dark:text-white"
                      }`}
                    >
                      {email.senderName}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {timeAgo(email.receivedAt)}
                    </span>
                  </span>
                  <span className="block truncate text-sm text-slate-500 dark:text-slate-400">
                    {email.subject}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
