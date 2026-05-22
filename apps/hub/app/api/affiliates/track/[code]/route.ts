import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'
import { getAffiliate, recordClick, affiliateCookieHeader, sha256Hex } from '@/lib/affiliate'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

/**
 * GET /api/affiliates/track/<code>?to=/agents
 *
 * First-touch attribution endpoint. Sets a 90-day HttpOnly cookie
 * `bz_aff=<code>` and 302-redirects to ?to= (defaults to /agents).
 * Records a pseudonymous click row (SHA-256 over ip+day-salt + UA hash).
 */
export async function GET(req: NextRequest, { params }: { params: { code: string } }): Promise<NextResponse> {
  const code = (params.code ?? '').trim().toLowerCase()
  if (!/^[a-z0-9]{8}$/.test(code)) {
    return NextResponse.redirect(new URL('/?bad_ref=1', req.nextUrl.origin), { status: 302 })
  }

  const aff = await getAffiliate(code)
  if (!aff || aff.status !== 'active') {
    return NextResponse.redirect(new URL('/?bad_ref=2', req.nextUrl.origin), { status: 302 })
  }

  // Pseudonymize: SHA-256(ip + day-salt) — same IP same day = same hash;
  // can be rotated by changing the day-salt; can't be reversed.
  const ip = (req.headers.get('x-forwarded-for')?.split(',')[0] ?? '').trim()
  const ua = req.headers.get('user-agent') ?? ''
  const referer = req.headers.get('referer') ?? ''
  const daySalt = new Date().toISOString().slice(0, 10)
  const ipHash = ip ? await sha256Hex(`${ip}|${daySalt}`) : null
  const uaHash = ua ? await sha256Hex(ua) : null
  let refererHost: string | null = null
  if (referer) {
    try { refererHost = new URL(referer).host } catch { refererHost = null }
  }

  const to = req.nextUrl.searchParams.get('to') ?? '/agents'
  // Only allow same-origin redirect targets
  const safeTo = to.startsWith('/') ? to : '/agents'
  const landingPath = safeTo.split('?')[0] ?? '/agents'

  await recordClick(code, ipHash, uaHash, refererHost, landingPath)

  logEventAsync({
    type: 'affiliate.click',
    source: 'hub',
    ref_id: code,
    metadata: { referer_host: refererHost, landing_path: landingPath },
  })

  const redirectUrl = new URL(safeTo, req.nextUrl.origin)
  const res = NextResponse.redirect(redirectUrl, { status: 302 })
  res.headers.append('set-cookie', affiliateCookieHeader(code))
  return res
}
