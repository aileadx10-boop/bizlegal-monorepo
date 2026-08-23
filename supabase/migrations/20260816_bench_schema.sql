-- 2026-08-16: Bench — the evaluation lab for legal AI (apps/bench)
-- Tables: bench_intake, bench_clients, bench_engagements, bench_experts,
--         bench_expert_applications, bench_evaluations, bench_reports
-- All tables RLS-protected; only the backend service role reads/writes.
-- Canonical decision doc: decisions/BENCH-LEGAL-AI-QUALITY-2026-08-16.md

-- 1. bench_intake: inbound audit requests (the ONLY acquisition ingress —
--    outbound is inbound-only per root CLAUDE.md hard rule 7)
create table if not exists public.bench_intake (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company text,
  segment text,                        -- 'legal_ai_vendor' | 'compliance_software' | 'law_firm' | 'ai_lab' | 'other'
  product_area text,                   -- what their AI does (contract review, regulatory Q&A, research…)
  jurisdiction text,                   -- 'EU' | 'UK' | 'UAE' | multi
  practice_area text,
  model_access text,                   -- 'api' | 'output_upload' | 'public_interface' | 'unsure'
  message text,
  status text not null default 'new',  -- new → qualified → scoping → pilot → client | closed
  source text default 'audit_request', -- 'audit_request' | 'inbound_lead' | 'referral'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bench_intake_status_idx on public.bench_intake (status, created_at desc);
create index if not exists bench_intake_email_idx on public.bench_intake (email);

-- 2. bench_clients
create table if not exists public.bench_clients (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid references public.bench_intake(id) on delete set null,
  company text not null,
  contact_email text not null,
  contact_name text,
  segment text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists bench_clients_email_idx on public.bench_clients (contact_email);

-- 3. bench_engagements: one paid measurement engagement
create table if not exists public.bench_engagements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.bench_clients(id) on delete cascade,
  tier text not null,                  -- 'diagnostic_audit' | 'managed_monthly' | 'dedicated'
  product_id text,                     -- @bizlegal/payment ProductId ('bench_audit_2500' | 'bench_managed_monthly')
  benchmark_slug text,                 -- 'mica-bench' | 'dpa-bench' | 'vara-bench' | 'custom'
  benchmark_version text,              -- e.g. 'v1.0'
  jurisdiction text not null,
  practice_area text not null,
  target_system text,                  -- client's model/product identifier + version (their words)
  planned_evals smallint,              -- 25-30 pilot / 100-150 managed (delivery-economics table in docs/PLAN.md)
  price_cents integer,
  status text not null default 'scoping', -- scoping → evaluating → qa → delivered → closed
  started_at timestamptz not null default now(),
  delivered_at timestamptz
);
create index if not exists bench_engagements_client_idx on public.bench_engagements (client_id, started_at desc);
create index if not exists bench_engagements_status_idx on public.bench_engagements (status);

-- 4. bench_experts: the invisible bench. No public profiles, ever.
create table if not exists public.bench_experts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,             -- internal only — reports show credential class, never names
  credential_class text,               -- what reports display: e.g. 'EU regulatory, 8 yrs PQE, MiCA'
  jurisdictions text[] not null default '{}',
  practice_areas text[] not null default '{}',
  pqe_years smallint,
  languages text[] not null default '{}',
  rate_per_task_cents integer,         -- $40-100 full-judgment; verification tasks lower
  assessment_score numeric(3,1),       -- paid test task, 0-5 avg across rubric dimensions
  qa_score numeric(3,1),               -- rolling QA average
  sampling_rate smallint not null default 100, -- % of tasks QA-reviewed: 100 → 20 → 5 (exception-only)
  status text not null default 'applied', -- applied → test_task → calibrating → active → paused | rejected
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bench_experts_status_idx on public.bench_experts (status);

-- 5. bench_expert_applications: the /experts/apply funnel (talent side)
create table if not exists public.bench_expert_applications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  jurisdiction text not null,
  practice_areas text,
  pqe_years smallint,
  languages text,
  credentials text,                    -- bar admission, LLM, roles — applicant's words
  availability_hours smallint,         -- hours/week
  sample_work_url text,
  status text not null default 'received', -- received → reviewed → test_task_sent → admitted | declined
  created_at timestamptz not null default now()
);
create index if not exists bench_expert_applications_status_idx
  on public.bench_expert_applications (status, created_at desc);

-- 6. bench_evaluations: one scored item. The atomic unit of the data moat.
--    Rubric contract mirrors apps/bench/web/lib/rubric-engine.ts — 5 dims, 0-5.
create table if not exists public.bench_evaluations (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid references public.bench_engagements(id) on delete cascade,
  benchmark_slug text not null,
  item_id text not null,               -- id inside the versioned benchmark JSON
  benchmark_version text not null,
  model_output text not null,          -- the output under evaluation
  mode text not null default 'ai_prescored', -- 'ai_prescored' | 'expert_full'
  -- rubric scores (null until scored)
  score_jurisdictional smallint check (score_jurisdictional between 0 and 5),
  score_correctness smallint check (score_correctness between 0 and 5),
  score_completeness smallint check (score_completeness between 0 and 5),
  score_reasoning smallint check (score_reasoning between 0 and 5),
  score_hallucination smallint check (score_hallucination between 0 and 5),
  severity text,                       -- 'critical' | 'high' | 'medium' | 'low' | 'none'
  taxonomy text[] not null default '{}', -- 'hallucinated_authority' | 'misstatement' | 'omission' | 'wrong_jurisdiction' | 'bad_reasoning' | 'unreliable_citation'
  gold_correction text,                -- expert corrected answer for failed items
  rationale text,
  expert_id uuid references public.bench_experts(id) on delete set null,
  qa_status text not null default 'pending', -- pending → sampled → verified | disputed
  double_score_of uuid references public.bench_evaluations(id) on delete set null, -- calibration pair
  scored_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists bench_evaluations_engagement_idx
  on public.bench_evaluations (engagement_id, created_at);
create index if not exists bench_evaluations_item_idx
  on public.bench_evaluations (benchmark_slug, benchmark_version, item_id);
create index if not exists bench_evaluations_calibration_idx
  on public.bench_evaluations (double_score_of) where double_score_of is not null;

-- 7. bench_reports: the deliverable. Token-gated viewer at /report/[id].
create table if not exists public.bench_reports (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.bench_engagements(id) on delete cascade,
  access_token uuid not null default gen_random_uuid(),
  metrics jsonb not null default '{}'::jsonb, -- EngagementMetrics from lib/rubric-engine.ts
  narrative text,                      -- remediation memo + findings prose
  expert_credentials jsonb not null default '[]'::jsonb, -- credential classes only, never names
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists bench_reports_engagement_idx on public.bench_reports (engagement_id);

-- RLS: service-role only across the board. No anon policies.
alter table public.bench_intake enable row level security;
alter table public.bench_clients enable row level security;
alter table public.bench_engagements enable row level security;
alter table public.bench_experts enable row level security;
alter table public.bench_expert_applications enable row level security;
alter table public.bench_evaluations enable row level security;
alter table public.bench_reports enable row level security;
