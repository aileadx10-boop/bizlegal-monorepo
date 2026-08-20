-- 20260813_reserve_reports.sql — W2-5 Stablecoin Reserve Report Generator
-- Self-contained fulfillment table for the $199/mo reserve report product.
-- Created before checkout via /api/reserve-report/generate, fulfilled by the
-- NOWPayments IPN handler at /api/reserve-report/webhook (TRACR-style, because
-- the universal /api/pay/start path does not write payment_orders).

create table if not exists public.reserve_reports (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  order_email_key text not null,
  order_id text,
  nowpayments_payment_id text,
  issuer_name text not null,
  issuer_jurisdiction text not null default 'US',
  token_type text not null default 'single_currency',
  payload jsonb not null,
  status text not null default 'pending',        -- pending | processing | delivered | failed
  report_url text,
  report_html text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  delivered_at timestamptz
);

create index if not exists reserve_reports_order_email_key_idx
  on public.reserve_reports (order_email_key, status);

alter table public.reserve_reports enable row level security;

-- Service-role only (same pattern as mica_deadlines).
-- Postgres has no CREATE POLICY IF NOT EXISTS, so drop-then-create for rerunnability.
drop policy if exists "reserve_reports_service_role_all" on public.reserve_reports;
create policy "reserve_reports_service_role_all"
  on public.reserve_reports
  for all
  to service_role
  using (true)
  with check (true);

-- Storage bucket for rendered report HTML (same pattern as tracr-reports).
insert into storage.buckets (id, name, public)
values ('reserve-reports', 'reserve-reports', true)
on conflict (id) do nothing;

drop policy if exists "reserve_reports_public_read" on storage.objects;
create policy "reserve_reports_public_read"
  on storage.objects
  for select
  using (bucket_id = 'reserve-reports');

drop policy if exists "reserve_reports_storage_service_role_all" on storage.objects;
create policy "reserve_reports_storage_service_role_all"
  on storage.objects
  for all
  to service_role
  using (bucket_id = 'reserve-reports')
  with check (bucket_id = 'reserve-reports');
