/**
 * SinceFiled free-tier paywall: ≤3 obligations free; 4th+ requires Firm/Lifetime.
 * Local mode uses obligation count from state store.
 */
import { readFirmState } from './state/store'

export const FREE_LIMIT = 3

export async function canCreateObligation(ownerEmail?: string): Promise<{ allowed: boolean; current: number; limit: number; paywall?: boolean }> {
  const firm = await readFirmState(ownerEmail)
  return { allowed: firm.entitled || firm.obligations.length < FREE_LIMIT, current: firm.obligations.length, limit: FREE_LIMIT, paywall: !firm.entitled && firm.obligations.length >= FREE_LIMIT }
}

