import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * GET /api/ops/health
 *
 * Per-subdomain env audit endpoint (matches the contract every other
 * subdomain implements — apps/hub aggregates these via SUBDOMAIN_HEALTH_TARGETS).
 */
const ENV_KEYS: ReadonlyArray<{ name: string; critical: boolean; reason: string }> = [
  { name: 'NEXT_PUBLIC_SUPABASE_URL', critical: true, reason: 'funnel_jobs reads/writes' },
  { name: 'SUPABASE_SERVICE_KEY', critical: true, reason: 'service-role inserts + storage uploads' },
  { name: 'ANTHROPIC_API_KEY', critical: true, reason: 'primary AI extraction (Haiku 4.5)' },
  { name: 'PAYPAL_CLIENT_ID', critical: true, reason: 'PayPal Orders v2 OAuth' },
  { name: 'PAYPAL_CLIENT_SECRET', critical: true, reason: 'PayPal Orders v2 OAuth' },
  { name: 'BIZLEGAL_INBOUND_SECRET', critical: true, reason: 'ops_log HMAC chain' },
  { name: 'PAYPAL_ENV', critical: false, reason: 'sandbox vs live (defaults sandbox)' },
  { name: 'PAYPAL_WEBHOOK_ID', critical: false, reason: 'webhook signature verification (best-effort if absent)' },
  { name: 'MINIMAX_API_KEY', critical: false, reason: 'fallback AI extraction (Anthropic failure path)' },
  { name: 'SUPABASE_STORAGE_BUCKET', critical: false, reason: "storage bucket (defaults 'funnel-uploads')" },
]

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const envs = ENV_KEYS.map((e) => ({
    name: e.name,
    set: Boolean(process.env[e.name]),
    critical: e.critical,
    reason: e.reason,
  }))
  const criticalMissing = envs.filter((e) => e.critical && !e.set).map((e) => e.name)
  return NextResponse.json({
    generated_at: new Date().toISOString(),
    surface: 'funnel-mvp',
    healthy: criticalMissing.length === 0,
    critical_missing: criticalMissing,
    envs,
  })
}
