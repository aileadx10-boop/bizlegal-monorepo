-- ═══════════════════════════════════════════════
-- BIZLEGAL-AI: OFAC Sanctions List Watcher (W2-6, O-008)
-- Run in: Supabase → SQL Editor (DB1: ydghhcuuopqzgqcicubg)
-- ═══════════════════════════════════════════════

-- Subscribers to the $29/mo OFAC watch product: email + watched addresses/entities.
CREATE TABLE IF NOT EXISTS watched_addresses (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT          NOT NULL,
  address       TEXT          NOT NULL,          -- 0x address (lowercased) or entity name
  entity_name   TEXT,                            -- optional human label for the watched item
  status        TEXT          NOT NULL DEFAULT 'active',  -- 'active' | 'paused' | 'unsubscribed'
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  last_checked_at TIMESTAMPTZ,
  UNIQUE (email, address)
);

-- Alert log — dedupes so a (email, address, list) match is alerted once.
CREATE TABLE IF NOT EXISTS sanctions_alert_log (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT          NOT NULL,
  address       TEXT          NOT NULL,
  list          TEXT          NOT NULL,          -- 'ofac' | 'un' | 'eu'
  matched_entity TEXT,
  source_url    TEXT,
  list_version  TEXT,
  alerted_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (email, address, list)
);

CREATE INDEX IF NOT EXISTS watched_addresses_status_idx ON watched_addresses(status);
CREATE INDEX IF NOT EXISTS watched_addresses_email_idx ON watched_addresses(email);
CREATE INDEX IF NOT EXISTS sanctions_alert_log_email_idx ON sanctions_alert_log(email);

-- RLS: service-role only (cron writes; page reads via service-role)
ALTER TABLE watched_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions_alert_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watched_addresses_service_all" ON watched_addresses
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "sanctions_alert_log_service_all" ON sanctions_alert_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);
