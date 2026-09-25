// Core webhook logic for the inbound-email Edge Function.
// Pure: takes a Db interface, so it is unit-testable without Supabase.
import { extractOtp, validatePayload } from "./lib.ts";

export interface MailboxRow {
  id: string;
  address: string;
  expires_at: string;
}

export interface NewEmailRow {
  address_id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  body: string;
  otp?: string;
  provider_message_id: string;
  received_at: string;
}

/** Thrown by Db.insertEmail when provider_message_id already exists. */
export class DuplicateEmailError extends Error {}

export interface Db {
  findMailboxByAddress(address: string): Promise<MailboxRow | null>;
  /** Returns the new email id. Throws DuplicateEmailError on message-id conflict. */
  insertEmail(row: NewEmailRow): Promise<string>;
}

export interface HandleResult {
  status: number;
  body: Record<string, unknown>;
}

/**
 * Handle one inbound-email webhook call.
 *
 * 1. Authenticate (Bearer secret)      → 401, no retry
 * 2. Validate JSON                     → 400, no retry
 * 3. Find mailbox by recipient         → 200 {reason: mailbox_not_found}, no retry
 * 4. Check expiration                  → 200 {reason: mailbox_expired}, no retry
 * 5. Extract OTP, insert email         → 200 {success: true, messageId}
 * 6. Duplicate providerMessageId       → 200 {reason: duplicate}, no retry
 * Unexpected errors throw → caller maps to 500 (Worker retries once).
 */
export async function handleInboundEmail(
  payload: unknown,
  authHeader: string | null,
  expectedSecret: string,
  db: Db,
): Promise<HandleResult> {
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return { status: 401, body: { success: false, error: "unauthorized" } };
  }

  const validated = validatePayload(payload);
  if (!validated.ok) {
    return { status: 400, body: { success: false, error: validated.error } };
  }
  const email = validated.value;

  let mailbox: MailboxRow | null;
  try {
    mailbox = await db.findMailboxByAddress(email.recipient);
  } catch {
    throw new Error("mailbox lookup failed");
  }
  if (!mailbox) {
    return { status: 200, body: { success: false, reason: "mailbox_not_found" } };
  }
  if (new Date(mailbox.expires_at).getTime() <= Date.now()) {
    return { status: 200, body: { success: false, reason: "mailbox_expired" } };
  }

  const otp = extractOtp(`${email.subject}\n${email.text}`);

  try {
    const id = await db.insertEmail({
      address_id: mailbox.id,
      sender_name: email.sender.split("@")[0] || email.sender,
      sender_email: email.sender,
      subject: email.subject,
      body: email.text,
      ...(otp ? { otp } : {}),
      provider_message_id: email.providerMessageId,
      received_at: email.receivedAt,
    });
    return { status: 200, body: { success: true, messageId: id } };
  } catch (err) {
    if (err instanceof DuplicateEmailError) {
      return { status: 200, body: { success: false, reason: "duplicate" } };
    }
    throw err;
  }
}
