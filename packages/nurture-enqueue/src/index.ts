/**
 * @bizlegal/nurture-enqueue — subdomain-side enqueue helper for
 * lead_nurture_state.
 *
 * Replaces 5 byte-identical apps/<sub>/lib/nurture-enqueue.ts files
 * (forge / brai / docai / lexaudit / tracr) per the F-9 finding from
 * INTEGRATION-V3 audit (2026-05-09).
 *
 * Each subdomain receives leads via the HMAC-verified
 * /api/inbound-lead endpoint or its decision-tree counterpart. After
 * verifying + logging, the route calls this to add a row to
 * `lead_nurture_state` so the CF Worker sends a welcome email in 5 min
 * and runs the 4-step cadence.
 *
 * Uses raw fetch (no @supabase/supabase-js dependency) to keep the
 * subdomain bundle small.
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

export interface EnqueueArgs {
  readonly lead_id: string
  readonly email: string
  readonly vertical: NurtureVertical
  readonly source: string
  readonly lead_classification?: Record<string, unknown>
  /** Override default 5-min welcome delay (e.g., immediate for hot leads). */
  readonly welcome_delay_minutes?: number
}

/** Backwards-compatible alias from the per-subdomain shim. */
export type SubdomainEnqueueArgs = EnqueueArgs

/**
 * Phase AA D13 — INTEGRATION-V3 B-5 mitigation, Option A:
 * skip-on-existing-active-sequence. By default, if the same email
 * already has an unarchived nurture row anywhere in the system, we
 * skip the new insert. This prevents the spam-complaint scenario
 * where a single email lands in two parallel cadences from two
 * different verticals (8 emails over 10 days, 2 voices, 2 products).
 *
 * Override behaviour:
 *   NURTURE_CROSS_VERTICAL_POLICY=allow_parallel
 *     → revert to pre-D13 behaviour (every vertical gets its own row;
 *       lead_id-based dedupe only, not email-based)
 *   NURTURE_CROSS_VERTICAL_POLICY=skip_on_existing  (DEFAULT)
 *     → check for any unarchived row with this email; skip insert if found
 *
 * The env knob is server-side per Vercel project. To allow product to
 * reverse the default for one subdomain (e.g. forge wants parallel for
 * BOI + sanctions on the same lead), set the env there only.
 */
const POLICY_ALLOW_PARALLEL = 'allow_parallel'

async function emailHasActiveSequence(
  url: string,
  key: string,
  email: string,
): Promise<boolean> {
  const lc = email.toLowerCase().trim()
  // Encode the email so PostgREST treats `+` and other reserved chars as data.
  const safeEmail = encodeURIComponent(lc)
  const queryUrl =
    `${url}/rest/v1/lead_nurture_state?select=id` +
    `&email=eq.${safeEmail}` +
    `&archived_at=is.null` +
    `&limit=1`
  try {
    const res = await fetch(queryUrl, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    })
    if (!res.ok) return false
    const rows = (await res.json().catch(() => [])) as unknown[]
    return rows.length > 0
  } catch {
    // If the lookup fails (transient network, Supabase blip), fail OPEN
    // and allow the insert. The unique index on lead_id still catches
    // exact re-inserts; the only thing the lookup defended against is
    // the cross-vertical case, which is a UX issue, not a correctness one.
    return false
  }
}

export async function enqueueNurture(args: EnqueueArgs): Promise<boolean> {
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

  const policy = process.env.NURTURE_CROSS_VERTICAL_POLICY
  if (policy !== POLICY_ALLOW_PARALLEL) {
    // Default = skip-on-existing. Look up before insert.
    const exists = await emailHasActiveSequence(url, key, args.email)
    if (exists) {
      console.info(
        `[nurture] cross-vertical skip — email already has an active sequence (lead_id=${args.lead_id})`,
      )
      // Treat as idempotent success so the caller's UX shows "saved".
      return true
    }
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
