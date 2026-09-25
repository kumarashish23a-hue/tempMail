import { useState } from "react";
import { Link } from "react-router-dom";
import { EmailCard } from "../components/EmailCard";
import { EmptyState } from "../components/EmptyState";
import { deleteAccount, getAccounts } from "../services/emailService";
import type { TemporaryEmail } from "../types";

/** Route /emails — all temporary addresses ever created (localStorage). */
export function MyEmailsPage() {
  const [accounts, setAccounts] = useState<TemporaryEmail[]>(() => getAccounts());

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this temporary email? This only removes the demo data.")) {
      deleteAccount(id);
      setAccounts(getAccounts());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          My Temporary Emails
        </h1>
        <Link
          to="/#create"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Create New
        </Link>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          title="No temporary emails yet"
          message="Generate your first temporary email address to see it listed here."
          action={
            <Link
              to="/#create"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Create Temporary Email
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <EmailCard key={account.id} account={account} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
