import { siteConfig } from "../config/siteConfig";
import type { Email, TemporaryEmail } from "../types";
import { mockInboxTemplates } from "./mockEmails";

// ─── Demo temporary email accounts ──────────────────────────────────────────
// Used to seed localStorage on first run so the "My Emails" page shows
// something (including an expired address). Everything is mock data.

let seedCounter = 0;
function seedId(prefix: string): string {
  seedCounter += 1;
  return `${prefix}-seed-${seedCounter}-${Date.now().toString(36)}`;
}

function seedEmail(templateIndex: number, minutesAgo: number): Email {
  const t = mockInboxTemplates[templateIndex % mockInboxTemplates.length];
  return {
    id: seedId("email"),
    senderName: t.senderName,
    sender: t.sender,
    subject: t.subject,
    body: t.body,
    otp: t.otp,
    hasAttachments: t.hasAttachments,
    receivedAt: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
    read: true,
  };
}

/**
 * Builds the accounts used to seed localStorage the first time the app runs.
 * Times are relative to "now" so the demo always looks fresh.
 */
export function buildSeedAccounts(): TemporaryEmail[] {
  const now = Date.now();

  const expired: TemporaryEmail = {
    id: seedId("account"),
    address: `test91@${siteConfig.domain}`,
    createdAt: new Date(now - 26 * 60_60_000).toISOString(),
    expiresAt: new Date(now - 2 * 60_60_000).toISOString(),
    status: "expired",
    emails: [seedEmail(3, 25 * 60), seedEmail(0, 24 * 60), seedEmail(1, 23 * 60)],
    websitesUsed: [
      {
        website: "Example.com",
        firstSeen: new Date(now - 25 * 60_60_000).toISOString(),
        status: "inactive",
      },
      {
        website: "Discord",
        firstSeen: new Date(now - 24 * 60_60_000).toISOString(),
        status: "inactive",
      },
    ],
  };

  return [expired];
}
