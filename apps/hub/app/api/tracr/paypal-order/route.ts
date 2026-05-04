import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

export const maxDuration = 15

const PAYPAL_BASE = 'https://api-m.paypal.com'

const PRICES: Record<string, number> = {
  standard: 149,
  priority: 249,
  litigation: 500,
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function getPayPalToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`)
  const data = await res.json()
  return data.access_token
}

export async function POST(req: NextRequest) {
  try {
    const { wallet, network = 'ethereum', tier = 'standard', email, firstName, lastName } = await req.json()

    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json({ error: 'Valid Ethereum wallet address required' }, { status: 400 })
    }
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const amount = PRICES[tier]
    if (!amount) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })

    // Generate report ID
    const reportId = `TR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`

    const token = await getPayPalToken()

    // Create PayPal order
    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: reportId,
          description: `TRACR Blockchain Forensic Report — ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2),
          },
          custom_id: reportId,
        }],
        application_context: {
          brand_name: 'TRACR Intelligence',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/tracr?paypal=success&reportId=${reportId}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tracr?paypal=cancel`,
        },
      }),
    })

    if (!orderRes.ok) {
      const err = await orderRes.json()
      throw new Error(`PayPal order creation failed: ${JSON.stringify(err)}`)
    }

    const order = await orderRes.json()

    // Save pending order to Supabase
    await supabase.from('tracr_orders').insert({
      report_id: reportId,
      email,
      first_name: firstName || null,
      last_name: lastName || null,
      wallet_address: wallet,
      network,
      tier,
      status: 'pending',
      nowpayments_order_id: `paypal_${order.id}`,
    })

    logEventAsync({
      type: 'agent.checkout',
      source: 'tracr',
      ref_id: reportId,
      email,
      amount_cents: amount * 100,
      status: 'pending',
      metadata: {
        product: 'tracr_forensic_report',
        tier,
        gateway: 'paypal',
        paypal_order_id: order.id,
      },
    })
    logEventAsync({
      type: 'payment.intent',
      source: 'tracr',
      ref_id: reportId,
      email,
      amount_cents: amount * 100,
      status: 'pending',
      metadata: {
        product: 'tracr_forensic_report',
        tier,
        gateway: 'paypal',
        paypal_order_id: order.id,
      },
    })

    return NextResponse.json({
      reportId,
      paypalOrderId: order.id,
      amount,
      tier,
    })
  } catch (err: any) {
    console.error('[TRACR paypal-order]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
