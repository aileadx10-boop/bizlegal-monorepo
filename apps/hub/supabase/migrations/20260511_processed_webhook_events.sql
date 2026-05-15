-- 2026-05-11 — Webhook idempotency table
--
-- Closes CODE-REVIEW-W5 H-01 + SECURITY-REVIEW-W5 S-C1 + SILENT-FAIL-W5 SF-C2.
--
-- Every payment gateway (LemonSqueezy, PayPal, NOWPayments, Paddle) can
-- re-deliver any event for up to 25 hours and may deliver them
-- out-of-order. Without dedup, a re-delivered BILLING.SUBSCRIPTION.
-- ACTIVATED arriving AFTER BILLING.SUBSCRIPTION.CANCELLED will revive a
-- cancelled subscription. Worse: a replayed payment.confirmed will
-- double-credit if the consumer treats each call independently.
--
-- This table is the "claim once" registry. Each webhook handler inserts
-- (gateway, event_id) under a unique constraint BEFORE doing any work.
-- If the insert hits the unique constraint, the event has been seen and
-- is dropped with a 200 (so the gateway stops retrying). If the insert
-- succeeds, the event is processed exactly once.
--
-- The `event_received_at` column is the gateway's stated send time
-- (PayPal create_time, LemonSqueezy created_at), so out-of-order
-- delivery can be detected by comparing to the row that's already in
-- the table when reconciling. Optional defense — not relied upon by
-- the basic idempotency check.
--
-- Schema is intentionally minimal: this is a write-once dedup register,
-- not a webhook log archive. The full event payload lives in ops_events
-- (via logEventAsync) and the gateway's own dashboard.

begin;

create table if not exists public.processed_webhook_events (
  gateway          text        not null,
  event_id         text        not null,
  event_type       text,
  event_received_at timestamptz,
  processed_at     timestamptz not null default now(),
  primary key (gateway, event_id)
);

-- Optional index for cleanup-by-age (we may TTL events older than 30d).
create index if not exists idx_processed_webhook_events_processed_at
  on public.processed_webhook_events (processed_at);

-- RLS — only service-role writes / reads. Webhooks always run with
-- service_role; client-facing surfaces never touch this table.
alter table public.processed_webhook_events enable row level security;

-- Drop existing policies if re-running (idempotent migration pattern).
drop policy if exists "service_role read processed_webhook_events"
  on public.processed_webhook_events;
drop policy if exists "service_role write processed_webhook_events"
  on public.processed_webhook_events;

create policy "service_role read processed_webhook_events"
  on public.processed_webhook_events
  for select
  using (auth.role() = 'service_role');

create policy "service_role write processed_webhook_events"
  on public.processed_webhook_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

comment on table public.processed_webhook_events is
  '2026-05-11 — webhook idempotency claim register; see apps/hub/lib/payments/webhook-idempotency.ts';

commit;
