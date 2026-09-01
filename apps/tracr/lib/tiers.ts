/* ─── TRACR tier definitions — single source of truth ──────────────────────
   Prices (USD) must match app/pricing/page.tsx. Both checkout routes
   (/api/scan/checkout → NOWPayments crypto, /api/create-order → PayPal card)
   read from this map so crypto and card can never diverge. */
export const TIER_PRICES_USD: Record<string, number> = {
  regulatory: 29,
  standard: 149,
  professional: 349,
  enterprise: 799,
}

export function isValidTier(tier: string): boolean {
  return tier in TIER_PRICES_USD
}
