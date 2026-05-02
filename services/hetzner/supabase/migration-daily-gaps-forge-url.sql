-- R4 — publisher.py now dual-deploys Forge-affinity posts to the
-- aileadx10-boop/forge content surface. This migration adds the
-- forge_url column on daily_gaps so we can render "view on forge"
-- links in /ops + the curator Telegram bot.
--
-- Idempotent. Apply against the curator's hub Supabase project.

ALTER TABLE public.daily_gaps
  ADD COLUMN IF NOT EXISTS forge_url text;

COMMENT ON COLUMN public.daily_gaps.forge_url IS
  'forge.bizlegal-ai.com/blog/<slug> URL when the post matched FORGE_AFFINITY_TERMS in publisher.py and was committed to the Forge content repo. NULL when the post did not route to Forge.';
