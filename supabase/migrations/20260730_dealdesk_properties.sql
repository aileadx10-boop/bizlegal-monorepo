-- DealDesk — shared property spine (apply first)
-- Supersedes the unapplied scaffold migration 20260728_trio_properties.sql.
-- Renaming was free: verified 2026-07-30 against project ydghhcuuopqzgqcicubg
-- that NONE of the 20260728 trio tables exist, so nothing is being migrated.
--
-- NOT APPLIED YET. Apply order: dd_properties FIRST, then the rest.
--
-- `user_id` is intentionally NULLABLE with an `email` fallback: anonymous
-- checkout captures an email before an account exists, and a later login
-- backfills user_id. Do not add NOT NULL.

begin;

create table if not exists public.dd_properties (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  -- anonymous checkout flow captures email before an account exists
  email       text,
  address     text not null,
  city        text,
  state       text check (state is null or char_length(state) = 2),
  zip         text check (zip is null or zip ~ '^[0-9]{5}(-[0-9]{4})?$'),
  lat         double precision,
  lon         double precision,
  created_at  timestamptz not null default now()
);

create index if not exists idx_dd_properties_user
  on public.dd_properties (user_id, created_at desc);
create index if not exists idx_dd_properties_email
  on public.dd_properties (lower(email));

alter table public.dd_properties enable row level security;

drop policy if exists "service_role dd_properties" on public.dd_properties;
create policy "service_role dd_properties"
  on public.dd_properties for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "own rows dd_properties" on public.dd_properties;
create policy "own rows dd_properties"
  on public.dd_properties for select
  using (auth.uid() = user_id);

commit;
