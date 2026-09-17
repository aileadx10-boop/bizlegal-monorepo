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

const RECURRING: Record<string, { product: string; tier: string; interval: 'monthly' }> = {
  sf_firm_49: { product: 'sincefiled', tier: 'firm', interval: 'monthly' },
}

export async function startSinceFiledCheckout(opts: {
  productId: string
  email: string
  gateway: 'crypto' | 'card'
  source?: string
  userName?: string
  forceDemo?: boolean
}): Promise<CheckoutResult> {
  if (DEMO_PREFIX || opts.forceDemo) {
    return simulateCheckout(opts.productId, opts.email)
  }
  const recurring = RECURRING[opts.productId]
  if (recurring && opts.gateway !== 'card') {
    return { ok: false, error: 'recurring_requires_card' }
  }
  try {
    const endpoint = recurring ? '/api/payments/paypal/start' : '/api/pay/start'
    const body = recurring
      ? { ...recurring, email: opts.email, name: opts.userName, source: opts.source ?? 'sincefiled_pricing' }
      : { product_id: opts.productId, user_email: opts.email, user_name: opts.userName, gateway: opts.gateway, source: opts.source ?? 'sincefiled_pricing' }
    const res = await fetch(`${HUB_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    const data = (await res.json()) as CheckoutResult & { approve_url?: string; error?: string }
    const checkoutUrl = data.checkout_url ?? data.approve_url
    return { ...data, checkout_url: checkoutUrl, product_id: opts.productId, ok: res.ok && Boolean(checkoutUrl) }
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

