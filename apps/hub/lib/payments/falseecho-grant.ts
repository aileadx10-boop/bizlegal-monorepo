import crypto from 'node:crypto'

/**
 * FalseEcho fulfillment write-through (falseecho MVP, docs/falseecho-mvp-spec.md §5).
 *
 * A hub apex checkout for product=falseecho knows the buyer's email + tier
 * but not the entity to scan — the apex checkout page has no field for it.
 * So instead of writing entitlements locally, we POST to the FalseEcho
 * subdomain's /api/fulfillment (HMAC-SHA256 over the body with
 * BIZLEGAL_INBOUND_SECRET — the same protocol every subdomain's
 * /api/inbound-lead uses). FalseEcho records the paid order as an unclaimed
 * credit and emails the buyer an intake link (/scan?order=<id>) to name the
 * entity and start the probe battery.
 *
 * Never throws into the webhook flow.
 */
export async function grantFalseEcho(
  order: {
    id?: string | number | null
    product?: string | null
    tier?: string | null
    billing_interval?: string | null
    user_email?: string | null
    amount_cents?: number | null
  },
): Promise<void> {
  if (order.product !== 'falseecho') return
  const email = order.user_email
  if (!email || !order.tier || order.id == null) return

  try {
    const secret = process.env.BIZLEGAL_INBOUND_SECRET
    if (!secret) {
      console.warn('[falseecho-grant] BIZLEGAL_INBOUND_SECRET missing — cannot fulfill')
      return
    }

    const url =
      process.env.FALSEECHO_FULFILL_URL ??
      'https://falseecho.bizlegal-ai.com/api/fulfillment'

    const body = JSON.stringify({
      email,
      tier: order.tier,
      interval: order.billing_interval ?? 'one-time',
      orderId: String(order.id),
      amount_cents: order.amount_cents ?? null,
    })
    const sig = crypto.createHmac('sha256', secret).update(body).digest('hex')

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bizlegal-signature': sig,
      },
      body,
    })
    if (!res.ok) {
      console.warn('[falseecho-grant] fulfillment POST failed:', res.status)
    }
  } catch (err) {
    console.warn('[falseecho-grant] threw:', err instanceof Error ? err.message : err)
  }
}
