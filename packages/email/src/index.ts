/**
 * @bizlegal/email — the single outbound email path for the whole fleet.
 *
 * Before this package there were 22 separate senders (7 TypeScript wrappers,
 * 15 Python call sites) plus ~25 inline fetches that bypassed even their own
 * app's wrapper. Consent was enforced in exactly one of them. That is why a
 * double-opt-in fix applied to five hub endpoints did not actually make the
 * fleet safe: the other senders never asked.
 *
 * The gate lives HERE, not in the callers, because a caller that forgets is
 * indistinguishable from a caller that decided not to. Every send goes through
 * `sendEmail`, and every send checks suppression first.
 *
 * Two kinds, and the difference matters:
 *   - 'transactional' — a reply to something the person just did (receipt,
 *     report delivery, the double-opt-in confirmation itself, password reset).
 *     Suppression still applies. Consent is NOT required: requiring opt-in to
 *     send a confirmation request would be circular, and withholding a receipt
 *     from a paying customer is worse than useless.
 *   - 'marketing'     — anything they did not just ask for (nurture, digest,
 *     newsletter, upsell). Requires double_optin_confirmed = true.
 *
 * Runtime: no SDK, no supabase-js — raw fetch only, so this runs unchanged on
 * Node, Next.js route handlers, and Cloudflare Workers. (services/worker had to
 * hand-roll its own ops-log client precisely because the shared package pulled
 * in supabase-js, which does not run on Workers. Not repeating that mistake.)
 */

const RESEND_URL = 'https://api.resend.com/emails'

export type EmailKind = 'transactional' | 'marketing'

export interface EmailConfig {
  readonly resendApiKey?: string
  readonly from?: string
  readonly replyTo?: string
  readonly supabaseUrl?: string
  readonly supabaseKey?: string
}

export interface SendEmailInput {
  readonly to: string
  readonly subject: string
  readonly text?: string
  readonly html?: string
  /** Defaults to 'marketing' — the safe default. Opt IN to bypassing consent. */
  readonly kind?: EmailKind
  readonly from?: string
  readonly replyTo?: string
  readonly headers?: Record<string, string>
  /**
   * Resend Idempotency-Key. If a transient 5xx lands after Resend already
   * accepted the message, a retry with the same key collapses to one delivery.
   */
  readonly idempotencyKey?: string
}

export type SendEmailResult =
  | { readonly ok: true; readonly id?: string; readonly kind: EmailKind }
  | { readonly ok: false; readonly error: SendEmailError; readonly detail?: string }

export type SendEmailError =
  | 'not_configured'
  | 'no_body'
  | 'invalid_recipient'
  | 'suppressed'
  | 'not_confirmed'
  | 'send_failed'

/**
 * Env without depending on @types/node. Cloudflare Workers has no `process` at
 * all, so this reads through globalThis and falls back to an empty object —
 * callers there pass an explicit EmailConfig instead.
 */
function readEnv(): Record<string, string | undefined> {
  const g = globalThis as { process?: { env?: Record<string, string | undefined> } }
  return g.process?.env ?? {}
}

function readConfig(cfg?: EmailConfig): Required<Pick<EmailConfig, 'from' | 'replyTo'>> & EmailConfig {
  const env = readEnv()
  return {
    resendApiKey: cfg?.resendApiKey ?? env.RESEND_API_KEY,
    supabaseUrl: cfg?.supabaseUrl ?? env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL,
    supabaseKey: cfg?.supabaseKey ?? env.SUPABASE_SERVICE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY,
    from: cfg?.from ?? env.RESEND_FROM ?? 'BizLegal AI <intelligence@intelligence.bizlegal-ai.com>',
    replyTo: cfg?.replyTo ?? env.RESEND_REPLY_TO ?? 'team@bizlegal-ai.com',
  }
}

function isEmail(v: string): boolean {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
}

/** PostgREST GET returning rows, or null when the store is unreachable. */
async function restSelect(
  cfg: EmailConfig,
  path: string,
): Promise<ReadonlyArray<Record<string, unknown>> | null> {
  if (!cfg.supabaseUrl || !cfg.supabaseKey) return null
  try {
    const res = await fetch(`${cfg.supabaseUrl}/rest/v1/${path}`, {
      headers: {
        apikey: cfg.supabaseKey,
        Authorization: `Bearer ${cfg.supabaseKey}`,
        'user-agent': 'bizlegal-agent/1.0',
      },
    })
    if (!res.ok) return null
    return (await res.json()) as ReadonlyArray<Record<string, unknown>>
  } catch {
    return null
  }
}

/**
 * True when the address must never be emailed. A lookup failure returns TRUE:
 * if we cannot prove an address is safe to mail, we do not mail it. This is the
 * opposite of the fc_flags kill-switch that failed open and let cold email
 * through — the direction of a failed check is a safety decision, not a detail.
 */
export async function isSuppressed(email: string, cfg?: EmailConfig): Promise<boolean> {
  const c = readConfig(cfg)
  if (!c.supabaseUrl || !c.supabaseKey) return false // no store configured at all: nothing to check against
  const rows = await restSelect(c, `email_suppression_list?email=ilike.${encodeURIComponent(email)}&select=email&limit=1`)
  if (rows === null) return true // store unreachable — refuse rather than guess
  return rows.length > 0
}

/** True when the address has completed double opt-in. */
export async function hasMarketingConsent(email: string, cfg?: EmailConfig): Promise<boolean> {
  const c = readConfig(cfg)
  const rows = await restSelect(
    c,
    `newsletter_subscribers?email=eq.${encodeURIComponent(email)}&select=double_optin_confirmed&limit=1`,
  )
  const row = rows?.[0]
  if (!row) return false
  return row.double_optin_confirmed === true
}

export async function sendEmail(input: SendEmailInput, cfg?: EmailConfig): Promise<SendEmailResult> {
  const c = readConfig(cfg)
  const kind: EmailKind = input.kind ?? 'marketing'
  const to = (input.to ?? '').trim().toLowerCase()

  if (!isEmail(to)) return { ok: false, error: 'invalid_recipient' }
  if (!input.text && !input.html) return { ok: false, error: 'no_body' }
  if (!c.resendApiKey) return { ok: false, error: 'not_configured' }

  // Suppression applies to every kind, including receipts. An address on this
  // list has bounced, complained, or asked us to stop.
  if (await isSuppressed(to, c)) return { ok: false, error: 'suppressed' }

  if (kind === 'marketing' && !(await hasMarketingConsent(to, c))) {
    return { ok: false, error: 'not_confirmed' }
  }

  const body: Record<string, unknown> = {
    from: input.from ?? c.from,
    to,
    subject: input.subject,
    reply_to: input.replyTo ?? c.replyTo,
  }
  if (input.text) body.text = input.text
  if (input.html) body.html = input.html
  if (input.headers) body.headers = input.headers

  const headers: Record<string, string> = {
    Authorization: `Bearer ${c.resendApiKey}`,
    'content-type': 'application/json',
    // Cloudflare blocks the default fetch UA for this account.
    'user-agent': 'bizlegal-agent/1.0',
  }
  if (input.idempotencyKey) headers['Idempotency-Key'] = input.idempotencyKey

  try {
    const res = await fetch(RESEND_URL, { method: 'POST', headers, body: JSON.stringify(body) })
    if (!res.ok) {
      const detail = (await res.text().catch(() => '<unreadable>')).slice(0, 300)
      return { ok: false, error: 'send_failed', detail: `${res.status}: ${detail}` }
    }
    const payload = (await res.json().catch(() => ({}))) as { id?: string }
    return { ok: true, id: payload.id, kind }
  } catch (err) {
    return { ok: false, error: 'send_failed', detail: err instanceof Error ? err.message : 'network_error' }
  }
}
