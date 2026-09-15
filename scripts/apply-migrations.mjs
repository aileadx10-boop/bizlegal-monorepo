#!/usr/bin/env node
/**
 * Apply local draft migrations to Supabase when SUPABASE_DB_URL is valid.
 * Usage: node scripts/apply-migrations.mjs --file <path>
 * Reads SUPABASE_DB_URL from env. Dry-run unless --yes.
 */
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const url = process.env.SUPABASE_DB_URL
if (!url || url.includes('localhost') || !url.includes('@')) {
  console.error('[migrations] SUPABASE_DB_URL missing/invalid (localhost or placeholder). Ask Moses for the real Postgres connection string.')
  process.exit(2)
}
const file = process.argv.indexOf('--file') !== -1 ? process.argv[process.argv.indexOf('--file') + 1] : null
if (!file) { console.error('usage: node scripts/apply-migrations.mjs --file <sql> [--dry-run]'); process.exit(1) }
const sql = readFileSync(file, 'utf8')
const args = ['-c', sql, url]
if (process.argv.includes('--dry-run')) console.log('[migrations] dry-run, not executing:', file)
else {
  const r = spawnSync('psql', args, { stdio: 'inherit' })
  if (r.status !== 0) process.exit(r.status ?? 1)
  console.log('[migrations] applied', file)
}
