import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import { markNurturePaid } from '@/lib/nurture-state'
import { claimWebhookEvent } from '@/lib/payments/webhook-idempotency'
import { verifyPaddleSignature } from '@/lib/payments/paddle'

/**
 * Paddle Billing webhook handler.
 *
 * 2026-05-11 build. Mirrors the hardening contract of the PayPal, LemonSqueezy,
 * and NOWPayments webhooks shipped today:
 *
 *   - HMAC-SHA256 verification of `paddle-signature` header before any body
 *     parsing or processing. Timing-safe compare + ≤5min freshness window.
 *   - Idempotency claim on `event.event_id` BEFORE state transition. Replays
 *     and out-of-order deliveries can't double-fire side effects.
 *   - Terminal-state guard: cancelled/expired/refunded rows are not rewound
 *     by stale earlier events.
 *   - Opaque error codes to caller; full detail to server logs.
 *   - markNurturePaid fires on confirmed payment.
 *
 * Required env (set in Vercel hub project before flipping the switch):
 *   PADDLE_WEBHOOK_SECRET — Paddle Dashboard → Notifications → Secret key.
 *
 * Webhook URL Moses configures in Paddle Dashboard:
 *   https://bizlegal-ai.com/api/payments/paddle/webhook
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const TERMINAL_STATES = new Set(['cancelled', 'expired', 'refunded'])

interface PaddleEvent {
  event_id: string
  event_type: string
  occurred_at?: string
  data?: {
    id?: string
    status?: string
    custom_data?: { order_id?: string }
    items?: Array<{ price_id?: string }>
    // For adjustments
    action?: string
    transaction_id?: string
  } & Record<string, unknown>
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

/**
 * Map a Paddle event_type to our internal status + side effects.
 * Returns null for events we acknowledge (200) but don't act on.
 */
function mapEvent(eventType: string, data: PaddleEvent['data']): {
  newStatus: string | null
  opsType: 'payment.confirmed' | 'payment.failed' | 'payment.refunded' | 'subscription.cancelled' | null
  activatedAt: boolean
  refundedAt: boolean
  cancelledAt: boolean
} {
  switch (eventType) {
    case 'transaction.completed':
    case 'subscription.activated':
    case 'subscription.resumed':
      return {
        newStatus: 'active',
        opsType: 'payment.confirmed',
        activatedAt: true,
        refundedAt: false,
        cancelledAt: false,
      }
    case 'transaction.payment_failed':
    case 'subscription.past_due':
      return {
        newStatus: 'past_due',
        opsType: 'payment.failed',
        activatedAt: false,
        refundedAt: false,
        cancelledAt: false,
      }
    case 'subscription.canceled':
    case 'subscription.paused':
      return {
        newStatus: 'cancelled',
        opsType: 'subscription.cancelled',
        activatedAt: false,
        refundedAt: false,
        cancelledAt: true,
      }
    case 'adjustment.created':
      // Adjustments include refunds. `action` distinguishes; treat refund
      // as terminal-refunded, everything else as audit-only ack.
      if (data?.action === 'refund' || data?.action === 'partial_refund') {
        return {
          newStatus: 'refunded',
          opsType: 'payment.refunded',
          activatedAt: false,
          refundedAt: true,
          cancelledAt: false,
        }
      }
      return { newStatus: null, opsType: null, activatedAt: false, refundedAt: false, cancelledAt: false }
    default:
      return { newStatus: null, opsType: null, activatedAt: false, refundedAt: false, cancelledAt: false }
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await req.text()
    const sigHeader = req.headers.get('paddle-signature')

    if (!verifyPaddleSignature(rawBody, sigHeader)) {
      return NextResponse.json({ error: 'webhook_verification_failed' }, { status: 401 })
    }

    let event: PaddleEvent
    try {
      event = JSON.parse(rawBody) as PaddleEvent
    } catch {
      return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
    }

    if (!event.event_id || !event.event_type) {
      return NextResponse.json({ error: 'missing_event_metadata' }, { status: 400 })
    }

    // Idempotency claim before any state-changing work.
    const claim = await claimWebhookEvent({
      gateway: 'paddle',
      eventId: event.event_id,
      eventType: event.event_type,
      eventReceivedAt: event.occurred_at ?? null,
    })
    if (claim === 'duplicate') {
      return NextResponse.json({ ok: true, deduped: true })
    }
    if (claim === 'error') {
      return NextResponse.json(
        { error: 'idempotency_storage_failed' },
        { status: 500 },
      )
    }

    const orderId = event.data?.custom_data?.order_id
    if (!orderId) {
      // Paddle events without custom_data (test webhooks, manual adjustments
      // not initiated by our /start flow) are acknowledged but not processed.
      // eslint-disable-next-line no-console
      console.warn(`[paddle/webhook] no custom_data.order_id on ${event.event_type}`)
      return NextResponse.json({ ok: true, ignored: true })
    }

    const mapped = mapEvent(event.event_type, event.data)
    if (!mapped.newStatus) {
      // eslint-disable-next-line no-console
      console.log(`[paddle/webhook] no-op event ${event.event_type}`)
      return NextResponse.json({ ok: true, ignored: true })
    }

    const supabase = getSupabase()

    // Terminal-state guard.
    const { data: currentRow } = await supabase
      .from('payment_orders')
      .select('status, user_email, amount_cents, product, tier, billing_interval, source')
      .eq('id', orderId)
      .maybeSingle()

    if (!currentRow) {
      // eslint-disable-next-line no-console
      console.warn(`[paddle/webhook] order_id=${orderId} not found in payment_orders`)
      return NextResponse.json({ ok: true, ignored: 'order_missing' })
    }

    const currentStatus = typeof currentRow.status === 'string' ? currentRow.status : null
    if (currentStatus !== null && TERMINAL_STATES.has(currentStatus)) {
      const allowedFromTerminal: Record<string, ReadonlyArray<string>> = {
        cancelled: ['refunded'],
        expired: ['refunded'],
        refunded: [],
      }
      const permitted = allowedFromTerminal[currentStatus] ?? []
      if (!permitted.includes(mapped.newStatus)) {
        // eslint-disable-next-line no-console
        console.warn(
          `[paddle/webhook] refused stale transition order=${orderId} current=${currentStatus} incoming=${mapped.newStatus} event=${event.event_type}`,
        )
        return NextResponse.json({ ok: true, refused_stale_transition: true })
      }
    }

    const updates: Record<string, unknown> = {
      status: mapped.newStatus,
      metadata: { last_event: event },
    }
    if (mapped.activatedAt) {
      updates.activated_at = new Date().toISOString()
      updates.last_charge_at = new Date().toISOString()
    }
    if (mapped.refundedAt) updates.refunded_at = new Date().toISOString()
    if (mapped.cancelledAt) updates.cancelled_at = new Date().toISOString()

    const { error: updateErr } = await supabase
      .from('payment_orders')
      .update(updates)
      .eq('id', orderId)

    if (updateErr) {
      // eslint-disable-next-line no-console
      console.error('[paddle/webhook] update failed', updateErr.message)
      return NextResponse.json({ error: 'update_failed' }, { status: 500 })
    }

    if (mapped.opsType) {
      logEventAsync({
        type: mapped.opsType,
        source: 'hub',
        ref_id: String(orderId),
        email: currentRow.user_email ?? undefined,
        amount_cents: currentRow.amount_cents ?? undefined,
        status: mapped.newStatus === 'active' ? 'ok' : 'failed',
        metadata: {
          gateway: 'paddle',
          event_type: event.event_type,
          product: currentRow.product,
          tier: currentRow.tier,
          interval: currentRow.billing_interval,
          order_source: currentRow.source,
        },
      })
    }

    if (mapped.newStatus === 'active' && currentRow.user_email) {
      void markNurturePaid(currentRow.user_email).catch((err) => {
        // Pipe to ops_log so the nurture-stop failure isn't console-only
        logEventAsync({
          type: 'error',
          source: 'hub',
          email: currentRow.user_email ?? undefined,
          status: 'failed',
          metadata: {
            stage: 'mark_nurture_paid',
            gateway: 'paddle',
            err: err instanceof Error ? err.message : String(err),
            order_id: orderId,
          },
        })
      })
    }

    return NextResponse.json({ ok: true, status: mapped.newStatus })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[paddle/webhook]', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: 'webhook_processing_failed' },
      { status: 500 },
    )
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    ok: true,
    service: 'paddle/webhook',
    configured: Boolean(process.env.PADDLE_WEBHOOK_SECRET),
    env: process.env.PADDLE_ENV ?? 'live',
  })
}
