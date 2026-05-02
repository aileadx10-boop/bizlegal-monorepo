// app/api/certificates/webhook/route.ts
// NOWPayments IPN handler — generates certificate on successful payment

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { generateCertificateFromIntent } from '@/lib/cert/generate'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const sig = req.headers.get('x-nowpayments-sig')
    const secret = process.env.NOWPAYMENTS_IPN_SECRET

    const payload = JSON.parse(body)

    // Verify HMAC-SHA512
    if (secret && sig) {
      const sorted = Object.keys(payload)
        .sort()
        .reduce(
          (acc, k) => {
            acc[k] = payload[k]
            return acc
          },
          {} as Record<string, unknown>,
        )
      const expected = crypto.createHmac('sha512', secret).update(JSON.stringify(sorted)).digest('hex')
      if (expected !== sig) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const { payment_status, order_id, payment_id } = payload
    if (!order_id) return NextResponse.json({ ok: true })

    if (payment_status !== 'finished' && payment_status !== 'confirmed') {
      return NextResponse.json({ ok: true })
    }

    const supabase = createServerSupabase()

    const { data: intent, error: fetchErr } = await supabase
      .from('cert_payment_intents')
      .select('*')
      .eq('order_id', order_id)
      .single()

    if (fetchErr || !intent) {
      console.error('[lex/webhook] intent not found:', order_id, fetchErr)
      return NextResponse.json({ ok: true })
    }

    if (intent.payment_status === 'paid') {
      return NextResponse.json({ ok: true })
    }

    const amountUsd = Number(payload.price_amount ?? payload.actually_paid ?? 24)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lexaudit.bizlegal-ai.com'

    await generateCertificateFromIntent({
      supabase,
      intent,
      amountUsd,
      gatewayPaymentId: String(payment_id),
      gateway: 'nowpayments',
      siteUrl,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[lex/webhook]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
