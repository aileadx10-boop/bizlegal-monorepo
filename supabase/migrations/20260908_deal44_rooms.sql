-- DEAL44 — multi-party transaction rooms.
--
-- Extends the Deal Intelligence head (20260823_deal_intelligence.sql), which is
-- APPLIED on project ydghhcuuopqzgqcicubg and empty: `deals`, `deal_documents`,
-- `deal_facts`, `deal_findings` all exist with 0 rows. This migration adds the
-- four tables that head lacks — parties, tasks, a sent-log and an audit tape —
-- plus seven additive columns on `deals`.
--
-- NOT `deal_rooms`. That table (20260704_deal_rooms.sql) is a hub SALES
-- proposal page: one lead, one token, and an anon policy of `USING (true)` that
-- lets any anon client read every row. It is not a transaction workspace and
-- nothing here touches it.
--
-- Verified against the live project 2026-09-07 before writing.

begin;

-- ── The ledger head, extended ───────────────────────────────────────────────
-- Additive only. `deals.jurisdiction` keeps its 'ae-dubai-residential' default;
-- DEAL44 always writes its pack id explicitly.
alter table public.deals
  add column if not exists title         text,
  add column if not exists locale        text not null default 'he-IL',
  add column if not exists currency      text not null default 'ILS'
                                         check (char_length(currency) = 3),
  -- 'il-residential' | null. Null is a MANUAL room: tasks typed in by hand.
  -- That path needs no reviewed template, which is why room #1 can ship before
  -- the practitioner review lands.
  add column if not exists template_id   text,
  -- {"signing":"YYYY-MM-DD","closing":"YYYY-MM-DD"} — the dates every task
  -- offset counts from. Free-form keys, validated against the template.
  add column if not exists anchors       jsonb not null default '{}'::jsonb,
  add column if not exists activated_at  timestamptz,
  add column if not exists paid_order_id uuid,
  add column if not exists created_by    text not null default 'moses';

-- ── Every human in the room, including the broker ───────────────────────────
create table if not exists public.deal_parties (
  id               uuid primary key default gen_random_uuid(),
  deal_id          uuid not null references public.deals(id) on delete cascade,
  -- Template-defined ('broker' | 'buyer' | 'seller' | 'buyer_lawyer' | ...).
  -- Deliberately NOT a CHECK: phase 3 lets a template declare its own roles,
  -- and validation belongs at the API boundary against that template.
  role             text not null,
  display_name     text not null,
  email            text not null,
  locale           text not null default 'he-IL',
  -- sha256 of a 192-bit random token. The raw token exists only in the link we
  -- send; a database leak therefore does not hand over room access. This is the
  -- deliberate difference from deal_rooms.token, which is stored in the clear.
  token_hash       text not null unique,
  -- The same token, AES-256-GCM encrypted under DEAL44_TOKEN_KEY (env, not in
  -- the database). The daily digest needs to rebuild each party's own link, and
  -- a hash cannot be reversed. Splitting the secret this way keeps the property
  -- that matters: the table alone is not enough — an attacker needs the row AND
  -- the server key. Null when no key was configured at creation time, in which
  -- case digests omit the button rather than link somewhere wrong.
  token_cipher     text,
  token_expires_at timestamptz,
  alerts_enabled   boolean not null default true,
  invited_at       timestamptz,
  last_seen_at     timestamptz,
  created_at       timestamptz not null default now(),
  unique (deal_id, email, role)
);
create index if not exists idx_deal_parties_deal on public.deal_parties (deal_id);

-- ── The checklist, materialised from a template or typed by hand ────────────
create table if not exists public.deal_tasks (
  id             uuid primary key default gen_random_uuid(),
  deal_id        uuid not null references public.deals(id) on delete cascade,
  key            text not null,
  -- Exactly one of these: a template task carries an i18n key so it renders in
  -- Hebrew or English; a manual task carries the broker's own words.
  label_key      text,
  label_text     text,
  phase          text not null,
  assignee_role  text not null,
  anchor         text,
  offset_days    int,
  -- Statutory clocks are calendar days. Routing one through business-day maths
  -- silently buys the client days they do not have.
  day_type       text not null default 'calendar'
                   check (day_type in ('business','calendar')),
  due_date       date,
  statutory      boolean not null default false,
  origin         text not null default 'template'
                   check (origin in ('template','manual','extracted')),
  -- Provenance for AI-extracted tasks (phase 1). deal_facts already forces a
  -- source document and a verbatim quote, so an extracted deadline can always
  -- be traced back to the clause it came from.
  source_fact_id uuid references public.deal_facts(id) on delete set null,
  -- 'suggested' is where extraction lands: a human confirms before it is a date.
  status         text not null default 'open'
                   check (status in ('open','done','suggested','dismissed')),
  completed_at   timestamptz,
  completed_by   uuid references public.deal_parties(id) on delete set null,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  unique (deal_id, key),
  check ((label_key is not null) <> (label_text is not null))
);
create index if not exists idx_deal_tasks_deal on public.deal_tasks (deal_id);
-- the daily 05:00 UTC alert cron scans open tasks by due date
create index if not exists idx_deal_tasks_due on public.deal_tasks (due_date)
  where status = 'open';

-- ── The sent-log both trio workflow docs assumed and neither created ────────
-- Without this, a daily cron re-announces the same deadline every morning.
create table if not exists public.deal_alerts (
  id              uuid primary key default gen_random_uuid(),
  deal_id         uuid not null references public.deals(id) on delete cascade,
  party_id        uuid not null references public.deal_parties(id) on delete cascade,
  task_id         uuid references public.deal_tasks(id) on delete cascade,
  kind            text not null check (kind in ('invite','tier','digest')),
  -- 30 | 7 | 1 | 0 | -1 (overdue)
  tier            int,
  -- Also sent to Resend as Idempotency-Key, so a retry after a transient 5xx
  -- collapses to one delivery instead of two.
  idempotency_key text not null unique,
  provider_id     text,
  sent_at         timestamptz not null default now()
);
create index if not exists idx_deal_alerts_day on public.deal_alerts (sent_at);
create index if not exists idx_deal_alerts_task on public.deal_alerts (task_id, party_id, tier);

-- ── Audit tape ──────────────────────────────────────────────────────────────
-- Who saw what, who ticked what. In a room shared by a buyer, a seller and two
-- lawyers, "the checklist says it was done" needs to survive a disagreement.
create table if not exists public.deal_events (
  id             bigint generated always as identity primary key,
  deal_id        uuid not null references public.deals(id) on delete cascade,
  actor_party_id uuid references public.deal_parties(id) on delete set null,
  actor          text not null,
  -- room.created | party.added | party.viewed | party.link_rotated |
  -- task.toggled | task.added | anchor.changed | alert.sent |
  -- document.uploaded | deadline.suggested | room.activated
  type           text not null,
  payload        jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);
create index if not exists idx_deal_events_deal on public.deal_events (deal_id, created_at desc);

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- Same shape as 20260823_deal_intelligence.sql: service_role for the server,
-- an owner SELECT for the broker once accounts land in phase 1.
--
-- There is deliberately NO anon policy. Party access is resolved server-side by
-- hashing the link token and looking it up with the service client — never by a
-- permissive policy. deal_rooms' `public_read_by_token USING (true)` is exactly
-- what this avoids: it lets any anon client read the whole table.
alter table public.deal_parties enable row level security;
alter table public.deal_tasks   enable row level security;
alter table public.deal_alerts  enable row level security;
alter table public.deal_events  enable row level security;

drop policy if exists "service_role deal_parties" on public.deal_parties;
create policy "service_role deal_parties" on public.deal_parties for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
drop policy if exists "broker reads deal_parties" on public.deal_parties;
create policy "broker reads deal_parties" on public.deal_parties for select
  using (exists (select 1 from public.deals d
                 where d.id = deal_parties.deal_id and d.user_id = auth.uid()));

drop policy if exists "service_role deal_tasks" on public.deal_tasks;
create policy "service_role deal_tasks" on public.deal_tasks for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
drop policy if exists "broker reads deal_tasks" on public.deal_tasks;
create policy "broker reads deal_tasks" on public.deal_tasks for select
  using (exists (select 1 from public.deals d
                 where d.id = deal_tasks.deal_id and d.user_id = auth.uid()));

drop policy if exists "service_role deal_alerts" on public.deal_alerts;
create policy "service_role deal_alerts" on public.deal_alerts for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role deal_events" on public.deal_events;
create policy "service_role deal_events" on public.deal_events for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
drop policy if exists "broker reads deal_events" on public.deal_events;
create policy "broker reads deal_events" on public.deal_events for select
  using (exists (select 1 from public.deals d
                 where d.id = deal_events.deal_id and d.user_id = auth.uid()));

-- ── Money ───────────────────────────────────────────────────────────────────
-- Phase 0 takes ILS by invoice under the founder's own name and records it as a
-- manual order (the O-018 precedent). 'manual' is not in the current CHECK.
--
-- 'wire' is added in the same breath because it is a live pre-existing bug:
-- apps/hub/app/api/payments/wire/start/route.ts writes gateway='wire', which the
-- constraint rejects, so every wire order insert fails.
-- Pattern from 20260705_hub_payment_orders_simulated_gateway.sql.
alter table public.payment_orders drop constraint if exists payment_orders_gateway_check;
alter table public.payment_orders add constraint payment_orders_gateway_check
  check (gateway = any (array[
    'nowpayments'::text, 'paypal'::text, 'lemonsqueezy'::text,
    'paddle'::text, 'simulated'::text, 'manual'::text, 'wire'::text
  ]));

comment on table public.deal_parties is
  'DEAL44 room participants. Access is a hashed per-party token resolved server-side; the raw token exists only in the invite link.';
comment on table public.deal_alerts is
  'Idempotency ledger for deadline reminders. Without it a daily cron re-announces the same deadline every morning.';

commit;
