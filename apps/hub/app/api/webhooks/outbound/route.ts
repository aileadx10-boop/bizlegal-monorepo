/**
 * POST /api/webhooks/outbound — cold-sender feedback (rule 7 v2, item 3).
 *
 * Instantly posts replies, bounces, unsubscribes and complaints here. Bounces,
 * complaints and unsubscribes land in email_suppression_list immediately so
 * the next dispatch tick refuses the address; replies become sales_reply rows
 * for the routine to classify and answer from the campaign's approved set.
 *
 * Auth: shared secret INSTANTLY_WEBHOOK_SECRET, in the `x-webhook-secret`
 * header or the `s` query parameter (timing-safe compare). Missing secret in
 * env → 503, i.e. fail closed. Idempotent via processed_webhook_events.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'node:crypto'
import { normaliseInstantlyEvent } from '@bizlegal/email'
import { logEventAsync } from '@/lib/ops/log'
import { claimWebhookEvent } from '@/lib/payments/webhook-idempotency'

export const dynamic = 'force-dynamic'

function secretOk(req: NextRequest): boolean {
  const expected = process.env.INSTANTLY_WEBHOOK_SECRET ?? ''
  if (!expected) return false
  const provided = req.headers.get('x-webhook-secret') ?? req.nextUrl.searchParams.get('s') ?? ''
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

const SUPPRESS: Record<string, string> = { email_bounced: 'bounced_hard', lead_unsubscribed: 'unsubscribed', complaint: 'complained' }

export async function POST(req: NextRequest) {
  if (!process.env.INSTANTLY_WEBHOOK_SECRET) return NextResponse.json({ error: 'webhook_secret_not_configured' }, { status: 503 })
  if (!secretOk(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const raw = await req.json().catch(() => null)
  const ev = normaliseInstantlyEvent(raw)
  if (!ev) return NextResponse.json({ error: 'unrecognised_event' }, { status: 400 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'supabase env missing' }, { status: 500 })
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const eventId = `${ev.type}:${ev.email}:${ev.messageId ?? ev.occurredAt}`
  const claim = await claimWebhookEvent({ gateway: 'instantly', eventId })
  if (claim === 'duplicate') return NextResponse.json({ ok: true, deduped: true })
  if (claim === 'error') return NextResponse.json({ error: 'idempotency_storage_failed' }, { status: 500 })

  const now = new Date().toISOString()
  const { data: lead } = await sb.from('sales_lead').select('id, status').ilike('email', ev.email).order('created_at', { ascending: false }).limit(1).maybeSingle()
  const { data: outreach } = lead
    ? await sb.from('sales_outreach').select('id').eq('lead_id', lead.id).not('sent_at', 'is', null).order('sent_at', { ascending: false }).limit(1).maybeSingle()
    : { data: null }

  if (ev.type in SUPPRESS) {
    await sb.from('email_suppression_list').upsert({ email: ev.email, reason: SUPPRESS[ev.type], detail: ev.messageId, source: 'instantly_webhook', created_by: 'agent:outbound-webhook' }, { onConflict: 'email', ignoreDuplicates: true })
    const logPatch: Record<string, unknown> = ev.type === 'email_bounced' ? { resend_status: 'bounced', bounced_at: now } : ev.type === 'complaint' ? { resend_status: 'complained', complained_at: now } : {}
    if (Object.keys(logPatch).length > 0) await sb.from('email_send_log').update(logPatch).ilike('to_email', ev.email).is('bounced_at', null)
    if (outreach) await sb.from('sales_outreach').update({ status: ev.type === 'email_bounced' ? 'bounced' : ev.type === 'complaint' ? 'complained' : 'unsubscribed' }).eq('id', outreach.id)
    if (lead) {
      await sb.from('sales_lead').update({ status: ev.type === 'lead_unsubscribed' ? 'unsubscribed' : lead.status, updated_at: now }).eq('id', lead.id)
      await sb.from('sales_event').insert({ lead_id: lead.id, outreach_id: outreach?.id ?? null, event_type: ev.type === 'lead_unsubscribed' ? 'opted_out' : 'suppressed', details: { via: 'instantly_webhook', event: ev.type }, actor: 'outbound-webhook' })
    }
  } else if (ev.type === 'reply_received') {
    if (lead) {
      await sb.from('sales_reply').insert({ lead_id: lead.id, outreach_id: outreach?.id ?? null, channel: 'email', body: ev.replyText ?? '(reply text not provided by sender)', intent: null, escalated_to_moses: false })
      if (outreach) await sb.from('sales_outreach').update({ status: 'replied' }).eq('id', outreach.id)
      await sb.from('sales_lead').update({ status: 'replied', updated_at: now }).eq('id', lead.id)
      await sb.from('sales_event').insert({ lead_id: lead.id, outreach_id: outreach?.id ?? null, event_type: 'reply_received', details: { via: 'instantly_webhook' }, actor: 'outbound-webhook' })
    }
  } else if (ev.type === 'email_opened' || ev.type === 'email_sent') {
    const patch = ev.type === 'email_opened' ? { opened_at: now } : { delivered_at: now }
    if (ev.messageId) await sb.from('email_send_log').update(patch).eq('resend_message_id', ev.messageId)
  }

  logEventAsync({ type: 'webhook.received', source: 'hub', ref_id: eventId, email: ev.email, status: 'ok', metadata: { provider: 'instantly', event: ev.type, matched_lead: Boolean(lead) } })
  return NextResponse.json({ ok: true, event: ev.type, matched_lead: Boolean(lead) })
}

export const GET = () => NextResponse.json({ error: 'POST only' }, { status: 405 })
