-- SellerRadar monitor scan state — columns the weekly re-scan cron
-- (apps/sellerradar/app/api/cron/monitor/route.ts) needs to diff against:
-- the last-known schedule version + computed impact, and a link from each
-- re-scan report back to the monitor that produced it.

begin;

alter table public.sellerradar_monitors
  add column if not exists last_scanned_at        timestamptz,
  add column if not exists last_schedule_version  text,        -- fixture version the stored impact was computed against
  add column if not exists last_monthly_impact    numeric(12,2),
  add column if not exists last_annual_impact     numeric(12,2),
  add column if not exists last_changed_fee_types text[];

alter table public.sellerradar_reports
  add column if not exists monitor_id uuid references public.sellerradar_monitors(id) on delete set null;

create index if not exists idx_sellerradar_reports_monitor
  on public.sellerradar_reports (monitor_id, created_at desc);

commit;
