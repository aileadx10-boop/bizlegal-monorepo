-- ═══════════════════════════════════════════════
-- BIZLEGAL-AI: Orders Table
-- Run in: Supabase → SQL Editor
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS orders (
  id             BIGSERIAL PRIMARY KEY,
  product        TEXT          NOT NULL,
  tier           TEXT          NOT NULL,
  amount         NUMERIC(10,2) NOT NULL,
  email          TEXT,
  payment_method TEXT,
  status         TEXT          NOT NULL DEFAULT 'pending',
  payment_id     TEXT,
  payment_url    TEXT,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS orders_product_idx ON orders(product);
CREATE INDEX IF NOT EXISTS orders_status_idx  ON orders(status);
CREATE INDEX IF NOT EXISTS orders_email_idx   ON orders(email);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read"   ON orders FOR SELECT USING (true);
CREATE POLICY "service_update" ON orders FOR UPDATE
  USING (current_setting('role') = 'service_role');
