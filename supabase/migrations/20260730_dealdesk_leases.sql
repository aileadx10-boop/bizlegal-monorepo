-- DealDesk — DocParse: parsed lease abstracts
-- Supersedes the unapplied scaffold migration 20260728_leaseparse_leases.sql.
-- Renaming was free: verified 2026-07-30 against project ydghhcuuopqzgqcicubg
-- that NONE of the 20260728 trio tables exist, so nothing is being migrated.
--
-- NOT APPLIED YET. Apply order: dd_properties FIRST, then the rest.
--
-- `user_id` is intentionally NULLABLE with an `email` fallback: anonymous
-- checkout captures an email before an account exists, and a later login
-- backfills user_id. Do not add NOT NULL.

begin;

create table if not exists public.dd_leases (
  id               uuid primary key default gen_random_uuid(),
  property_id      uuid references public.dd_properties(id) on delete cascade,
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

create index if not exists idx_dd_leases_user
  on public.dd_leases (user_id, created_at desc);
create index if not exists idx_dd_leases_property
  on public.dd_leases (property_id);
-- daily 06:00 UTC date-scan cron reads critical_dates across all rows
create index if not exists idx_dd_leases_parsed
  on public.dd_leases (parsed_at desc);

alter table public.dd_leases enable row level security;

drop policy if exists "service_role dd_leases" on public.dd_leases;
create policy "service_role dd_leases"
  on public.dd_leases for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "own rows dd_leases" on public.dd_leases;
create policy "own rows dd_leases"
  on public.dd_leases for select
  using (auth.uid() = user_id);

commit;
