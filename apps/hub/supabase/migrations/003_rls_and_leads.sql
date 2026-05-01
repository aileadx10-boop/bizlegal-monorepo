-- Migration 003: RLS fixes + new lead tables
-- Run in Supabase SQL Editor for project ydghhcuuopqzgqcicubg
-- ============================================================

-- ── Task 6: Enable RLS on tables that have it disabled ─────────

-- leads_raw: public INSERT for lead capture, auth-only for SELECT/UPDATE/DELETE
ALTER TABLE IF EXISTS public.leads_raw ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_raw_anon_insert" ON public.leads_raw;
CREATE POLICY "leads_raw_anon_insert"
  ON public.leads_raw FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "leads_raw_auth_select" ON public.leads_raw;
CREATE POLICY "leads_raw_auth_select"
  ON public.leads_raw FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "leads_raw_auth_update" ON public.leads_raw;
CREATE POLICY "leads_raw_auth_update"
  ON public.leads_raw FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "leads_raw_auth_delete" ON public.leads_raw;
CREATE POLICY "leads_raw_auth_delete"
  ON public.leads_raw FOR DELETE
  TO authenticated
  USING (true);

-- lead_magnets: public INSERT, auth-only SELECT
ALTER TABLE IF EXISTS public.lead_magnets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lead_magnets_anon_insert" ON public.lead_magnets;
CREATE POLICY "lead_magnets_anon_insert"
  ON public.lead_magnets FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "lead_magnets_auth_select" ON public.lead_magnets;
CREATE POLICY "lead_magnets_auth_select"
  ON public.lead_magnets FOR SELECT
  TO authenticated
  USING (true);

-- ── Task 5: tracr_wallet_leads table for BRAI scan payment gate ─

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

DROP POLICY IF EXISTS "wallet_leads_anon_insert" ON public.tracr_wallet_leads;
CREATE POLICY "wallet_leads_anon_insert"
  ON public.tracr_wallet_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "wallet_leads_auth_select" ON public.tracr_wallet_leads;
CREATE POLICY "wallet_leads_auth_select"
  ON public.tracr_wallet_leads FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "wallet_leads_service_all" ON public.tracr_wallet_leads;
CREATE POLICY "wallet_leads_service_all"
  ON public.tracr_wallet_leads FOR ALL
  USING (auth.role() = 'service_role');
