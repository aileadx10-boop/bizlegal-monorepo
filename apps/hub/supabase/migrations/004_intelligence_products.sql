-- Migration 004: Intelligence products + audit logs
-- Run in Supabase SQL Editor (bizlegal-ai project)

-- ── Intelligence products store ──────────────────────────

CREATE TABLE IF NOT EXISTS public.intelligence_products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  price_usd INTEGER NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'epub', 'interactive', 'api')),
  review_status TEXT NOT NULL DEFAULT 'draft' CHECK (review_status IN ('draft', 'validated', 'expert-reviewed', 'published')),
  confidence_score INTEGER,
  word_count INTEGER,
  tags TEXT[],
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.intelligence_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intel_public_read" ON public.intelligence_products
  FOR SELECT TO anon, authenticated
  USING (review_status = 'published');

CREATE POLICY "intel_service_all" ON public.intelligence_products
  FOR ALL USING (auth.role() = 'service_role');

-- ── Intelligence purchases ────────────────────────────────

CREATE TABLE IF NOT EXISTS public.intelligence_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES public.intelligence_products(id),
  email TEXT NOT NULL,
  payment_provider TEXT NOT NULL,
  payment_id TEXT,
  amount_usd INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded')),
  download_token TEXT UNIQUE,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intel_purchases_email ON public.intelligence_purchases(email);

ALTER TABLE public.intelligence_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intel_purchase_service_all" ON public.intelligence_purchases
  FOR ALL USING (auth.role() = 'service_role');

-- ── Audit logs ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product TEXT NOT NULL,
  tier TEXT,
  input_hash TEXT,
  model_version TEXT DEFAULT 'claude-sonnet-4-6',
  confidence INTEGER,
  verification_status TEXT CHECK (verification_status IN ('accept', 'flag', 'reject')),
  expert_review_required BOOLEAN DEFAULT FALSE,
  expert_review_status TEXT CHECK (expert_review_status IN ('pending', 'approved', 'rejected')),
  flags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_product ON public.audit_logs(product);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON public.audit_logs(expert_review_status) WHERE expert_review_required = TRUE;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_service_all" ON public.audit_logs
  FOR ALL USING (auth.role() = 'service_role');
