import { isExpired } from "../services/emailService";
import type { TemporaryEmail } from "../types";

interface ExpirationBadgeProps {
  account: TemporaryEmail;
  className?: string;
}

/** Green "Active" pill or red "Expired" pill for a temporary email address. */
export function ExpirationBadge({ account, className = "" }: ExpirationBadgeProps) {
  const expired = isExpired(account);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        expired
          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
          : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
      } ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${expired ? "bg-red-500" : "bg-green-500"}`}
      />
      {expired ? "Expired" : "Active"}
    </span>
  );
}
