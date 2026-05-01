-- ═══════════════════════════════════════════════
-- BIZLEGAL-AI: BOI Subscriptions (CTA-2024 Tracker)
-- Run in: Supabase → SQL Editor (DB1: ydghhcuuopqzgqcicubg)
-- ═══════════════════════════════════════════════

-- Per-subscriber entity tracking. One row per (user_email, entity).
-- A subscriber may track multiple entities under a single firm pack.
CREATE TABLE IF NOT EXISTS boi_subscriptions (
  id                 BIGSERIAL PRIMARY KEY,
  user_email         TEXT          NOT NULL,
  tier               TEXT          NOT NULL DEFAULT 'solo',  -- 'solo' | 'firm'
  entity_legal_name  TEXT          NOT NULL,
  entity_type        TEXT,                                    -- LLC, Corp, LLP, etc.
  entity_filing_date DATE,                                    -- date of original BOI filing
  ein_last4          TEXT,                                    -- last 4 of EIN for matching
  state_of_formation TEXT,                                    -- US state
  last_notified_at   TIMESTAMPTZ,                             -- last reminder sent
  status             TEXT          NOT NULL DEFAULT 'active', -- 'active' | 'paused' | 'cancelled'
  payment_order_id   BIGINT,                                  -- FK to payment_orders.id
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Cached daily pull from federalregister.gov to avoid re-hitting the API
-- on every per-subscriber check. One row per (rule_id, fetched_at).
CREATE TABLE IF NOT EXISTS boi_rule_index (
  id          BIGSERIAL PRIMARY KEY,
  rule_id     TEXT          NOT NULL UNIQUE,    -- federalregister document_number
  title       TEXT          NOT NULL,
  abstract    TEXT,
  publication_date DATE     NOT NULL,
  effective_date   DATE,
  rule_url    TEXT,
  agency      TEXT          NOT NULL DEFAULT 'fincen',
  affects_filing_types TEXT[]  NOT NULL DEFAULT '{}',  -- ['LLC', 'Corp', 'LLP', 'all']
  fetched_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS boi_subscriptions_email_idx ON boi_subscriptions(user_email);
CREATE INDEX IF NOT EXISTS boi_subscriptions_status_idx ON boi_subscriptions(status);
CREATE INDEX IF NOT EXISTS boi_rule_index_publication_idx ON boi_rule_index(publication_date DESC);

CREATE TRIGGER boi_subscriptions_updated_at
  BEFORE UPDATE ON boi_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: service-role only (cron + payment webhook write; UI reads via service-role)
ALTER TABLE boi_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE boi_rule_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "boi_subs_service_all" ON boi_subscriptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "boi_rules_service_all" ON boi_rule_index
  FOR ALL TO service_role USING (true) WITH CHECK (true);
