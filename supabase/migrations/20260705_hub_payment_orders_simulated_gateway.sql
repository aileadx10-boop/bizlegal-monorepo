-- 20260705_hub_payment_orders_simulated_gateway.sql
-- Allow gateway='simulated' so /api/test/payment-zero smoke rows are
-- distinguishable from real gateway orders (and excludable from revenue).
-- Applied to production via Supabase MCP on 2026-07-05.

ALTER TABLE payment_orders DROP CONSTRAINT payment_orders_gateway_check;
ALTER TABLE payment_orders ADD CONSTRAINT payment_orders_gateway_check
  CHECK (gateway = ANY (ARRAY['nowpayments'::text, 'paypal'::text, 'lemonsqueezy'::text, 'paddle'::text, 'simulated'::text]));
