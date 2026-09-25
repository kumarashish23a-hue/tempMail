# TempMail — Temporary Email Prototype (Supabase backend)

A website that creates **temporary email addresses** for registrations and
shows **verification emails / OTPs** in an inbox. The frontend is React +
TypeScript + Tailwind + Vite; the backend is **Supabase (Postgres)** — no
custom server code. Real email *receiving* is not connected yet (see
"Receiving real emails" below).

## Connect Supabase

1. Create a free project at supabase.com (name it `tempMail`).
2. In the project dashboard, open **SQL Editor → New query**, paste the SQL
   from `supabase/schema.sql` in this repo, and hit **Run**. This creates the
   `temp_addresses`, `emails`, and `website_usage` tables plus open demo RLS
   policies.
3. Copy **Project URL** and **anon key** from **Settings → API**.
4. Create a `.env` file in the project root (it's gitignored — never commit it):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. `npm install` and `npm run dev` as usual. When deploying (Vercel/Netlify),
   set the same two variables in the host's environment settings instead of
   using a `.env` file.

## Run it

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

Other commands:

```bash
npm run build    # check for TypeScript errors + build for production
npm run preview  # preview the production build
npm run lint     # check code style
```

## Where things are

| Question | Answer |
|---|---|
| Where is the UI? | `src/components/` (reusable pieces) and `src/pages/` (the pages) |
| Where is the mock data? | `src/data/mockEmails.ts` and `src/data/mockAccounts.ts` (kept for reference; no longer used by the app) |
| Where do I change the email domain? | `src/config/siteConfig.ts` → `domain` (e.g. `"tempdemo.com"`) |
| Where do I change expiration options? | `src/config/siteConfig.ts` → `durations` (add/remove/edit entries) |
| Where is the backend code? | `src/services/emailService.ts` — the ONLY place that talks to Supabase. The UI only calls these functions, so nothing else needs to change if the backend moves. Supabase client setup: `src/lib/supabase.ts`. |
| How do I add a new UI feature? | 1. Add a component in `src/components/` (copy an existing one as a template). 2. If it needs a page, add it in `src/pages/` and a `<Route>` in `src/App.tsx`. 3. If it needs config (labels, flags), put it in `src/config/siteConfig.ts`, not hardcoded in the component. |

## Project structure

```
src/
  App.tsx                  # routes + page layout (header, sidebar, footer)
  main.tsx                 # app entry point
  index.css                # Tailwind + dark-mode setup
  types.ts                 # shared data shapes (backend-ready)
  config/siteConfig.ts     # ★ change name, domain, durations, nav, flags here
  data/
    mockEmails.ts          # ★ demo inbox email templates
    mockAccounts.ts        # ★ seed demo address (shows in "My Emails")
  services/
    emailService.ts        # ★ the ONLY place that "talks to data" — swap for real API later
  hooks/
    useCountdown.ts        # live countdown timer + time formatting
    useTheme.ts            # light/dark/system theme
  lib/
    settings.ts            # settings stored in localStorage
  components/              # Header, Sidebar, EmailGenerator, EmailCard,
                           # InboxList, EmailViewer, OtpCard, CountdownTimer,
                           # CopyButton, UsageList, ExpirationBadge,
                           # EmptyState, ThemeToggle, EmailDashboard
  pages/                   # Home, Inbox, My Emails, Email detail,
                           # Usage, Settings, About
```

## How it works

- **Generate Email** creates a real row in Supabase (`temp_addresses`) like
  `alex72@tempdemo.com`, plus one welcome email (with a sample OTP so the
  copy-code UI can be tried).
- **Countdown** ticks down every second; at zero the address shows **Expired**
  and inbox actions are disabled.
- **Refresh Inbox** re-fetches messages from Supabase.
- **Copy / Copy Code** buttons use the browser clipboard.
- Your browser remembers which addresses *you* created (localStorage list of
  IDs); the `My Emails` page only shows those.
- **Settings** page: Light / Dark / System theme, default expiration,
  notifications toggle (UI only).

## Receiving real emails (not connected yet)

To receive actual emails sent to these addresses you need, in order:

1. A **domain you own** (e.g. from Cloudflare or Namecheap, ~₹800–1000/year).
2. An **inbound email service** — Mailgun, SendGrid Inbound Parse, or
   Cloudflare Email Workers (all have free tiers). Point your domain's MX
   records at it.
3. A **Supabase Edge Function** as the webhook target: the email service POSTs
   each incoming email to it, and the function inserts a row into the `emails`
   table. The inbox then shows real mail on the next refresh.

Until then, inboxes only contain the welcome email.

## Limitations (on purpose)

No real email server (SMTP/IMAP/POP3), no authentication, no payments, no
admin panel, no analytics backend. The RLS policies in `supabase/schema.sql`
are wide open for demo purposes — tighten them before any production use. Do
not use temporary addresses for sensitive or private information.
