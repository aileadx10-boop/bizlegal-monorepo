/**
 * Paddle Billing helper.
 *
 * 2026-05-11 build (per Moses's W5 ask: "make it ready to Paddle").
 *
 * Required env (set in Vercel hub project before flipping the switch):
 *   PADDLE_API_KEY              Bearer token from Paddle Dashboard →
 *                               Developer tools → Authentication.
 *   PADDLE_ENV                  'live' (default) | 'sandbox'.
 *   PADDLE_WEBHOOK_SECRET       Notification secret from Paddle
 *                               Dashboard → Notifications → click your
 *                               notification setting → "Secret key".
 *                               Format: `pdl_ntfy_<random>`.
 *   PADDLE_PRICE_<APP>_<TIER>_<INTERVAL>  Per-tier price IDs created in
 *                               Paddle Dashboard → Catalog → Prices.
 *                               Format: `pri_<random>`.
 *
 * Example tier env vars Moses sets in Vercel after creating the
 * prices in Paddle:
 *   PADDLE_PRICE_HUB_PRO_MONTHLY=pri_01...
 *   PADDLE_PRICE_HUB_PRO_YEARLY=pri_01...
 *   PADDLE_PRICE_HUB_SCALE_MONTHLY=pri_01...
 *   PADDLE_PRICE_HUB_SCALE_YEARLY=pri_01...
 *
 * Webhook endpoint Moses configures in Paddle:
 *   https://bizlegal-ai.com/api/payments/paddle/webhook
 */

import crypto from 'node:crypto'

const PADDLE_LIVE_BASE = 'https://api.paddle.com'
const PADDLE_SANDBOX_BASE = 'https://sandbox-api.paddle.com'

export function paddleBase(): string {
  return process.env.PADDLE_ENV === 'sandbox' ? PADDLE_SANDBOX_BASE : PADDLE_LIVE_BASE
}

/**
 * Resolve a tier identifier (e.g. 'HUB_PRO_MONTHLY') to a Paddle price
 * ID via env-var convention. Returns null if the env var is unset, so
 * the caller can return a clean "tier_not_configured" error rather than
 * crash.
 */
export function priceIdForTier(tier: string): string | null {
  const key = `PADDLE_PRICE_${tier.toUpperCase()}`
  const value = process.env[key]
  if (!value || typeof value !== 'string' || !value.startsWith('pri_')) {
    return null
  }
  return value
}

export interface CreateTransactionInput {
  /** Paddle price ID, e.g. `pri_01...`. */
  readonly priceId: string
  /** Quantity (defaults to 1). */
  readonly quantity?: number
  /** End-user email for the transaction record + customer creation. */
  readonly customerEmail: string
  /** Internal order ID we'll receive back on webhook (custom_data.order_id). */
  readonly orderId: string
  /** Absolute URL Paddle should redirect to after successful checkout. */
  readonly successUrl: string
  /** Optional discount code applied at transaction-create time. */
  readonly discountId?: string
}

export interface CreateTransactionResult {
  readonly transactionId: string
  readonly checkoutUrl: string
}

/**
 * Create a Paddle transaction (Paddle Billing v2). Returns the
 * checkout URL the caller should redirect the user to.
 *
 * Errors:
 *   - Throws if PADDLE_API_KEY is unset.
 *   - Throws if Paddle API returns non-2xx; full error stays in the
 *     thrown message for server logs, but callers MUST NOT bubble that
 *     to clients verbatim (H-02 pattern).
 */
export async function createPaddleTransaction(
  input: CreateTransactionInput,
): Promise<CreateTransactionResult> {
  const apiKey = process.env.PADDLE_API_KEY
  if (!apiKey || !apiKey.startsWith('pdl_')) {
    throw new Error('PADDLE_API_KEY not configured')
  }

  const body = {
    items: [
      {
        price_id: input.priceId,
        quantity: input.quantity ?? 1,
      },
    ],
    customer_email: input.customerEmail,
    custom_data: {
      order_id: input.orderId,
    },
    checkout: {
      url: input.successUrl,
    },
    ...(input.discountId ? { discount_id: input.discountId } : {}),
  }

  const response = await fetch(`${paddleBase()}/transactions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Paddle API ${response.status}: ${errorText}`)
  }

  const payload = (await response.json()) as {
    data?: {
      id?: string
      checkout?: { url?: string }
    }
  }

  const transactionId = payload.data?.id
  const checkoutUrl = payload.data?.checkout?.url
  if (!transactionId || !checkoutUrl) {
    throw new Error('Paddle response missing transaction id or checkout url')
  }
  return { transactionId, checkoutUrl }
}

/**
 * Verify a Paddle webhook signature.
 *
 * Paddle's notification signature is in the `paddle-signature` header
 * with format `ts=<unix>;h1=<sha256-hex>`. The HMAC base string is
 * `<ts>:<rawBody>` signed with PADDLE_WEBHOOK_SECRET.
 *
 * Returns false on:
 *   - Missing header or secret env
 *   - Malformed header
 *   - Stale timestamp (>5 minutes old; defense against very late
 *     replay even though we also have an idempotency table)
 *   - HMAC mismatch (timing-safe compare)
 */
export function verifyPaddleSignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (!secret || !header) return false

  // Parse `ts=...;h1=...` (Paddle may add more pairs in future; we tolerate)
  const parts = header.split(';').reduce<Record<string, string>>((acc, pair) => {
    const [k, v] = pair.split('=', 2)
    if (k && v) acc[k.trim()] = v.trim()
    return acc
  }, {})

  const ts = parts['ts']
  const h1 = parts['h1']
  if (!ts || !h1) return false

  // Reject if timestamp is older than 5 minutes (replay defense; the
  // idempotency table also covers this, but two layers are cheap).
  const tsNum = Number(ts)
  if (!Number.isFinite(tsNum)) return false
  const ageS = Math.abs(Math.floor(Date.now() / 1000) - tsNum)
  if (ageS > 300) return false

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${ts}:${rawBody}`)
    .digest('hex')

  if (expected.length !== h1.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(h1, 'hex'))
  } catch {
    return false
  }
}
