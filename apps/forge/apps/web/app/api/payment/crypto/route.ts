// app/api/payment/crypto/route.ts
// Creates a NOWPayments invoice for crypto payment

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createNOWPaymentsInvoice, PRICES } from '@/lib/payments'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { reference_id, reference_type, email } = await req.json()

    if (!reference_id || !reference_type) {
      return NextResponse.json({ error: 'Missing reference_id or reference_type' }, { status: 400 })
    }

    const supabase = createServerClient()
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://forge.bizlegal-ai.com'
    const ipnUrl = `${appUrl}/api/payment/webhook`

    if (reference_type === 'passport') {
      const { data: record } = await supabase
        .from('passport_assessments')
        .select('id, payment_status')
        .eq('id', reference_id)
        .single()

      if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      if (record.payment_status === 'paid') return NextResponse.json({ error: 'Already paid' }, { status: 409 })

      const invoice = await createNOWPaymentsInvoice({
        amountUsd: PRICES.passport.crypto,
        orderId: `passport_${reference_id}`,
        description: 'Forge Regulatory Passport',
        successUrl: `${appUrl}/passport/success?id=${reference_id}`,
        cancelUrl: `${appUrl}/passport`,
        ipnUrl,
      })

      await supabase
        .from('passport_assessments')
        .update({ stripe_session_id: invoice.invoiceId })
        .eq('id', reference_id)

      return NextResponse.json({ invoiceUrl: invoice.invoiceUrl, invoiceId: invoice.invoiceId })
    }

    if (reference_type === 'scan') {
      const { data: record } = await supabase
        .from('scans')
        .select('id, payment_status')
        .eq('id', reference_id)
        .single()

      if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      if (record.payment_status === 'paid') return NextResponse.json({ error: 'Already paid' }, { status: 409 })

      const invoice = await createNOWPaymentsInvoice({
        amountUsd: PRICES.scan.crypto,
        orderId: `scan_${reference_id}`,
        description: 'Forge Web Compliance Scan Report',
        successUrl: `${appUrl}/audit/success?id=${reference_id}`,
        cancelUrl: `${appUrl}/audit`,
        ipnUrl,
      })

      await supabase
        .from('scans')
        .update({ stripe_session_id: invoice.invoiceId })
        .eq('id', reference_id)

      return NextResponse.json({ invoiceUrl: invoice.invoiceUrl, invoiceId: invoice.invoiceId })
    }

    return NextResponse.json({ error: 'Invalid reference_type' }, { status: 400 })
  } catch (err) {
    console.error('[forge/payment/crypto]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
