// ─── Demo inbox emails ───────────────────────────────────────────────────────
// These are the ONLY emails the prototype can ever show. No network requests
// are made; the service layer picks from these templates and stamps them with
// an id, a received time, and a read flag.

export interface MockEmailTemplate {
  senderName: string;
  sender: string;
  subject: string;
  body: string;
  /** When present, the UI shows a prominent OTP card. */
  otp?: string;
  hasAttachments?: boolean;
}

export const mockInboxTemplates: MockEmailTemplate[] = [
  {
    senderName: "Amazon",
    sender: "no-reply@amazon.example.com",
    subject: "Your verification code",
    body: "Hello,\n\nYour Amazon verification code is:\n\n483921\n\nThis code expires in 10 minutes. If you didn't request this code, you can safely ignore this email.",
    otp: "483921",
  },
  {
    senderName: "Discord",
    sender: "noreply@discord.example.com",
    subject: "Verify your email",
    body: "Hey there,\n\nThanks for signing up for Discord! Click the link below to verify your email address:\n\nhttps://discord.example.com/verify?token=demo-token\n\nThis link expires in 24 hours.",
  },
  {
    senderName: "Example Website",
    sender: "welcome@example.com",
    subject: "Welcome",
    body: "Welcome to Example Website!\n\nYour account was created successfully. You can now sign in with your temporary email address.\n\n— The Example Website team",
  },
  {
    senderName: "GitHub",
    sender: "noreply@github.example.com",
    subject: "Your GitHub verification code",
    body: "Your GitHub verification code is:\n\n739104\n\nIf you didn't request this, your account may be at risk — but this is only a demo, so don't worry.",
    otp: "739104",
  },
  {
    senderName: "Spotify",
    sender: "no-reply@spotify.example.com",
    subject: "Confirm your email address",
    body: "Hi there,\n\nPlease confirm your email address to finish creating your Spotify account. Your confirmation code is:\n\n220586",
    otp: "220586",
  },
  {
    senderName: "Netflix",
    sender: "info@netflix.example.com",
    subject: "Welcome to Netflix",
    body: "Welcome aboard!\n\nYour Netflix account is ready. Start watching on any device, anytime.\n\nHappy streaming!",
  },
  {
    senderName: "Google",
    sender: "no-reply@google.example.com",
    subject: "Security alert: new sign-in",
    body: "Hi,\n\nWe noticed a new sign-in to your Google Account from a new device. If this was you, you don't need to do anything. (Demo email — no action needed.)",
  },
  {
    senderName: "Dropbox",
    sender: "no-reply@dropbox.example.com",
    subject: "Someone shared a file with you",
    body: "Hi there,\n\nAlex shared the file \"project-specs.pdf\" with you on Dropbox.\n\nOpen the attachment preview below to take a look. (Demo — the file isn't real.)",
    hasAttachments: true,
  },
];
