import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCountdown } from "../hooks/useCountdown";
import {
  addWebsiteUsage,
  deleteAccount,
  deleteInboxEmail,
  getAccount,
  getUnreadCount,
  isExpired,
  markEmailAsRead,
  refreshInbox,
} from "../services/emailService";
import type { TemporaryEmail } from "../types";
import { CopyButton } from "./CopyButton";
import { CountdownTimer } from "./CountdownTimer";
import { EmailViewer } from "./EmailViewer";
import { EmptyState } from "./EmptyState";
import { ExpirationBadge } from "./ExpirationBadge";
import { InboxList } from "./InboxList";
import { LoadingState } from "./LoadingState";
import { UsageList } from "./UsageList";

interface EmailDashboardProps {
  accountId: string;
}

/**
 * The main screen after creating an email: address + live countdown,
 * demo inbox (list + viewer), usage table, and actions.
 * Used by both the Inbox page and the per-email detail page.
 */
export function EmailDashboard({ accountId }: EmailDashboardProps) {
  const navigate = useNavigate();
  const [account, setAccount] = useState<TemporaryEmail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setAccount((await getAccount(accountId)) ?? null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load this email.");
    }
  }, [accountId]);

  // `key` from the parent remounts this component per address, so this effect
  // only runs on mount.
  useEffect(() => {
    let cancelled = false;
    getAccount(accountId).then(
      (a) => {
        if (cancelled) return;
        setAccount(a ?? null);
        setLoading(false);
      },
      (e: unknown) => {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Could not load this email.");
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [accountId]);

  // Live tick so the UI flips to "Expired" the second the timer hits zero.
  // `expired` is derived during render — no effect needed.
  const { expired: timerExpired } = useCountdown(account?.expiresAt ?? "");
  const expired = !account || isExpired(account) || timerExpired;

  if (loading) {
    return <LoadingState message="Loading inbox..." />;
  }

  if (loadError) {
    return (
      <EmptyState
        title="Couldn't load this email"
        message={loadError}
        action={
          <Link
            to="/"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Create a new email
          </Link>
        }
      />
    );
  }

  if (!account) {
    return (
      <EmptyState
        title="Email not found"
        message="This temporary email doesn't exist. It may have been deleted."
        action={
          <Link
            to="/"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Create a new email
          </Link>
        }
      />
    );
  }

  const unread = getUnreadCount(account);
  const selectedEmail = account.emails.find((e) => e.id === selectedId) ?? null;

  const handleRefresh = async () => {
    if (expired) return;
    await refreshInbox(accountId);
    await reload();
  };

  const handleSelect = async (id: string) => {
    await markEmailAsRead(accountId, id);
    setSelectedId(id);
    await reload();
  };

  const handleDeleteEmail = async (id: string) => {
    await deleteInboxEmail(accountId, id);
    if (selectedId === id) setSelectedId(null);
    await reload();
  };

  const handleAddWebsite = async (website: string) => {
    await addWebsiteUsage(accountId, website);
    await reload();
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(`Delete ${account.address}? This removes it from the database.`)) {
      await deleteAccount(accountId);
      navigate("/emails");
    }
  };

  return (
    <div className="space-y-6">
      {/* Address + countdown card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Temporary Email
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="break-all font-mono text-lg font-bold text-slate-900 dark:text-white">
                {account.address}
              </p>
              <CopyButton text={account.address} />
            </div>
          </div>
          <ExpirationBadge account={account} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <CountdownTimer
            expiresAt={account.expiresAt}
            variant="full"
            className={`text-2xl ${expired ? "" : "text-slate-900 dark:text-white"}`}
          />
          <button
            type="button"
            onClick={handleRefresh}
            disabled={expired}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Refresh Inbox
          </button>
        </div>

        {expired && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            Email Expired — inbox actions are disabled. Create a new temporary
            email to continue.
          </div>
        )}
      </div>

      {/* Inbox */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Inbox</h2>
          {unread > 0 && !expired && (
            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
              {unread} unread
            </span>
          )}
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <InboxList
              emails={account.emails}
              selectedId={selectedId}
              onSelect={handleSelect}
              disabled={expired}
            />
          </div>
          <div className="lg:col-span-3">
            <EmailViewer
              email={selectedEmail}
              accountAddress={account.address}
              onDelete={handleDeleteEmail}
              disabled={expired}
            />
          </div>
        </div>
      </div>

      {/* Usage */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Usage</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {account.websitesUsed.length} {account.websitesUsed.length === 1 ? "website" : "websites"}
          </span>
        </div>
        <UsageList usages={account.websitesUsed} onAdd={handleAddWebsite} disabled={expired} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Link
          to="/"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Create New Email
        </Link>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Delete Email
        </button>
      </div>
    </div>
  );
}
