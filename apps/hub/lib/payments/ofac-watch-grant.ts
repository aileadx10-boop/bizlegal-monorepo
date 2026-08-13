import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * OFAC Watcher activation write-through (W2-6, O-008).
 *
 * /tools/ofac-watcher registers the customer's addresses as status='pending'
 * before sending them to checkout. When the payment webhook confirms an
 * ofac_watch_monthly order, this flips that email's pending rows to 'active' —
 * the state /api/cron/ofac-watch screens on. Without it a paid subscriber is
 * never screened, and without the pending stage anyone could get free
 * monitoring by submitting the form and abandoning checkout.
 *
 * Keyed by EMAIL (case-insensitive), consistent with the other grant helpers:
 * the watchlist is stored under the email typed into the tool, which may
 * differ in case from the one on the payment order. Never throws into the
 * webhook flow.
 */
export async function grantOfacWatch(
  supabase: SupabaseClient,
  order: { product?: string | null; user_email?: string | null },
): Promise<void> {
  if (order.product !== 'ofac_watch_monthly') return
  const email = order.user_email
  if (!email) return

  try {
    const { error } = await supabase
      .from('watched_addresses')
      .update({ status: 'active' })
      .ilike('email', email)
      .eq('status', 'pending')

    if (error) {
      console.warn('[ofac-watch-grant] activation failed:', error.message)
    }
  } catch (err) {
    console.warn('[ofac-watch-grant] threw:', err instanceof Error ? err.message : err)
  }
}
