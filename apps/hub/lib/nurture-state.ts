/**
 * Hub-side helper for the lead-nurture state machine.
 *
 * Every lead-capture endpoint calls `enqueueNurture()` after the
 * primary `leads` row insert. The Cloudflare Worker
 * (services/worker/src/nurture.ts) reads from `lead_nurture_state`
 * every 5 min and drives the welcome → education → comparison →
 * last_call cadence.
 *
 * Schema: apps/hub/supabase/migrations/20260505_lead_nurture_state.sql
 *
 * Idempotent: re-captures of the same lead_id don't reset the
 * sequence (unique index on lead_id + ON CONFLICT DO NOTHING via
 * Prefer: resolution=ignore-duplicates).
 *
 * Fire-and-forget pattern: callers should NOT await — a Supabase
 * blip shouldn't fail the lead-capture POST. Use:
 *
 *   enqueueNurture({...}).catch((err) => console.warn('[nurture]', err))
 *
 * (The function itself never throws on transport errors; it only
 * throws when given garbage input. catch() above is belt-and-suspenders.)
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type NurtureVertical =
  | 'boi'
  | 'brai'
  | 'tracr'
  | 'lexaudit'
  | 'docai'
  | 'forge'
  | 'leadforge'
  | 'realestate'
  | 'generic'

export interface EnqueueArgs {
  /** Stable identifier for this lead — must be unique per email+context. */
  readonly lead_id: string
  readonly email: string
  readonly vertical: NurtureVertical
  /** Endpoint that captured the lead — for funnel attribution. */
  readonly source: string
  /** Optional EA classifier output (intent, vertical_confidence, stated_pain). */
  readonly lead_classification?: Record<string, unknown>
  /** Override the default 5-min welcome delay (e.g. 0 for immediate, 30 for "hot lead, give them a sec"). */
  readonly welcome_delay_minutes?: number
}

/**
 * Mark every nurture row for `email` as paid. Stops the cadence so
 * the user doesn't get the comparison/last_call upsell after they
 * already paid. Idempotent — re-setting paid is harmless.
 *
 * Called from payment webhooks (NOWPayments, PayPal). One user can
 * have multiple nurture rows (different verticals captured at
 * different times); we paid-flag them all because once a customer
 * converts, every parallel sequence stops.
 *
 * Fire-and-forget. Returns true on success or no-rows-affected;
 * false on transport/config failure.
 */
export async function markNurturePaid(email: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) {
    console.warn('[nurture] SUPABASE_URL/KEY missing; skipping mark-paid')
    return false
  }
  if (!email || !email.includes('@')) return false

  const sb: SupabaseClient = createClient(url, key)
  const normalized = email.toLowerCase().trim()
  try {
    const { error } = await sb
      .from('lead_nurture_state')
      .update({
        payment_status: 'paid',
        next_step: 'done',
        archived_at: new Date().toISOString(),
      })
      .eq('email', normalized)
      .eq('payment_status', 'none') // don't overwrite refunded/intent
    if (error) {
      console.warn(`[nurture] mark-paid failed: ${error.message}`)
      return false
    }
    return true
  } catch (err) {
    console.warn(`[nurture] mark-paid exception:`, err)
    return false
  }
}

/**
 * Insert a row into public.lead_nurture_state. Returns true on
 * success (or no-op idempotent skip), false on transport/config
 * failure. Never throws on transport errors — fire-and-forget safe.
 */
export async function enqueueNurture(args: EnqueueArgs): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) {
    console.warn('[nurture] SUPABASE_URL/KEY missing; skipping enqueue')
    return false
  }
  if (!args.lead_id || !args.email || !args.vertical || !args.source) {
    throw new Error('enqueueNurture requires lead_id, email, vertical, source')
  }

  const sb: SupabaseClient = createClient(url, key)
  const delay = args.welcome_delay_minutes ?? 5
  const next_send_at = new Date(Date.now() + delay * 60_000).toISOString()

  try {
    const { error } = await sb
      .from('lead_nurture_state')
      .insert(
        {
          lead_id: args.lead_id,
          email: args.email.toLowerCase().trim(),
          vertical: args.vertical,
          source: args.source,
          lead_classification: args.lead_classification ?? null,
          next_step: 'welcome',
          next_send_at,
        },
        { count: 'exact' },
      )

    // Unique-violation on lead_id is the idempotent re-capture case;
    // log + return true. Anything else is a genuine error worth logging.
    if (error) {
      const msg = error.message || ''
      if (msg.toLowerCase().includes('duplicate') || error.code === '23505') {
        // already enqueued — fine
        return true
      }
      console.warn(`[nurture] enqueue failed: ${msg}`)
      return false
    }
    return true
  } catch (err) {
    console.warn(`[nurture] enqueue exception:`, err)
    return false
  }
}
