/**
 * SinceFiled entitlement: grants Firm/Lifetime access after checkout (demo or live).
 * Live writes sf_subscriptions; local sets firm.entitled in JSON store.
 */
import { readFirmState, writeFirmState } from './state/store'
import { canUseLive, getSupabase } from './supabase'

export async function grantEntitlement(opts: { productId: string; firmId?: string }): Promise<{ ok: boolean; error?: string }> {
  if (canUseLive()) {
    const { error } = await getSupabase().from('sf_subscriptions').insert({
      firm_id: opts.firmId ?? undefined,
      product_id: opts.productId,
      status: 'active',
      entitlement: { unlimited: true },
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }
  const firm = await readFirmState()
  writeFirmState({ ...firm, entitled: true })
  return { ok: true }
}
