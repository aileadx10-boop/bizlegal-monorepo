import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@bizlegal/rate-limit'
import { getSubscriber } from '@/lib/access'
import { requestBuild } from '@/lib/build-this/metering'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

interface Body {
  opportunity_id?: unknown
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const subscriber = await getSubscriber()
  if (!subscriber) return NextResponse.json({ ok: false, error: 'not_authenticated' }, { status: 401 })

  const limit = rateLimit('brainx-build', subscriber.id, { limit: 5, windowMs: 60 * 60_000 })
  if (!limit.ok) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }
  const opportunityId = typeof body.opportunity_id === 'string' ? body.opportunity_id : ''
  if (!/^[0-9a-f-]{36}$/i.test(opportunityId)) {
    return NextResponse.json({ ok: false, error: 'invalid_opportunity_id' }, { status: 400 })
  }

  const outcome = await requestBuild({ subscriberId: subscriber.id, tier: subscriber.tier, opportunityId })

  if (outcome.ok) {
    logEventAsync({ type: 'lead.qualified', source: 'brainx', email: subscriber.email, status: 'ok', metadata: { step: 'build_request', opportunity_id: opportunityId, request_id: outcome.id } })
    return NextResponse.json({ ok: true, request_id: outcome.id, status: 'requested', turnaround: 'within 3 business days' }, { status: 201 })
  }
  if (outcome.reason === 'quota_exhausted') {
    return NextResponse.json({ ok: false, error: 'quota_exhausted', limit: outcome.limit, used: outcome.used, resets_at: outcome.resets_at }, { status: 402 })
  }
  if (outcome.reason === 'already_requested') {
    return NextResponse.json({ ok: false, error: 'already_requested' }, { status: 409 })
  }
  return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
}
