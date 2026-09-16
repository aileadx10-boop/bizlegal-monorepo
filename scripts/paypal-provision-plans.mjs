#!/usr/bin/env node
/**
 * paypal-provision-plans.mjs — create the PayPal catalog product + monthly
 * billing plans for a surface's recurring SKUs and write the ids into the
 * canonical vault. Adapted from Firmcited/scripts/provision-subscriptions.mjs.
 *
 *   node scripts/paypal-provision-plans.mjs --app sellerradar            # dry run
 *   node scripts/paypal-provision-plans.mjs --app falseecho --apply      # create
 *
 * Idempotent: a plan whose env name already holds a value is skipped.
 * PAYPAL_ENV=live in the vault means --apply creates REAL catalog objects
 * (no charges). Values are never printed. curl transport (Avast TLS).
 */
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const VAULT = process.env.BIZLEGAL_VAULT_PATH || join(homedir(), 'Downloads', 'env-hub-bizlegal-ai.txt')
const args = process.argv.slice(2)
const app = args[args.indexOf('--app') + 1]
const APPLY = args.includes('--apply')

const OFFERS = {
  sellerradar: {
    product: { name: 'SellerRadar', description: 'Amazon fee-change impact monitoring for sellers' },
    plans: [
      { env: 'PAYPAL_PLAN_ID_SELLERRADAR_MONITOR_MONTHLY', name: 'SellerRadar Monitor', desc: 'Weekly fee-schedule re-scan with a dollar-impact email', price: '99.00' },
    ],
  },
  falseecho: {
    product: { name: 'FalseEcho', description: 'AI-falsehood monitoring and evidence packs' },
    plans: [
      { env: 'PAYPAL_PLAN_ID_FALSEECHO_MONITOR_MONTHLY', name: 'FalseEcho Monitor', desc: 'Daily 25-prompt AI-answer monitoring with graded evidence', price: '149.00' },
    ],
  },
  brainx: {
    product: { name: 'BrainX', description: 'Weekly evidence-first opportunity radar — real estate compliance, legal practice growth, AI/fintech regulation' },
    plans: [
      { env: 'PAYPAL_PLAN_ID_BRAINX_RADAR_MONTHLY', name: 'BrainX Radar (monthly)', desc: 'Weekly opportunity radar, evidence vault, BrainX Decision Score v1, up to 5 radar profiles, 2 BUILD THIS briefs/month', price: '99.00', intervalUnit: 'MONTH' },
      { env: 'PAYPAL_PLAN_ID_BRAINX_RADAR_YEARLY', name: 'BrainX Radar (yearly)', desc: 'Yearly BrainX Radar subscription (save 2 months)', price: '999.00', intervalUnit: 'YEAR' },
      { env: 'PAYPAL_PLAN_ID_BRAINX_RADAR_BUILD_MONTHLY', name: 'BrainX Radar + Build (monthly)', desc: 'Everything in Radar, unlimited BUILD THIS briefs, written async expert review (capped 4/month)', price: '249.00', intervalUnit: 'MONTH' },
      { env: 'PAYPAL_PLAN_ID_BRAINX_RADAR_BUILD_YEARLY', name: 'BrainX Radar + Build (yearly)', desc: 'Yearly BrainX Radar + Build subscription (save 2 months)', price: '2499.00', intervalUnit: 'YEAR' },
    ],
  },
}
if (!app || !OFFERS[app]) {
  console.error(`usage: --app <${Object.keys(OFFERS).join('|')}> [--apply]`)
  process.exit(2)
}

let lines = readFileSync(VAULT, 'utf8').split(/\r?\n/)
const v = (name) => {
  const line = lines.find((l) => l.startsWith(`${name}=`))
  return line ? line.slice(name.length + 1).trim() : ''
}
function upsert(key, value) {
  copyFileSync(VAULT, `${VAULT}.bak`)
  let hit = false
  lines = lines.map((l) => (l.startsWith(`${key}=`) ? ((hit = true), `${key}=${value}`) : l))
  if (!hit) lines.push(`${key}=${value}`)
  writeFileSync(VAULT, lines.join('\n'))
}

const BASE = (v('PAYPAL_ENV') || 'live') === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'

function curl(method, path, body, token, extraHeaders = []) {
  const cfg = []
  if (token) cfg.push(`header = "Authorization: Bearer ${token}"`, 'header = "Content-Type: application/json"')
  else {
    const basic = Buffer.from(`${v('PAYPAL_CLIENT_ID')}:${v('PAYPAL_CLIENT_SECRET')}`).toString('base64')
    cfg.push(`header = "Authorization: Basic ${basic}"`, 'header = "Content-Type: application/x-www-form-urlencoded"')
  }
  for (const h of extraHeaders) cfg.push(`header = "${h}"`)
  cfg.push(`data = ${JSON.stringify(typeof body === 'string' ? body : JSON.stringify(body))}`)
  const r = spawnSync('curl', ['--ssl-no-revoke', '-s', '-X', method, '-w', '\n%{http_code}', '-K', '-', `${BASE}${path}`], {
    input: cfg.join('\n'), encoding: 'utf8', timeout: 30000,
  })
  const out = r.stdout || ''
  const nl = out.lastIndexOf('\n')
  let data = {}
  try { data = JSON.parse(out.slice(0, nl)) } catch { data = { raw: out.slice(0, 200) } }
  return { status: Number(out.slice(nl + 1).trim()) || 0, data }
}

const auth = curl('POST', '/v1/oauth2/token', 'grant_type=client_credentials')
if (!auth.data.access_token) { console.error('PayPal auth failed', auth.status); process.exit(1) }
const token = auth.data.access_token
console.log(`[paypal] ${BASE.includes('sandbox') ? 'SANDBOX' : 'LIVE'} · app=${app} · ${APPLY ? 'APPLY' : 'DRY RUN'}`)

const productEnv = `PAYPAL_PRODUCT_ID_${app.toUpperCase()}`
let productId = v(productEnv)
if (!productId) {
  console.log(`  product "${OFFERS[app].product.name}": ${APPLY ? 'creating' : 'would create'} (${productEnv})`)
  if (APPLY) {
    const p = curl('POST', '/v1/catalogs/products', { ...OFFERS[app].product, type: 'SERVICE', category: 'SOFTWARE' }, token, [`PayPal-Request-Id: ${app}-product-${Date.now()}`])
    if (p.status >= 300) { console.error('  product create failed', p.status, JSON.stringify(p.data).slice(0, 200)); process.exit(1) }
    productId = p.data.id
    upsert(productEnv, productId)
  }
} else console.log(`  product exists (${productEnv} set)`)

for (const plan of OFFERS[app].plans) {
  if (v(plan.env)) { console.log(`  ${plan.env}: exists`); continue }
  console.log(`  ${plan.env}: ${APPLY ? 'creating' : 'would create'} $${plan.price}/${(plan.intervalUnit || 'MONTH') === 'YEAR' ? 'yr' : 'mo'}`)
  if (!APPLY) continue
  const r = curl('POST', '/v1/billing/plans', {
    product_id: productId,
    name: plan.name,
    description: plan.desc,
    billing_cycles: [{ frequency: { interval_unit: plan.intervalUnit || 'MONTH', interval_count: 1 }, tenure_type: 'REGULAR', sequence: 1, total_cycles: 0, pricing_scheme: { fixed_price: { value: plan.price, currency_code: 'USD' } } }],
    payment_preferences: { auto_bill_outstanding: true, setup_fee_failure_action: 'CONTINUE', payment_failure_threshold: 2 },
  }, token, [`PayPal-Request-Id: ${app}-${plan.env}-${Date.now()}`])
  if (r.status >= 300) { console.error(`  ✗ ${plan.env}`, r.status, JSON.stringify(r.data).slice(0, 200)); continue }
  upsert(plan.env, r.data.id)
  console.log(`  ✓ ${plan.env} created`)
}
