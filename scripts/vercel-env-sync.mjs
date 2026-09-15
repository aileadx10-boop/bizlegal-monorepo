#!/usr/bin/env node
/**
 * vercel-env-sync.mjs — push vault values into a Vercel project's env, by NAME.
 *
 *   node scripts/vercel-env-sync.mjs <project-dir> NAME [NAME…] [--target production,preview] [--dry-run]
 *
 * <project-dir> is the app directory that holds `.vercel/project.json` (run
 * `vercel link` there first). Uses the logged-in Vercel CLI — the vault's
 * VERCEL_TOKEN is empty and not needed. Values are read from the canonical
 * vault and piped on stdin; they never touch argv or the terminal. Existing
 * values are replaced (`vercel env rm` then `env add`). Empty vault values are
 * skipped and reported so nothing "present-EMPTY" ships.
 */
import { readFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const VAULT = process.env.BIZLEGAL_VAULT_PATH || join(homedir(), 'Downloads', 'env-hub-bizlegal-ai.txt')
const TEAM = 'aileadx10-5415s-projects'

const args = process.argv.slice(2)
const dry = args.includes('--dry-run')
const tIdx = args.indexOf('--target')
const targets = (tIdx >= 0 ? args[tIdx + 1] : 'production').split(',')
const dir = args[0]
const names = args.slice(1).filter((a, i, arr) => !a.startsWith('--') && arr[i - 1] !== '--target')
if (!dir || names.length === 0) {
  console.error('usage: vercel-env-sync <project-dir> NAME… [--target production,preview] [--dry-run]')
  process.exit(2)
}
if (!existsSync(join(dir, '.vercel', 'project.json'))) {
  console.error(`${dir} is not linked (no .vercel/project.json) — run \`vercel link\` there first`)
  process.exit(2)
}

const vault = Object.fromEntries(
  readFileSync(VAULT, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('='))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

const bin = process.platform === 'win32' ? 'vercel.cmd' : 'vercel'
const run = (cliArgs, input) =>
  spawnSync(bin, cliArgs, { input, encoding: 'utf8', timeout: 90000, cwd: dir, shell: process.platform === 'win32' })

const report = { dir, targets, set: [], skippedEmpty: [], missing: [], failed: [] }
for (const name of names) {
  if (!(name in vault)) { report.missing.push(name); continue }
  if (!vault[name]) { report.skippedEmpty.push(name); continue }
  for (const target of targets) {
    if (dry) { report.set.push(`${name}@${target} (dry)`); continue }
    run(['env', 'rm', name, target, '--yes', '--scope', TEAM], '')
    const r = run(['env', 'add', name, target, '--scope', TEAM], `${vault[name]}\n`)
    if (r.status !== 0) report.failed.push(`${name}@${target}: ${(r.stderr || r.stdout || '').trim().split('\n').pop()}`)
    else report.set.push(`${name}@${target}`)
  }
}
console.log(JSON.stringify(report, null, 2))
process.exit(report.failed.length ? 1 : 0)
