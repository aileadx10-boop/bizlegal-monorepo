-- Trio (PropSignal + LeaseParse + CloseFlow) shared property spine.
-- One property row can have PropSignal reports, LeaseParse leases, and
-- CloseFlow transactions attached — this is the cross-sell backbone
-- (report → parse → transaction lifecycle).
-- NOT APPLIED YET — scaffold 2026-07-28. Apply via MCP/CLI when the first
-- trio surface goes to build phase. See
-- decisions/TRIO-PROPSIGNAL-LEASEPARSE-CLOSEFLOW-2026-07-28.md.

begin;

create table if not exists public.trio_properties (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  -- anonymous checkout flow captures email before an account exists
  email       text,
  address     text not null,
  city        text,
  -- 2026-08-23: `state`/`zip` originally carried US-only CHECKs (2-char state,
  -- 5-digit ZIP). Dubai is the first jurisdiction pack, and no Dubai address
  -- satisfies either — "Dubai" is not two characters and there is no ZIP at all.
  -- Since this migration had never been applied, the shape was still free to
  -- change. `region` and `postcode` are free-form; `country` is ISO-3166-1
  -- alpha-2 and defaults to US so existing US-shaped callers are unaffected.
  country     text not null default 'US'
                check (char_length(country) = 2),
  region      text,
  postcode    text,
  lat         double precision,
  lon         double precision,
  created_at  timestamptz not null default now()
);

create index if not exists idx_trio_properties_user
  on public.trio_properties (user_id, created_at desc);
create index if not exists idx_trio_properties_email
  on public.trio_properties (lower(email));

alter table public.trio_properties enable row level security;

drop policy if exists "service_role trio_properties" on public.trio_properties;
create policy "service_role trio_properties"
  on public.trio_properties for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "own rows trio_properties" on public.trio_properties;
create policy "own rows trio_properties"
  on public.trio_properties for select
  using (auth.uid() = user_id);

commit;
