-- OCI Deal Router — Supabase migration (Phase B2)
-- Apply once via Supabase SQL editor on project ydghhcuuopqzgqcicubg.
-- Idempotent: re-runnable if you ever need to.
--
-- Schema decisions (Moses-confirmed 2026-04-26):
--   - Reuse existing hub project (no new project)
--   - USD-only payouts (no multi-currency tracking)
--   - 90-day anonymization of contact PII (GDPR/UAE-PDPL safety)

-- ─────────────────────────────────────────────────────────────────
-- 1. partners — referral targets (realtors, lawyers, advisors)
-- ─────────────────────────────────────────────────────────────────

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  type text not null check (type in (
    'realtor',
    're_lawyer',
    'business_lawyer',
    'structuring_advisor',
    'family_office_advisor',
    'placeholder'                   -- fallback: routes to Moses himself
  )),

  -- Capability
  jurisdictions text[] not null default '{}',   -- ['UAE','SG','US','EU','IL','GB']
  specialties text[] not null default '{}',     -- ['DIFC_SPV','Reg_D','MAS_FFR','RERA']
  language_codes text[] not null default '{en}',-- ['en','ar','he','zh']

  -- Capacity (round-robin + weekly cap)
  active boolean not null default true,
  weekly_cap int not null default 5,
  current_week_count int not null default 0,
  current_week_start date,

  -- Commercial terms
  commission_pct_min numeric(5,2),
  commission_pct_max numeric(5,2),
  commission_basis text check (commission_basis in (
    'deal_value', 'fees_collected', 'fixed_per_intro'
  )),
  contract_signed_at timestamptz,
  contract_url text,

  -- Routing priority (1 = best, 5 = backup)
  tier int not null default 3 check (tier between 1 and 5),

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partners_active_idx
  on public.partners (active) where active = true;
create index if not exists partners_jurisdictions_idx
  on public.partners using gin (jurisdictions);
create index if not exists partners_specialties_idx
  on public.partners using gin (specialties);
create index if not exists partners_type_idx on public.partners (type);
create index if not exists partners_tier_idx on public.partners (tier);

-- ─────────────────────────────────────────────────────────────────
-- 2. deal_router_leads — every classified inbound lead
-- ─────────────────────────────────────────────────────────────────

create table if not exists public.deal_router_leads (
  lead_id text primary key,
  received_at timestamptz not null default now(),

  -- Source / intake
  source text not null check (source in (
    'hub_form', 'ea_worker', 'manual', 'unknown'
  )),
  source_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  user_agent text,
  ip_country text,

  -- Contact PII — anonymized after 90 days by anonymize_old_leads()
  contact_name text,
  contact_email text,
  contact_phone text,
  contact_role text,
  contact_anonymized_at timestamptz,

  -- Lead body
  raw_text text not null,

  -- WAT Phase 1 output (router classification)
  classification text not null check (classification in (
    'UAE_REAL_ESTATE',
    'SG_BUSINESS_SETUP',
    'EU_US_BUSINESS',
    'LEGAL_RISK_REPORT',
    'LOW_VALUE'
  )),
  buyer_type text,
  pain_point text,
  intent text check (intent in ('HIGH', 'MEDIUM', 'LOW')),
  budget_signal text check (budget_signal in ('HIGH', 'MEDIUM', 'LOW')),
  priority text check (priority in ('HOT', 'WARM', 'COLD')),

  -- Routing decision
  action text not null check (action in (
    'ROUTE_PARTNER', 'SELL_REPORT', 'IGNORE'
  )),
  recommended_partner text,                  -- 'realtor' | 'lawyer' | 'realtor + lawyer' | 'none'
  recommended_offer text,
  partner_id uuid references public.partners(id),

  -- Quality + audit
  confidence numeric(3,2),                   -- 0.00 to 1.00
  one_sentence_rationale text,
  next_step text,
  evaluation_scores jsonb,                   -- 6 WAT rubric scores
  optimized_final_version text,
  disclaimer_version text not null default 'v1.0.0-p1',

  -- LLM trace
  router_model text,                         -- 'claude-haiku-4-5' or 'claude-sonnet-4-6'
  escalated_to_sonnet boolean default false,
  raw_llm_response jsonb,                    -- full <thinking>+<output> block

  -- Lifecycle / outcome (Moses or partner updates these)
  partner_emailed_at timestamptz,
  partner_replied_at timestamptz,
  outcome text check (outcome in ('won', 'lost', 'no_show', 'pending')),
  outcome_notes text,

  updated_at timestamptz not null default now()
);

create index if not exists dr_leads_classification_idx
  on public.deal_router_leads (classification);
create index if not exists dr_leads_priority_idx
  on public.deal_router_leads (priority);
create index if not exists dr_leads_received_at_idx
  on public.deal_router_leads (received_at desc);
create index if not exists dr_leads_outcome_idx
  on public.deal_router_leads (outcome);
create index if not exists dr_leads_partner_id_idx
  on public.deal_router_leads (partner_id);

-- ─────────────────────────────────────────────────────────────────
-- 3. payouts — referral fee tracking (USD-only per Moses)
-- ─────────────────────────────────────────────────────────────────

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  lead_id text not null references public.deal_router_leads(lead_id),
  partner_id uuid not null references public.partners(id),

  -- USD-only — convert at earn-time
  commission_usd numeric(12,2) not null,

  status text not null check (status in (
    'pending',     -- earned, awaiting partner confirmation
    'confirmed',   -- partner acknowledged the close
    'invoiced',    -- Moses sent invoice
    'paid',        -- received
    'disputed',    -- partner pushback
    'voided'       -- deal didn't close
  )),

  -- Lifecycle timestamps
  earned_at timestamptz not null default now(),
  confirmed_at timestamptz,
  invoiced_at timestamptz,
  paid_at timestamptz,

  -- Reference numbers
  invoice_number text,
  payment_reference text,

  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payouts_status_idx on public.payouts (status);
create index if not exists payouts_partner_id_idx on public.payouts (partner_id);
create index if not exists payouts_lead_id_idx on public.payouts (lead_id);

-- ─────────────────────────────────────────────────────────────────
-- 4. updated_at triggers (so manual updates from Supabase UI stay
--    accurate without the OCI router having to remember)
-- ─────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_partners_updated on public.partners;
create trigger trg_partners_updated
  before update on public.partners
  for each row execute function public.set_updated_at();

drop trigger if exists trg_dr_leads_updated on public.deal_router_leads;
create trigger trg_dr_leads_updated
  before update on public.deal_router_leads
  for each row execute function public.set_updated_at();

drop trigger if exists trg_payouts_updated on public.payouts;
create trigger trg_payouts_updated
  before update on public.payouts
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────
-- 5. 90-day anonymization function
--    Called by a daily cron (OCI side or pg_cron — see note below).
-- ─────────────────────────────────────────────────────────────────

create or replace function public.anonymize_old_leads()
returns int
language plpgsql
security definer
as $$
declare
  affected int;
begin
  update public.deal_router_leads
  set
    contact_name = null,
    contact_email = null,
    contact_phone = null,
    contact_role = null,
    contact_anonymized_at = now()
  where contact_email is not null
    and received_at < now() - interval '90 days'
    and contact_anonymized_at is null;
  get diagnostics affected = row_count;
  return affected;
end;
$$;

-- Optional: schedule via pg_cron if extension is enabled in this project.
-- Otherwise the OCI publisher's nightly systemd timer calls this RPC daily.
-- Uncomment after confirming `create extension pg_cron;` is enabled:
-- select cron.schedule(
--   'anonymize-deal-router-leads-daily',
--   '0 3 * * *',
--   'select public.anonymize_old_leads();'
-- );

-- ─────────────────────────────────────────────────────────────────
-- 6. RLS — service-role only. Anon must NEVER read these tables.
-- ─────────────────────────────────────────────────────────────────

alter table public.partners enable row level security;
alter table public.deal_router_leads enable row level security;
alter table public.payouts enable row level security;

-- Service role bypasses RLS by default. No policies needed.
-- Defensive: explicitly drop any anon policies if they exist.
drop policy if exists anon_read_partners on public.partners;
drop policy if exists anon_read_deal_router_leads on public.deal_router_leads;
drop policy if exists anon_read_payouts on public.payouts;

-- ─────────────────────────────────────────────────────────────────
-- 7. Convenience views for the strategy_brain Marimo notebook
--    (Moses queries these read-only via service role; never anon)
-- ─────────────────────────────────────────────────────────────────

create or replace view public.deal_router_active as
  select
    l.lead_id,
    l.received_at,
    l.classification,
    l.priority,
    l.action,
    l.confidence,
    l.recommended_offer,
    l.outcome,
    p.name as partner_name,
    p.type as partner_type
  from public.deal_router_leads l
  left join public.partners p on p.id = l.partner_id
  where l.action in ('ROUTE_PARTNER', 'SELL_REPORT')
  order by l.received_at desc;

create or replace view public.payouts_open as
  select
    py.id,
    py.lead_id,
    p.name as partner_name,
    p.email as partner_email,
    py.commission_usd,
    py.status,
    py.earned_at,
    extract(day from now() - py.earned_at)::int as days_open
  from public.payouts py
  join public.partners p on p.id = py.partner_id
  where py.status in ('pending', 'confirmed', 'invoiced')
  order by py.earned_at;

-- ─────────────────────────────────────────────────────────────────
-- 8. Verification queries (run manually after migration)
-- ─────────────────────────────────────────────────────────────────

-- select 'partners' as t, count(*) from public.partners
-- union all
-- select 'deal_router_leads' as t, count(*) from public.deal_router_leads
-- union all
-- select 'payouts' as t, count(*) from public.payouts;
--
-- Expect: 0, 0, 0 immediately after migration.
