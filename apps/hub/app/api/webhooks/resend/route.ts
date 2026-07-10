/**
 * POST /api/webhooks/resend
 *
 * Resend event webhook receiver. Auto-suppresses bounced/complained
 * addresses so opt_in_outreach never mails them again.
 *
 * Built 2026-07-10 after spam-pipeline incident (ef3d90e).
 * See: services/agents/resend_webhook.py for the equivalent CLI tool.
 *
 * Wire up:
 *   1. Get webhook secret from Resend dashboard -> Webhooks -> Create
 *   2. Add RESEND_WEBHOOK_SECRET to Vercel env (prod + preview)
 *   3. Point webhook at https://bizlegal-ai.com/api/webhooks/resend
 *   4. Subscribe to: email.bounced, email.complained, email.delivered, email.opened
 *
 * The Python handler at services/agents/resend_webhook.py does the same
 * job for offline / backfill use; both keep email_suppression_list
 * in sync with Resend's bounce/complaint stream.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'node:crypto'

export const dynamic = 'force-dynamic'

// Map Resend event type -> (suppression_reason, sendlog_status)
const SUPPRESSION_MAP: Record<string, { reason: string; status: string }> = {
  'email.bounced':    { reason: 'bounced_hard', status: 'bounced' },
  'email.complained': { reason: 'complained',   status: 'complained' },
}
const LOG_UPDATE_MAP: Record<string, string> = {
  'email.bounced':    'bounced',
  'email.complained': 'complained',
  'email.delivered':  'delivered',
  'email.opened':     'opened',
}

function verifySvixSignature(rawBody: string, headers: Headers): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    // Dev mode: no secret configured = reject (production must set this)
    return false
  }
  const svixId = headers.get('svix-id')
  const svixTs = headers.get('svix-timestamp')
  const svixSig = headers.get('svix-signature')
  if (!svixId || !svixTs || !svixSig) return false
  // svix-signature: "v1,<hex>" (may have multiple space-separated)
  const signed = `${svixId}.${svixTs}.${rawBody}`
  // Resend webhook secrets come base64-encoded from the dashboard.
  // svix uses "whsec_" prefix + base64 of the secret bytes.
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
  const expected = createHmac('sha256', secretBytes).update(signed).digest('hex')
  return svixSig.split(' ').some(s => {
    const [v, hex] = s.split(',', 2)
    if (v !== 'v1' || !hex) return false
    try {
      return timingSafeEqual(Buffer.from(hex, 'hex'), Buffer.from(expected, 'hex'))
    } catch {
      return false
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- webhook handler writes dynamic computed-key columns; the generated client generics reject them
async function handleEvent(sb: any, event: any) {
  const etype: string = event?.type || ''
  const data = event?.data || {}
  // Resend payload: data.to = [emails], data.email_id = message id
  const toList: string[] = Array.isArray(data.to) ? data.to : [data.to].filter(Boolean)
  const toEmail = (toList[0] || '').toString().trim().toLowerCase()
  const messageId: string = data.email_id || data.message_id || event?.message_id || ''
  const timestamp: string = event.created_at || new Date().toISOString()

  if (!toEmail) return { ok: false, error: 'no_email', event: etype }

  // Bounce / complaint -> add to suppression list
  if (etype in SUPPRESSION_MAP) {
    const { reason, status } = SUPPRESSION_MAP[etype]
    const { error: supErr } = await sb
      .from('email_suppression_list')
      .upsert(
        {
          email: toEmail,
          reason,
          detail: JSON.stringify(data).slice(0, 400),
          source: 'resend_webhook',
          created_by: 'vercel_resend_handler',
        },
        { onConflict: 'email' },
      )
    // 23505 = unique violation (already suppressed) -> ok
    if (supErr && !String(supErr.message).includes('duplicate')) {
      console.warn(`[resend-webhook] suppress failed for ${toEmail}:`, supErr.message)
    }
    if (messageId) {
      await sb.from('email_send_log')
        .update({ resend_status: status, [`${status}_at`]: timestamp })
        .eq('resend_message_id', messageId)
    }
    return { ok: true, action: 'suppressed', email: toEmail, reason, message_id: messageId }
  }

  // Delivered / opened -> log only
  if (etype in LOG_UPDATE_MAP) {
    const status = LOG_UPDATE_MAP[etype]
    if (messageId) {
      await sb.from('email_send_log')
        .update({ resend_status: status, [`${status}_at`]: timestamp })
        .eq('resend_message_id', messageId)
    }
    return { ok: true, action: 'log_updated', email: toEmail, status, message_id: messageId }
  }

  return { ok: true, action: 'ignored', event: etype }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const raw = await req.text()
  if (!verifySvixSignature(raw, req.headers)) {
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 401 })
  }
  let payload: any
  try { payload = JSON.parse(raw) } catch { return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 }) }
  const events = Array.isArray(payload) ? payload : [payload]

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !key) {
    return NextResponse.json({ ok: false, error: 'supabase_env_missing' }, { status: 503 })
  }
  const sb = createClient(supabaseUrl, key)

  const results = await Promise.all(events.map(e => handleEvent(sb, e)))
  const anyFailed = results.some(r => !r.ok)
  return NextResponse.json({ ok: !anyFailed, results }, { status: anyFailed ? 207 : 200 })
}
