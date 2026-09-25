-- TempMail database schema for Supabase (Postgres).
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
--
-- Tables:
--   temp_addresses  one row per temporary email address
--   emails          inbox messages, linked to an address
--   website_usage   "where was this address used" tracking
--
-- The RLS policies below are WIDE OPEN (demo): anyone with the anon key can
-- read/write everything. That matches the "no login" prototype. Tighten them
-- before any production use.

create table if not exists temp_addresses (
  id uuid primary key default gen_random_uuid(),
  address text unique not null,
  created_at timestamptz default now() not null,
  expires_at timestamptz not null
);

create table if not exists emails (
  id uuid primary key default gen_random_uuid(),
  address_id uuid references temp_addresses(id) on delete cascade not null,
  sender_name text not null,
  sender_email text not null,
  subject text not null,
  body text not null,
  otp text,
  is_read boolean default false not null,
  received_at timestamptz default now() not null
);

create table if not exists website_usage (
  id uuid primary key default gen_random_uuid(),
  address_id uuid references temp_addresses(id) on delete cascade not null,
  website text not null,
  first_seen_at timestamptz default now() not null,
  unique(address_id, website)
);

-- Helpful indexes for the app's queries.
create index if not exists emails_address_id_idx on emails (address_id, received_at desc);
create index if not exists website_usage_address_id_idx on website_usage (address_id);

alter table temp_addresses enable row level security;
alter table emails enable row level security;
alter table website_usage enable row level security;

-- Drop the policy first so re-running this file is safe.
drop policy if exists "demo open access" on temp_addresses;
drop policy if exists "demo open access" on emails;
drop policy if exists "demo open access" on website_usage;

create policy "demo open access" on temp_addresses
  for all using (true) with check (true);
create policy "demo open access" on emails
  for all using (true) with check (true);
create policy "demo open access" on website_usage
  for all using (true) with check (true);
