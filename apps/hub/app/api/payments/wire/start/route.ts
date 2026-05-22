/**
 * /api/payments/wire/start
 *
 * Bank wire payment intake. Used for high-ticket SKUs (>= $500/€500) where
 * the buyer prefers a bank transfer over crypto or PayPal.
 *
 * Flow:
 *   1. Validate inputs (product, tier, interval, amount, email, currency)
 *   2. Reject if amount < WIRE_MIN_ORDER_CENTS (low-ticket should use NP/PayPal)
 *   3. Reject if bank not configured for the requested currency
 *   4. Insert payment_orders row with status='pending_wire' + wire reference
 *   5. Email buyer the wire instructions (rendered from env-stored bank details)
 *   6. Log payment.intent event for ops visibility
 *   7. Return order_id + reference so the success page can confirm
 *
 * Reconciliation:
 *   Moses runs /api/payments/wire/confirm with the order_id + amount when the
 *   wire lands in his Payoneer / Banking Circle account. That route flips
 *   status -> active and fires payment.confirmed (parallel to other gateways).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import {
  getWireDetails,
  isWireConfigured,
  wireReferenceFromOrderId,
  WIRE_MIN_ORDER_CENTS,
  type WireCurrency,
} from '@/lib/payments/wire'
import { sendBankWireInstructions } from '@/lib/resend'
import { readAffiliateCode } from '@/lib/affiliate'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface WireStartBody {
  product: string
  tier: string
  interval: 'one-time' | 'monthly' | 'yearly'
  amount_cents: number
  email: string
  name?: string
  currency: WireCurrency
  source?: string
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<WireStartBody>
    if (
      !body.product ||
      !body.tier ||
      !body.interval ||
      !body.amount_cents ||
      !body.email ||
      !body.currency
    ) {
      return NextResponse.json(
        { error: 'product, tier, interval, amount_cents, email, currency required' },
        { status: 400 },
      )
    }
    if (!['USD', 'EUR'].includes(body.currency)) {
      return NextResponse.json({ error: 'currency must be USD or EUR' }, { status: 400 })
    }
    if (body.amount_cents < WIRE_MIN_ORDER_CENTS) {
      return NextResponse.json(
        {
          error: `Bank wire is available for orders of $500 / €500 and above. For smaller orders, please use crypto or PayPal at the checkout page.`,
        },
        { status: 400 },
      )
    }
    const currency = body.currency as WireCurrency
    if (!isWireConfigured(currency)) {
      return NextResponse.json(
        {
          error: `Bank wire in ${currency} is not configured on this deployment. Please use crypto (NOWPayments) or PayPal.`,
        },
        { status: 503 },
      )
    }
    const wire = getWireDetails(currency)
    if (!wire) {
      return NextResponse.json({ error: 'Wire details unavailable' }, { status: 503 })
    }

    const supabase = getSupabase()
    const affiliateCode = readAffiliateCode(req.headers.get('cookie'))

    const { data: order, error: insertErr } = await supabase
      .from('payment_orders')
      .insert({
        user_email: body.email,
        user_name: body.name ?? null,
        product: body.product,
        tier: body.tier,
        billing_interval: body.interval,
        amount_cents: body.amount_cents,
        gateway: 'wire',
        status: 'pending_wire',
        source: body.source ?? 'checkout_wire',
        metadata: { currency },
        affiliate_code: affiliateCode,
      })
      .select('id')
      .single()

    if (insertErr || !order) {
      // eslint-disable-next-line no-console
      console.error('[wire/start] supabase insert failed', insertErr)
      return NextResponse.json({ error: 'order creation failed' }, { status: 500 })
    }

    const reference = wireReferenceFromOrderId(String(order.id))
    const productLabel = `${body.product.toUpperCase()} ${body.tier} ${body.interval}`

    // Store reference back on the order for reconcile-by-reference lookups
    await supabase
      .from('payment_orders')
      .update({ gateway_invoice_id: reference })
      .eq('id', order.id)

    // Email the wire instructions
    try {
      await sendBankWireInstructions({
        email: body.email,
        orderId: String(order.id),
        reference,
        amountCents: body.amount_cents,
        currency,
        productLabel,
        wire,
      })
    } catch (mailErr) {
      // eslint-disable-next-line no-console
      console.error('[wire/start] email failed', mailErr)
      // Don't fail the order — buyer can see reference on /checkout/wire/success
      // and can email us for instructions if the auto-mail didn't arrive.
    }

    logEventAsync({
      type: 'payment.intent',
      source: 'hub',
      ref_id: String(order.id),
      email: body.email,
      amount_cents: body.amount_cents,
      status: 'pending',
      metadata: {
        gateway: 'wire',
        currency,
        product: body.product,
        tier: body.tier,
        interval: body.interval,
        reference,
        order_source: body.source,
      },
    })

    return NextResponse.json({
      order_id: order.id,
      reference,
      currency,
      // Public fields for the success page — NEVER the IBAN/account number directly
      // (those go via email only, so the buyer has proof of receipt and we have
      // an audit trail per delivery).
      bank_label: currency === 'EUR' ? 'Banking Circle (EUR / SEPA)' : 'Citibank (USD / SWIFT)',
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[wire/start]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'wire_intake_failed' }, { status: 500 })
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    ok: true,
    service: 'wire/start',
    eur_configured: isWireConfigured('EUR'),
    usd_configured: isWireConfigured('USD'),
    min_order_cents: WIRE_MIN_ORDER_CENTS,
  })
}
