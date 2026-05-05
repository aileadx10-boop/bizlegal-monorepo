/**
 * Subdomain-side enqueue helper for lead_nurture_state.
 *
 * Each subdomain receives leads via the HMAC-verified
 * /api/inbound-lead endpoint. After verifying + logging, the route
 * calls this to add a row to `lead_nurture_state` so the CF Worker
 * sends a welcome email in 5 min and runs the 4-step cadence.
 *
 * Uses raw fetch (no @supabase/supabase-js dependency) to keep the
 * subdomain bundle small. Identical pattern across forge/docai/
 * lexaudit/tracr — duplicated rather than lifted to a workspace
 * package because the surface area is tiny and each app builds
 * independently. Lift to packages/ when a 5th caller appears.
 *
 * Schema: apps/hub/supabase/migrations/20260505_lead_nurture_state.sql
 *
 * Fire-and-forget. Returns true on success or idempotent skip (lead
 * already enqueued). Returns false on transport/config failure —
 * caller should NOT block the lead-capture response on this.
 */

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

export interface SubdomainEnqueueArgs {
  readonly lead_id: string
  readonly email: string
  readonly vertical: NurtureVertical
  readonly source: string
  readonly lead_classification?: Record<string, unknown>
  readonly welcome_delay_minutes?: number
}

export async function enqueueNurture(args: SubdomainEnqueueArgs): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.warn('[nurture] SUPABASE_URL/KEY missing; skipping enqueue')
    return false
  }
  if (!args.lead_id || !args.email || !args.vertical || !args.source) {
    console.warn('[nurture] enqueue called with missing fields')
    return false
  }

  const delay = args.welcome_delay_minutes ?? 5
  const next_send_at = new Date(Date.now() + delay * 60_000).toISOString()

  try {
    const res = await fetch(`${url}/rest/v1/lead_nurture_state`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        // Idempotent on the unique lead_id index. 409 = already
        // enqueued; we treat that as success (no-op).
        Prefer: 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify({
        lead_id: args.lead_id,
        email: args.email.toLowerCase().trim(),
        vertical: args.vertical,
        source: args.source,
        lead_classification: args.lead_classification ?? null,
        next_step: 'welcome',
        next_send_at,
      }),
    })

    if (res.ok || res.status === 409) return true
    const detail = await res.text().catch(() => '')
    console.warn(`[nurture] enqueue ${res.status}: ${detail.slice(0, 160)}`)
    return false
  } catch (err) {
    console.warn(`[nurture] enqueue exception:`, err)
    return false
  }
}
