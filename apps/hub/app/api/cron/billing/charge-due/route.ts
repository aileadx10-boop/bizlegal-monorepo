import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

interface DueOrder {
  id: string
  user_email: string
  user_name: string | null
  product: string
  tier: string
  billing_interval: 'monthly' | 'yearly'
  amount_cents: number
  gateway: 'nowpayments' | 'paypal'
}

/**
 * Daily cron — finds active recurring orders whose next_charge_at has
 * passed and (a) creates a fresh NOWPayments invoice + emails the user,
 * or (b) for PayPal subscriptions, lets PayPal handle it (PayPal bills
 * automatically based on Plan ID; this cron only handles NOWPayments).
 *
 * Authentication: CRON_SECRET in Authorization: Bearer header. Vercel
 * Cron sends this automatically when configured in vercel.json.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') ?? ''
    const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
    if (!process.env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()
    const now = new Date().toISOString()

    // Find recurring orders due — only NOWPayments (PayPal handles its own billing)
    const { data: due, error: queryErr } = await supabase
      .from('payment_orders')
      .select('id, user_email, user_name, product, tier, billing_interval, amount_cents, gateway')
      .eq('status', 'active')
      .eq('gateway', 'nowpayments')
      .in('billing_interval', ['monthly', 'yearly'])
      .lte('next_charge_at', now)
      .limit(100)

    if (queryErr) {
      console.error('[cron/charge-due] query failed', queryErr)
      return NextResponse.json({ error: 'query failed' }, { status: 500 })
    }

    const orders = (due ?? []) as DueOrder[]
    if (orders.length === 0) {
      return NextResponse.json({ ok: true, processed: 0 })
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'NOWPAYMENTS_API_KEY missing' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bizlegal-ai.com'
    const resendKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM ?? 'intelligence@intelligence.bizlegal-ai.com'
    const replyTo = process.env.RESEND_REPLY_TO ?? 'team@bizlegal-ai.com'

    const results: Array<{ id: string; ok: boolean; error?: string }> = []

    for (const order of orders) {
      try {
        // Create new NOWPayments invoice for this billing cycle
        const invoiceRes = await fetch('https://api.nowpayments.io/v1/invoice', {
          method: 'POST',
          headers: { 'x-api-key': apiKey, 'content-type': 'application/json' },
          body: JSON.stringify({
            price_amount: order.amount_cents / 100,
            price_currency: 'usd',
            order_id: order.id,
            order_description: `${order.product} ${order.tier} ${order.billing_interval} renewal`,
            success_url: `${baseUrl}/payment/success?order=${order.id}`,
            cancel_url: `${baseUrl}/payment/cancelled?order=${order.id}`,
            ipn_callback_url: `${baseUrl}/api/payments/nowpayments/webhook`,
          }),
        })

        if (!invoiceRes.ok) {
          results.push({ id: order.id, ok: false, error: `invoice ${invoiceRes.status}` })
          continue
        }
        const invoice = (await invoiceRes.json()) as { id: string; invoice_url: string }

        // Email user the renewal link via Resend
        if (resendKey) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: `BizLegal AI Intelligence <${fromEmail}>`,
              to: [order.user_email],
              reply_to: replyTo,
              subject: `${order.product} ${order.billing_interval} renewal — pay to continue`,
              html: `<div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0e0b1a">
<h2 style="font-weight:800;letter-spacing:-0.02em;color:#0e0b1a;margin:0 0 12px">Renewal due — ${order.product} ${order.tier}</h2>
<p style="line-height:1.6;color:#4b3f6a">Your ${order.billing_interval} subscription is up for renewal. Click below to pay with crypto and keep your access active. If you'd rather cancel, just ignore this email and your access will lapse.</p>
<p style="margin:24px 0"><a href="${invoice.invoice_url}" style="display:inline-block;padding:14px 28px;background:#5b21b6;color:#fff;text-decoration:none;border-radius:9999px;font-weight:700;font-size:14px">Pay $${(order.amount_cents / 100).toFixed(2)} →</a></p>
<p style="font-size:12px;color:#6b6188">Disclosure v1.0.0-p4 — Intelligence not legal advice. Reply to this email for support.</p>
</div>`,
            }),
          }).catch((e) => console.warn('[cron/charge-due] email send failed', e))
        }

        // Bump next_charge_at + record invoice id
        const next = new Date()
        next.setUTCDate(next.getUTCDate() + (order.billing_interval === 'yearly' ? 365 : 30))

        await supabase
          .from('payment_orders')
          .update({
            gateway_invoice_id: invoice.id,
            next_charge_at: next.toISOString(),
            status: 'past_due', // flips back to 'active' once the IPN webhook confirms payment
            metadata: { last_renewal_invoice_id: invoice.id },
          })
          .eq('id', order.id)

        results.push({ id: order.id, ok: true })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown'
        results.push({ id: order.id, ok: false, error: msg })
      }
    }

    const successes = results.filter((r) => r.ok).length
    const failures = results.filter((r) => !r.ok).length

    logEventAsync({
      type: 'cron.completed',
      source: 'hub',
      ref_id: 'billing/charge-due',
      status: failures > 0 ? 'failed' : 'ok',
      metadata: {
        cron: 'billing/charge-due',
        processed: results.length,
        successes,
        failures,
      },
    })

    return NextResponse.json({
      ok: true,
      processed: results.length,
      successes,
      failures,
      results,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[cron/charge-due]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
