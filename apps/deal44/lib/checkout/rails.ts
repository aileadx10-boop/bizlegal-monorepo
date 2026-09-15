/**
 * Which SKU a buyer is choosing, and which rail can actually carry it.
 *
 * Two currencies, one product. The room is priced in shekels (₪2,500) and sold
 * outside Israel at the dollar twin of that number; both are the same room,
 * set up and run for one transaction.
 *
 * **Why ILS is crypto-only.** NOWPayments prices an invoice in fiat and settles
 * in crypto, so a shekel price is a number it converts — that path works.
 * PayPal cannot RECEIVE shekels, so a shekel card order would be created and
 * then fail to settle. The hub's `/api/pay/start` refuses that combination with
 * a 503; this table refuses it one step earlier so the buyer never sees a
 * button that cannot work. It is a rail limitation, not a policy — a shekel
 * card payment is taken by invoice instead.
 *
 * **Why the amounts are repeated here.** `packages/payment/src/products.ts` is
 * the registry and the only thing that sets the charge; this app does not
 * depend on that package, so these two numbers are a mirror used for display
 * only. `tests/pure.test.ts` pins them, and the price the customer is actually
 * charged always comes back from the hub — never from this file.
 */

export type Deal44Currency = 'ILS' | 'USD'
export type Gateway = 'crypto' | 'card'
export type Deal44SetupProduct = 'deal44_room_setup_ils' | 'deal44_room_setup_usd'

export interface RoomSetupOption {
  readonly currency: Deal44Currency
  readonly productId: Deal44SetupProduct
  /** Agorot for ILS, cents for USD. Display only — see the file docblock. */
  readonly amountMinorUnits: number
  readonly gateways: readonly Gateway[]
}

export const ROOM_SETUP: Readonly<Record<Deal44Currency, RoomSetupOption>> = {
  ILS: {
    currency: 'ILS',
    productId: 'deal44_room_setup_ils',
    amountMinorUnits: 250_000,
    gateways: ['crypto'],
  },
  USD: {
    currency: 'USD',
    productId: 'deal44_room_setup_usd',
    // The FX twin of ₪2,500 at 3.68 ILS/USD, the rate recorded in the registry
    // on 2026-09-15. Moves only when that constant moves.
    amountMinorUnits: 67_900,
    gateways: ['crypto', 'card'],
  },
}

export const CURRENCIES: readonly Deal44Currency[] = ['ILS', 'USD']

export function isDeal44Currency(value: unknown): value is Deal44Currency {
  return value === 'ILS' || value === 'USD'
}

export function isGateway(value: unknown): value is Gateway {
  return value === 'crypto' || value === 'card'
}

export function optionFor(currency: Deal44Currency): RoomSetupOption {
  return ROOM_SETUP[currency]
}

/** True only for a pair the rail can settle. Fails closed on anything unknown. */
export function railAllowed(currency: unknown, gateway: unknown): boolean {
  if (!isDeal44Currency(currency) || !isGateway(gateway)) return false
  return ROOM_SETUP[currency].gateways.includes(gateway)
}

/** The locale a buyer paying in this currency is most likely reading in. */
export function defaultLocaleFor(currency: Deal44Currency): 'he-IL' | 'en-US' {
  return currency === 'ILS' ? 'he-IL' : 'en-US'
}
