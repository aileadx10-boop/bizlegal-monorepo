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

export async function startCasePageCheckout(opts: { productId: string; email: string; gateway: 'crypto' | 'card'; userName?: string }): Promise<CheckoutResult> {
  if (DEMO) {
    return { ok: true, checkout_url: `/api/pay/simulate?product_id=${encodeURIComponent(opts.productId)}`, provider: 'demo', product_id: opts.productId }
  }
  try {
    const res = await fetch(`${HUB_URL}/api/pay/start`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(opts), cache: 'no-store' })
    const data = (await res.json()) as CheckoutResult & { error?: string }
    return { ok: res.ok && Boolean(data.checkout_url), ...data }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'checkout_unavailable' }
  }
}
