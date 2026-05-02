-- Gap Pages — SEO-optimized compliance landing pages
-- Run on BOTH Supabase databases:
--   DB1 (ydghhcuuopqzgqcicubg) — Hub/DocAI canonical
--   DB2 (rgbwlaifhfvlxgamwcnz) — Product runtime

CREATE TABLE IF NOT EXISTS gap_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  regulation TEXT NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  summary TEXT NOT NULL,
  value_props JSONB NOT NULL DEFAULT '[]',
  lead_magnet_title TEXT,
  lead_magnet_url TEXT,
  cta_product TEXT NOT NULL CHECK (cta_product IN ('tracr','brai','lexaudit','docai','forge')),
  cta_url TEXT,
  meta_description TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gap_pages_slug ON gap_pages(slug);
CREATE INDEX IF NOT EXISTS idx_gap_pages_jurisdiction ON gap_pages(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_gap_pages_published ON gap_pages(published_at DESC);

ALTER TABLE gap_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON gap_pages FOR SELECT USING (true);
CREATE POLICY "Service role write" ON gap_pages FOR ALL USING (auth.role() = 'service_role');
