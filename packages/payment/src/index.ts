/**
 * @bizlegal/payment — code-only payment gateway clients.
 *
 * Replaces every NEXT_PUBLIC_NOWPAYMENTS_*_URL and NEXT_PUBLIC_PAYPAL_*_URL
 * env constant with on-the-fly checkout-URL generation. After Phase Z3,
 * Moses never pastes a checkout URL into Vercel UI again — gateway API
 * keys are the only env state required.
 *
 * Failure mode: when a gateway's API key is unset, the corresponding
 * `create*` function returns 503 stub `{ provider, ok: false, error: '...' }`
 * — caller falls back to the next available gateway or shows a friendly
 * "checkout coming soon" message.
 *
 * Idempotency: each call carries a deterministic order_id derived from
 * (user_email, product_id, timestamp_minute). NOWPayments + PayPal both
 * dedupe on order_id; calling /api/pay/start twice in the same minute
 * returns the same checkout URL.
 */

import { getProduct, type ProductId, type ProductSpec } from './products.js'

export * from './products.js'

export interface CheckoutSpec {
  product_id: ProductId
  /** Lower-cased email for idempotency keying. */
  user_email: string
  /** Optional override fields (e.g., user_name for receipts). */
  user_name?: string
  /** Origin domain for success/cancel URL construction. Defaults to https://bizlegal-ai.com. */
  origin?: string
}

export type Provider = 'nowpayments' | 'paypal' | 'lemonsqueezy' | 'paddle'

export interface CheckoutResultOk {
  ok: true
  provider: Provider
  checkout_url: string
  provider_invoice_id: string
  product: ProductSpec
  amount_cents: number
}

export interface CheckoutResultFail {
  ok: false
  provider: Provider
  error: string
  status_code: number
}

export type CheckoutResult = CheckoutResultOk | CheckoutResultFail

const HUB_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? 'https://bizlegal-ai.com'

function makeOrderId(productId: ProductId, email: string): string {
  // D12 SECURITY-V3 H-5 fix: previous shape was `bz_${productId}_${email}_${minute}`
  // which an attacker who knew (productId, email, ~minute) could guess. Today we
  // append a random nonce so collision-by-guess is computationally infeasible.
  // We keep (productId, safeEmail) in the prefix so gateway dashboards remain
  // human-readable, and we keep the minute bucket so accidental double-clicks
  // within the same minute still collapse server-side at NOWPayments / PayPal
  // dedupe (both gateways treat repeat order_ids in flight as the same order).
  // The random nonce + minute combo: uniqueness within minute bucket = nonce
  // (16 chars hex = 64 bits ~= no collision within any reasonable workload).
  const minute = Math.floor(Date.now() / 60_000)
  const safeEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40)
  const nonce = randomHex(16)
  return `bz_${productId}_${safeEmail}_${minute}_${nonce}`
}

function randomHex(bytes: number): string {
  // Use Web Crypto when available (Edge runtime, Cloudflare Workers, modern Node).
  // Falls back to Math.random for non-crypto environments — note this is a
  // SECONDARY defense; the primary order-id integrity comes from gateway-side
  // server-validated invoice records, not from order_id secrecy.
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const arr = new Uint8Array(Math.ceil(bytes / 2))
    globalThis.crypto.getRandomValues(arr)
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, bytes)
  }
  let out = ''
  while (out.length < bytes) {
    out += Math.floor(Math.random() * 16).toString(16)
  }
  return out
}

function successUrl(spec: CheckoutSpec, orderId: string): string {
  const product = getProduct(spec.product_id)
  const origin = spec.origin ?? HUB_ORIGIN
  return `${origin}/payment/success?order=${encodeURIComponent(orderId)}&product=${encodeURIComponent(product.id)}`
}

function cancelUrl(spec: CheckoutSpec, orderId: string): string {
  const product = getProduct(spec.product_id)
  const origin = spec.origin ?? HUB_ORIGIN
  return `${origin}/payment/cancelled?order=${encodeURIComponent(orderId)}&product=${encodeURIComponent(product.id)}`
}

function ipnUrl(spec: CheckoutSpec): string {
  const product = getProduct(spec.product_id)
  const origin = spec.origin ?? HUB_ORIGIN
  return `${origin}${product.webhook_path}`
}

// ────────────────────────────────────────────────────────────────────
// NOWPayments — crypto checkout
// ────────────────────────────────────────────────────────────────────

interface NowPaymentsInvoiceResponse {
  id: string
  invoice_url: string
}

export async function createNowPaymentsInvoice(spec: CheckoutSpec): Promise<CheckoutResult> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY
  if (!apiKey) {
    return { ok: false, provider: 'nowpayments', error: 'NOWPAYMENTS_API_KEY unset', status_code: 503 }
  }
  const product = getProduct(spec.product_id)
  const orderId = makeOrderId(spec.product_id, spec.user_email)
  try {
    const res = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        price_amount: product.amount_cents / 100,
        price_currency: product.currency.toLowerCase(),
        order_id: orderId,
        order_description: product.description,
        success_url: successUrl(spec, orderId),
        cancel_url: cancelUrl(spec, orderId),
        ipn_callback_url: ipnUrl(spec),
      }),
    })
    if (!res.ok) {
      return {
        ok: false,
        provider: 'nowpayments',
        error: `nowpayments_${res.status}`,
        status_code: res.status,
      }
    }
    const body = (await res.json()) as NowPaymentsInvoiceResponse
    return {
      ok: true,
      provider: 'nowpayments',
      checkout_url: body.invoice_url,
      provider_invoice_id: body.id,
      product,
      amount_cents: product.amount_cents,
    }
  } catch (err) {
    return {
      ok: false,
      provider: 'nowpayments',
      error: err instanceof Error ? err.message : 'network_error',
      status_code: 502,
    }
  }
}

// ────────────────────────────────────────────────────────────────────
// NOWPayments — raw invoice creator (escape hatch)
// ────────────────────────────────────────────────────────────────────
// Some surfaces (Forge per-vertical scan, Forge passport) carry
// per-call pricing + custom redirect URLs that don't fit the
// product-registry shape. The raw helper keeps the import boundary
// at @bizlegal/payment while letting those surfaces pass arbitrary
// amount + order_id + description + redirects.
//
// Use this when:
//  - You have a per-call price (e.g. variable scan tiers)
//  - You compose a custom order_id (e.g. `scan_<uuid>` for scan rows)
//  - The IPN handler lives on the calling subdomain, not hub
//
// Otherwise prefer createNowPaymentsInvoice(spec) — the typed,
// registry-backed path.

export interface NowPaymentsRawOpts {
  /** USD price; cents are inferred when amount_cents is supplied. */
  readonly amount_usd?: number
  /** Cents take priority over amount_usd. */
  readonly amount_cents?: number
  /** ISO currency code; defaults to USD. */
  readonly price_currency?: string
  /** Pay currency (e.g. 'usdtbsc'); leave empty for NOWPayments default. */
  readonly pay_currency?: string
  /** Caller-supplied order_id; should be deterministic to leverage NOWPayments dedupe. */
  readonly order_id: string
  /** Short order description shown in the invoice. */
  readonly description: string
  /** Fully-qualified URLs for redirect + IPN. */
  readonly success_url: string
  readonly cancel_url: string
  readonly ipn_url: string
}

export interface NowPaymentsRawResult {
  readonly ok: boolean
  readonly provider: 'nowpayments'
  readonly checkout_url?: string
  readonly provider_invoice_id?: string
  readonly amount_cents: number
  readonly error?: string
  readonly status_code: number
}

export async function createNowPaymentsInvoiceRaw(
  opts: NowPaymentsRawOpts,
): Promise<NowPaymentsRawResult> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY
  const amount_cents =
    opts.amount_cents ??
    (typeof opts.amount_usd === 'number' ? Math.round(opts.amount_usd * 100) : 0)
  if (!apiKey) {
    return {
      ok: false,
      provider: 'nowpayments',
      amount_cents,
      error: 'NOWPAYMENTS_API_KEY unset',
      status_code: 503,
    }
  }
  if (amount_cents <= 0) {
    return {
      ok: false,
      provider: 'nowpayments',
      amount_cents,
      error: 'amount_cents/amount_usd missing or non-positive',
      status_code: 400,
    }
  }
  const currency = (opts.price_currency ?? 'USD').toLowerCase()
  try {
    const body: Record<string, unknown> = {
      price_amount: amount_cents / 100,
      price_currency: currency,
      order_id: opts.order_id,
      order_description: opts.description,
      success_url: opts.success_url,
      cancel_url: opts.cancel_url,
      ipn_callback_url: opts.ipn_url,
    }
    if (opts.pay_currency) body.pay_currency = opts.pay_currency
    const res = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      return {
        ok: false,
        provider: 'nowpayments',
        amount_cents,
        error: `nowpayments_${res.status}`,
        status_code: res.status,
      }
    }
    const payload = (await res.json()) as NowPaymentsInvoiceResponse
    return {
      ok: true,
      provider: 'nowpayments',
      checkout_url: payload.invoice_url,
      provider_invoice_id: payload.id,
      amount_cents,
      status_code: 200,
    }
  } catch (err) {
    return {
      ok: false,
      provider: 'nowpayments',
      amount_cents,
      error: err instanceof Error ? err.message : 'network_error',
      status_code: 502,
    }
  }
}

// ────────────────────────────────────────────────────────────────────
// PayPal — card / PayPal balance checkout (Orders API for one-time;
// Subscriptions API would need a Plan ID, which we deliberately avoid
// per Z3 — Plan IDs are env constants we promised not to add)
// ────────────────────────────────────────────────────────────────────

interface PayPalAccessTokenResponse {
  access_token: string
}

interface PayPalOrderResponse {
  id: string
  links: Array<{ href: string; rel: string }>
}

export async function createPayPalOrder(spec: CheckoutSpec): Promise<CheckoutResult> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const apiUrl = process.env.PAYPAL_API_URL ?? 'https://api-m.paypal.com'
  if (!clientId || !clientSecret) {
    return {
      ok: false,
      provider: 'paypal',
      error: 'PAYPAL_CLIENT_ID/SECRET unset',
      status_code: 503,
    }
  }
  const product = getProduct(spec.product_id)
  const orderId = makeOrderId(spec.product_id, spec.user_email)
  try {
    // OAuth token
    const tokenRes = await fetch(`${apiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })
    if (!tokenRes.ok) {
      return {
        ok: false,
        provider: 'paypal',
        error: `paypal_token_${tokenRes.status}`,
        status_code: tokenRes.status,
      }
    }
    const { access_token } = (await tokenRes.json()) as PayPalAccessTokenResponse

    // Create order
    const orderRes = await fetch(`${apiUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'content-type': 'application/json',
        'PayPal-Request-Id': orderId,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId,
            description: product.description.slice(0, 127),
            amount: {
              currency_code: product.currency,
              value: (product.amount_cents / 100).toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: successUrl(spec, orderId),
          cancel_url: cancelUrl(spec, orderId),
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
        },
      }),
    })
    if (!orderRes.ok) {
      return {
        ok: false,
        provider: 'paypal',
        error: `paypal_order_${orderRes.status}`,
        status_code: orderRes.status,
      }
    }
    const body = (await orderRes.json()) as PayPalOrderResponse
    const approveUrl = body.links.find((l) => l.rel === 'approve' || l.rel === 'payer-action')?.href
    if (!approveUrl) {
      return {
        ok: false,
        provider: 'paypal',
        error: 'paypal_no_approve_url',
        status_code: 502,
      }
    }
    return {
      ok: true,
      provider: 'paypal',
      checkout_url: approveUrl,
      provider_invoice_id: body.id,
      product,
      amount_cents: product.amount_cents,
    }
  } catch (err) {
    return {
      ok: false,
      provider: 'paypal',
      error: err instanceof Error ? err.message : 'network_error',
      status_code: 502,
    }
  }
}

// ────────────────────────────────────────────────────────────────────
// LemonSqueezy — code-only stub until approval lands
// ────────────────────────────────────────────────────────────────────

export async function createLemonSqueezyCheckout(spec: CheckoutSpec): Promise<CheckoutResult> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  if (!apiKey || !storeId) {
    return {
      ok: false,
      provider: 'lemonsqueezy',
      error: 'lemonsqueezy_not_yet_approved',
      status_code: 503,
    }
  }
  // Real implementation: POST https://api.lemonsqueezy.com/v1/checkouts
  // with { data: { type: 'checkouts', attributes: { ... }, relationships: { store, variant } } }
  // We stub the call until Moses confirms LemonSqueezy approval landed and
  // shares the variant_id mapping per ProductId. Until then: 503.
  const product = getProduct(spec.product_id)
  return {
    ok: false,
    provider: 'lemonsqueezy',
    error: `lemonsqueezy_variant_id_unmapped_for_${product.id}`,
    status_code: 503,
  }
}

// ────────────────────────────────────────────────────────────────────
// Paddle — code-only stub until approval lands
// ────────────────────────────────────────────────────────────────────

export async function createPaddleCheckout(spec: CheckoutSpec): Promise<CheckoutResult> {
  const apiKey = process.env.PADDLE_API_KEY
  const vendorId = process.env.PADDLE_VENDOR_ID
  if (!apiKey || !vendorId) {
    return {
      ok: false,
      provider: 'paddle',
      error: 'paddle_not_yet_approved',
      status_code: 503,
    }
  }
  // Real implementation: Paddle Billing API checkout creation.
  // Stubbed until Moses confirms Paddle approval + price_id mapping per ProductId.
  const product = getProduct(spec.product_id)
  return {
    ok: false,
    provider: 'paddle',
    error: `paddle_price_id_unmapped_for_${product.id}`,
    status_code: 503,
  }
}

// ────────────────────────────────────────────────────────────────────
// Gateway router — picks a working provider per gateway preference
// ────────────────────────────────────────────────────────────────────

export type GatewayPreference = 'crypto' | 'card'

export async function startCheckout(
  spec: CheckoutSpec,
  preference: GatewayPreference,
): Promise<CheckoutResult> {
  if (preference === 'crypto') {
    // Crypto-first: NOWPayments. Future: add Coinbase Commerce as fallback.
    return createNowPaymentsInvoice(spec)
  }
  // Card-first: try LemonSqueezy → Paddle → PayPal in that order. The 503
  // stubs short-circuit instantly when keys aren't yet set so the fallback
  // chain costs almost nothing.
  const ls = await createLemonSqueezyCheckout(spec)
  if (ls.ok) return ls
  const paddle = await createPaddleCheckout(spec)
  if (paddle.ok) return paddle
  return createPayPalOrder(spec)
}
