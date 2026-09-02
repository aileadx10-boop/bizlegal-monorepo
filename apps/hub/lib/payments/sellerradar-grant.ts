import crypto from 'node:crypto'

/**
 * SellerRadar fulfillment write-through (sellerradar MVP,
 * docs/sellerradar-mvp-spec.md §4/§5). Same protocol as falseecho-grant.
 *
 * A hub apex checkout for product=sellerradar knows the buyer's email + tier
 * but not their catalog — the apex checkout page has no CSV upload field.
 * So instead of writing entitlements locally, we POST to the SellerRadar
 * subdomain's /api/fulfillment (HMAC-SHA256 over the body with
 * BIZLEGAL_INBOUND_SECRET — the same protocol every subdomain's
 * /api/inbound-lead uses). SellerRadar records the paid order as an
 * unclaimed credit and emails the buyer an intake link (/analyze?order=<id>)
 * to upload their catalog and run the fee-impact analysis.
 *
 * Never throws into the webhook flow.
 */
export async function grantSellerRadar(
  order: {
    id?: string | number | null
    product?: string | null
    tier?: string | null
    billing_interval?: string | null
    user_email?: string | null
    amount_cents?: number | null
  },
): Promise<void> {
  if (order.product !== 'sellerradar') return
  const email = order.user_email
  if (!email || !order.tier || order.id == null) return

  try {
    const secret = process.env.BIZLEGAL_INBOUND_SECRET
    if (!secret) {
      console.warn('[sellerradar-grant] BIZLEGAL_INBOUND_SECRET missing — cannot fulfill')
      return
    }

    const url =
      process.env.SELLERRADAR_FULFILL_URL ??
      'https://sellerradar.bizlegal-ai.com/api/fulfillment'

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
      console.warn('[sellerradar-grant] fulfillment POST failed:', res.status)
    }
  } catch (err) {
    console.warn('[sellerradar-grant] threw:', err instanceof Error ? err.message : err)
  }
}
