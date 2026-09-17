import crypto from 'node:crypto'

const PRODUCTS = new Set([
  'sincefiled',
  'sf_firm_49',
  'sf_lifetime_329',
  'sf_pack_us_19',
  'sf_pack_both_29',
])

interface SinceFiledOrder {
  id?: string | number | null
  product?: string | null
  tier?: string | null
  billing_interval?: string | null
  user_email?: string | null
  amount_cents?: number | null
  gateway?: string | null
  gateway_subscription_id?: string | null
  status?: string | null
}

/** Idempotent HMAC write-through to SinceFiled. Never throws into a webhook. */
export async function grantSinceFiled(order: SinceFiledOrder): Promise<void> {
  if (!order.product || !PRODUCTS.has(order.product)) return
  if (!order.user_email || order.id == null) return

  try {
    const secret = process.env.BIZLEGAL_INBOUND_SECRET
    if (!secret) {
      console.warn('[sincefiled-grant] BIZLEGAL_INBOUND_SECRET missing')
      return
    }
    const body = JSON.stringify({
      email: order.user_email.toLowerCase(),
      productId: order.product,
      tier: order.tier,
      interval: order.billing_interval ?? 'one-time',
      orderId: String(order.id),
      amount_cents: order.amount_cents ?? null,
      gateway: order.gateway ?? null,
      gatewaySubscriptionId: order.gateway_subscription_id ?? null,
      status: order.status ?? 'active',
    })
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex')
    const response = await fetch(
      process.env.SINCEFILED_FULFILL_URL ?? 'https://sincefiled.bizlegal-ai.com/api/fulfillment',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-bizlegal-signature': signature },
        body,
      },
    )
    if (!response.ok) console.warn('[sincefiled-grant] fulfillment POST failed:', response.status)
  } catch (error) {
    console.warn('[sincefiled-grant] threw:', error instanceof Error ? error.message : error)
  }
}
