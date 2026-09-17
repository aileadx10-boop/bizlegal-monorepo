#!/usr/bin/env node
/**
 * Bulk-sync named vault values to a linked Vercel project through REST.
 *
 * Usage:
 *   node scripts/vercel-env-sync-api.mjs <project-dir> NAME... [--target production,preview]
 *
 * Values never appear in argv or output. Empty/missing vault entries are
 * refused so a production secret cannot be silently replaced with blank.
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const VAULT = process.env.BIZLEGAL_VAULT_PATH || join(homedir(), 'Downloads', 'env-hub-bizlegal-ai.txt')
const args = process.argv.slice(2)
const targetIndex = args.indexOf('--target')
const targets = (targetIndex >= 0 ? args[targetIndex + 1] : 'production')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)
const dir = args[0]
const names = args.slice(1).filter((item, index) =>
  !item.startsWith('--') && args[index] !== '--target',
)
if (!dir || names.length === 0) {
  console.error('usage: vercel-env-sync-api <project-dir> NAME... [--target production,preview]')
  process.exit(2)
}

const vault = Object.fromEntries(
  readFileSync(VAULT, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.includes('='))
    .map((line) => [line.slice(0, line.indexOf('=')).trim(), line.slice(line.indexOf('=') + 1).trim()]),
)
const token = process.env.VERCEL_API_TOKEN || vault.VERCEL_API_TOKEN
if (!token) {
  console.error('VERCEL_API_TOKEN missing in canonical vault.')
  process.exit(1)
}
const { projectId, orgId } = JSON.parse(readFileSync(join(dir, '.vercel', 'project.json'), 'utf8'))
const missing = names.filter((name) => !vault[name])
if (missing.length) {
  console.error(`Refusing blank/missing vault values: ${missing.join(', ')}`)
  process.exit(2)
}

const body = names.map((name) => ({
  key: name,
  value: vault[name],
  type: 'encrypted',
  target: targets,
  comment: 'Synced from canonical BizLegal vault',
}))
const response = await fetch(
  `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${orgId}&upsert=true`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  },
)
const payload = await response.json()
if (!response.ok) {
  console.error(`Vercel env sync failed (${response.status}): ${payload.error?.message ?? 'unknown error'}`)
  process.exit(1)
}
console.log(`[vercel-env] ${projectId}: synced ${names.length} names to ${targets.join(',')}.`)
