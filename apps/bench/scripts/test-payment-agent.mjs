#!/usr/bin/env node
/**
 * test-payment-agent.mjs
 *
 * Authorized test-payment executor for bench.bizlegal-ai.com.
 *
 * SECURITY MODEL
 * -------------
 * This agent only acts when it receives a matching password + keyword.
 * Both are provided by Moses at invocation time (never stored in code).
 * The values are compared against a local protected config file
 * (.payment-agent.json in the monorepo root), which Moses creates once
 * and keeps outside git.
 *
 * The password proves the caller is authorized. The keyword proves the
 * agent itself is the legit agent (not a compromised copy). Together:
 *   - Wrong password  -> agent refuses
 *   - Wrong keyword   -> agent refuses
 *   - Both correct    -> agent executes the requested action
 *
 * SAFETY RAILS
 * ------------
 * - Default mode is --dry-run: only validates auth + shows what would happen.
 * - --confirm is required to actually create a checkout order.
 * - Only bench products are allowed (bench_audit_2500 / bench_managed_monthly).
 * - Every execution is appended to payment-agent.log.
 * - The agent never stores credentials in git.
 * - A max-amount guard rejects products above a Moses-set ceiling.
 *
 * USAGE
 * -----
 *   node apps/bench/scripts/test-payment-agent.mjs \
 *     --product bench_audit_2500 \
 *     --email moses@example.com \
 *     --password "$PASSWORD" \
 *     --keyword "$KEYWORD" \
 *     --dry-run
 *
 *   # Real run (creates PayPal order + returns approve URL):
 *   node apps/bench/scripts/test-payment-agent.mjs \
 *     --product bench_audit_2500 \
 *     --email moses@example.com \
 *     --password "$PASSWORD" \
 *     --keyword "$KEYWORD" \
 *     --confirm
 */

import { createHash, randomBytes } from 'node:crypto'
import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MONOREPO_ROOT = join(__dirname, '..', '..', '..')
const CONFIG_PATH = join(MONOREPO_ROOT, '.payment-agent.json')
const LOG_DIR = join(MONOREPO_ROOT, 'apps/bench/scripts/.logs')
const LOG_FILE = join(LOG_DIR, 'test-payment-agent.log')

const BENCH_CHECKOUT_URL = 'https://bench.bizlegal-ai.com/api/checkout/start'
const PAYPAL_API_URL = process.env.PAYPAL_API_URL ?? 'https://api-m.sandbox.paypal.com'
const PAYPAL_CLIENT_ID = process.env.PAYPAL_SANDBOX_CLIENT_ID ?? process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_SANDBOX_CLIENT_SECRET ?? process.env.PAYPAL_CLIENT_SECRET

const ALLOWED_PRODUCTS = new Map([
  ['bench_audit_2500', { name: 'Diagnostic Audit', amount_cents: 250000 }],
  ['bench_managed_monthly', { name: 'Managed Evaluation Program', amount_cents: 500000 }],
])

// ─── Auth helpers ───────────────────────────────────────────────────

function sha256(input) {
  return createHash('sha256').update(input).digest('hex')
}

function loadConfig() {
  if (!existsSync(CONFIG_PATH)) {
    throw new Error(
      'Config file not found at ' + CONFIG_PATH + '\n' +
      'Create it with: {\n' +
      '  "auth": {\n' +
      '    "password_hash": "<sha256 of password>",\n' +
      '    "keyword_hash": "<sha256 of keyword>"\n' +
      '  },\n' +
      '  "max_amount_cents": 250000,\n' +
      '  "enabled": true\n' +
      '}'
    )
  }
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
}

function authorize(config, password, keyword) {
  if (!config?.enabled) {
    return { ok: false, error: 'agent_disabled' }
  }
  if (!password || !keyword) {
    return { ok: false, error: 'missing_password_or_keyword' }
  }
  const pwdOk = sha256(password) === config.auth?.password_hash
  const kwOk = sha256(keyword) === config.auth?.keyword_hash
  if (!pwdOk || !kwOk) {
    appendLog({ type: 'auth_failed', password_ok: pwdOk, keyword_ok: kwOk })
    return { ok: false, error: 'invalid_credentials' }
  }
  return { ok: true }
}

function log(msg) {
  appendLog(msg)
  console.log(msg)
}

function appendLog(msg) {
  try {
    mkdirSync(LOG_DIR, { recursive: true })
    const line = '[' + new Date().toISOString() + '] ' + (typeof msg === 'string' ? msg : JSON.stringify(msg)) + '\n'
    appendFileSync(LOG_FILE, line, 'utf8')
  } catch {
    // best-effort logging — never block the agent on log failure
  }
}

// ─── Curl HTTP helpers (Node fetch has TLS issues in this env) ──────

function curl(method, url, headers, body) {
  const args = ['-s']
  if (method !== 'GET') {
    args.push('-X', method)
  }
  for (const [k, v] of Object.entries(headers || {})) {
    args.push('-H', `${k}: ${v}`)
  }
  if (body !== undefined) {
    args.push('-d', typeof body === 'string' ? body : JSON.stringify(body))
  }
  args.push(url)
  const result = spawnSync('curl', args, { encoding: 'utf8' })
  if (result.status !== 0) {
    throw new Error('curl failed: ' + (result.stderr || result.stdout || '').slice(0, 200))
  }
  return result.stdout
}

// ─── PayPal helpers ─────────────────────────────────────────────────

async function getPayPalAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET unset — set sandbox creds to verify orders.')
  }
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
  const raw = curl('POST', `${PAYPAL_API_URL}/v1/oauth2/token`, {
    'content-type': 'application/x-www-form-urlencoded',
    authorization: `Basic ${auth}`,
  }, 'grant_type=client_credentials')
  const data = JSON.parse(raw)
  if (!data.access_token) {
    throw new Error('paypal_token_failed: ' + raw.slice(0, 200))
  }
  return data.access_token
}

async function verifyPayPalOrder(orderId, accessToken) {
  try {
    const raw = curl('GET', `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
      authorization: `Bearer ${accessToken}`,
    })
    return { ok: true, data: JSON.parse(raw) }
  } catch (err) {
    return { ok: false, error: String(err).slice(0, 200) }
  }
}

// ─── Main ────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) {
        args[key] = next
        i++
      } else {
        args[key] = true
      }
    }
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const productId = args.product
  const email = args.email
  const password = args.password
  const keyword = args.keyword
  const isDryRun = !!args['dry-run']
  const isConfirm = !!args.confirm

  if (!productId || !ALLOWED_PRODUCTS.has(productId)) {
    log('Invalid product. Allowed: ' + [...ALLOWED_PRODUCTS.keys()].join(', '))
    process.exit(1)
  }
  if (!email || !email.includes('@')) {
    log('Missing or invalid email.')
    process.exit(1)
  }
  if (!isConfirm) {
    log('DRY-RUN mode — no order will be created. Pass --confirm to execute.')
  }

  // Auth
  let config
  try {
    config = loadConfig()
  } catch (err) {
    log('Config error: ' + err.message)
    process.exit(1)
  }

  const auth = authorize(config, password, keyword)
  if (!auth.ok) {
    log('Auth failed: ' + auth.error)
    process.exit(1)
  }
  log('Auth OK')

  // Amount guard
  const product = ALLOWED_PRODUCTS.get(productId)
  const maxAllowed = config.max_amount_cents ?? 250000
  if (product.amount_cents > maxAllowed) {
    log(`Amount guard: ${product.amount_cents} > ${maxAllowed}. Refusing.`)
    process.exit(1)
  }

  log(`Product: ${productId} (${product.name}) — $${(product.amount_cents / 100).toFixed(2)}`)
  log(`Email: ${email}`)
  log(`Mode: ${isConfirm ? 'CONFIRM — order will be created' : 'DRY-RUN — no order'}`)

  if (isDryRun || !isConfirm) {
    log('')
    log('Would call: POST ' + BENCH_CHECKOUT_URL)
    log(`Body: { product_id: "${productId}", user_email: "${email}", gateway: "card" }`)
    log('')
    log('Dry-run complete. Pass --confirm to create the order.')
    return 0
  }

  // Create the checkout order via bench API
  appendLog({ type: 'checkout_start', product_id: productId, email, dry_run: false })

  let checkoutJson
  try {
    const raw = curl('POST', BENCH_CHECKOUT_URL, { 'content-type': 'application/json' }, { product_id: productId, user_email: email, gateway: 'card' })
    checkoutJson = JSON.parse(raw)
  } catch (err) {
    log('Checkout API failed: ' + String(err))
    appendLog({ type: 'checkout_failed', product_id: productId, email, error: String(err) })
    process.exit(1)
  }

  if (!checkoutJson.ok) {
    log('Checkout API failed: ' + JSON.stringify(checkoutJson))
    appendLog({ type: 'checkout_failed', product_id: productId, email, error: checkoutJson })
    process.exit(1)
  }

  log('Checkout order created:')
  log('  Provider: ' + checkoutJson.provider)
  log('  Order: ' + checkoutJson.order_id)
  log('  PayPal invoice: ' + checkoutJson.provider_invoice_id)
  log('  Amount: $' + (checkoutJson.amount_cents / 100).toFixed(2))
  log('  URL: ' + checkoutJson.checkout_url)

  // Try to verify the PayPal order via the API (best-effort)
  try {
    const token = await getPayPalAccessToken()
    const verified = await verifyPayPalOrder(checkoutJson.provider_invoice_id, token)
    if (verified.ok) {
      log('')
      log('PayPal order verified: ' + verified.data.status)
      log('  Amount: ' + (verified.data.purchase_units?.[0]?.amount?.value ?? 'unknown'))
      appendLog({ type: 'paypal_verified', order_id: checkoutJson.order_id, provider_invoice_id: checkoutJson.provider_invoice_id, status: verified.data.status })
    } else {
      log('')
      log('Could not verify PayPal order: ' + verified.error)
    }
  } catch (err) {
    log('')
    log('PayPal verification skipped: ' + err.message)
  }

  appendLog({ type: 'checkout_complete', product_id: productId, email, order_id: checkoutJson.order_id, provider_invoice_id: checkoutJson.provider_invoice_id, checkout_url: checkoutJson.checkout_url })
  log('')
  log('COMPLETE. Checkout URL: ' + checkoutJson.checkout_url)
  return 0
}

main().catch((err) => {
  console.error('Agent crashed:', err)
  process.exit(1)
})

