/**
 * SinceFiled checkout helper.
 *
 * Live mode: POST to hub /api/pay/start (universal checkout). The hub
 * requires env (Supabase + gateway secrets); if that's missing, this
 * helper degrades to demo simulate mode.
 *
 * Never log secrets. No outcome guarantees in copy.
 */

export interface CheckoutResult {
  ok: boolean
  checkout_url?: string
  provider?: string
  order_id?: string
  product_id?: string
  amount_cents?: number
  error?: string
}

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL ?? 'https://bizlegal-ai.com'
const DEMO_PREFIX = process.env.DEMO_MODE === '1' ? 'DEMO_' : ''

export async function startSinceFiledCheckout(opts: {
  productId: string
  email: string
  gateway: 'crypto' | 'card'
  source?: string
  userName?: string
}): Promise<CheckoutResult> {
  if (DEMO_PREFIX || opts.forceDemo) {
    return simulateCheckout(opts.productId, opts.email)
  }
  try {
    const res = await fetch(`${HUB_URL}/api/pay/start`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(opts),
      cache: 'no-store',
    })
    const data = (await res.json()) as CheckoutResult & { error?: string }
    return { ok: res.ok && Boolean(data.checkout_url), ...data }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'checkout_unavailable' }
  }
}

function simulateCheckout(productId: string, email: string): CheckoutResult {
  return {
    ok: true,
    checkout_url: `/api/pay/simulate/redirect?product_id=${encodeURIComponent(productId)}&email=${encodeURIComponent(email)}`,
    provider: 'demo',
    order_id: `demo-${productId}-${Date.now()}`,
    product_id: productId,
    amount_cents: 0,
  }
}

