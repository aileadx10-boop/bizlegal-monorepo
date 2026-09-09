-- 20260909_tracr_wallet_leads.sql
-- Consolidated migration for the BRAI scan payment-gate lead table.
--
-- The table was originally created only in the pre-monorepo hub-local
-- migration apps/hub/supabase/migrations/003_rls_and_leads.sql, which is
-- NOT part of the consolidated supabase/migrations/ set. Prod DBs built
-- from the consolidated set therefore lack the table, and
-- POST /api/brai/leads fails with "Failed to save lead" on every insert.
--
-- Idempotent: CREATE TABLE IF NOT EXISTS — safe to apply whether or not
-- the table already exists (pre-monorepo prod).

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

CREATE INDEX IF NOT EXISTS idx_tracr_wallet_leads_email ON public.tracr_wallet_leads(email);
CREATE INDEX IF NOT EXISTS idx_tracr_wallet_leads_invoice ON public.tracr_wallet_leads(invoice_id) WHERE invoice_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tracr_wallet_leads_status ON public.tracr_wallet_leads(payment_status);

ALTER TABLE public.tracr_wallet_leads ENABLE ROW LEVEL SECURITY;
