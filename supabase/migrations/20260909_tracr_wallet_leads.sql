-- 20260909_tracr_wallet_leads.sql
-- APPLIED 2026-09-10 to ydghhcuuopqzgqcicubg via Supabase MCP (migration name
-- 20260909_tracr_wallet_leads). Prod was shape 2 below; payment_status +
-- invoice_id now exist and wallet_address is nullable.
-- Consolidated migration for the BRAI scan payment-gate lead table.
--
-- Two shapes exist in the wild:
--   1. Fresh DBs built from the consolidated supabase/migrations/ set — table
--      absent, so CREATE below is the whole story.
--   2. Pre-monorepo prod — table already exists (created by the hub-local
--      migration apps/hub/supabase/migrations/003_rls_and_leads.sql, which is
--      NOT part of the consolidated set) but with a DIFFERENT schema: it has
--      network + ip_address columns and wallet_address NOT NULL, yet is
--      MISSING payment_status and invoice_id. The BRAI webhook does
--      .update({ payment_status: 'paid' }) on it, so every payment-confirmed
--      IPN 500s with "column payment_status does not exist".
--
-- Idempotent: CREATE TABLE IF NOT EXISTS + ALTER TABLE ADD COLUMN IF NOT
-- EXISTS — safe to apply whether the table exists (pre-monorepo prod) or not
-- (fresh consolidated build).

CREATE TABLE IF NOT EXISTS public.tracr_wallet_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  wallet_address TEXT,
  risk_score INTEGER,
  risk_level TEXT,
  product TEXT DEFAULT 'brai_report',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'expired')),
  invoice_id TEXT,
  report_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upgrade path for the pre-monorepo table that lacks the payment-gate columns.
ALTER TABLE public.tracr_wallet_leads
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'expired')),
  ADD COLUMN IF NOT EXISTS invoice_id TEXT;

-- The pre-monorepo table declared wallet_address NOT NULL; the BRAI leads
-- route inserts wallet_address ?? null, so a scan without a wallet would
-- violate it. Relax to nullable to match the canonical schema.
ALTER TABLE public.tracr_wallet_leads
  ALTER COLUMN wallet_address DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tracr_wallet_leads_email ON public.tracr_wallet_leads(email);
CREATE INDEX IF NOT EXISTS idx_tracr_wallet_leads_invoice ON public.tracr_wallet_leads(invoice_id) WHERE invoice_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tracr_wallet_leads_status ON public.tracr_wallet_leads(payment_status);

ALTER TABLE public.tracr_wallet_leads ENABLE ROW LEVEL SECURITY;
