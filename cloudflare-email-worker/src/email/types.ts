// Shared types for the inbound-email Worker.

/** Worker environment bindings (set via wrangler secrets / .dev.vars). */
export interface Env {
  /** Backend webhook URL, e.g. https://xyz.supabase.co/functions/v1/inbound-email */
  BACKEND_WEBHOOK_URL: string;
  /** Shared secret sent as `Authorization: Bearer <secret>`. Never committed. */
  BACKEND_WEBHOOK_SECRET: string;
}

/** Normalized email handed from the parser to the backend client. */
export interface IncomingEmail {
  providerMessageId: string;
  /** Normalized recipient, e.g. "abc123@mydomain.com" (lowercase, trimmed). */
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
  receivedAt: string;
  attachmentCount: number;
  attachments: Array<{
    filename?: string;
    contentType?: string;
    size?: number;
  }>;
}

/** JSON payload POSTed to the backend webhook. */
export interface WebhookPayload {
  provider: "cloudflare";
  providerMessageId: string;
  recipient: string;
  sender: string;
  subject: string;
  text: string;
  html?: string;
  receivedAt: string;
  attachmentCount: number;
  attachments: IncomingEmail["attachments"];
}
