-- 2026-05-05 — Phase AA Vertical 3 (lead-nurture machine)
--
-- Reason: every lead-capture endpoint (apps/hub, apps/forge, apps/brai,
-- apps/docai, apps/lexaudit, apps/tracr, services/oci/router) currently
-- inserts into leads + (optionally) emails the partner, but NONE of them
-- send a welcome email to the lead. This table is the state row a
-- Cloudflare Worker uses to drive a 4-step email cadence per lead:
--
--   T+5 min : welcome
--   T+2 days: education
--   T+4 days: comparison
--   T+7 days: last_call
--
-- Stops on: payment.confirmed | opt_out | manual /lead-stop Telegram cmd.
--
-- Schema designed for the worker's cron pattern: every 5 minutes,
-- SELECT rows where next_send_at <= now() AND payment_status='none'
-- AND opted_out=false AND next_step != 'done'. The partial index
-- below makes that lookup O(1) over rows due-now, regardless of total
-- table size.

begin;

create table if not exists public.lead_nurture_state (
  id uuid primary key default gen_random_uuid(),

  -- Foreign-key to leads (whichever surface captured them).
  -- We use lead_id text instead of uuid FK because some surfaces
  -- (OCI router, BRAI scan) generate their own lead_ids before
  -- Supabase row exists. Worker can resolve lead_id -> leads.id
  -- post-hoc via lookup.
  lead_id text not null,
  email text not null,

  -- Vertical determines which set of email prompts to use.
  -- Maps 1:1 to the agents/ea/prompts/email-{step}-{vertical}.md files.
  vertical text not null check (vertical in (
    'boi', 'brai', 'tracr', 'lexaudit', 'docai', 'forge', 'leadforge',
    'realestate', 'generic'
  )),

  -- Source = the endpoint that created this row. Useful for funnel
  -- attribution and for filtering when one surface misbehaves.
  source text not null,

  -- Snapshot of the EA classifier output (intent, budget, vertical
  -- confidence). Worker reads this when composing emails so messages
  -- can be personalized to the lead's stated need.
  lead_classification jsonb,

  captured_at timestamptz not null default now(),

  -- Stops the sequence cleanly when payment lands.
  -- intent  = clicked checkout but didn't complete (don't email more)
  -- paid    = converted (deliver-product email fires elsewhere)
  -- refunded = chargeback / refund (don't re-engage)
  payment_status text not null default 'none' check (payment_status in (
    'none', 'intent', 'paid', 'refunded'
  )),

  -- One-click unsubscribe sets this. Worker reads it; never bypasses.
  opted_out boolean not null default false,

  -- When the row is fully done (sent last_call, opted out, paid).
  -- Set by the worker so future cron passes skip it cheaply.
  archived_at timestamptz,

  -- The cadence state machine.
  -- welcome → education → comparison → last_call → done
  next_step text not null default 'welcome' check (next_step in (
    'welcome', 'education', 'comparison', 'last_call', 'done'
  )),
  next_send_at timestamptz not null default now() + interval '5 minutes',
  last_sent_at timestamptz,
  emails_sent int not null default 0,

  -- Defense-in-depth: if a Resend bounce webhook fires, mark the
  -- row so the worker doesn't keep trying.
  bounce_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One sequence per email address; re-captures don't restart.
-- Two captures within the same minute should land on the same row
-- via UPSERT pattern in the worker.
create unique index if not exists idx_lns_lead_id_unique
  on public.lead_nurture_state (lead_id);

-- The hot path: cron worker at */5 * * * * SELECTs due rows.
-- Partial index keeps it bounded; without WHERE, an index across
-- the full table loads all paid/opted-out rows too.
create index if not exists idx_lns_due
  on public.lead_nurture_state (next_send_at)
  where payment_status = 'none'
    and opted_out = false
    and next_step != 'done';

-- Lookup by email (for opt-out webhook + bounce webhook).
create index if not exists idx_lns_email
  on public.lead_nurture_state (lower(email));

-- Updated-at maintainer.
create or replace function public.lead_nurture_state_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end
$$;

drop trigger if exists trg_lns_updated_at on public.lead_nurture_state;
create trigger trg_lns_updated_at
  before update on public.lead_nurture_state
  for each row execute function public.lead_nurture_state_set_updated_at();

-- RLS: this table contains email addresses + classification data.
-- Service role only. No anon/auth read; no public_read mistakes
-- (this is the deliberate alternative to the orders table's
-- public_read which we're separately fixing).
alter table public.lead_nurture_state enable row level security;

drop policy if exists service_role_all on public.lead_nurture_state;
create policy service_role_all on public.lead_nurture_state
  for all to service_role
  using (true)
  with check (true);

commit;

-- Smoke test (run after applying):
--   insert into public.lead_nurture_state (lead_id, email, vertical, source)
--     values ('test-' || gen_random_uuid()::text, 'test@example.com', 'boi', 'test');
--   select * from public.lead_nurture_state where source='test';
--   delete from public.lead_nurture_state where source='test';
