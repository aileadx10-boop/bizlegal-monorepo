import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * GET /api/ops/health?token=...
 *
 * Subdomain env-presence audit (V0.3). Token-gated by OPS_DASHBOARD_TOKEN
 * (same token as hub /ops dashboard). Returns env-name + presence boolean
 * per critical secret on this subdomain. Names + presence only — never
 * values.
 *
 * Hub /api/ops/health probes this endpoint and aggregates into the
 * /ops/health page's "Fleet env matrix" so Moses sees red/green per
 * subdomain × env without leaving the dashboard.
 *
 * Returns 404 on token mismatch (no leaks).
 */

const ENV_KEYS: ReadonlyArray<{ name: string; critical: boolean; reason: string }> = [
  { name: 'NEXT_PUBLIC_SUPABASE_URL',     critical: true,  reason: 'TRACR Supabase reads' },
  { name: 'SUPABASE_SERVICE_KEY',         critical: true,  reason: 'service-role inserts (orders, reports)' },
  { name: 'BIZLEGAL_INBOUND_SECRET',      critical: true,  reason: 'inbound HMAC pair (lead routing from Worker)' },
  { name: 'OPS_DASHBOARD_TOKEN',          critical: true,  reason: '/api/ops/health page guard' },
  { name: 'ANTHROPIC_API_KEY',            critical: true,  reason: 'forensic-report Sonnet drafter' },
  { name: 'RESEND_API_KEY',               critical: true,  reason: 'report delivery email' },
  { name: 'NOWPAYMENTS_API_KEY',          critical: true,  reason: 'crypto checkout (forensic report)' },
  { name: 'PAYPAL_CLIENT_ID',             critical: false, reason: 'card checkout fallback' },
  { name: 'PAYPAL_CLIENT_SECRET',         critical: false, reason: 'card checkout fallback' },
  { name: 'TRACR_BLOCKSCOUT_API_KEY',     critical: false, reason: 'wallet enrichment' },
  { name: 'TRACR_ETHERSCAN_API_KEY',      critical: false, reason: 'on-chain verification' },
]

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function GET(req: NextRequest) {
  const expected = process.env.OPS_DASHBOARD_TOKEN ?? ''
  const url = new URL(req.url)
  const provided = url.searchParams.get('token') ?? url.searchParams.get('t') ?? ''
  if (!expected || !provided || !timingSafeEq(expected, provided)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const envs = ENV_KEYS.map((k) => ({
    name: k.name,
    set: Boolean(process.env[k.name]),
    critical: k.critical,
    reason: k.reason,
  }))

  const criticalMissing = envs.filter((e) => e.critical && !e.set).map((e) => e.name)

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    source: 'tracr',
    envs,
    summary: {
      envs_total: envs.length,
      critical_missing: criticalMissing,
      healthy: criticalMissing.length === 0,
    },
  })
}
