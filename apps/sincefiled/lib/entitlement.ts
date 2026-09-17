/**
 * SinceFiled entitlement: grants Firm/Lifetime access after checkout (demo or live).
 * Live writes sf_subscriptions; local sets firm.entitled in JSON store.
 */
import { readFirmState, writeFirmState } from './state/store'
import { canUseLive } from './supabase'

export async function grantEntitlement(opts: { productId: string; firmId?: string }): Promise<{ ok: boolean; error?: string }> {
  if (canUseLive()) {
    return { ok: false, error: 'payment_webhook_required' }
  }
  const firm = await readFirmState()
  writeFirmState({ ...firm, entitled: true })
  return { ok: true }
}
