# temporary-email-worker

Cloudflare Email Worker for the TempMail project. Receives inbound email via
**Cloudflare Email Routing**, parses it, and forwards it to the backend
webhook (a Supabase Edge Function). The Worker owns **no business logic**:
no mailbox lookup, no expiration checks, no OTP extraction, no database.

```
Internet → you@yourdomain.com → Email Routing → this Worker → backend webhook → Postgres → frontend inbox
```

## Project layout

```
src/
  index.ts                 # email() handler — the whole pipeline
  email/
    types.ts               # Env, IncomingEmail, WebhookPayload
    parser.ts              # raw MIME → IncomingEmail (postal-mime)
    router.ts              # recipient normalize + validate
  services/
    backendClient.ts       # POST to webhook with Bearer secret + 1 retry
  utils/
    validation.ts          # URL check, stream reader with size cap
```

## Prerequisites

- Node 18+
- A Cloudflare account with your domain on Cloudflare DNS
- The backend webhook deployed (see `../supabase/functions/inbound-email/`)
- A shared secret both sides know (`BACKEND_WEBHOOK_SECRET`)

## Local development

```bash
npm install
cp .env.example .dev.vars   # then edit BACKEND_WEBHOOK_URL / SECRET
npx wrangler dev
```

### Simulate an incoming email

With `wrangler dev` running, POST a raw RFC 5322 message to the local
email handler endpoint:

```bash
curl -X POST http://localhost:8787/cdn-cgi/handler/email \
  --data-binary @- <<'EOF'
From: no-reply@example.com
To: abc123@mydomain.com
Subject: Your verification code
Message-ID: <test-1@example.com>
Content-Type: text/plain; charset=utf-8

Your verification code is 483921.
EOF
```

Point `BACKEND_WEBHOOK_URL` in `.dev.vars` at a local mock (or the real
Edge Function) and watch the Worker's console output plus the mock's log.

Expected:

```
Worker receives email → parses → extracts abc123@mydomain.com →
POSTs JSON to the webhook → webhook stores the email, OTP = 483921
```

## Secrets

```bash
# generate a secret
openssl rand -hex 32

# store it on the Worker (production)
npx wrangler secret put BACKEND_WEBHOOK_SECRET
```

The **same** value must also be set on the Supabase Edge Function:

```bash
supabase secrets set BACKEND_WEBHOOK_SECRET=<the-same-value>
```

Never commit secrets. `.dev.vars` is gitignored.

## Deploy

```bash
npm run deploy        # = npx wrangler deploy
npx wrangler tail     # watch live logs
```

After deploying, create the Email Routing rule in the Cloudflare dashboard
so `*@yourdomain.com` is sent to this Worker — see `../CLOUDFLARE_SETUP.md`.

## Security notes

- Webhook calls carry `Authorization: Bearer <secret>`; the backend rejects
  anything else with 401.
- Raw messages over 5 MB are refused; webhook JSON over 256 KB is refused.
- Logs contain only message ids and statuses — never bodies, secrets, or headers.
- One retry on network errors / 5xx; never on 4xx. No infinite retries.
- Attachments: only metadata (filename, type, size) is forwarded. Content is
  currently unsupported and not stored.
