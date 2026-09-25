import { parseEmail } from "./email/parser";
import { resolveRecipient } from "./email/router";
import type { Env } from "./email/types";
import { forwardToBackend } from "./services/backendClient";
import { streamToString } from "./utils/validation";

/** Refuse raw messages larger than 5 MB (DoS guard). */
const MAX_RAW_BYTES = 5 * 1024 * 1024;

export default {
  /**
   * Cloudflare Email Worker handler. Invoked by Email Routing for each
   * incoming message addressed to the domain.
   *
   * Pipeline: read → parse → normalize recipient → POST to backend webhook.
   * The Worker owns NO business logic: no mailbox lookup, no expiration
   * checks, no OTP extraction, no database access. All of that lives in
   * the backend webhook.
   */
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    try {
      const raw = await streamToString(message.raw, MAX_RAW_BYTES);
      const parsed = await parseEmail(raw);
      // The envelope recipient is authoritative for routing (headers can be
      // spoofed or differ, e.g. BCC). Fall back to the To header if empty.
      const recipient = resolveRecipient(message.to || parsed.to);
      parsed.to = recipient;

      const result = await forwardToBackend(parsed, env);
      if (!result.ok) {
        // Already logged safely inside forwardToBackend (status + id only).
        // The message is dropped here; Cloudflare does not bounce it.
        // Persistent failures are visible via `wrangler tail`.
        return;
      }
      console.log(`forwarded ${parsed.providerMessageId} → ${recipient}`);
    } catch (err) {
      // Safe log: never the raw email, body, secret, or headers.
      console.error(`inbound email dropped: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  },
};
