-- ═══════════════════════════════════════════════
-- DocAI: SQA Firm-tier knowledge base items
-- Run in: Supabase → SQL Editor (DB1: ydghhcuuopqzgqcicubg)
-- ═══════════════════════════════════════════════
--
-- Per-firm uploaded clauses for the DocAI Firm tier ($99/mo). Keyed by
-- firm_email (email of the active Firm-tier payment_orders row) instead
-- of a JWT firm_id — keeps the data shape compatible with the existing
-- email-only stateless checkout pattern. Server-side checks
-- payment_orders to ensure the firm_email is paid + active before
-- accepting writes.
--
-- RLS: service-role only. Reads + writes happen exclusively from the
-- /api/sqa/kb/* server routes which carry the service-role key.

CREATE TABLE IF NOT EXISTS sqa_firm_kb_items (
  -- Composite key (firm_email, id) so each firm has its own item-id namespace
  firm_email     TEXT          NOT NULL,
  id             TEXT          NOT NULL,
  source_name    TEXT          NOT NULL,
  source_url     TEXT          NOT NULL,
  jurisdiction   TEXT          NOT NULL,         -- "US" | "EU" | "UK" | "IN" | "CA" | "AU" | "SG" | "OTHER"
  topics         TEXT[]        NOT NULL DEFAULT '{}',
  text           TEXT          NOT NULL,
  last_updated   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  PRIMARY KEY (firm_email, id)
);

CREATE INDEX IF NOT EXISTS sqa_firm_kb_items_email_idx ON sqa_firm_kb_items(firm_email);
CREATE INDEX IF NOT EXISTS sqa_firm_kb_items_topics_idx ON sqa_firm_kb_items USING GIN (topics);

-- updated_at trigger (function may already exist from prior migration)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at') THEN
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $f$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $f$ LANGUAGE plpgsql;
  END IF;
END $$;

CREATE TRIGGER sqa_firm_kb_items_updated_at
  BEFORE UPDATE ON sqa_firm_kb_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE sqa_firm_kb_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sqa_firm_kb_service_all" ON sqa_firm_kb_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);
