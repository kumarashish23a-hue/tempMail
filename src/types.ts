// Shared data shapes for the TempMail prototype.
//
// These types are intentionally "backend-ready": they mirror what a real
// API would return, so the UI can stay untouched when a backend is added.

export type TemporaryEmailStatus = "active" | "expired";

export interface Email {
  id: string;
  /** Display name of the sender, e.g. "Amazon". */
  senderName: string;
  /** Raw sender address, e.g. "no-reply@amazon.example.com". */
  sender: string;
  subject: string;
  body: string;
  /** Present when the email contains a verification code. */
  otp?: string;
  /** ISO timestamp of when the email was received. */
  receivedAt: string;
  read: boolean;
  /** When true, the viewer shows an attachments placeholder. */
  hasAttachments?: boolean;
}

export interface WebsiteUsage {
  website: string;
  /** ISO timestamp of when the address was first used on this site. */
  firstSeen: string;
  status: "active" | "inactive";
}

export interface TemporaryEmail {
  id: string;
  address: string;
  /** ISO timestamp of when the address was created. */
  createdAt: string;
  /** ISO timestamp of when the address expires. */
  expiresAt: string;
  status: TemporaryEmailStatus;
  emails: Email[];
  websitesUsed: WebsiteUsage[];
}

export interface DurationOption {
  label: string;
  /** Lifetime of the address, in minutes. */
  minutes: number;
}

export type ThemePreference = "light" | "dark" | "system";

export interface AppSettings {
  theme: ThemePreference;
  defaultExpirationMinutes: number;
  /** UI-only toggle; no real notifications are sent in the demo. */
  notifyOnEmail: boolean;
}
