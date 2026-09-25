import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmailDashboard } from "../components/EmailDashboard";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { getLatestActiveAccount } from "../services/emailService";
import type { TemporaryEmail } from "../types";

/** Route /inbox — inbox of the most recently created active address. */
export function InboxPage() {
  const [account, setAccount] = useState<TemporaryEmail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestActiveAccount()
      .then((a) => setAccount(a ?? null))
      .catch(() => setAccount(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState message="Loading inbox..." />;
  }

  if (!account) {
    return (
      <EmptyState
        title="No active temporary email"
        message="Create a temporary email address first — your inbox will appear here."
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

  return <EmailDashboard key={account.id} accountId={account.id} />;
}
