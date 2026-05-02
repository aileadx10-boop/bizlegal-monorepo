// app/api/scan/checkout/route.ts
// Returns payment options for a scan: NOWPayments invoice URL + Payoneer link
// Prices are per-vertical

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { createNOWPaymentsInvoice, getPayoneerLink } from '@/lib/payments'

const VERTICAL_PRICES: Record<string, { crypto: number; card: number }> = {
  cipa:     { crypto: 97,  card: 119 },
  gpc:      { crypto: 97,  card: 119 },
  mhmda:    { crypto: 97,  card: 119 },
  gdpr:     { crypto: 97,  card: 119 },
  sms:      { crypto: 15,  card: 18  },
  tdpsa:    { crypto: 29,  card: 36  },
  iso27001: { crypto: 97,  card: 119 },
  gipa:     { crypto: 290, card: 360 },
  edtech:   { crypto: 195, card: 240 },
  surplus:  { crypto: 78,  card: 96  },
}

const DEFAULT_PRICE = { crypto: 97, card: 119 }

const CheckoutSchema = z.object({
  scan_id: z.string().uuid(),
  email: z.string().email(),
  vertical: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CheckoutSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { scan_id, email, vertical } = parsed.data
    const supabase = createServerClient()

    const { data: scan } = await supabase
      .from('scans')
      .select('id, payment_status')
      .eq('id', scan_id)
      .single()

    if (!scan) return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    if (scan.payment_status === 'paid') return NextResponse.json({ error: 'Already paid' }, { status: 409 })

    const price = VERTICAL_PRICES[vertical] ?? DEFAULT_PRICE
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://forge.bizlegal-ai.com'

    const invoice = await createNOWPaymentsInvoice({
      amountUsd: price.crypto,
      orderId: `scan_${scan_id}`,
      description: `Forge Compliance Report — ${vertical.toUpperCase()}`,
      successUrl: `${appUrl}/audit/success?id=${scan_id}`,
      cancelUrl: `${appUrl}/audit`,
      ipnUrl: `${appUrl}/api/payment/webhook`,
    })

    await supabase
      .from('scans')
      .update({ nowpayments_order_id: invoice.invoiceId })
      .eq('id', scan_id)

    return NextResponse.json({
      success: true,
      payment_options: {
        crypto: {
          invoiceUrl: invoice.invoiceUrl,
          amount_usd: price.crypto,
        },
        payoneer: {
          link: getPayoneerLink('scan'),
          amount_usd: price.card,
        },
      },
    })
  } catch (err) {
    console.error('[forge/scan/checkout]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
