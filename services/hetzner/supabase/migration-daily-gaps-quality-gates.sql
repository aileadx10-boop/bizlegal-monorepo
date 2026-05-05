-- 2026-05-05 — Phase AA Day 1 — quality-gate rejection columns
--
-- Reason: services/hetzner/brain.py wires three new gates between the
-- Sonnet draft and the publisher (humanize → factual_review → quality_gate).
-- On any rejection, brain.py calls _reject_draft() which writes:
--   status            = 'rejected_quality'
--   rejection_gate    = 'humanize' | 'factual_review' | 'factual_review_crash' | 'quality_gate'
--   rejection_reasons = jsonb array of error strings
--   rejected_at       = now()
--
-- The original migration (migration-daily-gaps-curator.sql) only allowed
-- statuses {pending_pick, picked, archived, skipped, drafted, published,
-- rejected}. Without this migration, the first rejection raises a CHECK
-- constraint violation, the row stays at 'picked', the next cron run
-- picks it up again → infinite retry loop. This must land BEFORE the
-- next scout/brain cron tick.

begin;

-- 1. Drop the old CHECK constraint and recreate with the new statuses.
alter table public.daily_gaps
  drop constraint if exists daily_gaps_status_check;

alter table public.daily_gaps
  add constraint daily_gaps_status_check
  check (status in (
    'pending_pick',
    'picked',
    'archived',
    'skipped',
    'drafted',
    'published',
    'rejected',              -- legacy human-rejected (Telegram "Reject")
    'rejected_quality',      -- NEW: rejected at humanize/quality gate
    'rejected_factual'       -- NEW: rejected at factual_review (no primary source)
  ));

-- 2. Three new columns brain.py writes on rejection.
alter table public.daily_gaps
  add column if not exists rejection_gate text,
  add column if not exists rejection_reasons jsonb,
  add column if not exists rejected_at timestamptz;

-- 3. Partial index for retry tooling: "show me everything that was
-- rejected in the last 24h, grouped by gate" — matches the Telegram
-- daily digest pattern.
create index if not exists idx_daily_gaps_rejected_recent
  on public.daily_gaps (rejection_gate, rejected_at desc)
  where status in ('rejected_quality', 'rejected_factual');

commit;

-- Rollback note: if this needs to be reverted, the gate code in
-- brain.py:_reject_draft also has to be reverted, otherwise rejections
-- crash the row. Do NOT roll back this migration alone.
