/**
 * /api/test/payment-flow — $0.50 wire-equivalent smoke test.
 *
 * Posts a $0.50 NOWPayments invoice with hardcoded production IPN,
 * then waits up to 5 minutes for the webhook to land + flip
 * payment_orders.status from 'pending' to 'active'.
 *
 * USE: Hit POST /api/test/payment-flow with { email: "test@x.com" }
 *      from a terminal. The route returns the invoice_url + the
 *      final payment status. After the test, run:
 *        SELECT * FROM payment_orders
 *        WHERE user_email = 'test@x.com'
 *        ORDER BY created_at DESC LIMIT 1;
 *      Expected: status = 'active', amount_cents = 50
 *
 * This is the proof route. If it returns 'active', the full
 * $0.09 → $2,500 funnel works.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 min for the wait

const TEST_AMOUNT_CENTS = 50 // $0.50
const HARD_CODED_IPN = 'https://hub.bizlegal-ai.com'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = (body.email ?? 'test+' + Date.now() + '@bizlegal.ai').toString().trim().toLowerCase()
    const apiKey = process.env.NOWPAYMENTS_API_KEY
    if (!apiKey) return NextResponse.json({ ok: false, error: 'NOWPAYMENTS_API_KEY missing on hub deployment' }, { status: 503 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Insert pending order
    const { data: order, error: insertErr } = await supabase
      .from('payment_orders')
      .insert({
        user_email: email,
        product: 'test_payment_flow',
        tier: 'wire',
        billing_interval: 'one-time',
        amount_cents: TEST_AMOUNT_CENTS,
        gateway: 'nowpayments',
        status: 'pending',
        source: 'test_payment_flow',
      })
      .select('id, amount_cents, status')
      .single()
    if (insertErr || !order) return NextResponse.json({ ok: false, error: 'supabase insert failed', detail: insertErr?.message }, { status: 500 })

    // 2. Create NOWPayments invoice with hardcoded production IPN
    const invRes = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_amount: TEST_AMOUNT_CENTS / 100,
        price_currency: 'usd',
        order_id: order.id,
        order_description: 'BizLegal payment-flow smoke test',
        ipn_callback_url: `${HARD_CODED_IPN}/api/payments/nowpayments/webhook`,
        success_url: `${HARD_CODED_IPN}/test/success?order=${order.id}`,
        cancel_url: `${HARD_CODED_IPN}/test/cancel?order=${order.id}`,
      }),
    })
    if (!invRes.ok) {
      const err = await invRes.text()
      return NextResponse.json({ ok: false, error: 'NOWPayments invoice create failed', detail: err, order_id: order.id }, { status: 502 })
    }
    const invoice = await invRes.json()

    // 3. Persist invoice id
    await supabase.from('payment_orders').update({ nowpayments_invoice_id: invoice.id, payment_url: invoice.invoice_url }).eq('id', order.id)

    // 4. Poll up to 5 min for webhook to flip status
    const deadline = Date.now() + 5 * 60 * 1000
    let finalStatus = 'pending'
    let elapsed = 0
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 5000))
      elapsed += 5
      const { data: row } = await supabase.from('payment_orders').select('status, paid_at').eq('id', order.id).single()
      if (row && (row.status === 'active' || row.status === 'paid' || row.status === 'completed')) {
        finalStatus = row.status
        break
      }
    }

    return NextResponse.json({
      ok: finalStatus !== 'pending',
      order_id: order.id,
      invoice_id: invoice.id,
      invoice_url: invoice.invoice_url,
      pay_amount: TEST_AMOUNT_CENTS / 100,
      pay_currency: 'usd',
      final_status: finalStatus,
      waited_seconds: elapsed,
      ipn_callback: `${HARD_CODED_IPN}/api/payments/nowpayments/webhook`,
      next: 'Open invoice_url, pay with any crypto, wait ' + elapsed + 's, then check SELECT * FROM payment_orders WHERE id = ' + order.id,
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'unexpected', detail: e?.message }, { status: 500 })
  }
}
