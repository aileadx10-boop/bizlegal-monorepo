#!/usr/bin/env node
/**
 * Concatenate the unapplied fleet-money SQL into one paste file.
 * Does not apply anything — SUPABASE_DB_URL is empty and the project is GitHub-login only.
 *
 *   node scripts/concat-pending-fleet-sql.mjs
 *
 * Writes C:/Users/Moshe Dor/Downloads/FLEET-PENDING-SQL-2026-09-18.sql
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const files = [
  'supabase/migrations/20260918_nurture_verticals.sql',
  'supabase/migrations/20260918_casepage_production.sql',
  'supabase/migrations/20260918_sincefiled_production.sql',
  'supabase/migrations/20260901_falseecho_mvp.sql',
  'supabase/migrations/20260915_falseecho_pending_engine_status.sql',
  'supabase/migrations/20260902_sellerradar_mvp.sql',
  'supabase/migrations/20260907_sellerradar_monitor_scan_state.sql',
  'supabase/migrations/20260915_leaseparse_paid_gate.sql',
  'supabase/migrations/20260915_deal44_paid_room.sql',
]

const header = `-- FLEET PENDING SQL — paste once into the GitHub-linked Supabase SQL editor
-- Project: ydghhcuuopqzgqcicubg (fleet). Generated ${new Date().toISOString().slice(0, 10)}.
-- Order is load-bearing: nurture CHECK first, then grant tables, then product MVPs.
-- Idempotent where the source files are. Do not run against BrainX/OnePath Neon.

`

const parts = files.map((rel) => {
  const body = readFileSync(join(root, rel), 'utf8').trimEnd()
  return `\n-- ===== ${rel} =====\n${body}\n`
})

const out = join(homedir(), 'Downloads', 'FLEET-PENDING-SQL-2026-09-18.sql')
writeFileSync(out, header + parts.join('\n'), 'utf8')
console.log('[pending-sql] wrote', out, 'bytes', Buffer.byteLength(header + parts.join('\n')))
