import { Link } from "react-router-dom";
import { isExpired } from "../services/emailService";
import type { TemporaryEmail } from "../types";
import { CountdownTimer } from "./CountdownTimer";
import { ExpirationBadge } from "./ExpirationBadge";

interface EmailCardProps {
  account: TemporaryEmail;
  onDelete: (id: string) => void;
}

/** One row in "My Emails": address, expiry, email count, open/delete actions. */
export function EmailCard({ account, onDelete }: EmailCardProps) {
  const expired = isExpired(account);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-mono text-sm font-semibold text-slate-900 dark:text-white">
            {account.address}
          </p>
          <ExpirationBadge account={account} />
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {expired ? (
            "Expired"
          ) : (
            <CountdownTimer expiresAt={account.expiresAt} variant="full" />
          )}{" "}
          <span className="text-slate-300 dark:text-slate-700">•</span>{" "}
          {account.emails.length} {account.emails.length === 1 ? "email" : "emails"}
        </p>
      </div>
      <div className="flex gap-2">
        <Link
          to={`/email/${account.id}`}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          {expired ? "View History" : "Open"}
        </Link>
        <button
          type="button"
          onClick={() => onDelete(account.id)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
