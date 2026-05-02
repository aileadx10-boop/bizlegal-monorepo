-- Hetzner curator — daily_gaps schema for the scout/brain/publisher loop.
-- Apply once via Supabase SQL editor (project ydghhcuuopqzgqcicubg).
-- Idempotent: re-running adds only the missing columns/indexes.

-- 1. Base table — created if missing. Existing tables get the new columns.
create table if not exists public.daily_gaps (
  url            text primary key,
  feed_id        text not null,
  title          text not null,
  summary        text,
  vertical       text,
  scout_date     date,
  scouted_at     timestamptz default now(),
  status         text not null default 'pending_pick'
                 check (status in (
                   'pending_pick', 'picked', 'archived', 'skipped',
                   'drafted', 'published', 'rejected'
                 )),
  -- Scout-stage scoring
  relevance      int,    -- 1-5 from llama3.2:3b filter pass
  revenue        int,    -- 0-10 from qwen2.5:7b ranker
  timeliness     int,    -- 0-10 from qwen2.5:7b ranker
  total_score    int,    -- relevance + revenue + timeliness (denormalized for sort)
  short_thesis   text,
  rationale      text,
  -- Pick-stage
  picked_at      timestamptz,
  actioned_at    timestamptz,
  -- Brain-stage
  draft_path     text,
  draft_slug     text,
  drafted_at     timestamptz,
  target         text default 'blog'
                 check (target in ('blog', 'hub', 'both')),
  regen_count    int default 0,
  -- Publish-stage
  published_at   timestamptz,
  blog_url       text,
  hub_url        text,
  -- Anti-hallucination verification
  verification_failed     boolean default false,
  unverified_numbers      jsonb
);

-- 2. Add columns to a pre-existing daily_gaps if it was created earlier
--    by Moses's strategy_brain.py marimo notebook. PostgreSQL ignores
--    duplicate column adds with `if not exists`.
alter table public.daily_gaps
  add column if not exists feed_id text,
  add column if not exists title text,
  add column if not exists summary text,
  add column if not exists vertical text,
  add column if not exists scout_date date,
  add column if not exists scouted_at timestamptz default now(),
  add column if not exists relevance int,
  add column if not exists revenue int,
  add column if not exists timeliness int,
  add column if not exists total_score int,
  add column if not exists short_thesis text,
  add column if not exists rationale text,
  add column if not exists picked_at timestamptz,
  add column if not exists actioned_at timestamptz,
  add column if not exists draft_path text,
  add column if not exists draft_slug text,
  add column if not exists drafted_at timestamptz,
  add column if not exists target text default 'blog',
  add column if not exists regen_count int default 0,
  add column if not exists published_at timestamptz,
  add column if not exists blog_url text,
  add column if not exists hub_url text,
  add column if not exists verification_failed boolean default false,
  add column if not exists unverified_numbers jsonb;

-- 3. Indexes for the workflows scout/brain/publisher rely on.
create index if not exists daily_gaps_status_idx on public.daily_gaps (status);
create index if not exists daily_gaps_scout_date_idx on public.daily_gaps (scout_date desc);
create index if not exists daily_gaps_total_score_idx on public.daily_gaps (total_score desc);
create index if not exists daily_gaps_draft_slug_idx on public.daily_gaps (draft_slug);

-- 4. RLS — scout/brain/publisher write via service-role key, no client
--    access expected. Enable RLS so any future anon-key paths fail closed.
alter table public.daily_gaps enable row level security;

-- Service role bypasses RLS by default; no policy needed for scout/brain/publisher.
-- Drop any inadvertent anon read policies.
drop policy if exists "anon_read_daily_gaps" on public.daily_gaps;

-- 5. (Optional) View the strategy_brain notebook reads — performance bands.
create or replace view public.daily_gaps_active as
  select *
  from public.daily_gaps
  where status not in ('rejected', 'archived', 'skipped')
  order by total_score desc, scouted_at desc;
