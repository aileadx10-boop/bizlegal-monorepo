import crypto from 'node:crypto'

/**
 * BrainX fulfillment write-through (BrainX productization, 2026-09-16).
 *
 * Same protocol as sellerradar-grant.ts / falseecho-grant.ts: the hub knows
 * the buyer's email + tier but BrainX is Neon-native (deliberately not
 * Supabase — decisions/BRAINX-INTELLIGENCE-OS-PLAN.md), so entitlement is
 * granted by an HMAC-signed POST to BrainX's own /api/fulfillment rather than
 * a local write. BrainX creates the `subscribers` row and emails the access
 * link.
 *
 * Two order shapes reach this file, because BrainX card billing goes through
 * the legacy `/api/payments/paypal/start` subscription route (product='brainx',
 * tier='radar'|'radar_build') while crypto yearly goes through the universal
 * `/api/pay/start` (product='brainx_opportunity_radar_yearly' etc., tier
 * usually 'brainx'). `brainxTierFor` normalises both to 'radar'|'radar_build'.
 *
 * Never throws into a webhook handler.
 */

export type BrainXLifecycleEvent = 'activated' | 'renewed' | 'past_due' | 'cancelled' | 'refunded'

interface OrderLike {
  id?: string | number | null
  product?: string | null
  tier?: string | null
  billing_interval?: string | null
  user_email?: string | null
  amount_cents?: number | null
  gateway?: string | null
}

export function isBrainXOrder(order: OrderLike): boolean {
  return order.product === 'brainx' || (typeof order.product === 'string' && order.product.startsWith('brainx_'))
}

export function brainxTierFor(order: OrderLike): 'radar' | 'radar_build' | null {
  if (order.product === 'brainx') {
    return order.tier === 'radar' || order.tier === 'radar_build' ? order.tier : null
  }
  if (typeof order.product === 'string' && order.product.startsWith('brainx_')) {
    return order.product.startsWith('brainx_radar_build_') ? 'radar_build' : 'radar'
  }
  return null
}

function fulfillUrl(): string {
  return process.env.BRAINX_FULFILL_URL ?? 'https://brainx.bizlegal-ai.com/api/fulfillment'
}

async function postFulfillment(event: BrainXLifecycleEvent, order: OrderLike): Promise<void> {
  const email = order.user_email
  const tier = brainxTierFor(order)
  if (!email || !tier || order.id == null) return

  const secret = process.env.BIZLEGAL_INBOUND_SECRET
  if (!secret) {
    console.warn('[brainx-grant] BIZLEGAL_INBOUND_SECRET missing — cannot fulfill')
    return
  }

  const body = JSON.stringify({
    event,
    order_id: String(order.id),
    email,
    tier,
    interval: order.billing_interval === 'yearly' ? 'yearly' : 'monthly',
    gateway: order.gateway ?? 'paypal',
    amount_cents: order.amount_cents ?? null,
    occurred_at: new Date().toISOString(),
  })
  const sig = crypto.createHmac('sha256', secret).update(body).digest('hex')

  try {
    const res = await fetch(fulfillUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-bizlegal-signature': sig, 'user-agent': 'bizlegal-agent/1.0' },
      body,
    })
    if (!res.ok) console.warn('[brainx-grant] fulfillment POST failed:', res.status)
  } catch (err) {
    console.warn('[brainx-grant] threw:', err instanceof Error ? err.message : err)
  }
}

/** Call on the activating event (PayPal ACTIVATED, or NOWPayments confirmed for the yearly crypto SKU). */
export async function grantBrainX(order: OrderLike): Promise<void> {
  if (!isBrainXOrder(order)) return
  await postFulfillment('activated', order)
}

/** Call on renewal / payment-failure / cancellation / refund events for an existing BrainX order. */
export async function syncBrainXSubscription(
  order: OrderLike,
  event: Exclude<BrainXLifecycleEvent, 'activated'>,
): Promise<void> {
  if (!isBrainXOrder(order)) return
  await postFulfillment(event, order)
}
