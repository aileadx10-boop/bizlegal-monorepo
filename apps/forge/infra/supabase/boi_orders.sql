-- BOI Orders table
CREATE TABLE IF NOT EXISTS boi_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paypal_order_id TEXT,
  nowpayments_payment_id TEXT,
  payer_email TEXT NOT NULL,
  form_data JSONB,
  amount INTEGER NOT NULL DEFAULT 149,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','delivered','refunded')),
  report_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_boi_orders_email ON boi_orders(payer_email);
CREATE INDEX IF NOT EXISTS idx_boi_orders_status ON boi_orders(status);
ALTER TABLE boi_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON boi_orders FOR ALL USING (auth.role() = 'service_role');
