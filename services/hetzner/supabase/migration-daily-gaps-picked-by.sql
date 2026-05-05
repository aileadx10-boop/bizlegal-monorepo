-- 2026-05-05 — Phase AA Day 2 — picked_by analytics column
--
-- auto_pick.py writes `picked_by='auto_pick'` to distinguish manually
-- picked rows (Telegram tap by Moses) from auto-picked rows (the daily
-- 10:00 UTC fallback when no manual pick happened within 4h).
--
-- This is mostly for retrospective analysis ("how many of last week's
-- articles came from auto-pick vs manual?") but the missing column was
-- causing auto_pick.py to crash with PGRST204. Apply alongside the
-- quality-gates migration (which is already live).

begin;

alter table public.daily_gaps
  add column if not exists picked_by text;

-- Useful for time-series of "pickup rhythm" — manual taps vs fallback.
create index if not exists idx_daily_gaps_picked_by
  on public.daily_gaps (picked_by, picked_at desc)
  where picked_by is not null;

commit;
