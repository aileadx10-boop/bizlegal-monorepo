-- 2026-07-16: Tables required by conversion_funnel, enterprise_closer, and aeo_revenue agents
-- NOTE: lead_nurture_state, agent_runs, partners already existed with different schemas.
-- This migration creates seo_citation_log and extends existing tables with missing columns.
-- Applied to ydghhcuuopqzgqcicubg via MCP (migration name: 20260716_revenue_agent_tables_v3).

-- Create seo_citation_log (was missing)
create table if not exists public.seo_citation_log (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  keyword text,
  referrer text,
  visit_count integer not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revenue_attributed boolean default false,
  unique(url, referrer)
);
create index if not exists seo_citation_log_url_idx on public.seo_citation_log (url);
create index if not exists seo_citation_log_referrer_idx on public.seo_citation_log (referrer, visit_count desc);
alter table public.seo_citation_log enable row level security;

-- Extend agent_runs (existed: id, agent_name, workflow_id, action, status, details, target_email, created_at)
alter table public.agent_runs add column if not exists duration_ms integer;

-- Extend lead_nurture_state (existed with most drip columns; add missing)
alter table public.lead_nurture_state add column if not exists risk_score smallint;
alter table public.lead_nurture_state add column if not exists last_template text;
alter table public.lead_nurture_state add column if not exists converted_at timestamptz;

-- Extend partners (existed as OCI deal-router table; add sales prospect pipeline fields)
alter table public.partners add column if not exists status text default 'prospect';
alter table public.partners add column if not exists vertical text;
alter table public.partners add column if not exists company text;
alter table public.partners add column if not exists referral_count integer not null default 0;
alter table public.partners add column if not exists revenue_generated_usd numeric(10,2) not null default 0;
create index if not exists partners_sales_status_idx on public.partners (status) where status is not null;
