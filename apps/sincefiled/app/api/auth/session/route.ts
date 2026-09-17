import { sendEmail } from '@bizlegal/email'
import { issueLoginToken } from '@/lib/auth'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return Response.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }
  const token = issueLoginToken(email)
  const origin = process.env.NODE_ENV === 'production'
    ? 'https://sincefiled.bizlegal-ai.com'
    : new URL(req.url).origin
  const verifyUrl = `${origin}/api/auth/verify?token=${encodeURIComponent(token)}`
  if (process.env.NODE_ENV !== 'production' && process.env.DEMO_MODE === '1') {
    return Response.json({ ok: true, verify_url: verifyUrl })
  }
  const result = await sendEmail({
    to: email,
    subject: 'Your SinceFiled sign-in link',
    text: `Sign in to SinceFiled: ${verifyUrl}\n\nThis link expires in 15 minutes.`,
    html: `<p>Use this private link to sign in to SinceFiled:</p><p><a href="${verifyUrl}">Sign in to SinceFiled</a></p><p>This link expires in 15 minutes.</p>`,
    kind: 'transactional',
    idempotencyKey: `sincefiled-login-${email}-${Math.floor(Date.now() / 60_000)}`,
  })
  if (!result.ok) {
    console.error('[sincefiled/auth] login email failed', result.error)
    return Response.json({ ok: false, error: 'email_unavailable' }, { status: 503 })
  }
  return Response.json({ ok: true })
}
