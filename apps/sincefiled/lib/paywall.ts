/**
 * SinceFiled free-tier paywall: ≤3 obligations free; 4th+ requires Firm/Lifetime.
 * Local mode uses obligation count from state store.
 */
import { readFirmState } from './state/store'
import { canUseLive, getSupabase } from './supabase'

export const FREE_LIMIT = 3

export async function canCreateObligation(): Promise<{ allowed: boolean; current: number; limit: number; paywall?: boolean }> {
  if (canUseLive()) {
    const s = getSupabase()
    const { count, error } = await s.from('sf_obligations').select('*', { count: 'exact', head: true })
    if (error) return { allowed: true, current: 0, limit: FREE_LIMIT }
    return { allowed: (count ?? 0) < FREE_LIMIT, current: count ?? 0, limit: FREE_LIMIT, paywall: (count ?? 0) >= FREE_LIMIT }
  }
  const firm = await readFirmState()
  return { allowed: firm.entitled || firm.obligations.length < FREE_LIMIT, current: firm.obligations.length, limit: FREE_LIMIT, paywall: !firm.entitled && firm.obligations.length >= FREE_LIMIT }
}

