import crypto from 'node:crypto'

const PRODUCTS = new Set(['casepage', 'cp_solo_49', 'cp_firm_149', 'cp_setup_490'])

interface CasePageOrder {
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

/** Idempotent HMAC write-through to CasePage. Never throws into a webhook. */
export async function grantCasePage(order: CasePageOrder): Promise<void> {
  if (!order.product || !PRODUCTS.has(order.product)) return
  if (!order.user_email || order.id == null) return

  try {
    const secret = process.env.BIZLEGAL_INBOUND_SECRET
    if (!secret) {
      console.warn('[casepage-grant] BIZLEGAL_INBOUND_SECRET missing')
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
      process.env.CASEPAGE_FULFILL_URL ?? 'https://casepage.bizlegal-ai.com/api/fulfillment',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-bizlegal-signature': signature },
        body,
      },
    )
    if (!response.ok) console.warn('[casepage-grant] fulfillment POST failed:', response.status)
  } catch (error) {
    console.warn('[casepage-grant] threw:', error instanceof Error ? error.message : error)
  }
}
