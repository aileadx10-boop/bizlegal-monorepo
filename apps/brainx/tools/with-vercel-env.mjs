#!/usr/bin/env node
/**
 * tools/with-vercel-env.mjs NAME[,NAME…] -- <command …>
 *
 * Runs <command> with the named production env vars of the linked Vercel
 * project (.vercel/project.json) injected into its environment — read
 * through the Vercel REST API and held in memory only. Nothing is written
 * to disk, which is the difference from `vercel env pull`: the BrainX Neon
 * connection string exists only in the brainx project env (the vault's
 * NEON_DATABASE_URL is a different database — apps/brainx/CLAUDE.md
 * invariant 12), and a one-off migration should not leave it in a file.
 *
 * VERCEL_API_TOKEN comes from the environment or the canonical vault.
 * Values are never printed.
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const VAULT = process.env.BIZLEGAL_VAULT_PATH || join(homedir(), 'Downloads', 'env-hub-bizlegal-ai.txt')
const vaultVal = (name) => {
  try { const m = readFileSync(VAULT, 'utf8').match(new RegExp(`^${name}=(.*)$`, 'm')); return m ? m[1].trim() : '' } catch { return '' }
}
const token = process.env.VERCEL_API_TOKEN || vaultVal('VERCEL_API_TOKEN')
if (!token) { console.error('VERCEL_API_TOKEN missing'); process.exit(1) }

const sep = process.argv.indexOf('--')
if (sep === -1 || !process.argv[2] || process.argv.length <= sep + 1) {
  console.error('usage: node tools/with-vercel-env.mjs NAME[,NAME…] -- <command …>')
  process.exit(2)
}
const names = process.argv[2].split(',').map((s) => s.trim()).filter(Boolean)
const cmd = process.argv.slice(sep + 1)
const { projectId, orgId } = JSON.parse(readFileSync(join(process.cwd(), '.vercel', 'project.json'), 'utf8'))

const headers = { Authorization: `Bearer ${token}` }
const listRes = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env?teamId=${orgId}`, { headers })
if (!listRes.ok) { console.error(`vercel api ${listRes.status}: ${(await listRes.text()).slice(0, 200)}`); process.exit(1) }
const { envs } = await listRes.json()
const picked = {}
for (const name of names) {
  const hit = envs.find((e) => e.key === name && (e.target ?? []).includes('production'))
  if (!hit) { console.error(`${name}: not set on production for this project`); process.exit(1) }
  // The list endpoint returns encrypted values as an opaque envelope; only the
  // per-variable endpoint with decrypt=true returns the plaintext.
  const one = await fetch(`https://api.vercel.com/v1/projects/${projectId}/env/${hit.id}?teamId=${orgId}&decrypt=true`, { headers })
  if (!one.ok) { console.error(`${name}: decrypt ${one.status}: ${(await one.text()).slice(0, 200)}`); process.exit(1) }
  const { value } = await one.json()
  if (typeof value !== 'string' || !value || value.startsWith('eyJ2Ijoi')) { console.error(`${name}: value not decryptable with this token`); process.exit(1) }
  picked[name] = value
}
console.log(`[with-vercel-env] injected ${names.join(', ')} → ${cmd.join(' ')}`)
const r = spawnSync(cmd[0], cmd.slice(1), { stdio: 'inherit', env: { ...process.env, ...picked }, shell: process.platform === 'win32' })
process.exit(r.status ?? 1)
