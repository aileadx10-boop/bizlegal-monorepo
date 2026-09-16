#!/usr/bin/env node
/**
 * tools/apply-migration.mjs <path-to-sql> [--purge-seed]
 *
 * Applies one plain-SQL migration to the BrainX Neon database through the
 * @neondatabase/serverless driver — this box has no psql. Statements are
 * split on ';' so the file must not contain $$-quoted bodies (001 does;
 * 002 and later must not — packages/database/CLAUDE.md).
 *
 * NEON_DATABASE_URL is read from the environment, falling back to the
 * canonical vault (root CLAUDE.md §4). The value is never printed.
 * --purge-seed deletes the three hand-seeded homepage "signals" the
 * 2026-09-16 scaffold left in production (agents/brainx/radar-run/SOP.md step 0).
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { neon } from '@neondatabase/serverless'

const VAULT = process.env.BIZLEGAL_VAULT_PATH || join(homedir(), 'Downloads', 'env-hub-bizlegal-ai.txt')
function vaultVal(name) {
  try {
    const m = readFileSync(VAULT, 'utf8').match(new RegExp(`^${name}=(.*)$`, 'm'))
    return m ? m[1].trim() : ''
  } catch { return '' }
}
const url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || vaultVal('NEON_DATABASE_URL')
if (!url) { console.error('NEON_DATABASE_URL not set and not in vault'); process.exit(1) }

const args = process.argv.slice(2)
const file = args.find((a) => !a.startsWith('--'))
if (!file) { console.error('usage: node tools/apply-migration.mjs <file.sql> [--purge-seed]'); process.exit(2) }
const sql = neon(url)

const tables = async () => (await sql(`select table_name from information_schema.tables where table_schema='public' order by table_name`)).map((t) => t.table_name)

const before = await tables()
console.log(`Tables before (${before.length}): ${before.join(', ')}`)

if (args.includes('--purge-seed')) {
  const purged = await sql(`delete from signals where url in ('https://www.google.com','https://www.esma.europa.eu','https://www.nar.realtor') returning id`)
  console.log(`Purged ${purged.length} seed signal(s).`)
}

const statements = readFileSync(file, 'utf8')
  .split('\n').filter((l) => !l.trim().startsWith('--')).join('\n')
  .split(';').map((s) => s.trim()).filter(Boolean)
console.log(`Applying ${statements.length} statements from ${file} ...`)
for (const [i, stmt] of statements.entries()) {
  try { await sql(stmt); console.log(`  [${i + 1}/${statements.length}] ok`) }
  catch (err) { console.error(`  [${i + 1}/${statements.length}] FAILED: ${stmt.slice(0, 90)}\n    ${err.message}`); process.exit(3) }
}
const after = await tables()
console.log(`Tables after (${after.length}): ${after.filter((t) => !before.includes(t)).join(', ') || '(no new tables)'}`)
const counts = await sql(`select (select count(*) from markets)::int as markets, (select count(*) from signals)::int as signals, (select count(*) from opportunities)::int as opportunities, (select count(*) from subscribers)::int as subscribers`)
console.log('Counts:', JSON.stringify(counts[0]))
