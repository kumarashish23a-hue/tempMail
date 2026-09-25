// Pure helpers for the inbound-email Edge Function.
// No external imports — this file is unit-tested in Node via type stripping.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_TEXT_BYTES = 256 * 1024; // refuse JSON payloads larger than 256 KB

export interface ValidPayload {
  provider: string;
  providerMessageId: string;
  recipient: string;
  sender: string;
  subject: string;
  text: string;
  html?: string;
  receivedAt: string;
}

export function normalizeRecipient(address: string): string {
  return address.trim().toLowerCase();
}

export function isValidEmailAddress(address: string): boolean {
  return address.length > 0 && address.length <= 254 && EMAIL_RE.test(address);
}

/**
 * Extract a one-time code from subject/body text.
 * Prefers a 4–8 digit number near keywords like "code", "OTP", "verification".
 * Falls back to the first standalone 4–8 digit number. Returns undefined if none.
 */
export function extractOtp(text: string): string | undefined {
  const nearKeyword =
    /(?:otp|one[\s-]?time[\s-]?password|verification|verify|security|login|sign[\s-]?in|confirm|activation|2fa|passcode|pin)[\D]{0,40}?(\d{4,8})/i.exec(
      text,
    );
  if (nearKeyword?.[1]) return nearKeyword[1];
  const standalone = /\b(\d{4,8})\b/.exec(text);
  return standalone?.[1];
}

/** Validate the Worker's JSON payload. Returns the normalized payload or an error. */
export function validatePayload(
  payload: unknown,
): { ok: true; value: ValidPayload } | { ok: false; error: string } {
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, error: "payload must be a JSON object" };
  }
  const p = payload as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);

  const providerMessageId = str(p.providerMessageId);
  const recipientRaw = str(p.recipient);
  const sender = str(p.sender);
  if (!providerMessageId || providerMessageId.length > 500) {
    return { ok: false, error: "providerMessageId is required" };
  }
  if (!recipientRaw) return { ok: false, error: "recipient is required" };
  const recipient = normalizeRecipient(recipientRaw);
  if (!isValidEmailAddress(recipient)) {
    return { ok: false, error: "recipient is not a valid email address" };
  }
  if (!sender || !isValidEmailAddress(normalizeRecipient(sender))) {
    return { ok: false, error: "sender is not a valid email address" };
  }
  const text = str(p.text) ?? "";
  if (text.length > MAX_TEXT_BYTES) {
    return { ok: false, error: "email body too large" };
  }
  const receivedAt = str(p.receivedAt);
  if (receivedAt && Number.isNaN(Date.parse(receivedAt))) {
    return { ok: false, error: "receivedAt is not a valid timestamp" };
  }
  const html = str(p.html);

  return {
    ok: true,
    value: {
      provider: str(p.provider) ?? "cloudflare",
      providerMessageId,
      recipient,
      sender: normalizeRecipient(sender),
      subject: (str(p.subject) ?? "").slice(0, 500),
      text,
      ...(html ? { html: html.slice(0, MAX_TEXT_BYTES) } : {}),
      receivedAt: receivedAt ?? new Date().toISOString(),
    },
  };
}
