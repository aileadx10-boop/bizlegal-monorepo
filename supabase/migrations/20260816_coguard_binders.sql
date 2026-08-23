begin;

create table if not exists public.coguard_binders (
  id                    uuid        primary key default gen_random_uuid(),
  subscriber_id         uuid        not null
                                      references public.coguard_subscribers(id) on delete cascade,
  date_from             timestamptz not null,
  date_to               timestamptz not null,
  status                text        not null default 'pending'
                                      check (status in ('pending', 'generating', 'ready', 'failed')),
  pdf_url               text,                   -- Supabase Storage signed URL (24h expiry)
  message_count         int,
  bates_start           int,
  bates_end             int,
  attorney_access_code  text        unique default substr(encode(gen_random_bytes(9), 'base64'), 1, 12),
  created_at            timestamptz not null default now(),
  completed_at          timestamptz
);

create index if not exists idx_coguard_binders_subscriber
  on public.coguard_binders (subscriber_id, created_at desc);

create index if not exists idx_coguard_binders_pending
  on public.coguard_binders (status)
  where status in ('pending', 'generating');

create index if not exists idx_coguard_binders_attorney_code
  on public.coguard_binders (attorney_access_code)
  where attorney_access_code is not null;

-- RLS: service_role full; subscribers can read their own binders
alter table public.coguard_binders enable row level security;

create policy "service_role full access on coguard_binders"
  on public.coguard_binders
  for all
  to service_role
  using (true)
  with check (true);

create policy "subscribers can read their own binders"
  on public.coguard_binders
  for select
  to authenticated
  using (
    subscriber_id in (
      select id from public.coguard_subscribers where user_id = auth.uid()
    )
  );

commit;
