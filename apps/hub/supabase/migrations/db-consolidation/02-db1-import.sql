-- ═══════════════════════════════════════════════════════════
-- STEP 2 of 3 — Run in DB1 (ydghhcuuopqzgqcicubg) SQL Editor
-- Goal: merge DB2's 3 orders → DB1, verify 10 total
-- ═══════════════════════════════════════════════════════════

-- 2a. Check current count before merge
SELECT COUNT(*) AS db1_order_count_before FROM tracr_orders;

-- 2b. PASTE the INSERT output from Step 1 here
--     (copy the generated INSERT ... ON CONFLICT DO NOTHING from DB2)
--     Example structure — replace with actual values from Step 1:
--
-- INSERT INTO tracr_orders (id, wallet_address, report_type, status, amount, ...)
-- SELECT id, wallet_address, report_type, status, amount, ...
-- FROM (VALUES
--   ('uuid-1', '0x...', 'standard', 'completed', 149, ...),
--   ('uuid-2', '0x...', 'litigation', 'completed', 500, ...),
--   ('uuid-3', '0x...', 'priority', 'pending', 249, ...)
-- ) AS t(id, wallet_address, ...) ON CONFLICT (id) DO NOTHING;

-- 2c. Verify total after merge (expect 10)
SELECT COUNT(*) AS db1_order_count_after FROM tracr_orders;

-- 2d. Confirm all orders look correct
SELECT id, wallet_address, report_type, status, amount, created_at
FROM tracr_orders
ORDER BY created_at DESC
LIMIT 15;
