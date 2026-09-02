// app/api/payment/webhook/route.ts
// NOWPayments IPN handler for Forge scan + passport + boi payments

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { logEventAsync } from '@/lib/ops/log'
import { PRICES } from '@/lib/payments'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const sig = req.headers.get('x-nowpayments-sig')
    const secret = process.env.NOWPAYMENTS_IPN_SECRET

    const payload = JSON.parse(body)

    // Verify HMAC-SHA512 — sort JSON keys alphabetically before hashing
    if (secret && sig) {
      const sorted = Object.keys(payload).sort().reduce((acc, k) => {
        acc[k] = payload[k]
        return acc
      }, {} as Record<string, unknown>)
      const expected = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(sorted))
        .digest('hex')
      if (expected !== sig) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const { payment_status, order_id } = payload
    if (!order_id) return NextResponse.json({ ok: true })

    if (payment_status !== 'finished' && payment_status !== 'confirmed') {
      return NextResponse.json({ ok: true })
    }

    const supabase = createServerClient()
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://forge.bizlegal-ai.com'
    const internalSecret = process.env.INTERNAL_SECRET ?? ''

    if (order_id.startsWith('passport_')) {
      const passportId = order_id.replace('passport_', '')
      await supabase
        .from('passport_assessments')
        .update({ payment_status: 'paid', paid_at: new Date().toISOString(), amount_paid: 29700 })
        .eq('id', passportId)

      fetch(`${appUrl}/api/passport/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': internalSecret },
        body: JSON.stringify({ passport_id: passportId }),
      }).catch(console.error)

      logEventAsync({
        type: 'payment.confirmed',
        source: 'forge',
        ref_id: passportId,
        amount_cents: 29700,
        status: 'ok',
        metadata: { product: 'forge_passport', gateway: 'nowpayments', payment_status: payload.payment_status },
      })
    }

    if (order_id.startsWith('scan_')) {
      const scanId = order_id.replace('scan_', '')
      const paidAmount = payload.price_amount ? Math.round(parseFloat(payload.price_amount) * 100) : 9700
      await supabase
        .from('scans')
        .update({ payment_status: 'paid', paid_at: new Date().toISOString(), amount_paid: paidAmount })
        .eq('id', scanId)

      fetch(`${appUrl}/api/scan/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': internalSecret },
        body: JSON.stringify({ scan_id: scanId }),
      }).catch(console.error)

      logEventAsync({
        type: 'payment.confirmed',
        source: 'forge',
        ref_id: scanId,
        amount_cents: paidAmount,
        status: 'ok',
        metadata: { product: 'forge_scan', gateway: 'nowpayments', payment_status: payload.payment_status },
      })
    }

    if (order_id.startsWith('boi_')) {
      const scanId = order_id.replace('boi_', '')
      const paidAmount = payload.price_amount
        ? Math.round(parseFloat(payload.price_amount) * 100)
        : PRICES.boi.crypto * 100

      // Idempotency: only the first IPN flips the scan to paid — duplicate
      // IPNs hit the payment_status guard and skip re-delivery.
      const { data: claimed } = await supabase
        .from('scans')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          amount_paid: paidAmount,
        })
        .eq('id', scanId)
        .eq('vertical', 'boi')
        .eq('payment_status', 'pending')
        .select('id, email, company_name')

      const boiScan = claimed?.[0]
      if (!boiScan) {
        // Unknown scan or already processed (duplicate IPN)
        logEventAsync({
          type: 'webhook.received',
          source: 'forge',
          ref_id: scanId,
          status: 'ok',
          metadata: {
            product: 'forge_boi_kit',
            gateway: 'nowpayments',
            note: 'boi_ipn_skipped_duplicate_or_unknown',
            payment_status: payload.payment_status,
          },
        })
      } else {
        // Same fulfillment path as card orders: /api/boi-order records the
        // order in boi_orders, emails the buyer, and fires the Telegram alert.
        fetch(`${appUrl}/api/boi-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payer_email: boiScan.email,
            form_data: { companyName: boiScan.company_name, scan_id: scanId },
            nowpayments_payment_id:
              payload.payment_id != null ? String(payload.payment_id) : null,
            amount: PRICES.boi.crypto,
          }),
        }).catch(console.error)

        logEventAsync({
          type: 'webhook.received',
          source: 'forge',
          ref_id: scanId,
          email: boiScan.email ?? undefined,
          amount_cents: paidAmount,
          status: 'ok',
          metadata: {
            product: 'forge_boi_kit',
            gateway: 'nowpayments',
            fulfillment: 'dispatched',
            payment_status: payload.payment_status,
            nowpayments_payment_id: payload.payment_id,
          },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[forge/payment/webhook]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
