-- Practice Revenue Report — one row per upload (free totals; paid rows gated
-- at read time by paid_at, the SellerRadar rule). The report jsonb holds
-- pseudonymised identifiers only ("Client 01", "INV-0001"): the buyer's
-- browser keeps the name key, so no client name is ever stored here.
--
-- Access pattern: service-role only from apps/hub API routes, so RLS is
-- enabled with no policies (deny-by-default for anon/auth roles).
-- Retention: 14 days free, 180 days paid; the report route returns 410 past
-- expires_at and the analyze route deletes expired rows opportunistically.

begin;

create table if not exists public.practice_revenue_reports (
  id                   uuid primary key default gen_random_uuid(),
  report_ref           text not null unique,             -- 'PR-2026-' || 10 hex; bearer id for /practice-revenue/report/[ref]
  email                text not null,
  tier                 text not null default 'free' check (tier in ('free', 'paid')),
  status               text not null default 'delivered' check (status in ('delivered', 'failed')),
  as_of                date not null,
  currency             text not null default 'USD',
  engine_version       int  not null default 1,
  pseudonymised        boolean not null default true,    -- v1 is always true; column exists so a later opt-out is auditable
  time_entry_count     int,
  invoice_count        int,
  unbilled_cents       bigint,
  unbilled_aged_cents  bigint,
  ar_open_cents        bigint,
  overdue_60_cents     bigint,
  realization_pct      numeric(5,1),
  collection_pct       numeric(5,1),
  utilization_pct      numeric(5,1),
  dso_days             numeric(7,1),
  lockup_days          numeric(7,1),
  dormant_client_count int,
  findings             jsonb not null default '[]'::jsonb,
  report               jsonb not null,                   -- full PracticeRevenueReport; pseudonymised ids only
  payment_order_id     uuid references public.payment_orders(id) on delete set null,
  paid_at              timestamptz,                      -- THE gate; the report route refuses rows without it
  paid_email           text,
  created_at           timestamptz not null default now(),
  expires_at           timestamptz not null default (now() + interval '14 days')
);

create index if not exists idx_prr_email   on public.practice_revenue_reports (lower(email), created_at desc);
create index if not exists idx_prr_expires on public.practice_revenue_reports (expires_at);
create index if not exists idx_prr_order   on public.practice_revenue_reports (payment_order_id) where payment_order_id is not null;

alter table public.practice_revenue_reports enable row level security;
-- No policies on purpose: service role only.

commit;
