import { siteConfig } from "../config/siteConfig";
import { buildSeedAccounts } from "../data/mockAccounts";
import { mockInboxTemplates } from "../data/mockEmails";
import type { Email, TemporaryEmail, WebsiteUsage } from "../types";

// ─── Demo service layer ─────────────────────────────────────────────────────
// Every function below works with mock data + localStorage. There are NO
// network requests anywhere in this file.
//
// TO CONNECT A REAL BACKEND LATER: replace the body of each function with a
// fetch() call to your API (e.g. POST /api/emails, GET /api/emails/:id/inbox).
// The UI only ever calls these functions, so nothing else needs to change.

const STORAGE_KEY = "tempmail.accounts.v1";

function randomId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9)}`;
}

const USERNAME_WORDS = [
  "alex", "sam", "jordan", "taylor", "max", "leo", "mia",
  "noah", "ivy", "kai", "ruby", "finn",
];

function randomUsername(): string {
  const word = USERNAME_WORDS[Math.floor(Math.random() * USERNAME_WORDS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${word}${num}`;
}

/** Demo inbox: a new address starts with 3 mock emails, 2/5/8 minutes old. */
function seedInbox(now: number): Email[] {
  const offsetsMinutes = [2, 5, 8];
  return offsetsMinutes.map((offset, i) => {
    const t = mockInboxTemplates[i % mockInboxTemplates.length];
    return {
      id: randomId("email"),
      senderName: t.senderName,
      sender: t.sender,
      subject: t.subject,
      body: t.body,
      otp: t.otp,
      hasAttachments: t.hasAttachments,
      receivedAt: new Date(now - offset * 60_000).toISOString(),
      read: false,
    };
  });
}

function readStored(): TemporaryEmail[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TemporaryEmail[]) : null;
  } catch {
    return null;
  }
}

function persist(accounts: TemporaryEmail[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // Storage full or unavailable — the demo still works in memory.
  }
}

/** Recompute active/expired from expiresAt so old addresses expire on load. */
function withFreshStatus(accounts: TemporaryEmail[]): TemporaryEmail[] {
  const now = Date.now();
  return accounts.map((a) => ({
    ...a,
    status: new Date(a.expiresAt).getTime() <= now ? "expired" : "active",
  }));
}

function loadAccounts(): TemporaryEmail[] {
  const stored = readStored();
  if (stored) return withFreshStatus(stored);
  const seeded = withFreshStatus(buildSeedAccounts());
  persist(seeded);
  return seeded;
}

function saveAccount(updated: TemporaryEmail): void {
  const accounts = loadAccounts().map((a) => (a.id === updated.id ? updated : a));
  persist(accounts);
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function createTemporaryEmail(opts: {
  username?: string;
  durationMinutes: number;
}): TemporaryEmail {
  const username = opts.username?.trim() || randomUsername();
  const now = Date.now();
  const account: TemporaryEmail = {
    id: randomId("account"),
    address: `${username}@${siteConfig.domain}`,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + opts.durationMinutes * 60_000).toISOString(),
    status: "active",
    emails: seedInbox(now),
    websitesUsed: [],
  };
  persist([account, ...loadAccounts()]);
  return account;
}

export function getAccounts(): TemporaryEmail[] {
  return loadAccounts();
}

export function getAccount(id: string): TemporaryEmail | undefined {
  return loadAccounts().find((a) => a.id === id);
}

/** Most recently created address that hasn't expired yet. */
export function getLatestActiveAccount(): TemporaryEmail | undefined {
  return loadAccounts().find((a) => a.status === "active");
}

export function deleteAccount(id: string): void {
  persist(loadAccounts().filter((a) => a.id !== id));
}

export function getInbox(accountId: string): Email[] {
  const account = getAccount(accountId);
  if (!account) return [];
  return [...account.emails].sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
  );
}

export function getEmail(accountId: string, emailId: string): Email | undefined {
  return getAccount(accountId)?.emails.find((e) => e.id === emailId);
}

export function markEmailAsRead(accountId: string, emailId: string): void {
  const account = getAccount(accountId);
  if (!account) return;
  saveAccount({
    ...account,
    emails: account.emails.map((e) => (e.id === emailId ? { ...e, read: true } : e)),
  });
}

export function deleteInboxEmail(accountId: string, emailId: string): void {
  const account = getAccount(accountId);
  if (!account) return;
  saveAccount({ ...account, emails: account.emails.filter((e) => e.id !== emailId) });
}

/**
 * Simulates a new email arriving (the "Refresh" button). Picks the next mock
 * template not already in the inbox, cycling back to the start when exhausted.
 * Returns the new email, or null if the account doesn't exist / is expired.
 */
export function simulateIncomingEmail(accountId: string): Email | null {
  const account = getAccount(accountId);
  if (!account || account.status === "expired") return null;

  const usedSubjects = new Set(account.emails.map((e) => e.subject));
  const template =
    mockInboxTemplates.find((t) => !usedSubjects.has(t.subject)) ??
    mockInboxTemplates[account.emails.length % mockInboxTemplates.length];

  const email: Email = {
    id: randomId("email"),
    senderName: template.senderName,
    sender: template.sender,
    subject: template.subject,
    body: template.body,
    otp: template.otp,
    hasAttachments: template.hasAttachments,
    receivedAt: new Date().toISOString(),
    read: false,
  };
  saveAccount({ ...account, emails: [email, ...account.emails] });
  return email;
}

export function getUsage(accountId: string): WebsiteUsage[] {
  return getAccount(accountId)?.websitesUsed ?? [];
}

export function addWebsiteUsage(accountId: string, website: string): WebsiteUsage | null {
  const account = getAccount(accountId);
  const name = website.trim();
  if (!account || !name) return null;
  if (account.websitesUsed.some((w) => w.website.toLowerCase() === name.toLowerCase())) {
    return null; // already listed
  }
  const usage: WebsiteUsage = {
    website: name,
    firstSeen: new Date().toISOString(),
    status: "active",
  };
  saveAccount({ ...account, websitesUsed: [...account.websitesUsed, usage] });
  return usage;
}

export function isExpired(account: TemporaryEmail): boolean {
  return account.status === "expired" || new Date(account.expiresAt).getTime() <= Date.now();
}

export function getUnreadCount(account: TemporaryEmail): number {
  return account.emails.filter((e) => !e.read).length;
}
