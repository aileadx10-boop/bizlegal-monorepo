/**
 * GET /api/newsletter/confirm?token=XYZ
 *
 * Flips a newsletter subscriber from double_optin_confirmed=false to true,
 * writes the consent_log row, and shows a tiny confirmation page.
 *
 * Token format: "<48-hex-random>.<16-hex-sig>" where sig is HMAC-SHA256 of
 * the random part with BIZLEGAL_NEWSLETTER_SECRET. Verifying the sig
 * prevents random address confirmation by attackers.
 *
 * Built 2026-07-10 as part of the spam-pipeline fix (ef3d90e).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'node:crypto'

export const dynamic = 'force-dynamic'

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  ) as any
}

type SbClient = ReturnType<typeof createClient>

function signToken(token: string): string {
  const secret = process.env.BIZLEGAL_NEWSLETTER_SECRET
    || process.env.SUPABASE_SERVICE_KEY
    || 'fallback-do-not-use-in-prod'
  return createHmac('sha256', secret).update(token).digest('hex').slice(0, 16)
}

function verifyToken(fullToken: string): { ok: boolean; reason?: string } {
  if (!fullToken || typeof fullToken !== 'string') return { ok: false, reason: 'no_token' }
  const parts = fullToken.split('.')
  if (parts.length !== 2) return { ok: false, reason: 'malformed' }
  const [token, sig] = parts
  const expected = signToken(token)
  // constant-time compare via timingSafeEqual
  const a = Buffer.from(sig, 'hex')
  const b = Buffer.from(expected, 'hex')
  if (a.length !== b.length) return { ok: false, reason: 'bad_sig' }
  if (!require('node:crypto').timingSafeEqual(a, b)) return { ok: false, reason: 'bad_sig' }
  return { ok: true }
}

function htmlResponse(status: number, title: string, bodyInner: string): NextResponse {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${title} — BizLegal AI</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:60px auto;padding:24px;color:#1a1a1a}
  h1{font-size:22px;margin-bottom:16px}
  p{line-height:1.55;color:#444}
  a{color:#0a2540;text-decoration:underline}
  .ok{background:#d4edda;border-left:4px solid #28a745;padding:12px 16px;border-radius:4px;margin:16px 0}
  .err{background:#f8d7da;border-left:4px solid #dc3545;padding:12px 16px;border-radius:4px;margin:16px 0}
</style>
</head>
<body>
<h1>${title}</h1>
${bodyInner}
<p style="margin-top:32px;font-size:13px;color:#888">
  <a href="https://bizlegal-ai.com/">Back to bizlegal-ai.com</a>
</p>
</body>
</html>`
  return new NextResponse(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const fullToken = url.searchParams.get('token') || ''
  const v = verifyToken(fullToken)
  if (!v.ok) {
    return htmlResponse(400, 'Invalid confirmation link',
      `<div class="err">This confirmation link is invalid or has been tampered with. If you got this from a real BizLegal AI email, please reply to it and we'll fix it manually.</div>`)
  }
  const sb = getClient()
  // Find the subscriber by token (token is unique per subscriber)
  const { data: rows, error: findErr } = await sb
    .from('newsletter_subscribers')
    .select('id, email, double_optin_token_expires, double_optin_confirmed')
    .eq('double_optin_token', fullToken)
    .limit(1) as any
  if (findErr || !rows || rows.length === 0) {
    return htmlResponse(400, 'Confirmation link not found',
      `<div class="err">This confirmation link is no longer valid. It may have been used already or never existed.</div>`)
  }
  const sub = rows[0]
  if (sub.double_optin_confirmed === true) {
    return htmlResponse(200, 'Already confirmed',
      `<div class="ok">Your subscription is already active. You'll start receiving the Regulatory Pulse within a few days.</div>`)
  }
  // Check expiry
  if (sub.double_optin_token_expires && new Date(sub.double_optin_token_expires) < new Date()) {
    return htmlResponse(410, 'Confirmation link expired',
      `<div class="err">This confirmation link has expired. <a href="https://bizlegal-ai.com/newsletter">Subscribe again</a> to get a fresh link.</div>`)
  }
  // Flip the flag + write consent_log atomically (best effort: do both, log if consent_log insert fails)
  const now = new Date().toISOString()
  const { error: updErr } = await sb
    .from('newsletter_subscribers')
    .update({
      double_optin_confirmed: true,
      double_optin_at: now,
      active: true,
    })
    .eq('id', sub.id)
  if (updErr) {
    console.error('[confirm] update failed:', updErr.message)
    return htmlResponse(500, 'Confirmation failed',
      `<div class="err">Something went wrong on our end. Reply to any past @bizlegal-ai.com email and we'll confirm you manually.</div>`)
  }
  // Write audit-trail consent_log entry
  const { data: cl, error: consentErr } = await sb
    .from('email_consent_log')
    .insert({
      email: sub.email,
      consent_kind: 'double_optin',
      source_table: 'newsletter_subscribers',
      source_id: sub.id,
    })
    .select('id')
    .single()
  if (consentErr) {
    console.warn('[confirm] consent_log insert failed (non-fatal):', consentErr.message)
  } else if (cl) {
    // Backlink on the subscriber for fast lookup
    await sb
      .from('newsletter_subscribers')
      .update({ consent_log_id: cl.id })
      .eq('id', sub.id)
  }
  return htmlResponse(200, 'You\'re confirmed',
    `<div class="ok">
      <strong>Subscription confirmed.</strong>
      <p style="margin-top:8px">You'll start receiving the BizLegal AI Regulatory Pulse within a few days. The first issue will be a high-signal roundup of the week's enforcement actions across SEC, MiCA, VARA, and GDPR — no fluff, no marketing.</p>
      <p style="margin-top:8px">One-click unsubscribe in every email, no questions asked.</p>
    </div>
    <p>— Moses, BizLegal AI</p>`)
}
