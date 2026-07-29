-- PARKED 2026-07-30 — PropSignal is not being built in the current runway.
-- Its SOCRATA_DATASETS registry is empty and its Perplexity key is a
-- placeholder. This migration still FKs trio_properties (now dd_properties)
-- and is intentionally left unapplied and inert. Revive with the app.

-- PropSignal: property risk reports built from free public data sources
-- (FEMA NFHL, EPA EJScreen/Envirofacts, Socrata open data, Perplexity research).
-- source_snapshots keeps the raw signals so the daily delta-scan cron can
-- diff yesterday vs today for portfolio monitoring.
-- NOT APPLIED YET — scaffold 2026-07-28. Depends on 20260728_trio_properties.sql.
-- See apps/propsignal/docs/PLAN.md.

begin;

create table if not exists public.propsignal_reports (
  id               uuid primary key default gen_random_uuid(),
  property_id      uuid references public.trio_properties(id) on delete cascade,
  user_id          uuid references auth.users(id) on delete cascade,
  email            text,
  score            int check (score is null or (score >= 0 and score <= 100)),
  grade            text check (grade in ('A','B','C','D','F')),
  source_snapshots jsonb not null default '{}'::jsonb,  -- {fema:[RiskSignal], epa:[...], socrata:[...], research:[...]}
  pdf_url          text,
  status           text not null default 'pending' check (status in
                     ('pending','generating','delivered','failed')),
  generated_at     timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists idx_propsignal_reports_user
  on public.propsignal_reports (user_id, created_at desc);
create index if not exists idx_propsignal_reports_property
  on public.propsignal_reports (property_id, created_at desc);
create index if not exists idx_propsignal_reports_status
  on public.propsignal_reports (status)
  where status in ('pending','generating');

alter table public.propsignal_reports enable row level security;

drop policy if exists "service_role propsignal_reports" on public.propsignal_reports;
create policy "service_role propsignal_reports"
  on public.propsignal_reports for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "own rows propsignal_reports" on public.propsignal_reports;
create policy "own rows propsignal_reports"
  on public.propsignal_reports for select
  using (auth.uid() = user_id);

commit;
