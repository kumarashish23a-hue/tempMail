# Cloudflare setup for real inbound email

This guide connects a domain you own to the TempMail app so generated
addresses (e.g. `abc123@yourdomain.com`) can actually **receive** mail.

```
Internet → abc123@yourdomain.com → Email Routing → Worker → Edge Function webhook → Postgres → inbox
```

You do these steps once. Nothing here is automated — they happen in the
Cloudflare dashboard and your terminal.

---

## 0. What you need

- A domain you own (buy one from Cloudflare Registrar, Namecheap, etc.
  — roughly ₹800–1000/year). This guide calls it `yourdomain.com`.
- The Worker code in `cloudflare-email-worker/` and the Edge Function in
  `supabase/functions/inbound-email/` (both already in this repo).
- The migration `supabase/migrations/20260925_inbound_email.sql` applied
  in your Supabase SQL editor (adds `provider_message_id` for duplicate
  protection).

## 1. Put the domain on Cloudflare DNS

1. Cloudflare dashboard → **Add a domain**, enter `yourdomain.com`.
2. Cloudflare gives you 2 nameservers. At your registrar, replace the
   domain's nameservers with Cloudflare's.
3. Wait until the dashboard shows the domain as **Active** (can take
   minutes to hours).

## 2. Deploy the backend webhook first

The Worker forwards mail to it, so it must exist before mail arrives.

```bash
cd supabase/functions/inbound-email

# deploy the function (needs Supabase CLI logged in: `supabase login`)
supabase functions deploy inbound-email --project-ref bqokchcfpejzdgiyobjp

# create the shared secret (generate once, reuse for the Worker)
openssl rand -hex 32
supabase secrets set BACKEND_WEBHOOK_SECRET=<paste-the-value>
```

Your webhook URL is now:

```
https://bqokchcfpejzdgiyobjp.supabase.co/functions/v1/inbound-email
```

## 3. Deploy the Worker

```bash
cd cloudflare-email-worker
npm install

# store the SAME secret as step 2 on the Worker
npx wrangler secret put BACKEND_WEBHOOK_SECRET

npx wrangler deploy
```

## 4. Enable Email Routing and point it at the Worker

1. Cloudflare dashboard → select `yourdomain.com` → **Email** → **Email Routing**.
2. Click **Get started** and follow the onboarding. Cloudflare automatically
   adds the required DNS records (MX, SPF, DKIM) for you — **do not create
   these manually**; use exactly the records the dashboard proposes.
3. Wait for DNS to propagate (dashboard shows record status).
4. Go to **Email Routing → Routing rules → Create rule**:
   - **Custom address**: `*` (catch-all — every `anything@yourdomain.com`
     goes to the Worker; do NOT create one rule per temp address)
   - **Action**: **Send to a Worker**
   - **Destination**: select `temporary-email-worker`
   - Save and enable the rule.
5. Under **Email Routing → Settings**, make sure routing is enabled.

## 5. Test end-to-end

1. In the TempMail app, generate an address — then note that generated
   addresses currently use `@tempdemo.com`. For real mail, generate (or
   mentally map) the equivalent `xxxxx@yourdomain.com` address: create the
   mailbox row with your real domain so the webhook finds it. (A future app
   update can make the domain configurable in the UI.)
2. From your personal email, send a message to that address, e.g.
   subject `Test`, body `Your verification code is 483921`.
3. Watch the Worker logs: `npx wrangler tail` (from `cloudflare-email-worker/`).
4. Refresh the app inbox — the email appears, OTP `483921` shown with a copy button.

Expected chain:

```
Send email → Email Routing → Worker receives → parses →
extracts recipient → POSTs to webhook (Bearer auth) →
webhook: auth ✓ → mailbox found ✓ → not expired ✓ →
OTP extracted → row inserted → 200 {success:true} →
inbox shows the email + OTP
```

## 6. Ongoing

- **Retention**: temp mail is privacy-sensitive. Schedule the cleanup query
  in `supabase/migrations/20260925_inbound_email.sql` (delete messages of
  expired mailboxes) so content isn't kept indefinitely.
- **Security**: before any public launch, replace the demo open RLS policies
  (see main README) and keep `BACKEND_WEBHOOK_SECRET` rotated if ever leaked.
- **Troubleshooting**: no mail arriving → check Email Routing rule is enabled,
  MX records propagated (`dig MX yourdomain.com`), and `wrangler tail` for
  Worker errors; check the Edge Function logs in Supabase dashboard →
  Edge Functions → `inbound-email` → Logs.
