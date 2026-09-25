import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { UsageList } from "../components/UsageList";
import {
  addWebsiteUsage,
  getLatestActiveAccount,
} from "../services/emailService";
import type { TemporaryEmail } from "../types";

/** Route /usage — "where was it used" for the latest active address. */
export function UsagePage() {
  const [account, setAccount] = useState<TemporaryEmail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestActiveAccount()
      .then((a) => setAccount(a ?? null))
      .catch(() => setAccount(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState message="Loading usage..." />;
  }

  if (!account) {
    return (
      <EmptyState
        title="No active temporary email"
        message="Usage tracking appears here once you create a temporary email address."
        action={
          <Link
            to="/#create"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Create Temporary Email
          </Link>
        }
      />
    );
  }

  const handleAdd = async (website: string) => {
    await addWebsiteUsage(account.id, website);
    setAccount((await getLatestActiveAccount()) ?? null);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Email Usage</h1>
        <p className="mt-1 font-mono text-sm text-slate-500 dark:text-slate-400">
          {account.address}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Addresses and usage are stored in Supabase.
        </p>
      </div>
      <UsageList usages={account.websitesUsed} onAdd={handleAdd} />
    </div>
  );
}
