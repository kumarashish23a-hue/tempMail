# TempMail — Temporary Email Prototype (Frontend Only)

A demo website that creates **temporary email addresses** for registrations and
shows **verification emails / OTPs** in a demo inbox. There is **no backend,
no database, and no real email delivery** — everything is mock data.

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
| Where is the mock data? | `src/data/mockEmails.ts` (demo inbox emails) and `src/data/mockAccounts.ts` (seed demo address) |
| Where do I change the email domain? | `src/config/siteConfig.ts` → `domain` (e.g. `"tempdemo.com"`) |
| Where do I change expiration options? | `src/config/siteConfig.ts` → `durations` (add/remove/edit entries) |
| Where do I connect the real backend later? | `src/services/emailService.ts` — replace each function's body with a `fetch()` call. The UI only calls these functions, so nothing else changes. |
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

## Demo behavior

- **Generate Email** creates a fake address like `alex72@tempdemo.com`.
- **Countdown** ticks down every second; at zero the address shows **Expired**
  and inbox actions are disabled.
- **Refresh Inbox** simulates a new email arriving (picks the next mock email).
- **Copy / Copy Code** buttons use the browser clipboard.
- Created addresses are saved in the browser's **localStorage** (`My Emails` page).
- **Settings** page: Light / Dark / System theme, default expiration,
  notifications toggle (UI only).

## Demo limitations (on purpose)

No backend, database, Supabase, real email server (SMTP/IMAP/POP3), real email
API, payments, authentication, admin panel, or analytics backend. Do not use
temporary addresses for sensitive or private information.
