import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyPayPalWebhook } from '@/lib/paypal'
import { fulfillPaidOrder } from '@/lib/fulfill'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/payments/paypal/webhook — the recurring rail.
 *
 * One-time PayPal orders are captured on return by /api/paypal-capture. A
 * subscription has no return-capture: money moves on PayPal's schedule, and
 * the only signal that the first charge cleared is
 * BILLING.SUBSCRIPTION.ACTIVATED. Without this route the $149/mo monitor took
 * the buyer's approval and provisioned nothing.
 *
 * Fail-closed, both directions:
 *   · PAYPAL_WEBHOOK_ID unset            → 503, nothing processed
 *   · signature verification not SUCCESS → 401, nothing processed
 * There is deliberately no "skip verification in preview" branch — that is
 * exactly the hole closed on the hub webhook (SECURITY-V3 H-3).
 *
 * The webhook id here is this project's own PayPal webhook, not the hub's;
 * the env NAME is shared across projects, the VALUE is per-project.
 */

interface PayPalEvent {
  id?: string
  event_type?: string
  resource?: {
    id?: string
    custom_id?: string
    status?: string
    purchase_units?: Array<{ custom_id?: string; reference_id?: string }>
  }
}

export async function POST(req: NextRequest) {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (!webhookId) {
      console.error('[paypal/webhook] PAYPAL_WEBHOOK_ID missing — refusing (fail-closed)')
      return NextResponse.json({ error: 'webhook_not_configured' }, { status: 503 })
    }

    const rawBody = await req.text()
    if (!(await verifyPayPalWebhook(req.headers, rawBody, webhookId))) {
      console.warn('[paypal/webhook] signature verification failed')
      return NextResponse.json({ error: 'webhook_verification_failed' }, { status: 401 })
    }

    const event = JSON.parse(rawBody) as PayPalEvent
    const eventType = event.event_type ?? ''

    // custom_id is the FE-… report_id we set when creating the subscription.
    const reportId =
      event.resource?.custom_id ??
      event.resource?.purchase_units?.[0]?.custom_id ??
      event.resource?.purchase_units?.[0]?.reference_id

    if (!reportId) {
      return NextResponse.json({ ok: true, ignored: 'no_custom_id', event: eventType })
    }

    const { data: order } = await supabaseAdmin
      .from('falseecho_orders')
      .select('id, report_id, scan_id, email, tier, status')
      .eq('report_id', reportId)
      .maybeSingle()

    if (!order) {
      console.warn('[paypal/webhook] order not found', reportId, eventType)
      return NextResponse.json({ ok: true, ignored: 'order_not_found' })
    }

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        await supabaseAdmin
          .from('falseecho_orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            payment_provider: 'paypal',
            payment_method: 'paypal',
          })
          .eq('id', order.id)
        // Idempotent: fulfillPaidOrder claims paid_at on the scan, so a
        // re-delivered ACTIVATED neither re-provisions the monitor nor
        // re-fires the battery. It also runs the engine pre-flight, so a
        // fleet with a missing engine key holds instead of burning the order.
        const scanRef = await fulfillPaidOrder(order)
        return NextResponse.json({ ok: true, status: 'active', scanRef })
      }

      case 'BILLING.SUBSCRIPTION.RENEWED':
      case 'PAYMENT.SALE.COMPLETED': {
        logEventAsync({
          type: 'subscription.renewed',
          source: 'falseecho',
          ref_id: order.report_id,
          email: order.email ?? undefined,
          status: 'ok',
          metadata: { gateway: 'paypal', tier: order.tier, event_type: eventType },
        })
        return NextResponse.json({ ok: true, status: 'renewed' })
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
        // Stop the daily re-scan. The order row keeps status 'paid' — the
        // payment it records really did happen; what ends is the entitlement.
        await stopMonitors(order)
        logEventAsync({
          type:
            eventType === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED'
              ? 'payment.failed'
              : 'subscription.cancelled',
          source: 'falseecho',
          ref_id: order.report_id,
          email: order.email ?? undefined,
          status: 'failed',
          metadata: { gateway: 'paypal', tier: order.tier, event_type: eventType },
        })
        return NextResponse.json({ ok: true, status: 'stopped' })
      }

      case 'PAYMENT.CAPTURE.REFUNDED':
      case 'PAYMENT.SALE.REFUNDED': {
        await supabaseAdmin.from('falseecho_orders').update({ status: 'refunded' }).eq('id', order.id)
        await stopMonitors(order)
        logEventAsync({
          type: 'payment.refunded',
          source: 'falseecho',
          ref_id: order.report_id,
          email: order.email ?? undefined,
          status: 'cancelled',
          metadata: { gateway: 'paypal', tier: order.tier, event_type: eventType },
        })
        return NextResponse.json({ ok: true, status: 'refunded' })
      }

      default:
        return NextResponse.json({ ok: true, ignored: eventType })
    }
  } catch (err) {
    console.error('[paypal/webhook]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'webhook_processing_failed' }, { status: 500 })
  }
}

/** Cancel every monitor row this order provisioned. */
async function stopMonitors(order: { scan_id: string | null; email: string | null }): Promise<void> {
  if (order.scan_id) {
    await supabaseAdmin
      .from('falseecho_monitors')
      .update({ status: 'cancelled' })
      .eq('scan_id', order.scan_id)
    return
  }
  if (order.email) {
    await supabaseAdmin
      .from('falseecho_monitors')
      .update({ status: 'cancelled' })
      .eq('email', order.email)
      .eq('status', 'active')
  }
}
