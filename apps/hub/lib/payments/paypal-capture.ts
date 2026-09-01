/**
 * Shared PayPal capture step for hub-routed card checkout — 2026-09-01.
 *
 * Closes fleet finding F1: hub creates PayPal orders with intent=CAPTURE
 * but nothing ever called /v2/checkout/orders/{id}/capture, so buyers
 * approved payment, no money moved, and the webhook granted product
 * access + sent "payment confirmed" emails on CHECKOUT.ORDER.APPROVED.
 *
 * This helper is the single capture path, used by:
 *   - /payment/paypal/return (buyer redirect after approval)
 *   - /api/payments/paypal/webhook (defensive capture on APPROVED, since
 *     some buyers close the tab before the return redirect)
 *
 * Idempotent: reads the order status first and skips capture when the
 * order is already COMPLETED; the payment_orders row records
 * metadata.paypal_capture_id so repeat calls short-circuit. PayPal-Request-Id
 * (the internal order id) collapses any residual gateway-side duplicates.
 *
 * Fulfillment (grants + confirmation email) is deliberately NOT here — it
 * lives in the webhook on PAYMENT.CAPTURE.COMPLETED, the only trustworthy
 * "money moved" signal.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  capturePayPalOrder,
  getPayPalOrder,
  paypalCaptureId,
} from '@bizlegal/payment'

// Same env convention as app/api/payments/paypal/start/route.ts — capture
// must hit the same environment that created the order.
function paypalBase(): string {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

export type CaptureOutcome = 'captured' | 'already_captured' | 'failed'

export interface CaptureResult {
  outcome: CaptureOutcome
  /** PayPal capture id when captured/already_captured. */
  captureId?: string
  error?: string
}

interface OrderRow {
  id: string
  status: string | null
  gateway_subscription_id: string | null
  gateway_invoice_id: string | null
  metadata: Record<string, unknown> | null
}

/**
 * Capture the PayPal order backing a payment_orders row.
 *
 * @param orderId       internal payment_orders.id (UUID)
 * @param paypalOrderId PayPal order id when the caller already knows it
 *                      (return URL ?token=, webhook resource.id); validated
 *                      against the stored gateway ids when both exist.
 */
export async function captureHubPayPalOrder(opts: {
  orderId: string
  paypalOrderId?: string
  source: 'return' | 'webhook'
  supabase?: SupabaseClient
}): Promise<CaptureResult> {
  const supabase = opts.supabase ?? getSupabase()

  const { data: row, error: readErr } = await supabase
    .from('payment_orders')
    .select('id, status, gateway_subscription_id, gateway_invoice_id, metadata')
    .eq('id', opts.orderId)
    .maybeSingle()

  if (readErr || !row) {
    return { outcome: 'failed', error: 'order_not_found' }
  }
  const order = row as OrderRow
  const meta = (order.metadata ?? {}) as Record<string, unknown>

  // Already captured through an earlier return/webhook pass.
  if (order.status === 'active' && typeof meta.paypal_capture_id === 'string') {
    return { outcome: 'already_captured', captureId: meta.paypal_capture_id }
  }

  const storedPayPalId = order.gateway_subscription_id ?? order.gateway_invoice_id
  const paypalOrderId = opts.paypalOrderId ?? storedPayPalId ?? undefined
  if (!paypalOrderId) {
    return { outcome: 'failed', error: 'paypal_order_id_missing' }
  }
  // Bind the caller-supplied token to the stored order id so a buyer can't
  // capture someone else's (or a cheaper) order against this row.
  if (opts.paypalOrderId && storedPayPalId && opts.paypalOrderId !== storedPayPalId) {
    return { outcome: 'failed', error: 'paypal_order_mismatch' }
  }

  const apiUrl = paypalBase()

  const current = await getPayPalOrder(paypalOrderId, { apiUrl })
  if (!current.ok || !current.order) {
    return { outcome: 'failed', error: current.error ?? 'paypal_get_failed' }
  }

  let captureId: string | undefined
  if (current.order.status === 'COMPLETED') {
    // Captured already (e.g. webhook fallback won the race) — just record.
    captureId = paypalCaptureId(current.order)
  } else if (current.order.status === 'APPROVED') {
    const captured = await capturePayPalOrder(paypalOrderId, {
      apiUrl,
      requestId: opts.orderId,
    })
    if (!captured.ok || !captured.order) {
      return { outcome: 'failed', error: captured.error ?? 'paypal_capture_failed' }
    }
    if (captured.order.status !== 'COMPLETED') {
      return { outcome: 'failed', error: `capture_status_${captured.order.status}` }
    }
    captureId = paypalCaptureId(captured.order)
  } else {
    // CREATED/SAVED (buyer never approved), VOIDED, etc.
    return { outcome: 'failed', error: `order_status_${current.order.status}` }
  }

  const { error: updateErr } = await supabase
    .from('payment_orders')
    .update({
      status: 'active',
      activated_at: new Date().toISOString(),
      last_charge_at: new Date().toISOString(),
      metadata: {
        ...meta,
        ...(captureId ? { paypal_capture_id: captureId } : {}),
        captured_via: opts.source,
      },
    })
    .eq('id', opts.orderId)

  if (updateErr) {
    // Money moved but the row update failed — surface as failure so the
    // caller retries; the next pass hits the COMPLETED branch above.
    return { outcome: 'failed', error: `record_failed: ${updateErr.message}`, captureId }
  }

  return { outcome: captureId ? 'captured' : 'already_captured', captureId }
}
