// lib/payments/index.ts
// Forge-local payment helpers: per-vertical PRICES + static Payoneer
// fallback links. Crypto invoice creation moved to @bizlegal/payment
// (createNowPaymentsInvoiceRaw) on Phase AA Day 6 — single source of
// truth for the NOWPayments fetch + retry behaviour. Do NOT add a new
// `createNOWPaymentsInvoice` function here.

// ── Prices (USD) ─────────────────────────────────────────────────────────────

export const PRICES = {
  scan: { crypto: 97, fiat: 119 },
  passport: { crypto: 297, fiat: 347 },
  // boi fiat collapsed to the canonical $149 (was $169) to match the
  // pricing page and PRODUCTS.forge_boi_kit; hub price-map accepts both.
  boi: { crypto: 149, fiat: 149 },
}

// ── Payoneer Links (static, from env) ────────────────────────────────────────
// Payoneer is a Forge-only fallback (static envs, not API). Stays here.

export function getPayoneerLink(product: 'scan' | 'passport'): string {
  if (product === 'passport') {
    return process.env.PAYONEER_PASSPORT_LINK ?? ''
  }
  return process.env.PAYONEER_SCAN_LINK ?? ''
}
