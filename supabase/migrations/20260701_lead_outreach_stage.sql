-- Add stage column to lead_outreach so lead_nurture.py follow-up cadence works.
-- stage=0: drafted/awaiting send
-- stage=1: day-3 follow-up sent
-- stage=2: day-7 follow-up sent
-- stage=3: day-14 break-up sent

ALTER TABLE lead_outreach ADD COLUMN IF NOT EXISTS stage integer NOT NULL DEFAULT 0;
