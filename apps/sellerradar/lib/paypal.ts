/* ─── PayPal Orders API v2 ───────────────────────────────────────────────── */

function baseUrl() {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

async function getAccessToken(): Promise<string> {
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`)
  const data = await res.json()
  return data.access_token as string
}

export interface CreateOrderResult {
  orderId: string
  approvalUrl: string
}

export async function createPayPalOrder(
  amountUsd: number,
  reportId: string,
  description: string,
): Promise<CreateOrderResult> {
  const token = await getAccessToken()
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sellerradar.bizlegal-ai.com'

  const res = await fetch(`${baseUrl()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: reportId,
        description,
        amount: { currency_code: 'USD', value: amountUsd.toFixed(2) },
      }],
      application_context: {
        return_url: `${site}/success?report=${reportId}&method=paypal`,
        cancel_url:  `${site}/analyze`,
        user_action: 'PAY_NOW',
        brand_name:  'SellerRadar',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal createOrder failed: ${err}`)
  }

  const data = await res.json()
  const approvalUrl = data.links?.find((l: { rel: string; href: string }) => l.rel === 'approve')?.href
  if (!approvalUrl) throw new Error('No PayPal approval URL in response')

  return { orderId: data.id as string, approvalUrl }
}

/* ─── Subscriptions (recurring) ────────────────────────────────────────────
   The $99/mo monitor used to go through createPayPalOrder above, i.e. it
   billed ONCE and then ran forever. A monthly SKU must be a PayPal
   subscription against a plan created in the PayPal dashboard; the plan id
   lives in PAYPAL_PLAN_ID_SELLERRADAR_<TIER>_<INTERVAL> (same convention the
   hub's /api/payments/paypal/start uses). No plan id → 503 at the call site,
   never a silent one-time charge. */

export function paypalPlanId(tier: string, interval: string): string | undefined {
  const key = planEnvName(tier, interval)
  const value = (process.env as Record<string, string | undefined>)[key]
  return value && value.trim() ? value.trim() : undefined
}

export function planEnvName(tier: string, interval: string): string {
  return `PAYPAL_PLAN_ID_SELLERRADAR_${tier.toUpperCase()}_${interval.toUpperCase()}`
}

export interface CreateSubscriptionResult {
  subscriptionId: string
  approvalUrl: string
}

export async function createPayPalSubscription(params: {
  planId: string
  /** Echoed back as resource.custom_id on every BILLING.SUBSCRIPTION.* event. */
  customId: string
  email: string
}): Promise<CreateSubscriptionResult> {
  const token = await getAccessToken()
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sellerradar.bizlegal-ai.com'

  const res = await fetch(`${baseUrl()}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan_id: params.planId,
      custom_id: params.customId,
      subscriber: { email_address: params.email },
      application_context: {
        brand_name: 'SellerRadar',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${site}/success?report=${params.customId}&method=paypal_subscription`,
        cancel_url: `${site}/pricing`,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`PayPal createSubscription failed: ${err}`)
  }

  const data = (await res.json()) as { id: string; links?: Array<{ rel: string; href: string }> }
  const approvalUrl = data.links?.find((l) => l.rel === 'approve')?.href
  if (!approvalUrl) throw new Error('No PayPal approval URL in subscription response')

  return { subscriptionId: data.id, approvalUrl }
}

/**
 * Verify a PayPal webhook against PAYPAL_WEBHOOK_ID. Fails CLOSED: a missing
 * webhook id, missing credentials, an unreachable verifier or anything other
 * than SUCCESS all return false.
 */
export async function verifyPayPalWebhook(
  headers: Headers,
  rawBody: string,
  webhookId: string,
): Promise<boolean> {
  try {
    const token = await getAccessToken()
    const res = await fetch(`${baseUrl()}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: headers.get('paypal-auth-algo'),
        cert_url: headers.get('paypal-cert-url'),
        transmission_id: headers.get('paypal-transmission-id'),
        transmission_sig: headers.get('paypal-transmission-sig'),
        transmission_time: headers.get('paypal-transmission-time'),
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    })
    if (!res.ok) return false
    const out = (await res.json()) as { verification_status?: string }
    return out.verification_status === 'SUCCESS'
  } catch (err) {
    console.error('[paypal] webhook verification threw:', err instanceof Error ? err.message : err)
    return false
  }
}

export async function capturePayPalOrder(orderId: string) {
  const token = await getAccessToken()

  const res = await fetch(`${baseUrl()}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal capture failed: ${err}`)
  }

  return await res.json()
}
