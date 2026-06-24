-- Migration: add source, opted_out_at, last_drip_sent, updated_at to subscribers
-- Required by: apps/hub/app/api/subscribers/route.ts (G2 — subscriber capture)

ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS source          TEXT,
  ADD COLUMN IF NOT EXISTS opted_out_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_drip_sent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT NOW();

-- Unique constraint for upsert ON CONFLICT (email) in subscribers route
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'subscribers'::regclass
      AND contype = 'u'
      AND conname = 'subscribers_email_key'
  ) THEN
    ALTER TABLE subscribers ADD CONSTRAINT subscribers_email_key UNIQUE (email);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS subscribers_source_idx ON subscribers (source);
CREATE INDEX IF NOT EXISTS subscribers_drip_idx   ON subscribers (last_drip_sent)
  WHERE opted_out_at IS NULL;
