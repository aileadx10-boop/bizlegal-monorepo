// app/api/payment/crypto/route.ts
// Creates a NOWPayments invoice for crypto payment via the canonical
// @bizlegal/payment workspace package (Phase AA D6 migration).
// PRICES still come from the local Forge constants because Forge runs
// per-vertical pricing (scan tiers); the import boundary now sits at
// @bizlegal/payment so all surfaces share one NOWPayments client.

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createNowPaymentsInvoiceRaw } from '@bizlegal/payment'
import { PRICES } from '@/lib/payments'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { reference_id, reference_type } = await req.json()

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

      const invoice = await createNowPaymentsInvoiceRaw({
        amount_usd: PRICES.passport.crypto,
        order_id: `passport_${reference_id}`,
        description: 'Forge Regulatory Passport',
        success_url: `${appUrl}/passport/success?id=${reference_id}`,
        cancel_url: `${appUrl}/passport`,
        ipn_url: ipnUrl,
      })
      if (!invoice.ok || !invoice.checkout_url) {
        console.error('[forge/payment/crypto] passport invoice failed:', invoice.error)
        return NextResponse.json(
          { error: invoice.error ?? 'invoice_create_failed' },
          { status: invoice.status_code },
        )
      }

      await supabase
        .from('passport_assessments')
        .update({ stripe_session_id: invoice.provider_invoice_id })
        .eq('id', reference_id)

      return NextResponse.json({
        invoiceUrl: invoice.checkout_url,
        invoiceId: invoice.provider_invoice_id,
      })
    }

    if (reference_type === 'scan') {
      const { data: record } = await supabase
        .from('scans')
        .select('id, payment_status')
        .eq('id', reference_id)
        .single()

      if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      if (record.payment_status === 'paid') return NextResponse.json({ error: 'Already paid' }, { status: 409 })

      const invoice = await createNowPaymentsInvoiceRaw({
        amount_usd: PRICES.scan.crypto,
        order_id: `scan_${reference_id}`,
        description: 'Forge Web Compliance Scan Report',
        success_url: `${appUrl}/audit/success?id=${reference_id}`,
        cancel_url: `${appUrl}/audit`,
        ipn_url: ipnUrl,
      })
      if (!invoice.ok || !invoice.checkout_url) {
        console.error('[forge/payment/crypto] scan invoice failed:', invoice.error)
        return NextResponse.json(
          { error: invoice.error ?? 'invoice_create_failed' },
          { status: invoice.status_code },
        )
      }

      await supabase
        .from('scans')
        .update({ stripe_session_id: invoice.provider_invoice_id })
        .eq('id', reference_id)

      return NextResponse.json({
        invoiceUrl: invoice.checkout_url,
        invoiceId: invoice.provider_invoice_id,
      })
    }

    if (reference_type === 'boi') {
      const { data: record } = await supabase
        .from('scans')
        .select('id, payment_status')
        .eq('id', reference_id)
        .single()

      if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      if (record.payment_status === 'paid') return NextResponse.json({ error: 'Already paid' }, { status: 409 })

      const invoice = await createNowPaymentsInvoiceRaw({
        amount_usd: PRICES.boi.crypto,
        order_id: `boi_${reference_id}`,
        description: 'Forge State Transparency Report Kit',
        success_url: `${appUrl}/boi/success?id=${reference_id}`,
        cancel_url: `${appUrl}/boi`,
        ipn_url: ipnUrl,
      })
      if (!invoice.ok || !invoice.checkout_url) {
        console.error('[forge/payment/crypto] boi invoice failed:', invoice.error)
        return NextResponse.json(
          { error: invoice.error ?? 'invoice_create_failed' },
          { status: invoice.status_code },
        )
      }

      await supabase
        .from('scans')
        .update({ stripe_session_id: invoice.provider_invoice_id })
        .eq('id', reference_id)

      return NextResponse.json({
        invoiceUrl: invoice.checkout_url,
        invoiceId: invoice.provider_invoice_id,
      })
    }

    return NextResponse.json({ error: 'Invalid reference_type' }, { status: 400 })
  } catch (err) {
    console.error('[forge/payment/crypto]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
