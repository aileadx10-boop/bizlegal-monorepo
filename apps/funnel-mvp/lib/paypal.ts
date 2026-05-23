/**
 * PayPal Orders v2 client — mirrors apps/hub/app/api/payments/paypal/start
 * but trimmed to the one-time-purchase shape funnel-mvp needs ($97 one-shot
 * for the full report). No subscription/plan logic.
 */

const SANDBOX_BASE = 'https://api-m.sandbox.paypal.com'
const LIVE_BASE = 'https://api-m.paypal.com'

export function paypalBase(): string {
  return process.env.PAYPAL_ENV === 'live' ? LIVE_BASE : SANDBOX_BASE
}

export async function getAccessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!id || !secret) throw new Error('PayPal credentials not configured')
  const auth = Buffer.from(`${id}:${secret}`).toString('base64')
  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status}`)
  }
  const json = (await res.json()) as { access_token: string }
  return json.access_token
}

export interface CreateOrderArgs {
  readonly amountCents: number
  readonly currency: string
  readonly description: string
  readonly returnUrl: string
  readonly cancelUrl: string
  readonly customId: string // funnel job id
}

export interface CreateOrderResult {
  readonly orderId: string
  readonly approveUrl: string
}

export async function createOneTimeOrder(args: CreateOrderArgs): Promise<CreateOrderResult> {
  const token = await getAccessToken()
  const value = (args.amountCents / 100).toFixed(2)
  const res = await fetch(`${paypalBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: args.customId,
          description: args.description.slice(0, 127),
          amount: {
            currency_code: args.currency,
            value,
          },
        },
      ],
      application_context: {
        return_url: args.returnUrl,
        cancel_url: args.cancelUrl,
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        brand_name: 'BizLegal AI',
      },
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`PayPal create order ${res.status}: ${body.slice(0, 200)}`)
  }
  const data = (await res.json()) as {
    id: string
    links: Array<{ rel: string; href: string }>
  }
  const approveLink = data.links.find((l) => l.rel === 'approve' || l.rel === 'payer-action')
  if (!approveLink) throw new Error('PayPal response missing approve URL')
  return { orderId: data.id, approveUrl: approveLink.href }
}

/** Capture a PayPal order. Used by the webhook handler after CHECKOUT.ORDER.APPROVED. */
export async function captureOrder(orderId: string): Promise<{
  readonly status: string
  readonly capturedAmountCents: number | null
  readonly captureId: string | null
}> {
  const token = await getAccessToken()
  const res = await fetch(`${paypalBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`PayPal capture ${res.status}: ${body.slice(0, 200)}`)
  }
  const data = (await res.json()) as {
    status: string
    purchase_units?: Array<{
      payments?: {
        captures?: Array<{ id: string; amount: { value: string; currency_code: string } }>
      }
    }>
  }
  const cap = data.purchase_units?.[0]?.payments?.captures?.[0]
  const cents = cap ? Math.round(Number(cap.amount.value) * 100) : null
  return { status: data.status, capturedAmountCents: cents, captureId: cap?.id ?? null }
}
