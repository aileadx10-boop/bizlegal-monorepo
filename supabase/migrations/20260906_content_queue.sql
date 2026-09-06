-- Marketing content queue (goal M.1) — event-driven content automation.
-- Spec: BizLegal_Marketing_GoalMode_Commands.md GOAL M.1.
--
-- Flow: product apps (falseecho, sellerradar) POST events to the hub
-- /api/marketing/trigger route → row lands in content_queue → the
-- services/marketing Trigger.dev schedule (every 6h) marks pending rows
-- 'processing' and POSTs them to the n8n webhook → n8n publishes and
-- calls back to /api/marketing/callback, which upserts published_content.
--
-- Access pattern: service-role writes from the hub API routes and the
-- Trigger.dev worker. RLS is enabled on all three tables; the only anon
-- policy is read access on published_content (public proof-of-content
-- surface). content_queue and content_assets stay deny-by-default.

begin;

-- ── One row per marketing event awaiting content generation ───────────────
create table if not exists public.content_queue (
  id             uuid primary key default gen_random_uuid(),
  product        text not null,                 -- falseecho | sellerradar | hub | …
  event_type     text not null,                 -- falsehood_detected | fee_change_detected | …
  payload        jsonb not null default '{}'::jsonb,
  status         text not null default 'pending'
                   check (status in ('pending', 'processing', 'published', 'failed')),
  content_types  text[],                        -- requested outputs: blog | linkedin | seo_page | video | …
  scheduled_for  timestamptz,                   -- null = process on next worker run
  created_at     timestamptz not null default now(),
  processed_at   timestamptz,
  published_urls jsonb                          -- [{content_type, url, platform}], filled by callback
);

create index if not exists idx_content_queue_pending
  on public.content_queue (status, created_at)
  where status = 'pending';

-- ── Generated assets attached to a queue item (images, video, docs) ───────
create table if not exists public.content_assets (
  id         uuid primary key default gen_random_uuid(),
  queue_id   uuid not null references public.content_queue(id) on delete cascade,
  asset_type text not null,                     -- image | video | pdf | …
  url        text not null,
  drive_id   text,                              -- Google Drive file id, when mirrored there
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_content_assets_queue on public.content_assets (queue_id, created_at desc);

-- ── Published outputs (the public, anon-readable proof surface) ───────────
create table if not exists public.published_content (
  id           uuid primary key default gen_random_uuid(),
  queue_id     uuid references public.content_queue(id) on delete set null,
  product      text not null,
  content_type text not null,                   -- blog | linkedin | seo_page | reddit | video | newsletter
  title        text,
  url          text not null,
  platform     text,                            -- bizlegal-ai.com | linkedin | reddit | youtube | …
  engagement   jsonb not null default '{}'::jsonb, -- views/likes/comments, refreshed by M.7
  published_at timestamptz not null default now()
);

create index if not exists idx_published_content_product
  on public.published_content (product, published_at desc);
create unique index if not exists idx_published_content_dedup
  on public.published_content (queue_id, content_type, url);

-- ── RLS: service-role write everywhere; anon reads published_content only ─
alter table public.content_queue     enable row level security;
alter table public.content_assets    enable row level security;
alter table public.published_content enable row level security;

create policy published_content_anon_read
  on public.published_content
  for select
  to anon
  using (true);

commit;
