-- Automation Tables Migration
-- Run this in Supabase SQL Editor to create required tables

-- Auto-generated tools table
CREATE TABLE IF NOT EXISTS auto_generated_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT,
  features TEXT[] DEFAULT '{}',
  use_cases TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social media posts table
CREATE TABLE IF NOT EXISTS social_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT REFERENCES seo_pages(slug) ON DELETE CASCADE,
  title TEXT NOT NULL,
  platforms JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automation runs log table
CREATE TABLE IF NOT EXISTS automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type TEXT NOT NULL CHECK (run_type IN ('manual', 'cron', 'seo', 'tools', 'social')),
  seo_pages_created INTEGER DEFAULT 0,
  seo_pages_failed INTEGER DEFAULT 0,
  social_posts_created INTEGER DEFAULT 0,
  social_posts_failed INTEGER DEFAULT 0,
  tools_created INTEGER DEFAULT 0,
  tools_failed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'partial', 'failed')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_pages_published ON seo_pages(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_social_media_posts_page_slug ON social_media_posts(page_slug);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_status ON social_media_posts(status);
CREATE INDEX IF NOT EXISTS idx_automation_runs_completed_at ON automation_runs(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_auto_generated_tools_status ON auto_generated_tools(status);

-- Enable Row Level Security (RLS)
ALTER TABLE auto_generated_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Allow public read access to published tools"
  ON auto_generated_tools FOR SELECT
  USING (status = 'published');

CREATE POLICY "Allow authenticated insert for tools"
  ON auto_generated_tools FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read access to social posts"
  ON social_media_posts FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert for social posts"
  ON social_media_posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read automation runs"
  ON automation_runs FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert automation runs"
  ON automation_runs FOR INSERT
  WITH CHECK (true);

-- Create a view for automation stats
CREATE OR REPLACE VIEW automation_stats AS
SELECT
  COUNT(*) FILTER (WHERE run_type = 'cron') AS total_cron_runs,
  COUNT(*) FILTER (WHERE run_type = 'manual') AS total_manual_runs,
  SUM(seo_pages_created) AS total_seo_pages,
  SUM(social_posts_created) AS total_social_posts,
  SUM(tools_created) AS total_tools,
  COUNT(*) FILTER (WHERE status = 'success') AS successful_runs,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_runs,
  MAX(completed_at) AS last_run_at
FROM automation_runs;

-- Insert sample data for testing (optional)
-- Uncomment to add test data
/*
INSERT INTO automation_runs (run_type, seo_pages_created, social_posts_created, tools_created, status)
VALUES 
  ('cron', 10, 70, 1, 'success'),
  ('cron', 8, 56, 0, 'success'),
  ('manual', 5, 35, 1, 'success');
*/
