/**
 * Checkout bridge — forwards to the hub's /api/pay/start.
 *
 * The hub owns every gateway credential, the payment_orders table, and the
 * NOWPayments/PayPal/LemonSqueezy/Paddle selection logic (@bizlegal/payment).
 * LeaseParse deliberately holds none of that: it posts a product id and gets a
 * checkout URL back. No new product SKU is introduced here —
 * `leaseparse_abstract_59` is already registered in packages/payment.
 *
 * THE GATE: LEASEPARSE_CHECKOUT_LIVE must be explicitly switched on. Default
 * off means the surface cannot take money even if it is deployed with real
 * gateway credentials present, which is the point — the trio decision doc
 * requires a verified test purchase first.
 */

export const CHECKOUT_GATE_ENV = 'LEASEPARSE_CHECKOUT_LIVE'

const PRODUCT_ID = 'leaseparse_abstract_59'
const DEFAULT_HUB = 'https://bizlegal-ai.com'
const REQUEST_TIMEOUT_MS = 20_000

/** Explicit opt-in only: anything other than "1"/"true"/"on" keeps it dark. */
export function isCheckoutLive(): boolean {
  const flag = (process.env[CHECKOUT_GATE_ENV] ?? '').trim().toLowerCase()
  return flag === '1' || flag === 'true' || flag === 'on'
}

function hubBaseUrl(): string {
  const raw = process.env.HUB_BASE_URL ?? process.env.NEXT_PUBLIC_HUB_URL ?? DEFAULT_HUB
  return raw.trim().replace(/\/+$/, '')
}

export interface StartCheckoutInput {
  readonly email: string
  readonly gateway: 'crypto' | 'card'
}

export interface CheckoutOk {
  readonly ok: true
  readonly checkoutUrl: string
  readonly orderId: string
  readonly provider: string
  readonly amountCents: number
}

export interface CheckoutFailure {
  readonly ok: false
  readonly error: string
  readonly detail?: string
  readonly status: number
}

export type StartCheckoutResult = CheckoutOk | CheckoutFailure

interface HubPayStartResponse {
  ok?: boolean
  provider?: string
  checkout_url?: string
  order_id?: string
  amount_cents?: number
  error?: string
}

export async function startLeaseCheckout(input: StartCheckoutInput): Promise<StartCheckoutResult> {
  if (!isCheckoutLive()) {
    // Belt and braces: the route already gates, but a future caller might not.
    return { ok: false, error: 'checkout_not_live', status: 503, detail: `${CHECKOUT_GATE_ENV} is off` }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(`${hubBaseUrl()}/api/pay/start`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': 'bizlegal-leaseparse/1.0' },
      body: JSON.stringify({
        product_id: PRODUCT_ID,
        user_email: input.email,
        gateway: input.gateway,
        source: 'leaseparse',
      }),
      signal: controller.signal,
    })

    const body = (await res.json().catch(() => ({}))) as HubPayStartResponse

    if (!res.ok || body.ok !== true || !body.checkout_url || !body.order_id) {
      return {
        ok: false,
        error: body.error ?? 'checkout_start_failed',
        detail: `hub /api/pay/start responded ${res.status}`,
        status: res.status >= 400 && res.status < 600 ? res.status : 502,
      }
    }

    return {
      ok: true,
      checkoutUrl: body.checkout_url,
      orderId: body.order_id,
      provider: body.provider ?? 'unknown',
      amountCents: body.amount_cents ?? 5900,
    }
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError'
    return {
      ok: false,
      error: aborted ? 'checkout_timeout' : 'checkout_unreachable',
      detail: err instanceof Error ? err.message : 'unknown transport error',
      status: 502,
    }
  } finally {
    clearTimeout(timer)
  }
}
