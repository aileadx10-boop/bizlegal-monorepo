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
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tracr.bizlegal-ai.com'

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
        cancel_url:  `${site}/scan`,
        user_action: 'PAY_NOW',
        brand_name:  'TRACR Intelligence',
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

export async function verifyWebhookSignature(
  body: string,
  headers: Record<string, string>,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) return true  // skip if not configured

  const token = await getAccessToken()

  const res = await fetch(`${baseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo:          headers['paypal-auth-algo'],
      cert_url:           headers['paypal-cert-url'],
      transmission_id:    headers['paypal-transmission-id'],
      transmission_sig:   headers['paypal-transmission-sig'],
      transmission_time:  headers['paypal-transmission-time'],
      webhook_id:         webhookId,
      webhook_event:      JSON.parse(body),
    }),
  })

  const data = await res.json()
  return data.verification_status === 'SUCCESS'
}
