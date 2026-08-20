import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * CASP bundle access write-through (W4-12, O-014).
 *
 * When a payment_orders row with product='casp_bundle_monthly' transitions to
 * active, the hub (the payment authority) upserts an active row onto the
 * customer's casp_bundle_subs — so a paying customer has bundle access in
 * real time, not only at their next sign-in.
 *
 * Keyed by EMAIL (case-insensitive), NOT by id, on purpose: casp_bundle_subs.id
 * is not tied to auth.users(id), which may not exist yet if the customer paid
 * before creating an account. An upsert-by-email is a safe no-op in that case,
 * and the bundle landing page read-through grants access when they do sign in.
 * Belt and suspenders; never throws into the webhook flow.
 */
export async function grantCaspBundle(
  supabase: SupabaseClient,
  order: { product?: string | null; user_email?: string | null },
): Promise<void> {
  if (order.product !== 'casp_bundle_monthly') return
  const email = order.user_email
  if (!email) return

  try {
    const { error } = await supabase.from('casp_bundle_subs').upsert(
      {
        user_email: email.toLowerCase(),
        status: 'active',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_email' },
    )
    if (error) {
      console.warn('[casp-bundle-grant] upsert failed:', error.message)
    }
  } catch (err) {
    console.warn('[casp-bundle-grant] threw:', err instanceof Error ? err.message : err)
  }
}
