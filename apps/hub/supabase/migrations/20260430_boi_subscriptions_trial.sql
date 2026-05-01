-- R3 — BOI Tracker 7-day free-trial lead magnet.
-- Adds a trial_ends_at timestamp + extends the boi_subscriptions.status
-- check constraint to accept 'trial' alongside the existing values.
--
-- The /api/boi/subscribe endpoint now accepts {tier: 'trial'} from the
-- "Track 1 entity free for 7 days" CTA on /agents/boi-tracker. Trial
-- subs run the daily FinCEN check unchanged for 7 days, then a separate
-- day-8 nudge email goes out — no card on file, no auto-charge.
--
-- Idempotent.

ALTER TABLE public.boi_subscriptions
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

COMMENT ON COLUMN public.boi_subscriptions.trial_ends_at IS
  '7-day no-card trial expiry. NULL for paid subscriptions. Day-8 nudge cron looks up rows where status=trial and trial_ends_at < now() to fire the upsell email + flip status to expired.';

-- Loosen the status check constraint to allow 'trial' + 'expired'.
-- We drop the old constraint by name (created in 20260429_boi_subscriptions.sql)
-- and recreate with the broader allowed set.
ALTER TABLE public.boi_subscriptions
  DROP CONSTRAINT IF EXISTS boi_subscriptions_status_check;

ALTER TABLE public.boi_subscriptions
  ADD CONSTRAINT boi_subscriptions_status_check
  CHECK (status IN ('active', 'paused', 'cancelled', 'past_due', 'trial', 'expired'));
