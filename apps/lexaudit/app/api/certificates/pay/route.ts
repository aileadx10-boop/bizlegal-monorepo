// app/api/certificates/pay/route.ts
// Creates a certificate-payment intent + payment-provider checkout URL.
// Supports two gateways: NOWPayments (crypto, $24) + PayPal (card, $29).

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const CERT_PRICE_CRYPTO = 24    // USD
const CERT_PRICE_CARD   = 29    // USD

interface PayBody {
  matter_id?: string
  form?: { lawyer?: string; prompt?: string; partner?: string; edits?: string; ai_tool?: string }
  gateway?: 'nowpayments' | 'paypal'
  email?: string
}

function randomCertId(): string {
  return 'LA-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

interface PayPalAccessToken { access_token: string }

async function getPayPalAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  const baseUrl = process.env.PAYPAL_API_URL ?? 'https://api-m.paypal.com'
  if (!clientId || !secret) return null

  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64')
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) return null
  const data = (await res.json()) as PayPalAccessToken
  return data.access_token ?? null
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PayBody
    const matter_id = body.matter_id
    const form = body.form
    const gateway = body.gateway === 'paypal' ? 'paypal' : 'nowpayments'
    const email = (body.email ?? '').trim().toLowerCase()

    if (!matter_id || !form?.lawyer || !form?.prompt) {
      return NextResponse.json({ error: 'matter_id and form (lawyer, prompt) required' }, { status: 400 })
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'invalid email' }, { status: 400 })
    }

    // ipnBase hardcoded to production — never a preview URL
    const ipnBase = 'https://lexaudit.bizlegal-ai.com'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ipnBase
    const certId  = randomCertId()
    const orderId = `${matter_id}-${Date.now()}`
    const priceUsd = gateway === 'paypal' ? CERT_PRICE_CARD : CERT_PRICE_CRYPTO

    // Store intent so the webhook (or PayPal capture) can generate cert later.
    // gateway + email are stored on the intent row for downstream Resend.
    const supabase = createServerSupabase()
    const intentRow: Record<string, unknown> = {
      order_id: orderId,
      cert_id: certId,
      matter_id,
      form_data: { ...form, _email: email, _gateway: gateway },
      payment_status: 'pending',
    }
    const { error: dbError } = await supabase
      .from('cert_payment_intents')
      .insert(intentRow)

    if (dbError) {
      console.error('[lex/pay] DB insert error:', dbError)
      return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
    }

    // ─── NOWPayments (crypto) ─────────────────────────────────────
    if (gateway === 'nowpayments') {
      const apiKey = process.env.NOWPAYMENTS_API_KEY
      if (!apiKey) {
        return NextResponse.json({ error: 'Crypto gateway not configured' }, { status: 503 })
      }
      const nwRes = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price_amount: priceUsd,
          price_currency: 'usd',
          pay_currency: 'usdtbsc',
          order_id: orderId,
          order_description: 'LexAudit Compliance Health Score snapshot',
          ipn_callback_url: `${ipnBase}/api/certificates/webhook`,
          success_url: `${siteUrl}/certificate/${certId}`,
          cancel_url: siteUrl,
        }),
      })
      if (!nwRes.ok) {
        const err = await nwRes.text()
        console.error('[lex/pay] NOWPayments error:', err)
        return NextResponse.json({ error: 'Payment provider error' }, { status: 502 })
      }
      const nwData = (await nwRes.json()) as { invoice_url?: string; id?: string }
      return NextResponse.json({
        gateway: 'nowpayments',
        invoice_url: nwData.invoice_url,
        order_id: orderId,
        cert_id: certId,
        price_usd: priceUsd,
      })
    }

    // ─── PayPal (card) ────────────────────────────────────────────
    const accessToken = await getPayPalAccessToken()
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Card gateway not configured (PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET required)' },
        { status: 503 },
      )
    }

    const baseUrl = process.env.PAYPAL_API_URL ?? 'https://api-m.paypal.com'
    const ppRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': orderId,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId,
            description: 'LexAudit Compliance Health Score snapshot',
            custom_id: certId,
            amount: { currency_code: 'USD', value: priceUsd.toFixed(2) },
          },
        ],
        application_context: {
          brand_name: 'LexAudit',
          user_action: 'PAY_NOW',
          return_url: `${siteUrl}/api/certificates/paypal/capture?order_id=${encodeURIComponent(orderId)}&cert_id=${encodeURIComponent(certId)}`,
          cancel_url: siteUrl,
        },
      }),
    })

    if (!ppRes.ok) {
      const err = await ppRes.text()
      console.error('[lex/pay] PayPal create order error:', ppRes.status, err)
      return NextResponse.json({ error: 'Card-payment provider error' }, { status: 502 })
    }
    const ppData = (await ppRes.json()) as {
      id: string
      links?: Array<{ href: string; rel: string }>
    }
    const approveLink = ppData.links?.find((l) => l.rel === 'approve' || l.rel === 'payer-action')?.href
    if (!approveLink) {
      console.error('[lex/pay] PayPal returned no approve link', ppData)
      return NextResponse.json({ error: 'Card-payment provider returned no approval URL' }, { status: 502 })
    }

    return NextResponse.json({
      gateway: 'paypal',
      approve_url: approveLink,
      paypal_order_id: ppData.id,
      order_id: orderId,
      cert_id: certId,
      price_usd: priceUsd,
    })
  } catch (err) {
    console.error('[lex/pay]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
