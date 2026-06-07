#!/usr/bin/env node
/**
 * DocAI launch readiness checker.
 *
 * Safe output: prints env names + set/empty only, never values.
 * Default: env-only checks from apps/docai/web/.env.local and process.env.
 * Optional: --db checks Supabase table/column availability using service role.
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const REPO_ROOT = resolve(import.meta.dirname, '..')
const DOCAI_ENV = resolve(REPO_ROOT, 'apps/docai/web/.env.local')

const REQUIRED = [
  ['NEXT_PUBLIC_SITE_URL', 'canonical DocAI redirects + payment return URLs'],
  ['NEXT_PUBLIC_SUPABASE_URL', 'contract_scans + report unlock reads/writes'],
  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'client-safe Supabase surfaces'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'service-role inserts and payment unlock updates', ['SUPABASE_SERVICE_KEY']],
  ['ANTHROPIC_API_KEY', 'primary contract analysis'],
  ['NOWPAYMENTS_API_KEY', '$97 crypto checkout invoice creation'],
  ['NOWPAYMENTS_IPN_SECRET', 'NOWPayments webhook verification/unlock'],
  ['BIZLEGAL_INBOUND_SECRET', 'ops event HMAC'],
  ['OPS_DASHBOARD_TOKEN', '/api/ops/health guard'],
]

const PAYPAL_KEYS = [
  ['NEXT_PUBLIC_PAYPAL_SCAN_ENABLED', 'feature flag for showing card/PayPal checkout'],
  ['PAYPAL_CLIENT_ID', '$97 card/PayPal fallback checkout'],
  ['PAYPAL_CLIENT_SECRET', '$97 PayPal capture'],
  ['PAYPAL_ENV', 'selects PayPal live vs sandbox API'],
]

const OPTIONAL = [
  ...PAYPAL_KEYS,
  ['PAYPAL_WEBHOOK_ID', 'PayPal subscription webhook verification'],
  ['PAYONEER_DOCAI_LINK', 'manual hosted-card backup'],
  ['OPS_LOG_URL', 'explicit hub ops-log URL; code has default'],
  ['OPENAI_API_KEY', 'AI fallback if Anthropic fails'],
  ['OPENAI_MODEL', 'OpenAI fallback model override; code has default'],
  ['OPENAI_EMBEDDING_KEY', 'Firm-tier KB embeddings'],
  ['RESEND_API_KEY', 'email delivery'],
  ['RESEND_FROM', 'email sender identity'],
]

const TABLE_CHECKS = [
  {
    table: 'contract_scans',
    select: 'id,email,filename,contract_type,score,red_flags,total_risks,ai_content,paid,payment_provider,nowpayments_order_id',
    reason: 'scan persistence, preview, and paid unlock',
  },
  {
    table: 'leads',
    select: '*',
    reason: 'best-effort lead capture after scan',
  },
  {
    table: 'payment_orders',
    select: 'id,user_email,product,tier,billing_interval,amount_cents,gateway,status,source,gateway_invoice_id,gateway_subscription_id',
    reason: 'dynamic pricing tier checkout',
  },
]

function parseEnvFile(path) {
  const out = {}
  if (!existsSync(path)) return out
  const text = readFileSync(path, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1)
    out[key] = value
  }
  return out
}

const fileEnv = parseEnvFile(DOCAI_ENV)
const env = { ...fileEnv, ...process.env }
const paypalScanEnabled = env.NEXT_PUBLIC_PAYPAL_SCAN_ENABLED === 'true'

if (process.argv.includes('--insecure-tls')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  console.log('WARNING: --insecure-tls disables local TLS certificate validation for this diagnostic run only.')
}

function hasEnv(name, aliases = []) {
  return [name, ...aliases].some((key) => typeof env[key] === 'string' && env[key].trim().length > 0)
}

function printEnvSection(title, items, required) {
  console.log(`\n${title}`)
  let missing = []
  for (const [name, reason, aliases = []] of items) {
    const ok = hasEnv(name, aliases)
    const aliasText = aliases.length ? ` aliases=${aliases.join(',')}` : ''
    console.log(`${ok ? '✓' : required ? '✗' : '○'} ${name}${aliasText} — ${ok ? 'set' : 'empty'} — ${reason}`)
    if (required && !ok) missing.push(name)
  }
  return missing
}

async function checkDb() {
  console.log('\nSupabase schema')
  const url = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY
  if (!url || !key) {
    console.log('✗ skipped — Supabase URL/service key missing')
    return ['supabase_env']
  }
  const failures = []
  for (const check of TABLE_CHECKS) {
    const endpoint = `${url}/rest/v1/${check.table}?select=${encodeURIComponent(check.select)}&limit=1`
    try {
      const response = await fetch(endpoint, {
        headers: {
          apikey: key,
          authorization: `Bearer ${key}`,
          accept: 'application/json',
        },
      })
      if (!response.ok) {
        const body = await response.json().catch(async () => ({ message: await response.text().catch(() => '') }))
        const code = body?.code || response.status
        const message = body?.message || response.statusText
        console.log(`✗ ${check.table} — ${check.reason} — ${code} ${message}`)
        failures.push(check.table)
      } else {
        console.log(`✓ ${check.table} — ${check.reason}`)
      }
    } catch (error) {
      console.log(`✗ ${check.table} — ${check.reason} — ${error instanceof Error ? error.message : String(error)}`)
      failures.push(check.table)
    }
  }
  return failures
}
async function main() {
  console.log('DocAI launch readiness check')
  console.log(`env_file=${DOCAI_ENV} exists=${existsSync(DOCAI_ENV)}`)

  const requiredMissing = printEnvSection('Required envs', paypalScanEnabled ? [...REQUIRED, ...PAYPAL_KEYS] : REQUIRED, true)
  printEnvSection('Optional envs', OPTIONAL, false)

  let dbFailures = []
  if (process.argv.includes('--db')) {
    dbFailures = await checkDb()
  } else {
    console.log('\nSupabase schema')
    console.log('○ skipped — pass --db to verify tables/columns against Supabase; add --insecure-tls only for local Windows CA-chain diagnostics')
  }

  if (requiredMissing.length || dbFailures.length) {
    console.log('\nResult: NOT READY')
    if (requiredMissing.length) console.log(`missing_required_envs=${requiredMissing.join(',')}`)
    if (dbFailures.length) console.log(`db_failures=${dbFailures.join(',')}`)
    process.exit(1)
  }

  console.log('\nResult: READY FOR PAYMENT SMOKE TESTS')
}

main().catch((error) => {
  console.error('launch_check_failed', error instanceof Error ? error.message : error)
  process.exit(1)
})


