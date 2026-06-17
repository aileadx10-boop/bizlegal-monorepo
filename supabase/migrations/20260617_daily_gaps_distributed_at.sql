-- Agent S1: track which published articles have had social content generated
ALTER TABLE daily_gaps ADD COLUMN IF NOT EXISTS distributed_at TIMESTAMPTZ;
