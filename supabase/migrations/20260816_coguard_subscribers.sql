begin;

create table if not exists public.coguard_subscribers (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        references auth.users(id) on delete cascade,
  email             text        not null,
  plan              text        not null default 'solo'
                                  check (plan in ('solo', 'litigation')),
  status            text        not null default 'inactive'
                                  check (status in ('inactive', 'active', 'suspended', 'cancelled')),
  inbox_alias       text        unique,     -- UUID portion of {uuid}@inbox.coguard.bizlegal-ai.com
  reply_address     text        unique,     -- {slug}@reply.coguard.bizlegal-ai.com
  payment_order_id  uuid,
  trial_ends_at     timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists idx_coguard_sub_email
  on public.coguard_subscribers (lower(email));

create index if not exists idx_coguard_sub_user
  on public.coguard_subscribers (user_id)
  where user_id is not null;

create index if not exists idx_coguard_sub_status
  on public.coguard_subscribers (status)
  where status = 'active';

-- RLS: service_role can do everything; authenticated users can SELECT their own row
alter table public.coguard_subscribers enable row level security;

create policy "service_role full access on coguard_subscribers"
  on public.coguard_subscribers
  for all
  to service_role
  using (true)
  with check (true);

create policy "subscribers can read their own row"
  on public.coguard_subscribers
  for select
  to authenticated
  using (user_id = auth.uid());

commit;
