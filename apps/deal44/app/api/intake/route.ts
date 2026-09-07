import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'
import { verifyTurnstile } from '@bizlegal/turnstile-verify'
import { sendEmail } from '@bizlegal/email'
import { intakeSchema } from '@/lib/rooms/schemas'
import { logEventAsync } from '@/lib/ops/log'

/**
 * POST /api/intake — a broker asks for a room.
 *
 * The only recipient is Moses, so there is no consent question here: this is a
 * message the sender just wrote, delivered to the business it was addressed to.
 * The broker's address is NOT added to any list; if he later replies to them,
 * that is a human writing back to someone who wrote first.
 *
 * The lead itself lives on the ops tape (`lead.inbound`) rather than in a new
 * table — one intake a day does not justify a schema.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 20

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // An unrecognised IP is still rate-limited, under a shared bucket. Letting
  // 'unknown' through unlimited would be a hole a scripted client walks into.
  const ip = clientIpFromHeaders(req.headers)
  const limit = rateLimit('deal44-intake', ip ?? 'unknown', { limit: 5, windowMs: 60_000 })
  if (!limit.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = intakeSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  const input = parsed.data

  // Skips itself when TURNSTILE_SECRET_KEY is unset, so a pre-launch deploy
  // still works rather than silently rejecting every real broker.
  const turnstile = await verifyTurnstile({ token: input.turnstile_token, clientIp: ip })
  if (!turnstile.ok) return NextResponse.json({ error: 'verification_failed' }, { status: 400 })

  const to = process.env.DEAL44_INTAKE_EMAIL ?? process.env.RESEND_REPLY_TO ?? 'team@bizlegal-ai.com'
  const rows: Array<[string, string]> = [
    ['Name', input.name],
    ['Email', input.email],
    ['Phone', input.phone],
    ['Deals/month', input.deals_per_month],
    ['Next signing', input.next_signing],
    ['Notes', input.notes],
  ]

  const result = await sendEmail({
    to,
    subject: `DEAL44 intake — ${input.name}`,
    replyTo: input.email,
    kind: 'transactional',
    idempotencyKey: `deal44:intake:${input.email}:${new Date().toISOString().slice(0, 13)}`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
    html: `<div style="font-family:sans-serif;font-size:14px;">${rows
      .map(([k, v]) => `<p style="margin:0 0 6px;"><strong>${k}:</strong> ${esc(v || '—')}</p>`)
      .join('')}</div>`,
  })

  logEventAsync({
    type: 'lead.inbound',
    source: 'deal44',
    email: input.email,
    status: result.ok ? 'ok' : 'failed',
    metadata: {
      name: input.name,
      deals_per_month: input.deals_per_month,
      next_signing: input.next_signing,
      delivery: result.ok ? 'sent' : result.error,
    },
  })

  // The lead is recorded on the ops tape either way. A Resend outage must not
  // look to the broker like their message vanished.
  return NextResponse.json({ ok: true })
}
