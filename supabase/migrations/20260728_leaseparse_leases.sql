-- LeaseParse: extracted lease abstracts + critical-date monitoring.
-- NOT APPLIED YET — scaffold 2026-07-28. Depends on 20260728_trio_properties.sql.
-- See apps/leaseparse/docs/PLAN.md.

begin;

create table if not exists public.leaseparse_leases (
  id               uuid primary key default gen_random_uuid(),
  property_id      uuid references public.trio_properties(id) on delete cascade,
  user_id          uuid references auth.users(id) on delete cascade,
  email            text,
  pdf_url          text,                    -- Supabase storage path
  lease_type       text check (lease_type in ('retail','office','industrial','other')),
  extracted_json   jsonb,                   -- full LeaseAbstract (lib/extract/types.ts)
  confidence_score real check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 1)),
  engine           text check (engine in ('hermes','claude')),
  critical_dates   jsonb not null default '[]'::jsonb,  -- [{key,label,date,notice_window_days}]
  risk_flags       jsonb not null default '[]'::jsonb,  -- [{clause,excerpt,severity}]
  parsed_at        timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists idx_leaseparse_leases_user
  on public.leaseparse_leases (user_id, created_at desc);
create index if not exists idx_leaseparse_leases_property
  on public.leaseparse_leases (property_id);
-- daily 06:00 UTC date-scan cron reads critical_dates across all rows
create index if not exists idx_leaseparse_leases_parsed
  on public.leaseparse_leases (parsed_at desc);

alter table public.leaseparse_leases enable row level security;

drop policy if exists "service_role leaseparse_leases" on public.leaseparse_leases;
create policy "service_role leaseparse_leases"
  on public.leaseparse_leases for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "own rows leaseparse_leases" on public.leaseparse_leases;
create policy "own rows leaseparse_leases"
  on public.leaseparse_leases for select
  using (auth.uid() = user_id);

commit;
