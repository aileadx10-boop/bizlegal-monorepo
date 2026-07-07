import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * POST /api/internal/send-email
 *
 * HMAC-signed email relay for Hetzner agents. Cloudflare permanently
 * blocks Hetzner datacenter IPs on api.resend.com (403 error 1010), so
 * agents that need to send email POST here instead — Vercel's egress
 * reaches Resend fine. Same signature scheme as /api/ops/log:
 * x-bizlegal-signature = HMAC-SHA256(raw body, BIZLEGAL_INBOUND_SECRET).
 *
 * Recipients are allowlisted so a leaked signature can't turn this
 * into an open mail relay.
 */

const ALLOWED_RECIPIENTS = new Set([
  'ai.leadx10@gmail.com',
  'mdmdmd63@gmail.com',
])
const ALLOWED_DOMAIN = '@bizlegal-ai.com'
const DEFAULT_FROM = 'BizLegal AI <intelligence@intelligence.bizlegal-ai.com>'

function verifyHmac(body: string, sig: string | null, secret: string): boolean {
  if (!sig || !secret) return false
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  if (expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  }
  return diff === 0
}

function isAllowedRecipient(to: string): boolean {
  const email = to.trim().toLowerCase()
  return ALLOWED_RECIPIENTS.has(email) || email.endsWith(ALLOWED_DOMAIN)
}

export async function POST(req: NextRequest) {
  const secret = process.env.BIZLEGAL_INBOUND_SECRET
  const resendKey = process.env.RESEND_API_KEY
  if (!secret || !resendKey) {
    return NextResponse.json({ ok: false, error: 'relay not configured' }, { status: 503 })
  }

  const raw = await req.text()
  if (!verifyHmac(raw, req.headers.get('x-bizlegal-signature'), secret)) {
    return NextResponse.json({ ok: false, error: 'bad signature' }, { status: 401 })
  }

  let body: { to?: string; subject?: string; html?: string; from?: string }
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON' }, { status: 400 })
  }

  const to = String(body.to ?? '').trim()
  const subject = String(body.subject ?? '').slice(0, 300)
  const html = String(body.html ?? '')
  if (!to || !subject || !html) {
    return NextResponse.json({ ok: false, error: 'to, subject, html required' }, { status: 400 })
  }
  if (!isAllowedRecipient(to)) {
    return NextResponse.json({ ok: false, error: 'recipient not allowlisted' }, { status: 403 })
  }
  if (html.length > 500_000) {
    return NextResponse.json({ ok: false, error: 'html too large' }, { status: 413 })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'bizlegal-agent/1.0',
    },
    body: JSON.stringify({
      from: body.from && String(body.from).includes(ALLOWED_DOMAIN) ? body.from : DEFAULT_FROM,
      to: [to],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 200)
    return NextResponse.json({ ok: false, error: `resend ${res.status}`, detail }, { status: 502 })
  }
  const data = (await res.json()) as { id?: string }
  return NextResponse.json({ ok: true, id: data.id ?? null })
}
