/**
 * Shared double-opt-in primitives.
 *
 * Extracted from /api/newsletter on 2026-08-14 so every capture surface uses
 * ONE consent implementation. Before this, /api/newsletter enforced DOI while
 * /api/subscribe, /api/leads, /api/inbound-lead and /api/mica-deadlines/subscribe
 * each mailed or enrolled people straight from a form post — the exact failure
 * the 2026-07-10 no-unconsented-send rule exists to prevent.
 *
 * Contract: nothing may email a person, enqueue them into a nurture cadence, or
 * enrol them in a recurring digest until /api/newsletter/confirm has flipped
 * double_optin_confirmed and written email_consent_log. Product signup rows
 * therefore land as status='pending' and are activated by that confirm step.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { createHmac, randomBytes } from 'node:crypto'

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

/** Role inboxes we will never confirm — they are shared, not personal, consent. */
const ROLE_PREFIXES = [
  'abuse@', 'noreply@', 'no-reply@', 'postmaster@', 'admin@', 'webmaster@',
  'hostmaster@', 'compliance@', 'legal@', 'security@', 'privacy@', 'unsubscribe@',
]

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  const e = email.trim().toLowerCase()
  if (e.length < 5 || e.length > 254) return false
  if (e.split('@').length !== 2) return false
  const [local, domain] = e.split('@')
  if (!local || !domain || local.length > 64) return false
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) return false
  return !ROLE_PREFIXES.some((p) => e.startsWith(p))
}

/** HMAC suffix so a confirm link cannot be guessed for an arbitrary address. */
export function signToken(token: string): string {
  const secret =
    process.env.BIZLEGAL_NEWSLETTER_SECRET ||
    process.env.SUPABASE_SERVICE_KEY ||
    'fallback-do-not-use-in-prod'
  return createHmac('sha256', secret).update(token).digest('hex').slice(0, 16)
}

export async function isSuppressed(sb: SupabaseClient, email: string): Promise<boolean> {
  try {
    const { data } = await sb
      .from('email_suppression_list')
      .select('reason')
      .ilike('email', email)
      .limit(1)
    return Array.isArray(data) && data.length > 0
  } catch {
    // Fail open on lookup error — the send path re-checks suppression.
    return false
  }
}

export interface StartOptInInput {
  readonly sb: SupabaseClient
  readonly email: string
  readonly source: string
  /** Stored so the confirm step can resume the right nurture cadence. */
  readonly verticalInterest?: readonly string[] | string | null
  /** Absolute origin for the confirm link, e.g. https://bizlegal-ai.com */
  readonly origin: string
}

export type StartOptInResult =
  | { ok: true; alreadyConfirmed: boolean; emailSent: boolean }
  | { ok: false; error: 'invalid_email' | 'suppressed' | 'store_failed' }

function normalizeVertical(
  vertical: readonly string[] | string | null | undefined,
): string[] | null {
  if (Array.isArray(vertical)) {
    const list = vertical.filter((v) => typeof v === 'string').map((v) => v.slice(0, 64))
    return list.length > 0 ? list : null
  }
  if (typeof vertical === 'string' && vertical.trim().length > 0) {
    return [vertical.trim().slice(0, 64)]
  }
  return null
}

/**
 * Records the subscriber as unconfirmed and emails them a confirm link.
 *
 * Returns `alreadyConfirmed: true` without re-sending when the address has
 * previously confirmed, so a repeat form post never resets an active
 * subscriber back to pending.
 */
export async function startDoubleOptIn(input: StartOptInInput): Promise<StartOptInResult> {
  const email = input.email.trim().toLowerCase()
  if (!isValidEmail(email)) return { ok: false, error: 'invalid_email' }
  if (await isSuppressed(input.sb, email)) return { ok: false, error: 'suppressed' }

  const { data: existing } = await input.sb
    .from('newsletter_subscribers')
    .select('double_optin_confirmed')
    .eq('email', email)
    .maybeSingle()

  if (existing?.double_optin_confirmed === true) {
    return { ok: true, alreadyConfirmed: true, emailSent: false }
  }

  // Token is "<random>.<sig>" — the confirm route re-signs the random half
  // and rejects any mismatch, so links cannot be forged for other addresses.
  const random = randomBytes(24).toString('hex')
  const token = `${random}.${signToken(random)}`

  const { error: upsertErr } = await input.sb.from('newsletter_subscribers').upsert(
    {
      email,
      source: input.source,
      vertical_interest: normalizeVertical(input.verticalInterest),
      subscribed_at: new Date().toISOString(),
      active: true,
      double_optin_confirmed: false,
      double_optin_at: null,
      unsubscribed_at: null,
      double_optin_token: token,
      double_optin_token_expires: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
    },
    { onConflict: 'email' },
  )

  if (upsertErr) {
    console.error('[optin] upsert failed:', upsertErr.message)
    return { ok: false, error: 'store_failed' }
  }

  const confirmUrl = `${input.origin}/api/newsletter/confirm?token=${encodeURIComponent(token)}`
  const emailSent = await sendConfirmationEmail(email, confirmUrl)
  return { ok: true, alreadyConfirmed: false, emailSent }
}

/** Absolute origin of the current request, for confirm links. */
export function originFromHeaders(headers: { get: (n: string) => string | null }): string {
  const proto = headers.get('x-forwarded-proto') || 'https'
  const host = headers.get('host') || 'bizlegal-ai.com'
  return `${proto}://${host}`
}

async function sendConfirmationEmail(email: string, confirmUrl: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return false
  const from = process.env.RESEND_FROM || 'intelligence@intelligence.bizlegal-ai.com'
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
        // Cloudflare blocks the default fetch UA on this account.
        'User-Agent': 'bizlegal-agent/1.0',
      },
      body: JSON.stringify({
        from: `BizLegal AI <${from}>`,
        to: [email],
        subject: 'Confirm your BizLegal AI subscription',
        text: `Please confirm you want email from BizLegal AI:

${confirmUrl}

This link expires in 7 days. If you didn't request this, ignore this email — we will not add you without confirmation.

— Moses, BizLegal AI`,
        html: `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px">
<h2 style="color:#0a2540">Confirm your subscription</h2>
<p>Please confirm you'd like to receive email from BizLegal AI. We don't add anyone to a list without an explicit confirmation.</p>
<p><a href="${confirmUrl}" style="display:inline-block;background:#0a2540;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600">Confirm subscription</a></p>
<p style="color:#666;font-size:13px">Or paste this URL:<br>${confirmUrl}</p>
<p style="color:#666;font-size:13px">This link expires in 7 days. If you didn't request this, just ignore this email.</p>
<hr style="border:none;border-top:1px solid #eee;margin:32px 0">
<p style="color:#888;font-size:12px">BizLegal AI · <a href="https://bizlegal-ai.com/unsubscribe" style="color:#888">Unsubscribe</a></p>
</div>`,
      }),
    })
    return res.ok
  } catch (err) {
    console.warn('[optin] confirm email failed:', err instanceof Error ? err.message : err)
    return false
  }
}
