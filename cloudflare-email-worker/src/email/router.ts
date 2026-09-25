// Recipient routing: normalize + validate the envelope recipient.
// The Worker does NOT decide which mailbox exists or whether it is expired —
// that is backend business logic. This only answers "is this a plausible
// address string worth forwarding?"

// Pragmatic (not RFC-complete) email check — the backend re-validates anyway.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Lowercase + trim, e.g. "  ABC123@MyDomain.com " → "abc123@mydomain.com". */
export function normalizeRecipient(to: string): string {
  return to.trim().toLowerCase();
}

export function isValidEmailAddress(address: string): boolean {
  return address.length <= 254 && EMAIL_RE.test(address);
}

/**
 * Normalize and validate the recipient. Throws on empty/invalid so the
 * caller can drop the message with a safe log line.
 */
export function resolveRecipient(rawTo: string): string {
  const recipient = normalizeRecipient(rawTo);
  if (!recipient) throw new Error("empty recipient");
  if (!isValidEmailAddress(recipient)) throw new Error(`invalid recipient: ${recipient}`);
  return recipient;
}
