import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'
import { verifyTurnstile } from '@bizlegal/turnstile-verify'
import { sql } from '@/lib/neon'
import { sendAccessLinkResend } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * POST /api/access/request — "email me my link". Always returns 200 with
 * the same message whether or not the address is an active subscriber, so
 * this endpoint cannot be used to enumerate who has paid.
 */

interface Body {
  email?: unknown
  turnstile_token?: unknown
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = clientIpFromHeaders(req.headers)
  const limit = rateLimit('brainx-access', ip ?? 'unknown', { limit: 5, windowMs: 10 * 60_000 })
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
    const rows = (await sql()`
      select access_token, tier from subscribers
      where lower(email) = ${email} and active_until > now() and status <> 'revoked'
      order by created_at desc limit 1
    `) as unknown as Array<{ access_token: string; tier: string }>
    const row = rows?.[0]
    if (row) {
      await sendAccessLinkResend({ to: email, token: row.access_token, tier: row.tier === 'radar_build' ? 'radar_build' : 'radar' }).catch(() => {})
    }
    await sql()`insert into access_link_requests (email, ip, sent) values (${email}, ${ip ?? null}, ${Boolean(row)})`
  } catch (err) {
    console.warn('[access/request] lookup failed:', err)
  }

  return NextResponse.json({ ok: true, message: 'If that email has an active BrainX subscription, a sign-in link is on its way.' })
}
