import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Conductor tier write-through.
 *
 * When a payment_orders row with product='conductor' transitions to active,
 * the hub (the payment authority) writes the entitled tier straight onto the
 * user's conductor_profiles row — so a paying customer is upgraded in real
 * time, not only at their next sign-in.
 *
 * Keyed by EMAIL (case-insensitive), NOT by id, on purpose: conductor_profiles.id
 * is a FK to auth.users(id), which may not exist yet if the customer paid before
 * creating an account. An update-by-email is a safe no-op in that case, and the
 * docai login read-through (resolveEntitledTier) grants the tier when they do
 * sign in. Belt and suspenders; never throws into the webhook flow.
 */
const SEATS_MAX_BY_TIER: Record<string, number> = { solo: 1, team: 5, firm: 999 }

export async function grantConductorTier(
  supabase: SupabaseClient,
  order: { product?: string | null; tier?: string | null; user_email?: string | null },
): Promise<void> {
  if (order.product !== 'conductor') return
  const email = order.user_email
  if (!email) return
  const tier = order.tier === 'team' || order.tier === 'firm' ? order.tier : 'solo'

  try {
    const { error } = await supabase
      .from('conductor_profiles')
      .update({
        tier,
        seats_max: SEATS_MAX_BY_TIER[tier] ?? 1,
        updated_at: new Date().toISOString(),
      })
      .ilike('email', email)
    if (error) {
      console.warn('[conductor-grant] update failed:', error.message)
    }
  } catch (err) {
    console.warn('[conductor-grant] threw:', err instanceof Error ? err.message : err)
  }
}
