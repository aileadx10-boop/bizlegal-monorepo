-- ═══════════════════════════════════════════════════════════
-- STEP 1 of 3 — Run in DB2 (rgbwlaifhfvlxgamwcnz) SQL Editor
-- Goal: inspect the 3 TRACR orders, generate INSERT for DB1
-- ═══════════════════════════════════════════════════════════

-- 1a. See all 3 orders
SELECT * FROM tracr_orders ORDER BY created_at;

-- 1b. Generate INSERT statements to paste into DB1
--     Copy the output of this query and run it in DB1
SELECT
  'INSERT INTO tracr_orders ('
  || string_agg(column_name, ', ' ORDER BY ordinal_position)
  || ') SELECT '
  || string_agg(column_name, ', ' ORDER BY ordinal_position)
  || ' FROM (VALUES '
  || (
    SELECT string_agg(
      '(' || quote_literal(id::text) || ',' ||
             quote_nullable(wallet_address) || ',' ||
             quote_nullable(report_type) || ',' ||
             quote_nullable(status) || ',' ||
             quote_nullable(amount::text) || ',' ||
             quote_nullable(currency) || ',' ||
             quote_nullable(payment_method) || ',' ||
             quote_nullable(payment_id) || ',' ||
             quote_nullable(email) || ',' ||
             quote_nullable(created_at::text) || ',' ||
             quote_nullable(updated_at::text) || ')',
      E',\n      '
    )
    FROM tracr_orders
  )
  || ') AS t('
  || string_agg(column_name, ', ' ORDER BY ordinal_position)
  || ') ON CONFLICT (id) DO NOTHING;'
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tracr_orders';
