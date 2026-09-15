-- FalseEcho — add the 'pending_engine' order status (B2 engine pre-flight).
--
-- Why: a paid battery is worth nothing if the four engine keys are absent.
-- The adapters degrade to status 'unavailable', so without this hold the
-- buyer would receive an "evidence pack" that probed nothing and the order
-- would read as fulfilled. apps/falseecho/lib/fulfill.ts now checks
-- engineStatusMatrix() before firing the battery and parks the order here
-- instead, with an ops event naming the missing engines.
--
-- A held order is NOT a failed payment: paid_at on the scan stays set,
-- because the buyer did pay. Once the keys are in place the operator
-- re-fires POST /api/scan/run (internal-key gated) with the scan ref from
-- the ops event, and the order moves to 'paid'.
--
-- Safe to re-run. Until this is applied, fulfill.ts logs a warning and the
-- ops event is the only record of the hold — the code does not fail.

begin;

alter table public.falseecho_orders
  drop constraint if exists falseecho_orders_status_check;

alter table public.falseecho_orders
  add constraint falseecho_orders_status_check
  check (status in ('pending', 'pending_engine', 'paid', 'failed', 'refunded'));

commit;
