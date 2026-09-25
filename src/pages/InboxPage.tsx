import { Link } from "react-router-dom";
import { EmailDashboard } from "../components/EmailDashboard";
import { EmptyState } from "../components/EmptyState";
import { getLatestActiveAccount } from "../services/emailService";

/** Route /inbox — inbox of the most recently created active address. */
export function InboxPage() {
  const account = getLatestActiveAccount();

  if (!account) {
    return (
      <EmptyState
        title="No active temporary email"
        message="Create a temporary email address first — your demo inbox will appear here."
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
