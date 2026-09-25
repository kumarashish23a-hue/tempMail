import type { Env, IncomingEmail, WebhookPayload } from "../email/types";
import { isValidWebhookUrl } from "../utils/validation";

export interface ForwardResult {
  ok: boolean;
  /** HTTP status from the backend (0 = network failure). */
  status: number;
  /** True when the caller may retry (network error or 5xx). Never for 4xx. */
  retryable: boolean;
}

const REQUEST_TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 2_000;
const MAX_ATTEMPTS = 2;

function toPayload(email: IncomingEmail): WebhookPayload {
  return {
    provider: "cloudflare",
    providerMessageId: email.providerMessageId,
    recipient: email.to,
    sender: email.from,
    subject: email.subject,
    text: email.text,
    ...(email.html ? { html: email.html } : {}),
    receivedAt: email.receivedAt,
    attachmentCount: email.attachmentCount,
    attachments: email.attachments,
  };
}

async function postOnce(
  url: string,
  secret: string,
  payload: WebhookPayload,
): Promise<ForwardResult> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    // Network failure / timeout — safe to log, retryable.
    console.error(
      `webhook network error for ${payload.providerMessageId}: ${err instanceof Error ? err.message : "unknown"}`,
    );
    return { ok: false, status: 0, retryable: true };
  }

  if (res.ok) return { ok: true, status: res.status, retryable: false };

  const retryable = res.status >= 500;
  // Safe log: status + message id only. Never the body, secret, or headers.
  console.error(
    `webhook rejected ${payload.providerMessageId}: status=${res.status} retryable=${retryable}`,
  );
  return { ok: false, status: res.status, retryable };
}

/**
 * POST the parsed email to the backend webhook.
 * Retries once on network errors / 5xx. Never retries 4xx.
 * Never throws — always returns a ForwardResult.
 */
export async function forwardToBackend(
  email: IncomingEmail,
  env: Env,
): Promise<ForwardResult> {
  if (!isValidWebhookUrl(env.BACKEND_WEBHOOK_URL)) {
    console.error("webhook misconfigured: BACKEND_WEBHOOK_URL is not a valid URL");
    return { ok: false, status: 0, retryable: false };
  }
  if (!env.BACKEND_WEBHOOK_SECRET) {
    console.error("webhook misconfigured: BACKEND_WEBHOOK_SECRET is empty");
    return { ok: false, status: 0, retryable: false };
  }

  const payload = toPayload(email);
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await postOnce(env.BACKEND_WEBHOOK_URL, env.BACKEND_WEBHOOK_SECRET, payload);
    if (result.ok || !result.retryable || attempt === MAX_ATTEMPTS) return result;
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  }
  // Unreachable, but keeps TypeScript happy.
  return { ok: false, status: 0, retryable: false };
}
