import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * GET /api/ops/health?token=...
 *
 * Subdomain env-presence audit (fleet pattern, same shape as FalseEcho).
 * Token-gated; returns env-name + presence boolean per critical secret —
 * never values. Aggregated by hub /api/ops/health into the fleet env matrix.
 */

const ENV_KEYS: ReadonlyArray<{ name: string; critical: boolean; reason: string }> = [
  { name: 'NEXT_PUBLIC_SUPABASE_URL',     critical: true,  reason: 'report + SKU store reads' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY',    critical: true,  reason: 'reports, SKUs, orders writes' },
  { name: 'BIZLEGAL_INBOUND_SECRET',      critical: true,  reason: 'inbound HMAC (leads, fulfillment)' },
  { name: 'OPS_DASHBOARD_TOKEN',          critical: true,  reason: '/api/ops/health page guard' },
  { name: 'RESEND_API_KEY',               critical: true,  reason: 'impact report + intake email delivery' },
  { name: 'PAYPAL_CLIENT_ID',             critical: true,  reason: 'card checkout ($49 audit)' },
  { name: 'PAYPAL_CLIENT_SECRET',         critical: true,  reason: 'card checkout ($49 audit)' },
  { name: 'NOWPAYMENTS_API_KEY',          critical: false, reason: 'crypto checkout' },
  { name: 'NOWPAYMENTS_IPN_SECRET',       critical: false, reason: 'crypto IPN verification' },
  { name: 'PAYPAL_PLAN_ID_SELLERRADAR_MONITOR_MONTHLY', critical: false, reason: 'monitor-tier recurring (Moses handoff)' },
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
    source: 'sellerradar',
    envs,
    summary: {
      envs_total: envs.length,
      critical_missing: criticalMissing,
      healthy: criticalMissing.length === 0,
    },
  })
}
