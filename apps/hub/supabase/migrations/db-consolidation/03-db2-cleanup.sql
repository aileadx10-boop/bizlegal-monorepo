-- ═══════════════════════════════════════════════════════════
-- STEP 3 of 3 — Run in DB2 (rgbwlaifhfvlxgamwcnz) SQL Editor
-- Goal: drop duplicate tables, keep product-specific tables
-- ONLY RUN AFTER Step 2 is verified (10 orders in DB1)
-- ═══════════════════════════════════════════════════════════

-- 3a. Safety check — confirm these are empty before dropping
SELECT 'trcr_clients'    AS tbl, COUNT(*) FROM trcr_clients    UNION ALL
SELECT 'trcr_deals'      AS tbl, COUNT(*) FROM trcr_deals      UNION ALL
SELECT 'trcr_activities' AS tbl, COUNT(*) FROM trcr_activities UNION ALL
SELECT 'trcr_documents'  AS tbl, COUNT(*) FROM trcr_documents;
-- All should show 0. If any row > 0, export it first.

-- 3b. Drop duplicates (all 0-row dead tables)
DROP TABLE IF EXISTS trcr_clients    CASCADE;
DROP TABLE IF EXISTS trcr_deals      CASCADE;
DROP TABLE IF EXISTS trcr_activities CASCADE;
DROP TABLE IF EXISTS trcr_documents  CASCADE;

-- 3c. Verify what remains in DB2 (should still have product tables)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ── DB2 FINAL OWNERSHIP ──────────────────────────────────────
-- KEEP in DB2 (product runtime):
--   tracr_orders     ← TRACR order intake (synced to DB1)
--   tracr_wallet_leads
--   scans
--   leads
--   pipeline_runs
--   brai_*           (BRAI tables)
--   forge_*          (Forge scanner tables)
--   lexaudit_*       (LexAudit cert tables)
--
-- DB1 OWNS (hub + SEO + master orders):
--   tracr_orders     ← canonical source of truth (10 orders)
--   trcr_clients     ← 5 clients stay in DB1
--   seo_pages        ← 172 pages
--   docai_*
--   profiles
--   leads            ← 3 leads
