// app/api/passport/route.ts
// Intake form → creates record → returns NOWPayments invoice + Payoneer link

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { createNowPaymentsInvoiceRaw } from '@bizlegal/payment'
import { getPayoneerLink, PRICES } from '@/lib/payments'

const PassportSchema = z.object({
  company_name: z.string().min(1),
  contact_name: z.string().min(1),
  email: z.string().email(),
  website: z.string().optional(),
  product_type: z.string().min(1),
  crypto_involved: z.boolean(),
  entity_types: z.array(z.string()).default([]),
  target_markets: z.array(z.string()).min(1, 'Select at least one market'),
  current_revenue_usd: z.number().optional(),
  fundraising_stage: z.string().optional(),
  investor_jurisdiction: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = PassportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data
    const supabase = createServerClient()

    const { data: record, error: dbError } = await supabase
      .from('passport_assessments')
      .insert({
        company_name: data.company_name,
        contact_name: data.contact_name,
        email: data.email,
        website: data.website,
        product_type: data.product_type,
        crypto_involved: data.crypto_involved,
        entity_types: data.entity_types,
        target_markets: data.target_markets,
        current_revenue_usd: data.current_revenue_usd,
        fundraising_stage: data.fundraising_stage,
        investor_jurisdiction: data.investor_jurisdiction,
        notes: data.notes,
        intake_data: data,
        status: 'queued',
        payment_status: 'pending',
      })
      .select('id')
      .single()

    if (dbError || !record) {
      console.error('DB insert error:', dbError)
      return NextResponse.json({ error: 'Failed to create assessment record' }, { status: 500 })
    }

    const passportId = record.id
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://forge.bizlegal-ai.com'

    const invoice = await createNowPaymentsInvoiceRaw({
      amount_usd: PRICES.passport.crypto,
      order_id: `passport_${passportId}`,
      description: 'Forge Regulatory Passport',
      success_url: `${appUrl}/passport/success?id=${passportId}`,
      cancel_url: `${appUrl}/passport`,
      ipn_url: `${appUrl}/api/payment/webhook`,
    })
    if (!invoice.ok || !invoice.checkout_url) {
      console.error('[forge/passport] invoice failed:', invoice.error)
      return NextResponse.json(
        { error: invoice.error ?? 'invoice_create_failed' },
        { status: invoice.status_code },
      )
    }

    await supabase
      .from('passport_assessments')
      .update({ stripe_session_id: invoice.provider_invoice_id })
      .eq('id', passportId)

    return NextResponse.json({
      success: true,
      passport_id: passportId,
      payment_options: {
        crypto: {
          invoiceUrl: invoice.checkout_url,
          amount_usd: PRICES.passport.crypto,
        },
        payoneer: {
          link: getPayoneerLink('passport'),
          amount_usd: PRICES.passport.fiat,
        },
      },
    })
  } catch (err) {
    console.error('Passport API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
