import { siteConfig } from "../config/siteConfig";
import { requireSupabase } from "../lib/supabase";
import type { Email, TemporaryEmail, WebsiteUsage } from "../types";

// ─── Supabase-backed service layer ──────────────────────────────────────────
// Every function below talks to Supabase (Postgres) instead of mock data.
// There are no other network calls in the app: the UI only ever calls the
// functions in this file, so this is the single place to change if the
// backend ever moves.
//
// Tables (created via the SQL in the README):
//   temp_addresses  — one row per temporary email address
//   emails          — inbox messages, linked by address_id
//   website_usage   — "where was this address used" rows
//
// "My" addresses: because there is no login, the browser keeps the list of
// address IDs it created in localStorage. getAccounts() only returns those,
// so you never see other people's addresses.

// ─── DB row shapes (snake_case) ─────────────────────────────────────────────

interface AddressRow {
  id: string;
  address: string;
  created_at: string;
  expires_at: string;
}

interface EmailRow {
  id: string;
  address_id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  body: string;
  otp: string | null;
  is_read: boolean;
  received_at: string;
}

interface UsageRow {
  id: string;
  address_id: string;
  website: string;
  first_seen_at: string;
}

// ─── "My addresses" tracking (localStorage) ─────────────────────────────────

const MY_IDS_KEY = "tempmail.my-address-ids.v1";

function readMyIds(): string[] {
  try {
    const raw = localStorage.getItem(MY_IDS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function addMyId(id: string): void {
  try {
    const ids = readMyIds();
    if (!ids.includes(id)) {
      localStorage.setItem(MY_IDS_KEY, JSON.stringify([id, ...ids]));
    }
  } catch {
    // Storage unavailable — the app still works, the list just won't persist.
  }
}

function removeMyId(id: string): void {
  try {
    localStorage.setItem(MY_IDS_KEY, JSON.stringify(readMyIds().filter((x) => x !== id)));
  } catch {
    // ignore
  }
}

// ─── Mappers (DB rows → app types) ──────────────────────────────────────────

function toEmail(row: EmailRow): Email {
  return {
    id: row.id,
    senderName: row.sender_name,
    sender: row.sender_email,
    subject: row.subject,
    body: row.body,
    otp: row.otp ?? undefined,
    receivedAt: row.received_at,
    read: row.is_read,
    hasAttachments: false,
  };
}

function toUsage(row: UsageRow): WebsiteUsage {
  return {
    website: row.website,
    firstSeen: row.first_seen_at,
    status: "active",
  };
}

function freshStatus(expiresAt: string): TemporaryEmail["status"] {
  return new Date(expiresAt).getTime() <= Date.now() ? "expired" : "active";
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

// ─── Public API ─────────────────────────────────────────────────────────────

async function loadAccount(id: string): Promise<TemporaryEmail | undefined> {
  const sb = requireSupabase();
  const { data: addr, error: addrError } = await sb
    .from("temp_addresses")
    .select("*")
    .eq("id", id)
    .single();
  if (addrError || !addr) return undefined;

  const [emailsRes, usageRes] = await Promise.all([
    sb.from("emails").select("*").eq("address_id", id).order("received_at", { ascending: false }),
    sb.from("website_usage").select("*").eq("address_id", id).order("first_seen_at", { ascending: true }),
  ]);
  if (emailsRes.error) throw new Error(`Could not load inbox: ${emailsRes.error.message}`);
  if (usageRes.error) throw new Error(`Could not load usage: ${usageRes.error.message}`);

  const row = addr as AddressRow;
  return {
    id: row.id,
    address: row.address,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    status: freshStatus(row.expires_at),
    emails: ((emailsRes.data ?? []) as EmailRow[]).map(toEmail),
    websitesUsed: ((usageRes.data ?? []) as UsageRow[]).map(toUsage),
  };
}

export async function createTemporaryEmail(opts: {
  username?: string;
  durationMinutes: number;
}): Promise<TemporaryEmail> {
  const sb = requireSupabase();
  const username = opts.username?.trim() || randomUsername();
  const address = `${username}@${siteConfig.domain}`;
  const expiresAt = new Date(Date.now() + opts.durationMinutes * 60_000).toISOString();

  const { data, error } = await sb
    .from("temp_addresses")
    .insert({ address, expires_at: expiresAt })
    .select()
    .single();
  if (error || !data) {
    throw new Error(`Could not create email address: ${error?.message ?? "unknown error"}`);
  }
  const row = data as AddressRow;
  addMyId(row.id);

  // Seed one welcome email (with a sample OTP) so the inbox, viewer, and
  // copy-code UI are demonstrable before real emails arrive via webhook.
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const { error: mailError } = await sb.from("emails").insert({
    address_id: row.id,
    sender_name: "TempMail Team",
    sender_email: `welcome@${siteConfig.domain}`,
    subject: "Welcome to your temporary inbox",
    body:
      `Your temporary address ${address} is ready.\n\n` +
      `Any email sent to this address will appear here once real email ` +
      `receiving is connected (domain + inbound email service — see README).\n\n` +
      `Here is a sample verification code so you can try the copy button:`,
    otp,
  });
  if (mailError) throw new Error(`Address created, but the welcome email failed: ${mailError.message}`);

  const account = await loadAccount(row.id);
  if (!account) throw new Error("Address was created but could not be loaded.");
  return account;
}

/** Addresses created in this browser, newest first. */
export async function getAccounts(): Promise<TemporaryEmail[]> {
  const ids = readMyIds();
  if (ids.length === 0) return [];
  const accounts = await Promise.all(ids.map((id) => loadAccount(id)));
  return accounts.filter((a): a is TemporaryEmail => a !== undefined);
}

export async function getAccount(id: string): Promise<TemporaryEmail | undefined> {
  return loadAccount(id);
}

/** Most recently created address that hasn't expired yet. */
export async function getLatestActiveAccount(): Promise<TemporaryEmail | undefined> {
  return (await getAccounts()).find((a) => a.status === "active");
}

export async function deleteAccount(id: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.from("temp_addresses").delete().eq("id", id);
  if (error) throw new Error(`Could not delete address: ${error.message}`);
  removeMyId(id); // emails + usage rows are removed by ON DELETE CASCADE
}

export async function getInbox(accountId: string): Promise<Email[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("emails")
    .select("*")
    .eq("address_id", accountId)
    .order("received_at", { ascending: false });
  if (error) throw new Error(`Could not load inbox: ${error.message}`);
  return ((data ?? []) as EmailRow[]).map(toEmail);
}

export async function getEmail(accountId: string, emailId: string): Promise<Email | undefined> {
  return (await getInbox(accountId)).find((e) => e.id === emailId);
}

export async function markEmailAsRead(accountId: string, emailId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from("emails")
    .update({ is_read: true })
    .eq("id", emailId)
    .eq("address_id", accountId);
  if (error) throw new Error(`Could not mark email as read: ${error.message}`);
}

export async function deleteInboxEmail(accountId: string, emailId: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb
    .from("emails")
    .delete()
    .eq("id", emailId)
    .eq("address_id", accountId);
  if (error) throw new Error(`Could not delete email: ${error.message}`);
}

/**
 * Re-fetch the inbox from Supabase (the "Refresh" button). Returns the
 * current messages, newest first. New emails appear here once the inbound
 * email webhook (see README) is connected.
 */
export async function refreshInbox(accountId: string): Promise<Email[]> {
  return getInbox(accountId);
}

export async function getUsage(accountId: string): Promise<WebsiteUsage[]> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("website_usage")
    .select("*")
    .eq("address_id", accountId)
    .order("first_seen_at", { ascending: true });
  if (error) throw new Error(`Could not load usage: ${error.message}`);
  return ((data ?? []) as UsageRow[]).map(toUsage);
}

export async function addWebsiteUsage(
  accountId: string,
  website: string,
): Promise<WebsiteUsage | null> {
  const sb = requireSupabase();
  const name = website.trim().toLowerCase();
  if (!name) return null;
  const existing = await getUsage(accountId);
  if (existing.some((w) => w.website.toLowerCase() === name)) return null; // already listed

  const { data, error } = await sb
    .from("website_usage")
    .insert({ address_id: accountId, website: name })
    .select()
    .single();
  if (error) {
    // Unique-violation race: treat as "already listed".
    if (error.code === "23505") return null;
    throw new Error(`Could not save website: ${error.message}`);
  }
  return toUsage(data as UsageRow);
}

// ─── Pure helpers (no network — safe to call during render) ─────────────────

export function isExpired(account: TemporaryEmail): boolean {
  return account.status === "expired" || new Date(account.expiresAt).getTime() <= Date.now();
}

export function getUnreadCount(account: TemporaryEmail): number {
  return account.emails.filter((e) => !e.read).length;
}
