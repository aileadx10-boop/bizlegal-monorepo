/**
 * Bank Wire Payment Helper — 2026-05-20
 *
 * Reads receiving-account details from encrypted Vercel env vars
 * (BANK_EUR_* + BANK_USD_*). Never log these values, never commit
 * them, never return them to the browser as plaintext beyond the
 * email body sent to the buyer who has placed an order.
 *
 * Why bank-wire only for high-ticket SKUs (>= $500 / €500):
 *   - Reconciliation is manual ops (Moses checks Payoneer, marks order paid)
 *   - Per-order overhead is fixed; only worth it for big tickets
 *   - Low-ticket items already covered by NOWPayments + PayPal Orders API
 *
 * Reconciliation:
 *   When wire lands, Moses POSTs to /api/payments/wire/confirm with
 *   {order_id, amount_received_cents} from the Payoneer notification.
 *   That route flips status: pending_wire -> active, fires payment.confirmed.
 */

export type WireCurrency = 'USD' | 'EUR'

export interface WireDetails {
  bankName: string
  bankAddress: string
  beneficiary: string
  // EUR side
  iban?: string
  bic?: string
  // USD side
  routing?: string
  swift?: string
  accountNumber?: string
  accountType?: string
}

export function isWireConfigured(currency: WireCurrency): boolean {
  if (currency === 'EUR') {
    return Boolean(process.env.BANK_EUR_IBAN && process.env.BANK_EUR_BIC && process.env.BANK_EUR_BENEFICIARY)
  }
  return Boolean(
    process.env.BANK_USD_ACCOUNT &&
      process.env.BANK_USD_ROUTING &&
      process.env.BANK_USD_BENEFICIARY,
  )
}

export function getWireDetails(currency: WireCurrency): WireDetails | null {
  if (!isWireConfigured(currency)) return null
  if (currency === 'EUR') {
    return {
      bankName: process.env.BANK_EUR_NAME ?? '',
      bankAddress: process.env.BANK_EUR_ADDRESS ?? '',
      beneficiary: process.env.BANK_EUR_BENEFICIARY ?? '',
      iban: process.env.BANK_EUR_IBAN,
      bic: process.env.BANK_EUR_BIC,
    }
  }
  return {
    bankName: process.env.BANK_USD_NAME ?? '',
    bankAddress: process.env.BANK_USD_ADDRESS ?? '',
    beneficiary: process.env.BANK_USD_BENEFICIARY ?? '',
    routing: process.env.BANK_USD_ROUTING,
    swift: process.env.BANK_USD_SWIFT,
    accountNumber: process.env.BANK_USD_ACCOUNT,
    accountType: process.env.BANK_USD_ACCOUNT_TYPE,
  }
}

/**
 * Unique reference code for the buyer to put in the wire memo so we can
 * reconcile the deposit against the payment_orders row. Short, all-caps,
 * easy to type, derived from the order UUID's first 8 chars.
 */
export function wireReferenceFromOrderId(orderId: string): string {
  const hex = orderId.replace(/-/g, '').slice(0, 8).toUpperCase()
  return `BL-${hex}`
}

/**
 * Threshold for offering bank wire as a payment option (in USD cents).
 * Reconciliation overhead per order doesn't pay off below this number.
 */
export const WIRE_MIN_ORDER_CENTS = 500_00 // $500 / €500
