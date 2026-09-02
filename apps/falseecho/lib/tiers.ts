/* ─── FalseEcho tier definitions — single source of truth ──────────────────
   Prices (USD) must match app/pricing/page.tsx and the hub SKU entries in
   apps/hub/lib/payments/price-map.ts (product `falseecho`). Both checkout
   routes (/api/create-order → PayPal card, /api/payments/nowpayments/start →
   crypto) read from this map so card and crypto can never diverge. */
export const TIER_PRICES_USD: Record<string, number> = {
  audit: 29,
  monitor: 149,
}

export const TIER_INTERVALS: Record<string, 'one-time' | 'monthly'> = {
  audit: 'one-time',
  monitor: 'monthly',
}

export function isValidTier(tier: string): boolean {
  return tier in TIER_PRICES_USD
}
