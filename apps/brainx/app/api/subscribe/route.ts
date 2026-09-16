import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'
import { verifyTurnstile } from '@bizlegal/turnstile-verify'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

/**
 * POST /api/subscribe — "one evidence-linked opportunity a week" email
 * capture. Proxies to the hub's double-opt-in newsletter flow
 * (apps/hub/lib/newsletter-optin.ts) rather than writing a row locally —
 * @bizlegal/email's consent check reads the same store, so a subscriber
 * created here is recognized by tools/send-weekly-pick.ts without a second
 * consent system to keep in sync.
 */

const HUB_NEWSLETTER = 'https://bizlegal-ai.com/api/newsletter'

interface Body {
  email?: unknown
  turnstile_token?: unknown
  source?: unknown
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = clientIpFromHeaders(req.headers)
  const limit = rateLimit('brainx-subscribe', ip ?? 'unknown', { limit: 5, windowMs: 60_000 })
  if (!limit.ok) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email.includes('@')) return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })

  const turnstile = await verifyTurnstile({ token: typeof body.turnstile_token === 'string' ? body.turnstile_token : null, clientIp: ip })
  if (!turnstile.ok) return NextResponse.json({ ok: false, error: 'turnstile_failed' }, { status: 403 })

  try {
    const res = await fetch(HUB_NEWSLETTER, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': 'bizlegal-agent/1.0' },
      body: JSON.stringify({ email, source: 'brainx', vertical_interest: ['brainx'] }),
      cache: 'no-store',
    })
    const json = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string; error?: string }
    logEventAsync({ type: 'lead.inbound', source: 'brainx', email, status: json.success ? 'ok' : 'failed', metadata: { step: 'subscribe' } })
    if (!res.ok || json.error) {
      return NextResponse.json({ ok: false, error: json.error ?? 'subscribe_failed' }, { status: res.status || 500 })
    }
    return NextResponse.json({ ok: true, message: json.message ?? 'Check your inbox to confirm.' })
  } catch (err) {
    console.warn('[brainx/subscribe] hub unreachable:', err instanceof Error ? err.message : err)
    return NextResponse.json({ ok: false, error: 'subscribe_unavailable' }, { status: 502 })
  }
}
