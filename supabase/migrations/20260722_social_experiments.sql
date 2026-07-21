-- Growth Agent memory table: tracks per-channel post performance
-- so the planner can learn which angles/hooks work best over time.
-- Applied 2026-07-22 via MCP.

begin;

create table if not exists public.social_experiments (
  id              bigserial primary key,
  social_draft_id bigint references public.social_drafts(id) on delete set null,
  channel         text not null check (channel in ('linkedin','x','reddit','buffer')),
  angle           text not null,
  hook_type       text not null,
  topic           text not null,
  post_body       text not null,
  posted_url      text,
  posted_at       timestamptz,
  impressions     int  not null default 0,
  reactions       int  not null default 0,
  comments        int  not null default 0,
  shares          int  not null default 0,
  clicks          int  not null default 0,
  engagement_rate float not null default 0,
  followers_delta int  not null default 0,
  measured_at     timestamptz,
  what_worked     text,
  what_failed     text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_social_experiments_channel_eng
  on public.social_experiments (channel, engagement_rate desc);
create index if not exists idx_social_experiments_angle
  on public.social_experiments (angle, channel);
create index if not exists idx_social_experiments_posted_at
  on public.social_experiments (posted_at desc);

alter table public.social_experiments enable row level security;

drop policy if exists "service_role social_experiments" on public.social_experiments;
create policy "service_role social_experiments"
  on public.social_experiments for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Add measured_at to social_drafts if not present
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'social_drafts'
      and column_name = 'measured_at'
  ) then
    alter table public.social_drafts add column measured_at timestamptz;
  end if;
end $$;

commit;
