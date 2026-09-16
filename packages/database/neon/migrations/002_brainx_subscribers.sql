-- 002_brainx_subscribers.sql — BrainX productization (2026-09-16).
--
-- Adds what a paying subscriber needs and what the 2026-09-16 schema had no
-- room for: an entitlement row, subscription lifecycle events from the hub,
-- radar profiles, BUILD THIS request metering columns, and the per-signal
-- verification stamp the ingest tool writes.
--
-- Deliberately no plpgsql: services/highintelligence-api/scripts/apply_migration.py
-- splits on ';' and cannot apply $$ bodies. Apply with:
--   psql "$NEON_DATABASE_URL" -f packages/database/neon/migrations/002_brainx_subscribers.sql
-- Every statement is idempotent so a re-run is harmless.

-- ── Subscribers ────────────────────────────────────────────────────────────
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  tier text not null check (tier in ('radar','radar_build')),
  "interval" text not null check ("interval" in ('monthly','yearly')),
  gateway text not null,
  order_id text not null unique,
  paid_at timestamptz not null,
  active_until timestamptz not null,
  status text not null default 'active' check (status in ('active','past_due','cancelled','revoked')),
  cancelled_at timestamptz,
  access_token uuid not null unique default gen_random_uuid(),
  token_rotated_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscribers_email_idx on subscribers (lower(email));
create index if not exists subscribers_active_idx on subscribers (active_until) where status <> 'revoked';

-- ── Subscription lifecycle events from the hub webhooks (idempotent) ───────
create table if not exists subscription_events (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references subscribers(order_id) on delete cascade,
  event text not null check (event in ('activated','renewed','past_due','cancelled','refunded')),
  occurred_at timestamptz not null,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  unique (order_id, event, occurred_at)
);

-- ── Radar profiles: "up to 5 profiles across the covered verticals" ────────
create table if not exists radar_profiles (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references subscribers(id) on delete cascade,
  market_id uuid not null references markets(id),
  label text not null,
  keywords text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (subscriber_id, market_id, label)
);
create index if not exists radar_profiles_subscriber_idx on radar_profiles (subscriber_id);

-- ── "Email me my link" audit trail (rate-limited in the route) ─────────────
create table if not exists access_link_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  ip text,
  sent boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── BUILD THIS becomes request → brief ──────────────────────────────────────
alter table products add column if not exists subscriber_id uuid references subscribers(id) on delete set null;
alter table products add column if not exists requested_at timestamptz not null default now();
alter table products add column if not exists ready_at timestamptz;
alter table products add column if not exists delivered_at timestamptz;
alter table products add column if not exists brief jsonb;
alter table products add column if not exists evidence_ids uuid[] not null default '{}';
alter table products add column if not exists turnaround_note text;
alter table products add column if not exists review jsonb;
alter table products add column if not exists reviewed_at timestamptz;
alter table products alter column status set default 'requested';
-- status vocabulary: requested | in_progress | ready | delivered | cancelled
-- (pre-existing rows keep 'draft'; nothing reads it.)

-- One open request per subscriber per opportunity.
create unique index if not exists products_open_request_idx
  on products (subscriber_id, opportunity_id)
  where status in ('requested','in_progress','ready');
create index if not exists products_metering_idx on products (subscriber_id, requested_at);

-- ── Opportunities get a URL-safe slug and a why-now list ───────────────────
alter table opportunities add column if not exists slug text;
create unique index if not exists opportunities_slug_idx on opportunities (slug) where slug is not null;
alter table opportunities add column if not exists why_now text[] not null default '{}';

-- ── Signals carry the verification stamp the ingest tool writes ────────────
alter table signals add column if not exists publisher text;
alter table signals add column if not exists url_verified_at timestamptz;
alter table signals add column if not exists excerpt text;
