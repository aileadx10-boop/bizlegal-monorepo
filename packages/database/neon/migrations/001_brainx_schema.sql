-- ============================================================
-- BRAINX — Neon schema v1 (adapted from Intelligence OS spec §4.1)
-- Supabase-free: no RLS, no Supabase storage. Neon + pgvector only.
-- Apply in order against the `brainx` Neon project main branch.
-- ============================================================

create extension if not exists "pgvector";
create extension if not exists "pgcrypto";

-- ---------- markets / verticals ----------
create table if not exists markets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  vertical text not null check (vertical in ('real_estate','legal_compliance','ai_fintech_regulation')),
  name text not null,
  description text,
  keywords text[] not null default '{}',
  geo text not null default 'US',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- sources ----------
create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets(id) on delete cascade,
  source_type text not null,
  source_name text not null,
  url text,
  config jsonb not null default '{}',
  is_active boolean not null default true,
  last_run_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- research runs (audit) ----------
create table if not exists research_runs (
  id uuid primary key default gen_random_uuid(),
  workflow text not null,
  market_id uuid references markets(id) on delete set null,
  status text not null default 'running',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  items_collected int not null default 0,
  items_new int not null default 0,
  cost_usd numeric(8,2),
  error text
);

-- ---------- signals (normalized, append-only) ----------
create table if not exists signals (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references research_runs(id) on delete set null,
  market_id uuid not null references markets(id) on delete cascade,
  source_id uuid references sources(id) on delete set null,
  signal_type text not null,
  title text not null,
  description text,
  url text,
  author text,
  raw_data jsonb not null,
  content_hash text not null,
  confidence numeric(4,3),
  sentiment numeric(4,3),
  intensity numeric(4,3),
  embedding vector(1536),
  detected_at timestamptz not null,
  analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (market_id, source_id, content_hash)
);
create index if not exists signals_market_idx on signals(market_id, detected_at desc);
create index if not exists signals_type_idx on signals(signal_type);
create index if not exists signals_embedding_idx on signals using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ---------- customer voices (subset of signals, enriched) ----------
create table if not exists customer_voices (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null unique references signals(id) on delete cascade,
  market_id uuid not null references markets(id) on delete cascade,
  voice_type text not null check (voice_type in ('pain','frustration','request','buying_signal','legal_pain','wtp','none')),
  quote text not null,
  paraphrase text,
  topic text,
  wtp_evidence boolean not null default false,
  urgency numeric(4,3),
  embedding vector(1536),
  created_at timestamptz not null default now()
);
create index if not exists customer_voices_market_idx on customer_voices(market_id, voice_type);

-- ---------- competitors ----------
create table if not exists competitors (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets(id) on delete cascade,
  name text not null,
  website text,
  positioning text,
  pricing jsonb,
  strengths text[],
  weaknesses text[],
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (market_id, name)
);

-- ---------- competitor snapshots (immutable) ----------
create table if not exists competitor_snapshots (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid not null references competitors(id) on delete cascade,
  snapshot_type text not null,
  data jsonb not null,
  page_hash text not null,
  captured_at timestamptz not null default now(),
  source_url text
);
create index if not exists competitor_snapshots_latest_idx on competitor_snapshots(competitor_id, snapshot_type, captured_at desc);

-- ---------- detected changes (diff output) ----------
create table if not exists detected_changes (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid not null references competitors(id) on delete cascade,
  market_id uuid not null references markets(id) on delete cascade,
  snapshot_type text not null,
  change_summary text not null,
  change_type text not null,
  business_meaning text,
  significance numeric(4,3),
  created_at timestamptz not null default now()
);

-- ---------- regulatory events ----------
create table if not exists regulatory_events (
  id uuid primary key default gen_random_uuid(),
  market_id uuid references markets(id) on delete cascade,
  title text not null,
  agency text,
  jurisdiction text,
  event_type text not null check (event_type in ('rule_change','enforcement_action','guidance','bill','court_ruling')),
  summary text,
  severity numeric(4,3),
  effective_date date,
  source_url text,
  published_at timestamptz not null default now()
);

-- ---------- opportunities (derived, never patched) ----------
create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets(id) on delete cascade,
  name text not null,
  problem text not null,
  target_customer text,
  proposed_product text,
  proposed_pricing jsonb,
  gtm_channels text[],
  demand_score numeric(5,2) not null default 0,
  pain_score numeric(5,2) not null default 0,
  wtp_score numeric(5,2) not null default 0,
  competition_score numeric(5,2) not null default 0,
  legal_score numeric(5,2) not null default 0,
  automation_score numeric(5,2) not null default 0,
  acquisition_score numeric(5,2) not null default 0,
  opportunity_score numeric(5,2) not null default 0,
  lang_arbitrage boolean not null default false,
  aeo_brief jsonb,
  status text not null default 'watch',
  status_reason text,
  confidence numeric(4,3),
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_scored_at timestamptz
);
create index if not exists opportunities_score_idx on opportunities(opportunity_score desc);
create index if not exists opportunities_status_idx on opportunities(status);

-- ---------- opportunity scores (history) ----------
create table if not exists opportunity_scores (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  demand numeric(5,2), pain numeric(5,2), wtp numeric(5,2),
  competition numeric(5,2), legal numeric(5,2),
  automation numeric(5,2), acquisition numeric(5,2),
  total numeric(5,2),
  scoring_version text not null default 'v1',
  computed_at timestamptz not null default now()
);

-- ---------- evidence links (no evidence, no opportunity) ----------
create table if not exists evidence_links (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  weight numeric(3,2) not null default 1.0,
  note text,
  created_at timestamptz not null default now(),
  unique (opportunity_id, entity_type, entity_id)
);

-- ---------- products / BUILD THIS output ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  name text not null,
  icp text,
  offer text,
  pricing jsonb,
  landing_page_spec jsonb,
  seo_keywords text[],
  outbound_list jsonb,
  email_sequence jsonb,
  mvp_spec jsonb,
  codex_task text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

-- ---------- alerts ----------
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  alert_type text not null,
  entity_type text,
  entity_id uuid,
  market_id uuid references markets(id) on delete cascade,
  title text not null,
  body jsonb,
  priority text not null default 'info',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- BrainX Gmail inbox (replies become signals) ----------
create table if not exists brainx_inbox (
  id uuid primary key default gen_random_uuid(),
  gmail_message_id text unique,
  thread_id text,
  from_email text not null,
  to_email text not null,
  subject text,
  body text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  signal_id uuid references signals(id) on delete set null
);

-- ---------- raw snapshot archive (replaces Supabase Storage) ----------
create table if not exists raw_snapshots (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_url text,
  data bytea,
  meta jsonb,
  captured_at timestamptz not null default now()
);

-- ---------- updated_at trigger ----------
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_markets_touch on markets;
create trigger trg_markets_touch before update on markets for each row execute function touch_updated_at();
drop trigger if exists trg_opportunities_touch on opportunities;
create trigger trg_opportunities_touch before update on opportunities for each row execute function touch_updated_at();

-- ---------- evidence gate trigger ----------
create or replace function evidence_gate() returns trigger as $$
begin
  if new.status in ('validated','build') and old.status is distinct from new.status then
    if (select count(*) from evidence_links where opportunity_id = new.id) < 3 then
      raise exception 'Opportunity % requires >= 3 evidence links to reach status %', new.id, new.status;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_opportunities_evidence on opportunities;
create trigger trg_opportunities_evidence before update on opportunities for each row execute function evidence_gate();

-- ---------- seed 3 verticals ----------
insert into markets (slug, vertical, name, keywords) values
  ('us-re-compliance', 'real_estate', 'US Real Estate Compliance', array['real estate compliance','brokerage audit','CRE due diligence']),
  ('legal-practice-growth', 'legal_compliance', 'Legal & Compliance Practice Growth', array['law firm growth','compliance practice','legal marketing']),
  ('ai-fintech-regulation', 'ai_fintech_regulation', 'AI & Fintech Regulation', array['AI compliance','fintech licensing','regulatory change'])
on conflict (slug) do nothing;
