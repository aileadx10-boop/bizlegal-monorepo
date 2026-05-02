-- ============================================================
-- FORGE COMPLIANCE ENGINE — SUPABASE SCHEMA
-- All verticals: CIPA, GPC, MHMDA, GIPA, EdTech, Surplus, Passport
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── ENUM TYPES ──────────────────────────────────────────────────────────────

create type vertical_type as enum (
  'cipa', 'gpc', 'mhmda', 'gipa', 'edtech',
  'noncompete', 'phantom_1099', 'surplus_funds',
  'passport', 'gdpr', 'delete_act', 'ftc_review'
);

create type scan_status as enum (
  'queued', 'scanning', 'complete', 'failed', 'manual_review'
);

create type payment_status as enum (
  'pending', 'paid', 'refunded', 'failed'
);

create type risk_level as enum ('low', 'medium', 'high', 'critical');

-- ── EXECUTORS (attorneys, investors, service providers) ──────────────────────
-- Defined first so qualified_cases can reference it

create table executors (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now(),

  name          text not null,
  email         text not null unique,
  phone         text,
  type          text not null,      -- 'attorney', 'investor', 'cpa', 'hr_consultant'
  specialties   jsonb default '[]', -- ['surplus_funds', 'privacy_law', 'employment']
  states        jsonb default '[]', -- ['FL', 'TX', 'IL']
  active        boolean default true,
  notes         text,

  -- Performance
  cases_assigned integer default 0,
  cases_accepted integer default 0,
  revenue_generated bigint default 0
);

-- ── SCANS (web-based modules: CIPA, GPC, MHMDA, GDPR) ──────────────────────

create table scans (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  -- Input
  url           text not null,
  vertical      vertical_type not null,
  email         text,
  company_name  text,

  -- Processing
  status        scan_status default 'queued',
  apify_run_id  text,

  -- Results
  violation     boolean,
  confidence    numeric(4,2),       -- 0.00–1.00
  risk_level    risk_level,
  findings      jsonb default '[]', -- [{tracker, fired_before_consent, ...}]
  exposure_min  bigint,             -- USD conservative
  exposure_max  bigint,             -- USD aggressive
  evidence      jsonb default '{}', -- screenshots, network logs

  -- Payment
  payment_status payment_status default 'pending',
  stripe_session_id text,
  stripe_payment_intent text,
  paid_at       timestamptz,
  amount_paid   integer,            -- cents

  -- Fulfillment
  report_url    text,               -- Supabase storage URL
  fix_delivered boolean default false,
  fix_urls      jsonb default '[]'  -- script, policy, addendum URLs
);

-- ── DOCUMENT AUDITS (GIPA, EdTech, Clawback, TRAP) ──────────────────────────

create table doc_audits (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  -- Input
  vertical      vertical_type not null,
  email         text,
  company_name  text,
  doc_url       text,               -- Supabase storage URL of uploaded doc
  doc_type      text,               -- 'hr_form', 'vendor_contract', 'employment_contract'

  -- Processing
  status        scan_status default 'queued',

  -- Results
  violation     boolean,
  risk_level    risk_level,
  missing_clauses jsonb default '[]', -- [{clause_id, description, required_by}]
  prohibited_clauses jsonb default '[]',
  findings_summary text,
  exposure_min  bigint,
  exposure_max  bigint,
  applicant_count integer,          -- for GIPA calculations

  -- Payment
  payment_status payment_status default 'pending',
  stripe_session_id text,
  paid_at       timestamptz,
  amount_paid   integer,

  -- Fulfillment
  report_url    text,
  fix_urls      jsonb default '[]'  -- compliant_form, instruction_letter, addendum
);

-- ── PASSPORT ASSESSMENTS (Israeli Regulatory Passport) ──────────────────────

create table passport_assessments (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  delivered_at  timestamptz,

  -- Company intake
  company_name  text not null,
  contact_name  text not null,
  email         text not null,
  website       text,
  hq_country    text default 'Israel',
  entity_types  jsonb default '[]', -- ['Israeli Ltd', 'Delaware C-Corp', 'UK Ltd']
  product_type  text,               -- 'SaaS', 'Fintech', 'Crypto-adjacent'
  crypto_involved boolean default false,
  target_markets jsonb default '[]', -- ['UK', 'EU', 'US', 'Singapore']
  current_revenue_usd integer,
  fundraising_stage text,           -- 'Seed', 'Series A', etc.
  investor_jurisdiction text,       -- primary VC jurisdiction
  notes         text,

  -- Questionnaire answers (full JSON from intake form)
  intake_data   jsonb default '{}',

  -- Processing
  status        scan_status default 'queued',
  assigned_to   text,               -- internal reviewer

  -- Results
  regulatory_map jsonb default '{}', -- {UK: {...}, EU: {...}, US: {...}, SG: {...}}
  risk_flags    jsonb default '[]',
  priority_actions jsonb default '[]',
  report_summary text,

  -- Payment
  payment_status payment_status default 'pending',
  stripe_session_id text,
  stripe_payment_intent text,
  paid_at       timestamptz,
  amount_paid   integer,            -- cents (150000 = $1,500)
  package_type  text default 'assessment', -- 'assessment', 'bundle', 'subscription'

  -- Delivery
  report_url    text,
  followup_scheduled timestamptz
);

-- ── PIPELINE RUNS (PipeForge — Surplus + other deal-flow) ──────────────────

create table pipeline_runs (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  vertical      vertical_type not null,
  state         text,               -- 'FL', 'TX', 'CA'
  status        scan_status default 'queued',
  apify_run_id  text,

  -- Stats
  raw_count     integer default 0,
  qualified_count integer default 0,
  assigned_count integer default 0,
  error_message text,

  run_config    jsonb default '{}'
);

-- ── QUALIFIED CASES (PipeForge deal routing) ────────────────────────────────

create table qualified_cases (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  pipeline_run_id uuid references pipeline_runs(id),
  vertical      vertical_type not null,

  -- Case data (flexible for multi-vertical)
  raw_data      jsonb not null,
  case_summary  text,               -- Claude-generated 1-paragraph summary
  score         numeric(4,2),       -- 0.00–1.00 quality score
  estimated_value bigint,           -- USD

  -- Routing
  status        text default 'new', -- 'new', 'assigned', 'accepted', 'rejected', 'closed'
  executor_id   uuid references executors(id),
  assigned_at   timestamptz,
  accepted_at   timestamptz,
  closed_at     timestamptz,

  -- Payment
  payment_status payment_status default 'pending',
  amount_charged integer,           -- cents
  paid_at       timestamptz,

  notes         text
);

-- ── MONITORING SUBSCRIPTIONS ─────────────────────────────────────────────────

create table monitoring_subs (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now(),

  email         text not null,
  company_name  text,
  url           text,               -- for web modules
  vertical      vertical_type not null,

  -- Stripe
  stripe_subscription_id text,
  stripe_customer_id text,
  status        text default 'active', -- 'active', 'cancelled', 'past_due'
  next_scan_at  timestamptz,
  scan_frequency text default 'weekly', -- 'daily', 'weekly', 'monthly'

  last_scan_id  uuid,
  last_violation boolean,
  alert_count   integer default 0
);

-- ── LEADS (outbound pipeline) ────────────────────────────────────────────────

create table leads (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),

  vertical      vertical_type not null,
  source        text,               -- 'apify_linkedin', 'apollo', 'manual'
  company_name  text,
  domain        text,
  contact_name  text,
  contact_email text,
  contact_title text,
  linkedin_url  text,

  -- Qualification
  score         integer,            -- 0–100
  risk_signal   text,               -- what triggered this lead
  estimated_exposure bigint,

  -- Outreach
  status        text default 'new', -- 'new', 'contacted', 'replied', 'converted', 'dead'
  contacted_at  timestamptz,
  converted_at  timestamptz,
  converted_to  text,               -- scan_id or passport_id
  sequence_step integer default 0,

  raw_data      jsonb default '{}'
);

-- ── INDEXES ──────────────────────────────────────────────────────────────────

create index scans_status_idx       on scans(status);
create index scans_vertical_idx     on scans(vertical);
create index scans_email_idx        on scans(email);
create index doc_audits_status_idx  on doc_audits(status);
create index passport_status_idx    on passport_assessments(status);
create index passport_email_idx     on passport_assessments(email);
create index cases_status_idx       on qualified_cases(status);
create index cases_vertical_idx     on qualified_cases(vertical);
create index leads_vertical_idx     on leads(vertical);
create index leads_status_idx       on leads(status);
create index monitoring_email_idx   on monitoring_subs(email);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

alter table scans                 enable row level security;
alter table doc_audits            enable row level security;
alter table passport_assessments  enable row level security;
alter table pipeline_runs         enable row level security;
alter table qualified_cases       enable row level security;
alter table executors             enable row level security;
alter table monitoring_subs       enable row level security;
alter table leads                 enable row level security;

-- Service role bypasses RLS (for workers and API routes)
-- Public insert allowed for new scans/passports (users submitting)

create policy "insert_scan" on scans
  for insert with check (true);

create policy "read_own_scan" on scans
  for select using (email = current_setting('request.jwt.claims', true)::json->>'email');

create policy "insert_passport" on passport_assessments
  for insert with check (true);

create policy "read_own_passport" on passport_assessments
  for select using (email = current_setting('request.jwt.claims', true)::json->>'email');

create policy "insert_doc_audit" on doc_audits
  for insert with check (true);
