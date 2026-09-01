import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { captureHubPayPalOrder } from '@/lib/payments/paypal-capture'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * GET /payment/paypal/return?token=<paypalOrderId>&order=<internalOrderId>
 *
 * PayPal redirects the buyer here after approval (return_url set in
 * /api/payments/paypal/start and in @bizlegal/payment createPayPalOrder).
 * Follows the DocAI capture-on-return pattern
 * (apps/docai/web/app/api/payment/paypal/return/route.ts): the order is
 * CAPTURED server-side first — with intent=CAPTURE an approved order moves
 * no money until capture — and only the capture outcome decides whether
 * the buyer lands on /payment/success or /payment/cancelled.
 *
 * Subscription returns (billing_interval != one-time) skip capture:
 * BILLING.SUBSCRIPTION.ACTIVATED arrives via webhook instead.
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

function redirect(req: NextRequest, path: string, params: Record<string, string>) {
  const url = new URL(path, new URL(req.url).origin)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return NextResponse.redirect(url, 303)
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams
  const token = sp.get('token')?.trim() ?? '' // PayPal order/subscription id
  const orderId = sp.get('order')?.trim() ?? '' // internal payment_orders.id

  if (!orderId) {
    return redirect(req, '/payment/cancelled', { reason: 'missing_order' })
  }

  try {
    const supabase = getSupabase()
    const { data: row } = await supabase
      .from('payment_orders')
      .select('id, status, product, billing_interval, gateway_subscription_id, gateway_invoice_id')
      .eq('id', orderId)
      .maybeSingle()

    if (!row) {
      return redirect(req, '/payment/cancelled', { order: orderId, reason: 'unknown_order' })
    }

    const product = typeof row.product === 'string' ? row.product : ''

    // Subscription approval — activation lands via webhook, nothing to capture.
    if (row.billing_interval && row.billing_interval !== 'one-time') {
      return redirect(req, '/payment/success', { order: orderId, product })
    }

    const result = await captureHubPayPalOrder({
      orderId,
      paypalOrderId: token || undefined,
      source: 'return',
      supabase,
    })

    if (result.outcome === 'failed') {
      console.error('[paypal/return] capture failed', orderId, result.error)
      logEventAsync({
        type: 'payment.failed',
        source: 'hub',
        ref_id: orderId,
        status: 'failed',
        metadata: { gateway: 'paypal', stage: 'capture', error: result.error },
      })
      return redirect(req, '/payment/cancelled', {
        order: orderId,
        product,
        reason: 'capture_failed',
      })
    }

    return redirect(req, '/payment/success', { order: orderId, product, paypal: 'captured' })
  } catch (err) {
    console.error('[paypal/return]', err instanceof Error ? err.message : err)
    return redirect(req, '/payment/cancelled', { order: orderId, reason: 'capture_error' })
  }
}
