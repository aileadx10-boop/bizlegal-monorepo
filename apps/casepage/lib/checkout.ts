/**
 * CasePage checkout helper.
 * Live mode: hub /api/pay/start. Demo mode: simulate.
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
const DEMO = process.env.DEMO_MODE === '1'

const RECURRING: Record<string, { product: string; tier: string; interval: 'monthly' }> = {
  cp_solo_49: { product: 'casepage', tier: 'solo', interval: 'monthly' },
  cp_firm_149: { product: 'casepage', tier: 'firm', interval: 'monthly' },
}

export async function startCasePageCheckout(opts: { productId: string; email: string; gateway: 'crypto' | 'card'; userName?: string }): Promise<CheckoutResult> {
  if (DEMO) {
    return { ok: true, checkout_url: `/api/pay/simulate?product_id=${encodeURIComponent(opts.productId)}`, provider: 'demo', product_id: opts.productId }
  }
  const recurring = RECURRING[opts.productId]
  if (recurring && opts.gateway !== 'card') {
    return { ok: false, error: 'recurring_requires_card' }
  }
  try {
    const endpoint = recurring ? '/api/payments/paypal/start' : '/api/pay/start'
    const body = recurring
      ? { ...recurring, email: opts.email, name: opts.userName, source: 'casepage_pricing' }
      : { product_id: opts.productId, user_email: opts.email, user_name: opts.userName, gateway: opts.gateway, source: 'casepage_pricing' }
    const res = await fetch(`${HUB_URL}${endpoint}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' })
    const data = (await res.json()) as CheckoutResult & { approve_url?: string; error?: string }
    const checkoutUrl = data.checkout_url ?? data.approve_url
    return { ...data, checkout_url: checkoutUrl, product_id: opts.productId, ok: res.ok && Boolean(checkoutUrl) }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'checkout_unavailable' }
  }
}
