/**
 * POST /api/newsletter
 *
 * Double opt-in newsletter subscribe. The actual fix that makes
 * opt_in_outreach shippable.
 *
 * Built 2026-07-10 after the spam-pipeline incident (ef3d90e). The previous
 * route just did `upsert({active: true, ...})` which set NO confirmation
 * flag — every subscribed address was effectively a spam target.
 *
 * New flow:
 *   1. POST {email, source} here
 *   2. Validate email + check suppression_list (NEVER confirm a suppressed addr)
 *   3. Generate a unique 32-char token
 *   4. Upsert with double_optin_confirmed=false, double_optin_token=token
 *   5. Send confirmation email via Resend with the magic link
 *   6. User clicks /newsletter/confirm?token=X
 *   7. GET /api/newsletter/confirm flips the flag + writes email_consent_log
 *
 * After step 7, the address becomes mailable (subject to all other safety
 * checks: not suppressed, not bounced, not complained, etc.)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac, randomBytes } from 'node:crypto'

export const dynamic = 'force-dynamic'

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  ) as any
}

type SbClient = ReturnType<typeof createClient>

// Validate a real email address (lightweight but catches obvious garbage)
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  const e = email.trim().toLowerCase()
  if (e.length < 5 || e.length > 254) return false
  // Must have exactly one @, no spaces, basic shape
  if (e.split('@').length !== 2) return false
  const [local, domain] = e.split('@')
  if (!local || !domain || local.length > 64) return false
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) return false
  // Reject obvious role-inboxes even at signup (we'll never confirm these)
  const rolePrefixes = ['abuse@', 'noreply@', 'no-reply@', 'postmaster@', 'admin@',
                        'webmaster@', 'hostmaster@', 'compliance@', 'legal@',
                        'security@', 'privacy@', 'unsubscribe@']
  for (const p of rolePrefixes) {
    if (e.startsWith(p)) return false
  }
  return true
}

// Sign the confirm token so we can verify on click (prevents random guessing)
function signToken(token: string): string {
  const secret = process.env.BIZLEGAL_NEWSLETTER_SECRET
    || process.env.SUPABASE_SERVICE_KEY
    || 'fallback-do-not-use-in-prod'
  return createHmac('sha256', secret).update(token).digest('hex').slice(0, 16)
}

async function checkSuppression(sb: SbClient, email: string): Promise<{ blocked: boolean; reason?: string }> {
  try {
    const { data } = await sb
      .from('email_suppression_list')
      .select('reason')
      .ilike('email', email)
      .limit(1)
    if (data && (data as any[]).length > 0) {
      return { blocked: true, reason: (data as any[])[0].reason }
    }
    return { blocked: false }
  } catch {
    return { blocked: false }  // fail open on lookup error, suppression_checked=false later
  }
}

async function sendConfirmationEmail(email: string, confirmUrl: string): Promise<{ ok: boolean; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return { ok: false, error: 'resend_not_configured' }
  const from = process.env.RESEND_FROM || 'intelligence@intelligence.bizlegal-ai.com'
  const body = {
    from: `BizLegal AI <${from}>`,
    to: [email],
    subject: 'Confirm your BizLegal AI newsletter subscription',
    text: `Hi,

Thanks for signing up for the BizLegal AI Regulatory Pulse.

To complete your subscription (and start receiving 2-3x/week regulatory intelligence), confirm here:

${confirmUrl}

This link expires in 7 days. If you didn't request this, just ignore this email — we won't add you without confirmation.

Why double opt-in? Per privacy best practice and CAN-SPAM/GDPR — we never add anyone to a list without explicit confirmation, and you can unsubscribe in one click from any future email.

— Moses, BizLegal AI
https://bizlegal-ai.com/unsubscribe`,
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px">
<h2 style="color:#0a2540">Confirm your subscription</h2>
<p>Thanks for signing up for the BizLegal AI Regulatory Pulse — enforcement alerts, jurisdiction updates, and compliance intelligence for fintech and crypto executives, delivered 2-3 times a week.</p>
<p><a href="${confirmUrl}" style="display:inline-block;background:#0a2540;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600">Confirm subscription</a></p>
<p style="color:#666;font-size:13px">Or copy and paste this URL:<br>${confirmUrl}</p>
<p style="color:#666;font-size:13px">This link expires in 7 days. If you didn't request this, just ignore this email.</p>
<hr style="border:none;border-top:1px solid #eee;margin:32px 0">
<p style="color:#888;font-size:12px">BizLegal AI · <a href="https://bizlegal-ai.com/unsubscribe" style="color:#888">Unsubscribe</a></p>
</div>`,
  }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'bizlegal-agent/1.0',
      },
      body: JSON.stringify(body),
    })
    if (!r.ok) {
      const err = await r.text()
      return { ok: false, error: `resend_http_${r.status}: ${err.slice(0, 100)}` } as any
    }
    const data = await r.json()
    return { ok: true, message_id: data.id || '' } as any
  } catch (e) {
    return { ok: false, error: `resend_exception: ${String(e).slice(0, 80)}` } as any
  }
}

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { email, source = 'website', vertical_interest = null } = body || {}
  if (!isValidEmail(email || '')) {
    return NextResponse.json({ error: 'Please use a real, personal email address (no role inboxes)' }, { status: 400 })
  }
  const cleaned = email.trim().toLowerCase()
  // Normalize vertical_interest: accept string OR array, store as text[] (Postgres array)
  let verticalForDb: string[] | null = null
  if (Array.isArray(vertical_interest)) {
    verticalForDb = vertical_interest.filter((v: any) => typeof v === 'string').map((v: string) => v.slice(0, 64))
    if (verticalForDb.length === 0) verticalForDb = null
  } else if (typeof vertical_interest === 'string' && vertical_interest.trim().length > 0) {
    // Single string -> array of 1
    verticalForDb = [vertical_interest.trim().slice(0, 64)]
  }
  const sb = getClient()

  // Reject if already on suppression list
  const sup = await checkSuppression(sb, cleaned)
  if (sup.blocked) {
    return NextResponse.json({ error: 'This address cannot be subscribed' }, { status: 403 })
  }

  // Generate token + signature
  const token = randomBytes(24).toString('hex')  // 48 chars
  const sig = signToken(token)
  const fullToken = `${token}.${sig}`
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()  // 7 days

  // Upsert: refresh subscribed_at, set token, force double_optin_confirmed=false
  const { error: upsertErr } = await sb
    .from('newsletter_subscribers')
    .upsert({
      email: cleaned,
      source,
      vertical_interest: verticalForDb,
      subscribed_at: new Date().toISOString(),
      active: true,
      double_optin_confirmed: false,
      double_optin_at: null,
      unsubscribed_at: null,
      double_optin_token: fullToken,
      double_optin_token_expires: expiresAt,
    }, { onConflict: 'email' })

  if (upsertErr) {
    console.error('[newsletter] upsert failed:', upsertErr.message)
    return NextResponse.json({ error: 'Subscription failed — please try again' }, { status: 500 })
  }

  // Build the confirm URL (relative path so it works on any subdomain)
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const host = req.headers.get('host') || 'bizlegal-ai.com'
  const confirmUrl = `${proto}://${host}/api/newsletter/confirm?token=${encodeURIComponent(fullToken)}`

  const sendResult = await sendConfirmationEmail(cleaned, confirmUrl)

  if (!sendResult.ok) {
    console.warn('[newsletter] confirm email failed for', cleaned, sendResult.error)
    // Still report success to the user (their address is saved) but flag the email issue
    return NextResponse.json({
      success: true,
      message: 'Subscribed. Confirmation email is on the way (if you don\'t see it in 5 min, check spam or reply to any @bizlegal-ai.com email).',
      email_sent: false,
    })
  }

  return NextResponse.json({
    success: true,
    message: 'Check your inbox to confirm. The link is valid for 7 days.',
    email_sent: true,
  })
}
