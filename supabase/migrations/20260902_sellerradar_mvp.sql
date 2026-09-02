-- SellerRadar MVP — reports, per-SKU impact rows, orders, monitors, leads,
-- fee schedule registry.
-- Spec: docs/sellerradar-mvp-spec.md §4/§5.
--
-- Fee data itself lives in curated JSON fixtures versioned in-repo
-- (apps/sellerradar/data/fee-schedules/) per spec §5 — the fee_schedules
-- table below is the v2 live/admin-refresh path (fee_type, category, tier,
-- rate, effective_date, source_url) and is not read by the v1 app.
--
-- Access pattern: service-role only from apps/sellerradar API routes, so RLS
-- is enabled with no policies (deny-by-default for anon/auth roles).

begin;

-- ── Fee schedule registry (v2 live path; v1 uses in-repo fixtures) ─────────
create table if not exists public.fee_schedules (
  id             uuid primary key default gen_random_uuid(),
  marketplace    text not null default 'amazon.com',
  version        text not null,                  -- e.g. '2026'
  fee_type       text not null
                   check (fee_type in ('referral', 'fba_fulfillment', 'storage')),
  category       text not null default 'default',-- referral: category key; others: 'default'
  tier           text,                           -- fba_fulfillment: size tier; storage: standard|oversize
  rate           numeric(12,4) not null,         -- pct (0.15) or USD amount
  effective_date date not null,
  source_url     text not null,                  -- citation per spec liability shrinker
  created_at     timestamptz not null default now(),
  unique (marketplace, version, fee_type, category, tier)
);

create index if not exists idx_fee_schedules_lookup
  on public.fee_schedules (marketplace, fee_type, effective_date desc);

-- ── One row per catalog analysis ────────────────────────────────────────────
create table if not exists public.sellerradar_reports (
  id                   uuid primary key default gen_random_uuid(),
  report_ref           text not null unique,     -- SR-2026-XXXXX, bearer id for /report/[report_ref]
  email                text,
  tier                 text not null default 'free'
                         check (tier in ('free', 'audit', 'monitor')),
  status               text not null default 'pending'
                         check (status in ('pending', 'delivered', 'failed')),
  sku_count            int,
  affected_count       int,
  monthly_impact       numeric(12,2),            -- USD/month, positive = margin loss
  annual_impact        numeric(12,2),            -- USD/year
  avg_margin_delta_pct numeric(8,2),
  changed_fee_types    text[],                   -- referral | fba_fulfillment | storage
  schedule_from        text,                     -- fixture version diffed from
  schedule_to          text,                     -- fixture version diffed to
  warnings             text[],                   -- human-readable CSV parse notes
  created_at           timestamptz not null default now(),
  completed_at         timestamptz,
  paid_at              timestamptz               -- the paid gate; /api/report refuses SKU rows without it
);

create index if not exists idx_sellerradar_reports_email on public.sellerradar_reports (lower(email), created_at desc);

-- ── Per-SKU impact rows (the paid detail) ───────────────────────────────────
create table if not exists public.sellerradar_skus (
  id                 uuid primary key default gen_random_uuid(),
  report_id          uuid not null references public.sellerradar_reports(id) on delete cascade,
  sku                text not null,
  asin               text,
  category           text not null default 'default',
  price              numeric(12,2) not null,
  cogs               numeric(12,2) not null default 0,
  monthly_units      numeric(12,2) not null default 0,
  size_tier          text,                       -- small_standard | large_standard | large_bulky | oversize
  fees_old           jsonb,                      -- {referral, fulfillment, storage, total, sizeTier}
  fees_new           jsonb,
  fee_delta_per_unit numeric(12,2),
  monthly_impact     numeric(12,2),
  annual_impact      numeric(12,2),
  margin_old_pct     numeric(8,2),
  margin_new_pct     numeric(8,2),
  created_at         timestamptz not null default now(),
  unique (report_id, sku)
);

create index if not exists idx_sellerradar_skus_report on public.sellerradar_skus (report_id, annual_impact desc);

-- ── Orders (in-app PayPal + NOWPayments + hub apex credits) ─────────────────
create table if not exists public.sellerradar_orders (
  id                 uuid primary key default gen_random_uuid(),
  report_id          text not null unique,       -- SR-… (in-app) or hub payment_orders id (apex)
  analysis_id        uuid references public.sellerradar_reports(id) on delete set null,
  email              text,
  tier               text not null check (tier in ('audit', 'monitor')),
  amount             numeric(10,2) not null,     -- USD, server-resolved from lib/tiers.ts
  interval           text not null default 'one-time' check (interval in ('one-time', 'monthly')),
  status             text not null default 'pending'
                       check (status in ('pending', 'paid', 'failed', 'refunded')),
  payment_method     text,                       -- paypal | crypto
  payment_provider   text,                       -- paypal | nowpayments | hub_apex
  paypal_order_id    text,
  paypal_capture_id  text,
  gateway_invoice_id text,
  paid_at            timestamptz,
  created_at         timestamptz not null default now()
);

create index if not exists idx_sellerradar_orders_email on public.sellerradar_orders (lower(email), created_at desc);

-- ── Monitor tier registry (weekly re-scan cron is a post-MVP stub) ──────────
create table if not exists public.sellerradar_monitors (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  report_id    uuid references public.sellerradar_reports(id) on delete set null,
  status       text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  next_scan_at timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists idx_sellerradar_monitors_due on public.sellerradar_monitors (status, next_scan_at);

-- ── Landing-page lead capture ───────────────────────────────────────────────
create table if not exists public.sellerradar_leads (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  name       text,
  scenario   text,
  source     text,
  created_at timestamptz not null default now()
);

create index if not exists idx_sellerradar_leads_email on public.sellerradar_leads (lower(email), created_at desc);

-- ── RLS: service-role only (deny-by-default for everyone else) ──────────────
alter table public.fee_schedules        enable row level security;
alter table public.sellerradar_reports  enable row level security;
alter table public.sellerradar_skus     enable row level security;
alter table public.sellerradar_orders   enable row level security;
alter table public.sellerradar_monitors enable row level security;
alter table public.sellerradar_leads    enable row level security;

commit;
