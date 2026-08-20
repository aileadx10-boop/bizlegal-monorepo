-- ═══════════════════════════════════════════════
-- BIZLEGAL-AI: CASP Compliance Bundle (W4-12, O-014)
-- Run in: Supabase → SQL Editor (DB1: ydghhcuuopqzgqcicubg)
-- ═══════════════════════════════════════════════

-- Bundle access grants. One row per paying CASP-bundle customer, keyed by
-- email (case-insensitive) so a customer who pays before creating an account
-- still gets access on their next sign-in. Written by the hub webhook on
-- payment.confirmed (grantCaspBundle), read by the bundle landing page.
CREATE TABLE IF NOT EXISTS public.casp_bundle_subs (
  id            BIGSERIAL PRIMARY KEY,
  user_email    TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'paused', 'cancelled', 'past_due', 'expired')),
  granted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_casp_bundle_subs_status ON public.casp_bundle_subs (status);

ALTER TABLE public.casp_bundle_subs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.casp_bundle_subs;
CREATE POLICY "service_role_all"
  ON public.casp_bundle_subs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.casp_bundle_subs IS
  'W4-12 — CASP Compliance Bundle ($499/mo) subscribers. payment.confirmed for product_family=casp grants an active row here. compliance_snapshots (per-tool state) deferred.';
