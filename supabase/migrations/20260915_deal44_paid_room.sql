-- DEAL44 — one paid room per payment (plan v3 §B3).
--
-- STATUS: NOT APPLIED. Written by the B3 build; apply from the Supabase SQL
-- editor or MCP when the checkout goes live.
--
-- Adds nothing to the schema: `deals.paid_order_id` and `deals.activated_at`
-- already exist and are applied (20260908_deal44_rooms.sql). What is missing is
-- the guarantee that they mean one thing.
--
-- Why: `apps/hub/lib/payments/deal44-grant.ts` runs inside both payment
-- webhooks, and a gateway retries an IPN it did not see acknowledged. The grant
-- checks `paid_order_id` before writing, but two deliveries landing together
-- both pass that check and the buyer ends up with two rooms for one payment —
-- and then two different links for the same transaction, which for a deadline
-- product is worse than no room at all. The index makes the second insert fail
-- instead, which the grant catches and logs.
--
-- Idempotent: `if not exists` throughout, no data written, safe to re-run.

begin;

-- Partial: every unpaid room has `paid_order_id is null`, and nulls must stay
-- unconstrained.
create unique index if not exists deals_paid_order_id_uniq
  on public.deals (paid_order_id)
  where paid_order_id is not null;

-- The grant's other lookup path: "the rooms this buyer has". Only the rooms
-- that carry an email, which is every room the checkout creates.
create index if not exists deals_email_idx
  on public.deals (lower(email))
  where email is not null;

commit;
