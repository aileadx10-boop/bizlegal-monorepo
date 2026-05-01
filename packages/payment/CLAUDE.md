# @bizlegal/payment

Code-only payment gateway clients. Replaces every `NEXT_PUBLIC_NOWPAYMENTS_*_URL` and `NEXT_PUBLIC_PAYPAL_*_URL` env constant with on-the-fly checkout-URL generation.

After Phase Z3, Moses never pastes a checkout URL into Vercel UI again. The only env state is the gateway API key set (which already lives in the canonical vault).

## Public surface

```ts
import { startCheckout, getProduct, type ProductId } from '@bizlegal/payment'

const result = await startCheckout(
  { product_id: 'boi_solo_monthly', user_email: 'me@example.com' },
  'crypto',  // 'crypto' or 'card'
)

if (result.ok) {
  return Response.redirect(result.checkout_url)
} else {
  // 503 stub from a not-yet-approved gateway, or a real error
  console.warn(`${result.provider} declined: ${result.error}`)
}
```

`src/products.ts` is the registry — adding a new priceable product = append a `ProductSpec`. PricingTierCard components reference products by `ProductId` string.

## Gateways

| Gateway | Status | Env required | Fallback when key absent |
|---|---|---|---|
| NOWPayments (crypto) | live | `NOWPAYMENTS_API_KEY` | 503 stub |
| PayPal Orders v2 (card) | live | `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` (+ optional `PAYPAL_API_URL`) | 503 stub |
| LemonSqueezy (card) | code-only stub | `LEMONSQUEEZY_API_KEY` + `LEMONSQUEEZY_STORE_ID` (+ approval) | 503 `lemonsqueezy_not_yet_approved` |
| Paddle (card) | code-only stub | `PADDLE_API_KEY` + `PADDLE_VENDOR_ID` (+ approval) | 503 `paddle_not_yet_approved` |

`startCheckout(spec, 'card')` tries LemonSqueezy → Paddle → PayPal in that order; 503 stubs short-circuit instantly so the fallback chain costs almost nothing.

## Idempotency

`makeOrderId(productId, email)` derives a deterministic order_id from `(product_id, lower(email), floor(now/60s))`. NOWPayments + PayPal both dedupe on order_id at the gateway side; double-clicking the checkout button in the same minute returns the same checkout URL.

## When LemonSqueezy or Paddle approval lands

1. Append the API key + variant/price ID mapping to the canonical vault.
2. Replace the stub bodies of `createLemonSqueezyCheckout` / `createPaddleCheckout` in `src/index.ts` with real API calls.
3. The fallback chain in `startCheckout('card')` already prefers LS → Paddle → PayPal, so once stubs go live, card payments automatically route through them without any other code change.
4. Test with `pnpm --filter @bizlegal/hub dev` + manual `/agents/<x>` checkout click → verify gateway page loads.

## What NOT to do

- Don't add `NEXT_PUBLIC_NOWPAYMENTS_*_URL` or `NEXT_PUBLIC_PAYPAL_*_URL` env vars. Z3 deleted them. The pre-commit hook flags new env-var refs not in the vault.
- Don't remove the deterministic `makeOrderId` — it's the dedup key.
- Don't replace 503 stubs with hardcoded checkout URLs while waiting for approval. The 503 is a signal, not a placeholder. Webhook routes (`/api/payments/webhook`) handle the actual confirmation downstream — they remain unchanged.
