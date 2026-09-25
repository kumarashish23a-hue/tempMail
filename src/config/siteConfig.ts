import type { DurationOption } from "../types";

// ─── Site-wide customization ────────────────────────────────────────────────
// Change the website name, email domain, durations, navigation, and feature
// flags here — no need to hunt through components.

export const siteConfig = {
  name: "TempMail",
  tagline: "Your Temporary Email, Instantly.",
  subtitle:
    "Create a disposable email address for registrations, verification codes, and temporary sign-ups.",

  /** Domain used when generating demo addresses, e.g. alex72@tempdemo.com */
  domain: "tempdemo.com",

  /** Default lifetime (minutes) pre-selected in the generator. */
  defaultExpirationMinutes: 60,

  /** Lifetime choices shown in the duration dropdown. */
  durations: [
    { label: "10 minutes", minutes: 10 },
    { label: "30 minutes", minutes: 30 },
    { label: "1 hour", minutes: 60 },
    { label: "6 hours", minutes: 360 },
    { label: "24 hours", minutes: 1440 },
  ] as DurationOption[],

  /** Allow typing a custom lifetime in minutes. */
  allowCustomDuration: true,
  /** Allow typing a custom username instead of a random one. */
  allowCustomUsername: true,

  nav: [
    { label: "Dashboard", path: "/" },
    { label: "Inbox", path: "/inbox" },
    { label: "My Emails", path: "/emails" },
    { label: "Usage", path: "/usage" },
  ],
  secondaryNav: [
    { label: "Settings", path: "/settings" },
    { label: "About", path: "/about" },
  ],

  features: {
    /** "Refresh" button that simulates a new email arriving. */
    refreshInbox: true,
    /** "Add Website" button in the usage section. */
    addWebsite: true,
    /** Notification toggle in settings (UI only). */
    notifications: true,
  },

  privacyNotice:
    "Temporary emails are not intended for sensitive or private information.",
  demoNotice: "Demo mode: No real emails are being received.",
};
