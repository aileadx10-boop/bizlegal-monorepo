-- ============================================================
-- BRAI/BizLegal AI - Database Schema Migration
-- Run this in Supabase SQL Editor to fix missing tables
-- Date: 2026-04-02
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE 1: tracr_wallet_leads (BRAI Lead Capture)
-- ============================================================
CREATE TABLE IF NOT EXISTS tracr_wallet_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  wallet_address TEXT,
  risk_score INTEGER,
  risk_level TEXT,
  product TEXT DEFAULT 'brai_report',
  report_data JSONB,
  invoice_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tracr_wallet_leads_email ON tracr_wallet_leads(email);
CREATE INDEX IF NOT EXISTS idx_tracr_wallet_leads_invoice ON tracr_wallet_leads(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tracr_wallet_leads_payment ON tracr_wallet_leads(payment_status);

-- Add comment
COMMENT ON TABLE tracr_wallet_leads IS 'Stores BRAI scan leads and payment status';

-- ============================================================
-- TABLE 2: tracr_orders (Payment Order Tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS tracr_orders (
  report_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  wallet_address TEXT NOT NULL,
  network TEXT DEFAULT 'ethereum',
  case_context TEXT,
  amount INTEGER NOT NULL,
  tier TEXT DEFAULT 'standard',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_provider TEXT,
  nowpayments_order_id TEXT,
  nowpayments_payment_id TEXT,
  paid_at TIMESTAMPTZ,
  risk_score INTEGER,
  risk_level TEXT,
  report_url TEXT,
  ai_content JSONB,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tracr_orders_email ON tracr_orders(email);
CREATE INDEX IF NOT EXISTS idx_tracr_orders_status ON tracr_orders(status);
CREATE INDEX IF NOT EXISTS idx_tracr_orders_nowpayments ON tracr_orders(nowpayments_order_id);
CREATE INDEX IF NOT EXISTS idx_tracr_orders_created ON tracr_orders(created_at);

-- Add comment
COMMENT ON TABLE tracr_orders IS 'Tracks TRACR forensic report orders and payment status';

-- ============================================================
-- TABLE 3: seo_pages (SEO Content Management)
-- ============================================================
CREATE TABLE IF NOT EXISTS seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta TEXT,
  content TEXT,
  keywords TEXT[],
  jurisdiction TEXT,
  page_type TEXT,
  cta_type TEXT,
  published BOOLEAN DEFAULT false,
  word_count INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seo_pages_slug ON seo_pages(slug);
CREATE INDEX IF NOT EXISTS idx_seo_pages_published ON seo_pages(published);

-- Add comment
COMMENT ON TABLE seo_pages IS 'SEO-optimized content pages for BizLegal AI';

-- ============================================================
-- TABLE 4: automation_state (Automation Tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS automation_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  last_run TIMESTAMPTZ DEFAULT NOW(),
  state JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_automation_state_key ON automation_state(key);

-- Add comment
COMMENT ON TABLE automation_state IS 'Tracks automation script execution state';

-- ============================================================
-- STORAGE BUCKET: tracr-reports
-- ============================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tracr-reports', 'tracr-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policy for public read access to reports
CREATE POLICY IF NOT EXISTS "Public reports are accessible by anyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'tracr-reports');

-- Allow authenticated service role to upload
CREATE POLICY IF NOT EXISTS "Service role can upload reports"
ON storage.objects FOR ALL
USING (bucket_id = 'tracr-reports');

-- ============================================================
-- SEED DATA (Optional - for testing)
-- ============================================================

-- Insert a test lead (optional, remove in production)
-- INSERT INTO tracr_wallet_leads (email, wallet_address, risk_score, risk_level, product)
-- VALUES ('test@example.com', '0x1234567890abcdef1234567890abcdef12345678', 45, 'MEDIUM', 'brai_report');

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name LIKE 'tracr%' OR table_name LIKE 'seo%';

-- Check storage bucket
-- SELECT * FROM storage.buckets WHERE id = 'tracr-reports';

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
