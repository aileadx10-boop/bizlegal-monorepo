import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'
import { createAffiliate } from '@/lib/affiliate'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * POST /api/affiliates/signup
 * Body: { email, display_name?, payout_address? }
 *
 * Mints a new 8-char affiliate code, persists, returns:
 *   { code, dashboard_url, share_url }
 */

interface SignupBody {
  email?: string
  display_name?: string
  payout_address?: string
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: SignupBody
  try {
    body = (await req.json()) as SignupBody
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }
  const email = (body.email ?? '').trim().toLowerCase()
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 })
  }
  const displayName = body.display_name?.trim() || null
  const payoutAddress = body.payout_address?.trim() || null

  const row = await createAffiliate(email, displayName, payoutAddress)
  if (!row) {
    return NextResponse.json({ error: 'signup failed' }, { status: 500 })
  }

  logEventAsync({
    type: 'affiliate.signup',
    source: 'hub',
    ref_id: row.code,
    email,
    metadata: { display_name: displayName, has_payout_address: payoutAddress !== null },
  })

  const origin = req.nextUrl.origin
  return NextResponse.json({
    code: row.code,
    dashboard_url: `${origin}/affiliates/${row.code}/dashboard`,
    share_url: `${origin}/?ref=${row.code}`,
    rate_card: {
      first_month: row.rate_pct_first_mo,
      recurring: row.rate_pct_recurring,
      one_time: row.rate_pct_onetime,
    },
  })
}
