begin;

-- Attorney portal access log. Access codes live on coguard_binders.attorney_access_code.
-- This table records who accessed what and when.
create table if not exists public.coguard_attorney_access (
  id               uuid        primary key default gen_random_uuid(),
  attorney_email   text,                   -- null until attorney provides email (optional)
  subscriber_id    uuid        not null
                                 references public.coguard_subscribers(id) on delete cascade,
  binder_id        uuid        references public.coguard_binders(id) on delete set null,
  access_code      text        not null,   -- mirrors coguard_binders.attorney_access_code
  access_count     int         not null default 0,
  created_at       timestamptz not null default now(),
  last_accessed_at timestamptz,
  unique(access_code)
);

create index if not exists idx_coguard_attorney_sub
  on public.coguard_attorney_access (subscriber_id);

create index if not exists idx_coguard_attorney_code
  on public.coguard_attorney_access (access_code);

-- RLS: service_role only. Attorney portal uses server-side service_role reads.
-- No authenticated-user access — attorneys are not Supabase users.
alter table public.coguard_attorney_access enable row level security;

create policy "service_role full access on coguard_attorney_access"
  on public.coguard_attorney_access
  for all
  to service_role
  using (true)
  with check (true);

commit;
