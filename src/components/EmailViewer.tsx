import { formatDateTime } from "../hooks/useCountdown";
import type { Email } from "../types";
import { CopyButton } from "./CopyButton";
import { EmptyState } from "./EmptyState";
import { OtpCard } from "./OtpCard";

interface EmailViewerProps {
  email: Email | null;
  /** The temporary address the email was sent to (for "Copy Email"). */
  accountAddress: string;
  onDelete: (emailId: string) => void;
  disabled?: boolean;
}

/** Right column of the inbox: the selected email with OTP card and actions. */
export function EmailViewer({ email, accountAddress, onDelete, disabled = false }: EmailViewerProps) {
  if (!email) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <EmptyState
          title="No email selected"
          message="Pick an email from the inbox list to read it here."
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{email.subject}</h3>

      <dl className="mt-4 space-y-2 border-b border-slate-100 pb-4 text-sm dark:border-slate-800">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 font-medium text-slate-400">From:</dt>
          <dd className="text-slate-700 dark:text-slate-300">
            {email.senderName} <span className="text-slate-400">&lt;{email.sender}&gt;</span>
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 font-medium text-slate-400">Received:</dt>
          <dd className="text-slate-700 dark:text-slate-300">{formatDateTime(email.receivedAt)}</dd>
        </div>
      </dl>

      {email.otp && (
        <div className="mt-4">
          <OtpCard otp={email.otp} />
        </div>
      )}

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {email.body}
      </p>

      {email.hasAttachments && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-400 dark:border-slate-700">
          Attachments (demo placeholder — no real files in this prototype)
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {email.otp && <CopyButton text={email.otp} label="Copy OTP" />}
        <CopyButton text={accountAddress} label="Copy Email" />
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(email.id)}
          className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
