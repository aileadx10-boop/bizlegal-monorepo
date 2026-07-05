/**
 * /api/test/payment-zero — $0 zero-cost E2E smoke test.
 *
 * Inserts a payment_orders row with status='active' immediately,
 * simulating a successful payment. Use to verify the
 * post-payment paths fire (agent_runs, marketing_revenue, daily_digest).
 *
 * USE: curl -X POST https://hub.bizlegal-ai.com/api/test/payment-zero \
 *        -H 'Content-Type: application/json' \
 *        -d '{"email":"zero@test.com","amount_cents":50}'
 *
 * Does NOT need NOWPAYMENTS_API_KEY. Safe to run anytime.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = (body.email ?? 'zero+' + Date.now() + '@bizlegal.ai').toString()
    const amount_cents = Number(body.amount_cents ?? 50)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data, error } = await supabase
      .from('payment_orders')
      .insert({
        user_email: email,
        product: body.product ?? 'smoke_zero',
        tier: body.tier ?? 'zero',
        billing_interval: 'one-time',
        amount_cents,
        gateway: 'simulated',
        status: 'active',
        source: 'payment_zero_smoke',
        paid_at: new Date().toISOString(),
      })
      .select('id, status, amount_cents, created_at')
      .single()
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({
      ok: true,
      simulated: true,
      order: data,
      note: 'No real money moved. payment_orders.status set to active immediately. Downstream agents will pick it up at next cron tick.',
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}
