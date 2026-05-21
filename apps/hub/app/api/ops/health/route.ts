import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * GET /api/ops/health?token=...
 *
 * Read-only health snapshot for the /ops/health page. Combines:
 *
 *   1. Subdomain reachability probes (same target list as /api/cron/smoke)
 *   2. HMAC self-loop check — signs a known payload with
 *      BIZLEGAL_INBOUND_SECRET and POSTs to the hub's own /api/ops/log
 *      endpoint. A 200 means hub HMAC is functional; 401 means the
 *      secret is unset or mismatched (P3 not done).
 *   3. Env-var presence audit — boolean per critical hub secret. Names
 *      and presence only; never values.
 *
 * Token-gated by OPS_DASHBOARD_TOKEN. Returns 404 on mismatch (no leaks).
 */

interface SubProbe {
  readonly name: string
  readonly url: string
  readonly source: string
}

const TARGETS: ReadonlyArray<SubProbe> = [
  { name: 'hub',       url: 'https://bizlegal-ai.com/api/digest',           source: 'hub' },
  { name: 'tracr',     url: 'https://tracr.bizlegal-ai.com/api/digest',     source: 'tracr' },
  { name: 'brai',      url: 'https://brai.bizlegal-ai.com/api/digest',      source: 'brai' },
  { name: 'lexaudit',  url: 'https://lexaudit.bizlegal-ai.com/api/digest',  source: 'lexaudit' },
  { name: 'docai',     url: 'https://docai.bizlegal-ai.com/api/digest',     source: 'docai' },
  { name: 'leadforge', url: 'https://leadforge.bizlegal-ai.com/api/digest', source: 'leadforge' },
  { name: 'forge',     url: 'https://forge.bizlegal-ai.com/api/digest',     source: 'forge' },
  { name: 'blog',      url: 'https://blog.bizlegal-ai.com/sitemap.xml',     source: 'blog' },
  { name: 'oci',       url: 'https://router.bizlegal-ai.com/health',        source: 'oci' },
  // Hetzner curator publisher — FastAPI on :8082 fronted by Caddy + Cloudflare Tunnel.
  // Default URL is the public publisher.bizlegal-ai.com hostname; can be overridden via env
  // if the tunnel hostname changes.
  {
    name: 'hetzner-publisher',
    url: process.env.HETZNER_PUBLISHER_HEALTH_URL ?? 'https://publisher.bizlegal-ai.com/healthz',
    source: 'curator',
  },
]

const ENV_KEYS: ReadonlyArray<{ name: string; critical: boolean; reason: string }> = [
  { name: 'NEXT_PUBLIC_SUPABASE_URL',     critical: true,  reason: 'ops_events writes' },
  { name: 'SUPABASE_SERVICE_KEY',         critical: true,  reason: 'service-role inserts' },
  { name: 'BIZLEGAL_INBOUND_SECRET',      critical: true,  reason: 'inbound HMAC pair (subdomains + curator + worker + oci)' },
  { name: 'CRON_SECRET',                  critical: true,  reason: 'cron auth (charge-due, smoke, ops-alerts)' },
  { name: 'OPS_DASHBOARD_TOKEN',          critical: true,  reason: '/ops + /ops/health page guard' },
  { name: 'RESEND_API_KEY',               critical: true,  reason: 'transactional email delivery' },
  { name: 'NOWPAYMENTS_API_KEY',          critical: true,  reason: 'crypto checkout' },
  { name: 'PAYPAL_CLIENT_ID',             critical: true,  reason: 'card checkout' },
  { name: 'PAYPAL_CLIENT_SECRET',         critical: true,  reason: 'card checkout' },
  { name: 'PAYPAL_API_URL',               critical: false, reason: 'card checkout (defaults to live)' },
  { name: 'TELEGRAM_BOT_TOKEN',           critical: false, reason: '/ops alerts notifications' },
  { name: 'TELEGRAM_CHAT_ID',             critical: false, reason: '/ops alerts notifications' },
  { name: 'ANTHROPIC_API_KEY',            critical: true,  reason: 'risk engine + sqa engine' },
  { name: 'NEXT_PUBLIC_APP_URL',          critical: false, reason: 'callback URLs (defaults to https://bizlegal-ai.com)' },
  { name: 'LEXAUDIT_MONITOR_URL',         critical: false, reason: 'compliance monitor cross-call' },
  { name: 'FIRECRAWL_API_KEY',            critical: false, reason: 'Q1/Q2 — rotated key required after leak' },
  { name: 'OCI_ROUTER_URL',               critical: false, reason: 'realestate-intake forwards here (defaults to router.bizlegal-ai.com/lead)' },
  // Per-product NEXT_PUBLIC_*_URL constants were deprecated in Z3 (PR #42, 2026-05-20).
  // /checkout now generates invoices on the fly via @bizlegal/payment. The 14 entries
  // previously audited here only added cosmetic RED noise to /ops/health; removed.
]

// V0.3 — fan-out subdomain env probe. Each subdomain ships a clone of
// /api/ops/health that returns its env-presence booleans. Hub aggregates
// so /ops/health renders the full fleet env grid.
const SUBDOMAIN_HEALTH_TARGETS: ReadonlyArray<{ name: string; url: string }> = [
  { name: 'tracr',     url: 'https://tracr.bizlegal-ai.com/api/ops/health' },
  { name: 'brai',      url: 'https://brai.bizlegal-ai.com/api/ops/health' },
  { name: 'lexaudit',  url: 'https://lexaudit.bizlegal-ai.com/api/ops/health' },
  { name: 'docai',     url: 'https://docai.bizlegal-ai.com/api/ops/health' },
  { name: 'leadforge', url: 'https://leadforge.bizlegal-ai.com/api/ops/health' },
  { name: 'forge',     url: 'https://forge.bizlegal-ai.com/api/ops/health' },
]

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

interface ProbeResult {
  name: string
  source: string
  url: string
  status: number | null
  ok: boolean
  duration_ms: number
  error?: string
}

async function probeOne(target: SubProbe): Promise<ProbeResult> {
  const start = Date.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(target.url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'user-agent': 'bizlegal-health/1.0' },
      cache: 'no-store',
    })
    clearTimeout(timer)
    return {
      name: target.name,
      source: target.source,
      url: target.url,
      status: res.status,
      ok: res.ok,
      duration_ms: Date.now() - start,
    }
  } catch (err) {
    clearTimeout(timer)
    return {
      name: target.name,
      source: target.source,
      url: target.url,
      status: null,
      ok: false,
      duration_ms: Date.now() - start,
      error: err instanceof Error ? err.name : String(err),
    }
  }
}

interface HmacSelfTest {
  attempted: boolean
  ok: boolean
  status: number | null
  error?: string
  reason?: string
}

interface SubdomainEnvSnapshot {
  name: string
  reachable: boolean
  status: number | null
  error?: string
  envs: Array<{ name: string; set: boolean; critical: boolean; reason: string }>
  critical_missing: string[]
}

async function probeSubdomainEnvs(
  target: { name: string; url: string },
  token: string
): Promise<SubdomainEnvSnapshot> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(`${target.url}?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'user-agent': 'bizlegal-health-aggregator/1.0' },
      cache: 'no-store',
    })
    clearTimeout(timer)
    if (!res.ok) {
      return {
        name: target.name,
        reachable: false,
        status: res.status,
        error: `http_${res.status}`,
        envs: [],
        critical_missing: [],
      }
    }
    const body = (await res.json().catch(() => ({}))) as Partial<{
      envs: Array<{ name: string; set: boolean; critical: boolean; reason: string }>
      summary: { critical_missing?: string[] }
    }>
    return {
      name: target.name,
      reachable: true,
      status: res.status,
      envs: Array.isArray(body.envs) ? body.envs : [],
      critical_missing: body.summary?.critical_missing ?? [],
    }
  } catch (err) {
    clearTimeout(timer)
    return {
      name: target.name,
      reachable: false,
      status: null,
      error: err instanceof Error ? err.name : String(err),
      envs: [],
      critical_missing: [],
    }
  }
}

async function hmacSelfTest(req: NextRequest): Promise<HmacSelfTest> {
  const secret = process.env.BIZLEGAL_INBOUND_SECRET ?? ''
  if (!secret) {
    return {
      attempted: false,
      ok: false,
      status: null,
      reason: 'BIZLEGAL_INBOUND_SECRET not set — set it on hub + 6 subdomain Vercel projects to close the chain',
    }
  }
  // POST a synthetic webhook.received event signed with the secret to
  // the hub's own /api/ops/log. Round-trips the HMAC pair through the
  // server we already trust. A 401 here is unambiguous: secret mismatch
  // between the two reads of the same name on the same project. A 200
  // means the signing path works end-to-end.
  const body = JSON.stringify({
    type: 'webhook.received',
    source: 'hub',
    metadata: { hmac_self_test: true, ts: new Date().toISOString() },
  })
  const sig = crypto.createHmac('sha256', secret).update(body).digest('hex')
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  const host = req.headers.get('host') ?? 'bizlegal-ai.com'
  const url = `${proto}://${host}/api/ops/log`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-bizlegal-signature': sig,
      },
      body,
      cache: 'no-store',
    })
    return {
      attempted: true,
      ok: res.ok,
      status: res.status,
      reason: res.ok ? 'HMAC self-loop OK' : `non-2xx: ${res.status}`,
    }
  } catch (err) {
    return {
      attempted: true,
      ok: false,
      status: null,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const expected = process.env.OPS_DASHBOARD_TOKEN ?? ''
    const url = new URL(req.url)
    const provided = url.searchParams.get('token') ?? url.searchParams.get('t') ?? ''
    if (!expected || !provided || !timingSafeEq(expected, provided)) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const [probes, hmac, subdomainEnvs] = await Promise.all([
      Promise.all(TARGETS.map(probeOne)),
      hmacSelfTest(req),
      Promise.all(SUBDOMAIN_HEALTH_TARGETS.map((t) => probeSubdomainEnvs(t, provided))),
    ])

    const envs = ENV_KEYS.map((k) => ({
      name: k.name,
      set: Boolean(process.env[k.name]),
      critical: k.critical,
      reason: k.reason,
    }))

    const criticalMissing = envs.filter((e) => e.critical && !e.set).map((e) => e.name)
    const reachableCount = probes.filter((p) => p.ok).length

    // Aggregate fleet env health: hub criticals + every subdomain's
    // criticals must be set for chain_healthy to be true.
    const subdomainCriticalGaps = subdomainEnvs.flatMap((s) =>
      s.critical_missing.map((env) => `${s.name}:${env}`)
    )
    const subdomainEnvsReachable = subdomainEnvs.filter((s) => s.reachable).length

    return NextResponse.json({
      generated_at: new Date().toISOString(),
      probes,
      hmac,
      envs,
      subdomain_envs: subdomainEnvs,
      summary: {
        subdomains_total: probes.length,
        subdomains_reachable: reachableCount,
        subdomains_down: probes.length - reachableCount,
        envs_total: envs.length,
        critical_missing: criticalMissing,
        subdomain_envs_total: subdomainEnvs.length,
        subdomain_envs_reachable: subdomainEnvsReachable,
        subdomain_critical_missing: subdomainCriticalGaps,
        chain_healthy:
          hmac.ok &&
          criticalMissing.length === 0 &&
          reachableCount === probes.length &&
          subdomainCriticalGaps.length === 0 &&
          subdomainEnvsReachable === subdomainEnvs.length,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[ops/health]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
