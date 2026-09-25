import PostalMime from "postal-mime";
import type { IncomingEmail } from "./types";

/**
 * Parse a raw RFC 5322 message into an IncomingEmail.
 * Throws on unparseable input. Never includes attachment *content* —
 * only metadata (filename, type, size).
 */
export async function parseEmail(raw: string): Promise<IncomingEmail> {
  const parsed = await PostalMime.parse(raw);

  const to = parsed.to?.[0]?.address ?? "";
  const from = parsed.from?.address ?? "";
  const subject = parsed.subject ?? "";
  // Message-ID may be missing on malformed mail; fall back to a synthetic id
  // so the backend can still dedupe on (recipient, subject, receivedAt).
  // The "<" ">" brackets are stripped for a cleaner id.
  const providerMessageId =
    parsed.messageId?.replace(/^<|>$/g, "") || `no-id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const receivedAt = parsed.date || new Date().toISOString();

  const attachments = (parsed.attachments ?? []).map((a) => ({
    filename: a.filename ?? undefined,
    contentType: a.mimeType ?? undefined,
    size:
      typeof a.content === "string"
        ? a.content.length
        : a.content instanceof ArrayBuffer
          ? a.content.byteLength
          : undefined,
  }));

  return {
    providerMessageId,
    to,
    from,
    subject,
    text: parsed.text ?? "",
    html: parsed.html ?? undefined,
    receivedAt,
    attachmentCount: attachments.length,
    attachments,
  };
}
