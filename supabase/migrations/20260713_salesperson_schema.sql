-- 2026-07-13: Salesperson agent schema
-- Tables: sales_lead, sales_outreach, sales_reply, sales_meeting
-- All tables RLS-protected, only backend service role can read/write

-- 1. sales_lead: the lead pipeline (replaces/augments leadforge_leads)
create table if not exists public.sales_lead (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  company text,
  company_domain text,
  job_title text,
  industry text,
  jurisdiction text,
  icp_score smallint,                -- 0-100, deterministic
  intent_signals jsonb default '[]'::jsonb,  -- array of {type, source, weight, evidence_url, observed_at}
  source text,                       -- how we found them: 'inbound_blog', 'linkedin_2nd', 'newsletter', 'referral', 'manual'
  source_url text,                   -- the specific page/post that triggered intent
  status text not null default 'new',-- new → qualifying → contacted → replied → meeting → won | lost | unsubscribed
  owner text default 'salesperson_agent',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(email, company_domain)
);
create index if not exists sales_lead_status_idx on public.sales_lead (status, icp_score desc);
create index if not exists sales_lead_email_idx on public.sales_lead (email);
create index if not exists sales_lead_source_idx on public.sales_lead (source);

-- 2. sales_outreach: every send attempt (DRAFT-ONLY enforced by app logic)
create table if not exists public.sales_outreach (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.sales_lead(id) on delete cascade,
  channel text not null,              -- 'email' | 'linkedin' | 'twitter_dm' | 'in_app'
  template text,                      -- template name: 'intro_async', 'followup_1', etc.
  subject text,
  body text not null,                 -- the AI-drafted message
  drafted_at timestamptz not null default now(),
  approved_at timestamptz,            -- null until Moses approves
  approved_by text,                   -- 'moses' or 'auto_after_48h' (NEVER for cold outbound)
  sent_at timestamptz,                -- null until approved + sent
  message_id text,                    -- Resend message_id for tracking
  consent_logged boolean default false,  -- primitive 4
  suppression_checked boolean default false, -- primitive 3
  status text not null default 'drafted' -- drafted → approved → sent → delivered → opened → clicked → replied → bounced
);
create index if not exists sales_outreach_lead_idx on public.sales_outreach (lead_id, sent_at desc);
create index if not exists sales_outreach_status_idx on public.sales_outreach (status, drafted_at);

-- 3. sales_reply: incoming replies (triage)
create table if not exists public.sales_reply (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.sales_lead(id) on delete cascade,
  outreach_id uuid references public.sales_outreach(id) on delete set null,
  channel text not null,              -- 'email' | 'linkedin' | 'in_app'
  body text not null,
  intent text,                        -- auto-classified: 'interested' | 'objection' | 'unsubscribe' | 'question' | 'out_of_office' | 'wrong_person'
  confidence real,                    -- 0-1, classifier confidence
  auto_response_sent boolean default false,
  auto_response_text text,
  escalated_to_moses boolean default false,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);
create index if not exists sales_reply_lead_idx on public.sales_reply (lead_id, received_at desc);
create index if not exists sales_reply_intent_idx on public.sales_reply (intent, escalated_to_moses);

-- 4. sales_meeting: discovery booking
create table if not exists public.sales_meeting (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.sales_lead(id) on delete cascade,
  format text not null,               -- 'async_written' | 'async_loom' | 'video_15' | 'video_30' | 'phone_15' (phone only for $2,500+ tier)
  scheduled_for timestamptz,
  duration_minutes smallint,
  status text not null default 'requested',  -- requested → confirmed → held → won | lost | no_show
  agenda text,
  outcome text,
  hold_cost_usd numeric(8,2),         -- what we paid in time (e.g. 15min × $200/hr = $50)
  close_value_usd numeric(10,2),      -- if won, what they paid
  product text,                       -- 'docai_97' | 'tracr_149' | 'lexaudit_99' | 'retainer_2500'
  created_at timestamptz not null default now()
);
create index if not exists sales_meeting_lead_idx on public.sales_meeting (lead_id, scheduled_for);

-- 5. sales_cap: hard-coded constants (primitive 5 — cap is a CONSTANT, never ctx override)
create table if not exists public.sales_cap (
  name text primary key,
  value_int integer not null,
  value_text text,
  description text,
  updated_at timestamptz not null default now()
);
-- Seed the caps
insert into public.sales_cap (name, value_int, value_text, description) values
  ('max_outreach_per_day', 3, null, 'Hard cap on outreach sends per day (introvert-friendly)'),
  ('max_outreach_per_week', 20, null, 'Hard cap on outreach sends per week'),
  ('max_outreach_per_lead_per_30d', 3, null, 'Cap on touches per lead per 30 days'),
  ('cooldown_days_between_touches', 5, null, 'Min days between touches to same lead'),
  ('require_approval_for_drafts', 1, null, '1=true (Moses approves each send), 0=auto (NEVER for cold outreach)'),
  ('auto_approve_after_hours', 0, null, '0=never auto-approve cold drafts (only inbound-reply drafts)'),
  ('reply_classifier_threshold', 0, '0.75', 'Min confidence to auto-respond'),
  ('escalation_intent_threshold', 0, 'interested,question', 'Comma-separated intents that escalate to Moses')
on conflict (name) do nothing;

-- 6. sales_consent_log: primitive 4 — every outreach must log consent
create table if not exists public.sales_consent_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.sales_lead(id) on delete cascade,
  outreach_id uuid references public.sales_outreach(id) on delete set null,
  consent_type text not null,         -- 'explicit' (double opt-in), 'implied' (inbound), 'cold_approved' (Moses pre-approved this lead)
  evidence_url text,                 -- the URL/screenshot proving consent
  recorded_at timestamptz not null default now()
);
create index if not exists sales_consent_log_lead_idx on public.sales_consent_log (lead_id, recorded_at desc);

-- 7. sales_event: append-only audit log
create table if not exists public.sales_event (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.sales_lead(id) on delete cascade,
  outreach_id uuid references public.sales_outreach(id) on delete set null,
  event_type text not null,           -- 'lead_created', 'draft_generated', 'draft_approved', 'sent', 'reply_received', 'reply_processed', 'meeting_booked', 'closed_won', 'closed_lost', 'suppressed', 'opted_out', 'cap_hit'
  details jsonb default '{}'::jsonb,
  actor text not null default 'salesperson_agent',
  created_at timestamptz not null default now()
);
create index if not exists sales_event_lead_idx on public.sales_event (lead_id, created_at desc);
create index if not exists sales_event_type_idx on public.sales_event (event_type, created_at);

-- RLS
alter table public.sales_lead enable row level security;
alter table public.sales_outreach enable row level security;
alter table public.sales_reply enable row level security;
alter table public.sales_meeting enable row level security;
alter table public.sales_cap enable row level security;
alter table public.sales_consent_log enable row level security;
alter table public.sales_event enable row level security;
-- Service role bypasses RLS by default. No anon policies.
