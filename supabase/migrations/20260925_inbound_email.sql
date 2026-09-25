-- Inbound-email support: run once in the Supabase SQL editor.
-- Adds provider_message_id so the inbound-email Edge Function can ignore
-- duplicate deliveries of the same message.

alter table emails
  add column if not exists provider_message_id text;

-- One message id may only be stored once. NULLs (rows created before this
-- migration, e.g. the welcome email) are not affected: Postgres allows
-- multiple NULLs in a unique column.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'emails_provider_message_id_key'
  ) then
    alter table emails add constraint emails_provider_message_id_key unique (provider_message_id);
  end if;
end $$;

-- Optional: index for fast duplicate checks on high volume.
create index if not exists emails_provider_message_id_idx
  on emails (provider_message_id);

-- ─── Optional retention cleanup ──────────────────────────────────────────
-- Temporary mail is privacy-sensitive: do not keep messages indefinitely.
-- Run the statement below manually, or schedule it (e.g. Supabase pg_cron
-- or a scheduled Edge Function) to delete messages older than N hours.
-- Example: delete everything older than 24h whose mailbox has expired:
--
-- delete from emails e
-- using temp_addresses a
-- where e.address_id = a.id
--   and a.expires_at < now() - interval '24 hours';
