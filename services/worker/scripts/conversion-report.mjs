#!/usr/bin/env node
/**
 * conversion-report — per-vertical 14-day rolling conversion rate.
 *
 * Phase AA D13. Reads `lead_nurture_state` (and optionally a payment-
 * confirmed signal from the same table's `payment_status='paid'` flip)
 * to compute, for each of the 9 verticals:
 *
 *   - leads captured in the last 14 days
 *   - leads converted (payment_status flipped to paid) in the last 14 days
 *   - conversion rate (paid / captured)
 *
 * Output is a JSON document suitable for piping into a pricing-experiment
 * decision (per `~/.claude/skills/bizlegal-price-test/SKILL.md`).
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SECRET=... node scripts/conversion-report.mjs
 *   SUPABASE_URL=... SUPABASE_SECRET=... node scripts/conversion-report.mjs --window 7
 *   SUPABASE_URL=... SUPABASE_SECRET=... node scripts/conversion-report.mjs --vertical boi
 */

import { argv, env, exit } from 'node:process'

const VERTICALS = [
  'boi',
  'brai',
  'tracr',
  'lexaudit',
  'docai',
  'forge',
  'leadforge',
  'realestate',
  'generic',
]

function parseArgs(rawArgs) {
  const out = { windowDays: 14, vertical: null, format: 'json' }
  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i]
    if (arg === '--window') out.windowDays = Number(rawArgs[++i])
    else if (arg === '--vertical') out.vertical = rawArgs[++i]
    else if (arg === '--format') out.format = rawArgs[++i]
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node conversion-report.mjs [--window N] [--vertical NAME] [--format json|table]
  --window <n>      lookback in days (default 14)
  --vertical <name> filter to one vertical
  --format <fmt>    json (default) | table`)
      exit(0)
    } else {
      console.error(`Unknown arg: ${arg}`)
      exit(2)
    }
  }
  if (Number.isNaN(out.windowDays) || out.windowDays < 1 || out.windowDays > 90) {
    console.error('--window must be 1-90')
    exit(2)
  }
  if (out.vertical && !VERTICALS.includes(out.vertical)) {
    console.error(`--vertical must be one of: ${VERTICALS.join(', ')}`)
    exit(2)
  }
  if (!['json', 'table'].includes(out.format)) {
    console.error('--format must be json or table')
    exit(2)
  }
  return out
}

function requireEnv(name) {
  const value = env[name]
  if (!value) {
    console.error(`env ${name} required`)
    exit(2)
  }
  return value
}

// Lazy creds — let --help work without Supabase access.
let supabaseUrl
let supabaseKey
function ensureSb() {
  if (supabaseUrl && supabaseKey) return
  supabaseUrl = requireEnv('SUPABASE_URL')
  supabaseKey = requireEnv('SUPABASE_SECRET')
}

async function sbCount(path, params) {
  ensureSb()
  const url = new URL(`${supabaseUrl}/rest/v1/${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: 'count=exact',
      Range: '0-0',
    },
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`${path} ${res.status}: ${detail.slice(0, 200)}`)
  }
  // PostgREST returns Content-Range like '0-0/12345' — parse the total.
  const cr = res.headers.get('content-range') ?? ''
  const m = /\/(\d+)$/.exec(cr)
  return m ? Number(m[1]) : 0
}

async function main() {
  const args = parseArgs(argv.slice(2))
  const sinceIso = new Date(Date.now() - args.windowDays * 86_400_000).toISOString()
  const targetVerticals = args.vertical ? [args.vertical] : VERTICALS

  const rows = []
  for (const vertical of targetVerticals) {
    const captured = await sbCount('lead_nurture_state', {
      select: 'id',
      vertical: `eq.${vertical}`,
      captured_at: `gte.${sinceIso}`,
    })
    const paid = await sbCount('lead_nurture_state', {
      select: 'id',
      vertical: `eq.${vertical}`,
      captured_at: `gte.${sinceIso}`,
      payment_status: 'eq.paid',
    })
    const opted_out = await sbCount('lead_nurture_state', {
      select: 'id',
      vertical: `eq.${vertical}`,
      captured_at: `gte.${sinceIso}`,
      opted_out: 'eq.true',
    })
    const rate_pct = captured > 0 ? Math.round((paid / captured) * 10000) / 100 : 0
    const opt_out_rate_pct = captured > 0 ? Math.round((opted_out / captured) * 10000) / 100 : 0
    rows.push({ vertical, captured, paid, opted_out, rate_pct, opt_out_rate_pct })
  }

  const report = {
    window_days: args.windowDays,
    since: sinceIso,
    rows,
    rules: {
      experiment_threshold_rate_pct: 0.5,
      experiment_min_visits: 100,
      note: 'Conversion below 0.5% over ≥100 visits → experiment-eligible per Phase AA pricing authority.',
    },
  }

  if (args.format === 'json') {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log(
      `\nConversion report (last ${args.windowDays}d, since ${sinceIso.slice(0, 10)}):\n`,
    )
    console.log(`${'vertical'.padEnd(14)} ${'captured'.padStart(9)} ${'paid'.padStart(6)} ${'rate %'.padStart(8)} ${'opt-out %'.padStart(10)} eligible`)
    console.log('-'.repeat(60))
    for (const r of rows) {
      const eligible =
        r.captured >= report.rules.experiment_min_visits && r.rate_pct < report.rules.experiment_threshold_rate_pct
          ? 'YES'
          : ''
      console.log(
        `${r.vertical.padEnd(14)} ${String(r.captured).padStart(9)} ${String(r.paid).padStart(6)} ${String(r.rate_pct).padStart(8)} ${String(r.opt_out_rate_pct).padStart(10)} ${eligible}`,
      )
    }
  }
  exit(0)
}

main().catch((err) => {
  console.error('FAILED:', err.message)
  exit(1)
})
