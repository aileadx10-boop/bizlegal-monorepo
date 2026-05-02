// app/api/certificates/paypal/capture/route.ts
// PayPal returns the user here (return_url) after they approve the order.
// We capture the order, generate the cert, then redirect to /certificate/[id].

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { generateCertificateFromIntent } from '@/lib/cert/generate'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

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

interface PayPalCaptureResponse {
  id: string
  status: string
  purchase_units?: Array<{
    payments?: { captures?: Array<{ id: string; amount?: { value: string } }> }
  }>
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const orderId = url.searchParams.get('order_id') ?? ''
  const certId = url.searchParams.get('cert_id') ?? ''
  const ppToken = url.searchParams.get('token') ?? '' // PayPal sends ?token=<paypal_order_id>

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lexaudit.bizlegal-ai.com'
  if (!orderId || !certId || !ppToken) {
    return NextResponse.redirect(new URL('/?error=paypal_capture_missing_params', siteUrl))
  }

  try {
    const accessToken = await getPayPalAccessToken()
    if (!accessToken) {
      return NextResponse.redirect(new URL('/?error=paypal_not_configured', siteUrl))
    }

    const baseUrl = process.env.PAYPAL_API_URL ?? 'https://api-m.paypal.com'
    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${ppToken}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `${orderId}-capture`,
      },
    })

    if (!captureRes.ok) {
      const err = await captureRes.text()
      console.error('[lex/paypal-capture] capture error', captureRes.status, err)
      return NextResponse.redirect(new URL(`/?error=paypal_capture_failed&order_id=${orderId}`, siteUrl))
    }
    const captureData = (await captureRes.json()) as PayPalCaptureResponse
    if (captureData.status !== 'COMPLETED') {
      return NextResponse.redirect(new URL(`/?error=paypal_status_${captureData.status}&order_id=${orderId}`, siteUrl))
    }

    const supabase = createServerSupabase()
    const { data: intent, error } = await supabase
      .from('cert_payment_intents')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (error || !intent) {
      console.error('[lex/paypal-capture] intent not found', orderId, error)
      return NextResponse.redirect(new URL(`/?error=intent_not_found&order_id=${orderId}`, siteUrl))
    }

    if (intent.payment_status === 'paid') {
      // Already processed — just redirect to cert
      return NextResponse.redirect(new URL(`/certificate/${certId}`, siteUrl))
    }

    const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0]
    const amountUsd = capture?.amount?.value ? Number(capture.amount.value) : 29
    const captureId = capture?.id ?? captureData.id

    await generateCertificateFromIntent({
      supabase,
      intent,
      amountUsd,
      gatewayPaymentId: captureId,
      gateway: 'paypal',
      siteUrl,
    })

    return NextResponse.redirect(new URL(`/certificate/${certId}`, siteUrl))
  } catch (err) {
    console.error('[lex/paypal-capture]', err)
    return NextResponse.redirect(new URL('/?error=paypal_capture_exception', siteUrl))
  }
}
