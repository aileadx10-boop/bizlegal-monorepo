import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * GET /api/ops/health?token=...
 *
 * Subdomain env-presence audit. Token-gated. Returns env-name + presence
 * boolean per DocAI launch/payment secret. Names + presence only — never values.
 * Returns 404 on token mismatch.
 */

type EnvCheck = { name: string; aliases?: string[]; critical: boolean; reason: string }

const ENV_KEYS: ReadonlyArray<EnvCheck> = [
  { name: 'NEXT_PUBLIC_SITE_URL', critical: true, reason: 'canonical DocAI redirects + payment return URLs' },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', critical: true, reason: 'contract_scans + report unlock reads/writes' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', critical: true, reason: 'client-safe Supabase surfaces' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', aliases: ['SUPABASE_SERVICE_KEY'], critical: true, reason: 'service-role inserts and payment unlock updates' },
  { name: 'BIZLEGAL_INBOUND_SECRET', critical: true, reason: 'outbound ops event HMAC' },
  { name: 'OPS_DASHBOARD_TOKEN', critical: true, reason: '/api/ops/health page guard' },
  { name: 'ANTHROPIC_API_KEY', critical: true, reason: 'DocAI contract analysis and drafting' },
  { name: 'RESEND_API_KEY', critical: false, reason: 'email delivery for paid/support flows' },
  { name: 'NOWPAYMENTS_API_KEY', critical: true, reason: '$97 crypto checkout invoice creation' },
  { name: 'NOWPAYMENTS_IPN_SECRET', critical: true, reason: 'NOWPayments webhook verification and paid unlock' },
  { name: 'PAYPAL_CLIENT_ID', critical: true, reason: '$97 card/PayPal fallback checkout' },
  { name: 'PAYPAL_CLIENT_SECRET', critical: true, reason: '$97 card/PayPal fallback capture' },
  { name: 'PAYPAL_ENV', critical: true, reason: 'selects PayPal live vs sandbox API' },
  { name: 'PAYPAL_WEBHOOK_ID', critical: false, reason: 'subscription webhook verification for non-scan DocAI tiers' },
  { name: 'PAYONEER_DOCAI_LINK', critical: false, reason: 'manual hosted-card backup if PayPal is down' },
  { name: 'OPENAI_EMBEDDING_KEY', critical: false, reason: 'Firm-tier KB embeddings' },
]

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

function isSet(check: EnvCheck) {
  return Boolean(process.env[check.name] || check.aliases?.some((alias) => Boolean(process.env[alias])))
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
    aliases: k.aliases ?? [],
    set: isSet(k),
    critical: k.critical,
    reason: k.reason,
  }))

  const criticalMissing = envs.filter((e) => e.critical && !e.set).map((e) => e.name)

  // Extra domain-correctness checks — presence alone is not enough for these.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const siteUrlPointsAtCanonical = siteUrl.includes('docai.bizlegal-ai.com')
  const nowpaymentsKeySet = Boolean(process.env.NOWPAYMENTS_API_KEY)
  const nowpaymentsIpnSecretSet = Boolean(process.env.NOWPAYMENTS_IPN_SECRET)

  const paymentWarnings: string[] = []
  if (!siteUrlPointsAtCanonical) {
    paymentWarnings.push(
      `NEXT_PUBLIC_SITE_URL ("${siteUrl || '(empty)'}") does not contain docai.bizlegal-ai.com — NOWPayments IPN will be misdirected`,
    )
  }
  if (!nowpaymentsKeySet) {
    paymentWarnings.push('NOWPAYMENTS_API_KEY is not set — crypto checkout will fail')
  }
  if (!nowpaymentsIpnSecretSet) {
    paymentWarnings.push('NOWPAYMENTS_IPN_SECRET is not set — webhook verification will fail, no report unlocks')
  }

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    source: 'docai',
    envs,
    payment_config: {
      site_url_set: Boolean(siteUrl),
      site_url_canonical: siteUrlPointsAtCanonical,
      nowpayments_key_set: nowpaymentsKeySet,
      nowpayments_ipn_secret_set: nowpaymentsIpnSecretSet,
      warnings: paymentWarnings,
    },
    summary: {
      envs_total: envs.length,
      critical_missing: criticalMissing,
      payment_warnings: paymentWarnings.length,
      healthy: criticalMissing.length === 0 && paymentWarnings.length === 0,
    },
  })
}
