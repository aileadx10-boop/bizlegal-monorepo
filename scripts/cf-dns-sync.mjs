#!/usr/bin/env node
/**
 * cf-dns-sync.mjs — idempotent Cloudflare DNS reconciler for bizlegal-ai.com.
 *
 * Reads CLOUDFLARE_API_TOKEN from the canonical vault (never prints it),
 * compares the desired record set below with the zone, and prints a diff.
 * Nothing is written unless --apply is passed.
 *
 *   node scripts/cf-dns-sync.mjs            # dry run (default)
 *   node scripts/cf-dns-sync.mjs --apply    # write the diff
 *
 * Desired set: branded hosts for active apps, parked/broken aliases absent,
 * one DMARC on the apex, and DMARC on the Resend domain.
 * `notes.` (outbound v2 sender) is deliberately NOT here until the sender
 * is chosen (rule 7 v2 #6).
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const VAULT = process.env.BIZLEGAL_VAULT_PATH || join(homedir(), 'Downloads', 'env-hub-bizlegal-ai.txt')
const ZONE_NAME = 'bizlegal-ai.com'
const APPLY = process.argv.includes('--apply')

function vault(name) {
  const line = readFileSync(VAULT, 'utf8').split(/\r?\n/).find((l) => l.startsWith(`${name}=`))
  return line ? line.slice(name.length + 1).trim() : ''
}

// curl transport: this machine's Node TLS is intercepted by Avast (see memory);
// curl --ssl-no-revoke is the path every other vault script uses.
function cf(method, path, body) {
  const token = vault('CLOUDFLARE_API_TOKEN')
  if (!token) throw new Error('CLOUDFLARE_API_TOKEN missing in vault')
  const cfg = [`header = "Authorization: Bearer ${token}"`, 'header = "Content-Type: application/json"']
  if (body) cfg.push(`data = ${JSON.stringify(JSON.stringify(body))}`)
  const res = spawnSync('curl', ['--ssl-no-revoke', '-s', '-X', method, '-K', '-', `https://api.cloudflare.com/client/v4${path}`], {
    input: cfg.join('\n'), encoding: 'utf8', timeout: 30000,
  })
  const out = JSON.parse(res.stdout || '{}')
  if (!out.success) throw new Error(`${method} ${path} → ${JSON.stringify(out.errors)}`)
  return out.result
}

const zone = cf('GET', `/zones?name=${ZONE_NAME}`)[0]
if (!zone) throw new Error('zone not visible to this token')
const existing = cf('GET', `/zones/${zone.id}/dns_records?per_page=500`)

const ABSENT_NAMES = new Set([
  // Apex is canonical; this proxy-to-apex alias caused a Cloudflare 525 loop.
  `hub.${ZONE_NAME}`,
  // Explicitly parked until the active fleet proves revenue.
  `propsignal.${ZONE_NAME}`,
  `closeflow.${ZONE_NAME}`,
  `coguard.${ZONE_NAME}`,
])

const DESIRED = [
  // Branded hosts for active apps (proxied off until each returns 200, then flip).
  ...['sellerradar', 'falseecho', 'leaseparse', 'casepage', 'sincefiled'].map((h) => ({
    type: 'CNAME', name: `${h}.${ZONE_NAME}`, content: 'cname.vercel-dns.com', proxied: false,
  })),
  // ONE DMARC on the apex (two records = no policy)
  { type: 'TXT', name: `_dmarc.${ZONE_NAME}`, content: 'v=DMARC1; p=quarantine; rua=mailto:team@bizlegal-ai.com; pct=100', exclusive: true },
  // DMARC on the Resend transactional domain (Google bulk-sender rule)
  { type: 'TXT', name: `_dmarc.intelligence.${ZONE_NAME}`, content: 'v=DMARC1; p=quarantine; rua=mailto:team@bizlegal-ai.com', exclusive: true },
]

const norm = (s) => String(s).replace(/^"|"$/g, '').trim()
const plan = []
for (const rec of existing) {
  if (ABSENT_NAMES.has(rec.name)) plan.push({ op: 'delete', rec, why: 'canonical alias removed or product parked' })
}
for (const want of DESIRED) {
  const same = existing.filter((r) => r.type === want.type && r.name === want.name)
  const match = same.find((r) => norm(r.content) === norm(want.content))
  if (want.exclusive) for (const r of same) if (r !== match) plan.push({ op: 'delete', rec: r, why: 'duplicate/conflicting' })
  if (!match) plan.push({ op: 'create', rec: want })
  else if (typeof want.proxied === 'boolean' && match.proxied !== want.proxied && !want.exclusive) plan.push({ op: 'skip', rec: match, why: `proxied=${match.proxied} (flip manually after first 200)` })
}

console.log(`[cf-dns-sync] zone ${zone.name} · ${existing.length} records · ${APPLY ? 'APPLY' : 'DRY RUN'}`)
for (const p of plan) console.log(`  ${p.op.padEnd(6)} ${p.rec.type.padEnd(5)} ${p.rec.name.padEnd(40)} ${norm(p.rec.content).slice(0, 60)}${p.why ? `  (${p.why})` : ''}`)
if (plan.length === 0) console.log('  nothing to do')
if (!APPLY) process.exit(0)

for (const p of plan) {
  if (p.op === 'delete') cf('DELETE', `/zones/${zone.id}/dns_records/${p.rec.id}`)
  if (p.op === 'create') cf('POST', `/zones/${zone.id}/dns_records`, { type: p.rec.type, name: p.rec.name, content: p.rec.content, ttl: 1, proxied: p.rec.proxied ?? false })
  console.log(`  ✓ ${p.op} ${p.rec.type} ${p.rec.name}`)
}
