import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { sql } from '@/lib/neon'
import { sendAccessLink } from '@/lib/email'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/fulfillment — hub webhook grant callback (HMAC-SHA256 over the
 * raw body with BIZLEGAL_INBOUND_SECRET, same protocol as every subdomain's
 * /api/inbound-lead — see apps/hub/lib/payments/brainx-grant.ts).
 *
 * Five lifecycle events, all idempotent:
 *   activated — create the subscriber (ON CONFLICT (order_id) DO NOTHING —
 *     a webhook replay must not re-send the access email), send the link.
 *   renewed   — extend active_until.
 *   past_due  — flag status; access continues until active_until (grace).
 *   cancelled — flag status; the paid period still runs out naturally.
 *   refunded  — revoke immediately: active_until = now(), token rotated.
 */

interface FulfillmentPayload {
  event: 'activated' | 'renewed' | 'past_due' | 'cancelled' | 'refunded'
  order_id: string
  email: string
  tier: 'radar' | 'radar_build'
  interval: 'monthly' | 'yearly'
  gateway: string
  amount_cents?: number | null
  occurred_at: string
}

function timingSafeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'))
}

const GRACE_DAYS = 3

function activeUntilFor(paidAt: Date, interval: 'monthly' | 'yearly'): Date {
  const d = new Date(paidAt)
  if (interval === 'yearly') d.setUTCFullYear(d.getUTCFullYear() + 1)
  else d.setUTCMonth(d.getUTCMonth() + 1)
  d.setUTCDate(d.getUTCDate() + GRACE_DAYS)
  return d
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.BIZLEGAL_INBOUND_SECRET
  if (!secret) return NextResponse.json({ error: 'fulfillment_not_configured' }, { status: 503 })

  const signature = req.headers.get('x-bizlegal-signature')
  if (!signature) return NextResponse.json({ error: 'missing_signature' }, { status: 401 })

  const rawBody = await req.text()
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  if (expected.length !== signature.length || !timingSafeHexEqual(expected, signature)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  let payload: FulfillmentPayload
  try {
    payload = JSON.parse(rawBody) as FulfillmentPayload
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (!payload.event || !payload.order_id || !payload.email || !payload.tier || !payload.interval) {
    return NextResponse.json({ error: 'event, order_id, email, tier, interval required' }, { status: 400 })
  }

  const email = payload.email.trim().toLowerCase()
  const db = sql()

  try {
    if (payload.event === 'activated') {
      const paidAt = new Date(payload.occurred_at || Date.now())
      const activeUntil = activeUntilFor(paidAt, payload.interval)
      const rows = (await db`
        insert into subscribers (email, tier, "interval", gateway, order_id, paid_at, active_until, status)
        values (${email}, ${payload.tier}, ${payload.interval}, ${payload.gateway ?? 'unknown'}, ${payload.order_id}, ${paidAt.toISOString()}, ${activeUntil.toISOString()}, 'active')
        on conflict (order_id) do nothing
        returning id, access_token
      `) as unknown as Array<{ id: string; access_token: string }>

      if (rows.length === 0) {
        // Replay of an already-processed activation — deduped, not an error.
        return NextResponse.json({ ok: true, deduped: true })
      }

      await sendAccessLink({ to: email, token: rows[0]!.access_token, tier: payload.tier, orderId: payload.order_id }).catch((err) =>
        console.warn('[fulfillment] access link email failed:', err),
      )

      logEventAsync({ type: 'payment.confirmed', source: 'brainx', ref_id: payload.order_id, email, amount_cents: payload.amount_cents ?? undefined, status: 'ok', metadata: { tier: payload.tier, interval: payload.interval, gateway: payload.gateway } })
      logEventAsync({ type: 'subscription.created', source: 'brainx', ref_id: payload.order_id, email, status: 'ok', metadata: { tier: payload.tier, interval: payload.interval } })
      return NextResponse.json({ ok: true, credited: true })
    }

    if (payload.event === 'renewed') {
      const period = payload.interval === 'yearly' ? '1 year' : '1 month'
      const rows = (await db`
        update subscribers
        set active_until = greatest(active_until, now()) + ${period}::interval + (${GRACE_DAYS} || ' days')::interval,
            status = 'active',
            updated_at = now()
        where order_id = ${payload.order_id}
        returning id
      `) as unknown as Array<{ id: string }>
      if (rows.length === 0) return NextResponse.json({ error: 'unknown_order' }, { status: 404 })

      await db`
        insert into subscription_events (order_id, event, occurred_at, payload)
        values (${payload.order_id}, 'renewed', ${payload.occurred_at}, ${JSON.stringify(payload)}::jsonb)
        on conflict (order_id, event, occurred_at) do nothing
      `
      logEventAsync({ type: 'subscription.renewed', source: 'brainx', ref_id: payload.order_id, email, status: 'ok' })
      return NextResponse.json({ ok: true })
    }

    if (payload.event === 'past_due') {
      await db`update subscribers set status = 'past_due', updated_at = now() where order_id = ${payload.order_id}`
      logEventAsync({ type: 'payment.failed', source: 'brainx', ref_id: payload.order_id, email, status: 'failed' })
      return NextResponse.json({ ok: true })
    }

    if (payload.event === 'cancelled') {
      await db`update subscribers set status = 'cancelled', cancelled_at = now(), updated_at = now() where order_id = ${payload.order_id}`
      logEventAsync({ type: 'subscription.cancelled', source: 'brainx', ref_id: payload.order_id, email, status: 'cancelled' })
      return NextResponse.json({ ok: true })
    }

    if (payload.event === 'refunded') {
      await db`
        update subscribers
        set status = 'revoked', active_until = now(), access_token = gen_random_uuid(), token_rotated_at = now(), updated_at = now()
        where order_id = ${payload.order_id}
      `
      logEventAsync({ type: 'payment.refunded', source: 'brainx', ref_id: payload.order_id, email, status: 'failed' })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: `unknown event: ${payload.event}` }, { status: 400 })
  } catch (err) {
    console.error('[fulfillment] db error:', err)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }
}
