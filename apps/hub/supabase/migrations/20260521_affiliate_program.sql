-- Phase RR R3 — Affiliate Program (applied 2026-05-21 via MCP)
-- Generalizes the OCI real-estate referral schema to ALL 7 products.

begin;

-- 1. affiliates: one row per partner. `code` is the 8-char URL slug.
create table if not exists public.affiliates (
  code               text        primary key,
  email              text        not null,
  display_name       text,
  payout_address     text,
  payout_currency    text        default 'USD',
  rate_pct_first_mo  numeric(5,2) not null default 30.00,
  rate_pct_recurring numeric(5,2) not null default 20.00,
  rate_pct_onetime   numeric(5,2) not null default 15.00,
  balance_cents      bigint      not null default 0,
  lifetime_paid_cents bigint     not null default 0,
  status             text        not null default 'active',
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_affiliates_email on public.affiliates (email);
create index if not exists idx_affiliates_status on public.affiliates (status);

create table if not exists public.affiliate_clicks (
  id            bigserial primary key,
  code          text        not null references public.affiliates(code) on delete cascade,
  ts            timestamptz not null default now(),
  ip_hash       text,
  ua_hash       text,
  referer_host  text,
  landing_path  text
);

create index if not exists idx_affiliate_clicks_code_ts on public.affiliate_clicks (code, ts desc);

alter table public.payment_orders
  add column if not exists affiliate_code text references public.affiliates(code) on delete set null;

create index if not exists idx_payment_orders_affiliate_code
  on public.payment_orders (affiliate_code)
  where affiliate_code is not null;

alter table public.affiliates        enable row level security;
alter table public.affiliate_clicks  enable row level security;

drop policy if exists "service_role read affiliates"  on public.affiliates;
drop policy if exists "service_role write affiliates" on public.affiliates;
create policy "service_role read affiliates"
  on public.affiliates for select
  using (auth.role() = 'service_role');
create policy "service_role write affiliates"
  on public.affiliates for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "service_role read affiliate_clicks"  on public.affiliate_clicks;
drop policy if exists "service_role write affiliate_clicks" on public.affiliate_clicks;
create policy "service_role read affiliate_clicks"
  on public.affiliate_clicks for select
  using (auth.role() = 'service_role');
create policy "service_role write affiliate_clicks"
  on public.affiliate_clicks for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

commit;
