-- Outbound v2 — rule 7 amended 2026-09-07 (decisions/OUTBOUND-V2-RULE-7-AMENDED-2026-09-07.md).
--
-- Adds the campaign table Moses approves on /sales, the per-lead lawful-basis
-- and verification columns the dispatch cron refuses without, the sender
-- bookkeeping on sales_outreach, and the cap constants. Every cap lives here
-- as a row, never as a ctx override; the hard per-mailbox ceiling lives in
-- @bizlegal/email and no row can raise it.
--
-- Service-role only (RLS on, no policies), like the rest of the sales_* set.

begin;

create table if not exists public.sales_campaign (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  product_id          text,                                   -- @bizlegal/payment ProductId the CTA sells
  icp                 jsonb not null default '{}'::jsonb,     -- lib/outbound/icp.ts IcpSchema
  template_a          text,                                   -- persuasion template A (body with {{first_name}}, {{specific}}, {{cta_url}})
  template_b          text,
  reply_set           jsonb not null default '{}'::jsonb,     -- approved replies per intent
  jurisdictions       text[] not null default '{US}',
  lawful_basis        text not null default 'us_can_spam',
  daily_cap           int not null default 20,                -- per mailbox; capped again by sales_cap + hard max
  mailboxes           int not null default 1,
  sender_provider     text not null default 'instantly',
  sender_campaign_ref text,                                   -- provider campaign id (carries mailboxes, schedule, unsubscribe)
  sender_domain       text,
  cta_url             text,
  status              text not null default 'draft'
                        check (status in ('draft', 'approved', 'running', 'paused', 'done', 'archived')),
  approved_by         text,
  approved_at         timestamptz,
  paused_reason       text,
  created_by          text not null default 'agent',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists sales_campaign_status_idx on public.sales_campaign (status, created_at desc);

alter table public.sales_lead
  add column if not exists lawful_basis            text,
  add column if not exists email_verified_at       timestamptz,
  add column if not exists verification_status     text,
  add column if not exists verification_sub_status text,
  add column if not exists campaign_id             uuid references public.sales_campaign(id) on delete set null,
  add column if not exists firm_website            text,
  add column if not exists practice_areas          text[],
  add column if not exists enrichment              jsonb not null default '{}'::jsonb;
create index if not exists sales_lead_campaign_idx on public.sales_lead (campaign_id, status);

alter table public.sales_outreach
  add column if not exists campaign_id        uuid references public.sales_campaign(id) on delete set null,
  add column if not exists variant            text,                -- 'a' | 'b'
  add column if not exists step               smallint not null default 0,   -- 0 initial, 1/2 follow-ups
  add column if not exists sender_provider    text,
  add column if not exists sender_message_id  text,
  add column if not exists last_refusal       text,
  add column if not exists last_refusal_at    timestamptz;
create index if not exists sales_outreach_campaign_idx on public.sales_outreach (campaign_id, status, sent_at desc);

-- Caps are constants (primitive 5). Raising one is a migration Moses runs.
insert into public.sales_cap (name, value_int, value_text, description) values
  ('outbound_daily_cap_per_mailbox', 20, null, 'Cold sends per warmed mailbox per day; hard max 50 enforced in @bizlegal/email'),
  ('outbound_trailing_window', 200, null, 'Sends in the trailing reputation window'),
  ('outbound_auto_pause_min_sends', 50, null, 'Minimum sends in the window before rates can pause a campaign'),
  ('outbound_auto_pause_bounce_pct_x100', 200, null, 'Auto-pause when trailing bounce rate exceeds this (2.00%)'),
  ('outbound_auto_pause_complaint_pct_x100', 10, null, 'Auto-pause when trailing complaint rate exceeds this (0.10%)'),
  ('outbound_followups_max', 2, null, 'Follow-ups after the initial note (day 3, day 7), then stop'),
  ('outbound_reply_auto_send', 1, null, '1 = auto-send approved-set replies for interested/question/pricing/objection; legal questions and call requests always escalate')
on conflict (name) do nothing;

alter table public.sales_campaign enable row level security;

commit;
