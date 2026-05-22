-- Phase RR R4 — Social syndication queue (applied 2026-05-22 via MCP)

begin;

create table if not exists public.social_drafts (
  id              bigserial primary key,
  channel         text        not null check (channel in ('linkedin','x','reddit','buffer')),
  status          text        not null default 'pending_approval'
    check (status in ('pending_approval','approved','rejected','posted','failed')),
  source_url      text        not null,
  source_title    text,
  body            text        not null,
  channel_meta    jsonb       not null default '{}'::jsonb,
  posted_url      text,
  posted_at       timestamptz,
  approval_token  text        unique,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_social_drafts_status_created on public.social_drafts (status, created_at desc);
create index if not exists idx_social_drafts_channel on public.social_drafts (channel);

alter table public.social_drafts enable row level security;

drop policy if exists "service_role read social_drafts" on public.social_drafts;
drop policy if exists "service_role write social_drafts" on public.social_drafts;
create policy "service_role read social_drafts"
  on public.social_drafts for select
  using (auth.role() = 'service_role');
create policy "service_role write social_drafts"
  on public.social_drafts for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

commit;
