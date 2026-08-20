begin;

create table if not exists public.coguard_drafts (
  id               uuid        primary key default gen_random_uuid(),
  subscriber_id    uuid        not null
                                 references public.coguard_subscribers(id) on delete cascade,
  raw_draft        text        not null,
  biff_text        text,
  tone_score       real        check (tone_score is null
                                  or (tone_score >= 0 and tone_score <= 1)),
  biff_needed      boolean,
  changes_summary  text,
  status           text        not null default 'pending_approval'
                                 check (status in ('pending_approval', 'sent', 'discarded')),
  sent_at          timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists idx_coguard_drafts_pending
  on public.coguard_drafts (subscriber_id, created_at desc)
  where status = 'pending_approval';

-- RLS: service_role full; subscribers can read + update their own drafts
-- (subscriber may discard a pending draft via dashboard)
alter table public.coguard_drafts enable row level security;

create policy "service_role full access on coguard_drafts"
  on public.coguard_drafts
  for all
  to service_role
  using (true)
  with check (true);

create policy "subscribers can read their own drafts"
  on public.coguard_drafts
  for select
  to authenticated
  using (
    subscriber_id in (
      select id from public.coguard_subscribers where user_id = auth.uid()
    )
  );

create policy "subscribers can discard their own pending drafts"
  on public.coguard_drafts
  for update
  to authenticated
  using (
    subscriber_id in (
      select id from public.coguard_subscribers where user_id = auth.uid()
    )
    and status = 'pending_approval'
  )
  with check (status = 'discarded');

commit;
