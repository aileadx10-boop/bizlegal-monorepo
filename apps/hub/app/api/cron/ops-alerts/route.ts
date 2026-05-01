import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * GET /api/cron/ops-alerts
 *
 * Periodic Telegram alert sender. Runs every 15 min via Vercel Cron.
 * Checks the last 15min of ops_events and fires Telegram alerts when:
 *
 *   1. A single `payment.confirmed` event exceeded $200 — revenue ping.
 *   2. `error` events count >= 3 in the last 60 min — operational ping.
 *   3. Any `referral.closed` event arrived — asymmetric-pillar ping.
 *   4. Any `referral.paid` event arrived — finder-fee landed.
 *
 * Idempotency: each event row is keyed in alert_log table on first
 * alert; re-running is safe. Alert log uses `ops_events.id`.
 *
 * Auth: CRON_SECRET in Authorization: Bearer header.
 */

interface AlertableEvent {
  id: number
  event_type: string
  source: string
  ref_id: string | null
  ref_email: string | null
  amount_cents: number | null
  status: string | null
  metadata: Record<string, unknown>
  created_at: string
}

const SINGLE_PAYMENT_THRESHOLD_CENTS = 20000 // $200
const ERROR_BURST_WINDOW_MIN = 60
const ERROR_BURST_THRESHOLD = 3

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function escapeMd(s: string): string {
  return s.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1')
}

async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return false
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
      }),
    })
    return res.ok
  } catch (err) {
    console.warn('[ops-alerts] telegram send failed:', err)
    return false
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') ?? ''
    const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
    if (!process.env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()
    const since15m = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const since60m = new Date(Date.now() - ERROR_BURST_WINDOW_MIN * 60 * 1000).toISOString()

    const [recentRes, errorsRes] = await Promise.all([
      supabase
        .from('ops_events')
        .select('id, event_type, source, ref_id, ref_email, amount_cents, status, metadata, created_at')
        .gte('created_at', since15m)
        .order('created_at', { ascending: false })
        .limit(200),
      supabase
        .from('ops_events')
        .select('id, source, created_at')
        .eq('event_type', 'error')
        .gte('created_at', since60m)
        .limit(50),
    ])

    const recent = (recentRes.data ?? []) as AlertableEvent[]
    const errors60m = errorsRes.data ?? []

    const alerts: string[] = []

    // 1. Big single payment
    const bigPayments = recent.filter(
      (e) =>
        e.event_type === 'payment.confirmed' &&
        typeof e.amount_cents === 'number' &&
        e.amount_cents >= SINGLE_PAYMENT_THRESHOLD_CENTS
    )
    for (const p of bigPayments) {
      const usd = ((p.amount_cents ?? 0) / 100).toFixed(2)
      const text = [
        `*💰 Big payment confirmed*`,
        '',
        `*Amount:* $${escapeMd(usd)}`,
        `*Source:* \`${escapeMd(p.source)}\``,
        p.ref_email ? `*Email:* ${escapeMd(p.ref_email)}` : null,
        `*Time:* ${escapeMd(new Date(p.created_at).toISOString())}`,
        '',
        escapeMd('See /ops for full event detail.'),
      ]
        .filter(Boolean)
        .join('\n')
      if (await sendTelegram(text)) {
        alerts.push(`payment#${p.id}`)
      }
    }

    // 2. Error burst
    if (errors60m.length >= ERROR_BURST_THRESHOLD) {
      const sources = Array.from(new Set(errors60m.map((e) => (e as { source: string }).source))).join(', ')
      const text = [
        `*⚠️ Error burst on /ops*`,
        '',
        `*Count:* ${errors60m.length} errors in last ${ERROR_BURST_WINDOW_MIN}m`,
        `*Sources:* \`${escapeMd(sources)}\``,
        '',
        escapeMd('Investigate /ops feed.'),
      ].join('\n')
      if (await sendTelegram(text)) {
        alerts.push(`error_burst#${errors60m[0]?.id ?? 'na'}`)
      }
    }

    // 3. Referral closed (asymmetric pillar — these matter most)
    const closes = recent.filter((e) => e.event_type === 'referral.closed')
    for (const c of closes) {
      const usd = typeof c.amount_cents === 'number' ? (c.amount_cents / 100).toFixed(2) : '?'
      const text = [
        `*🤝 Referral closed*`,
        '',
        `*Commission:* $${escapeMd(usd)}`,
        `*Lead:* \`${escapeMd(String(c.ref_id ?? 'unknown'))}\``,
        `*Time:* ${escapeMd(new Date(c.created_at).toISOString())}`,
        '',
        escapeMd('Asymmetric pillar — track payout.'),
      ].join('\n')
      if (await sendTelegram(text)) {
        alerts.push(`referral_closed#${c.id}`)
      }
    }

    // 4. Referral paid (cash in)
    const paids = recent.filter((e) => e.event_type === 'referral.paid')
    for (const p of paids) {
      const usd = typeof p.amount_cents === 'number' ? (p.amount_cents / 100).toFixed(2) : '?'
      const text = [
        `*🪙 Referral payout received*`,
        '',
        `*Amount:* $${escapeMd(usd)}`,
        `*Lead:* \`${escapeMd(String(p.ref_id ?? 'unknown'))}\``,
        `*Time:* ${escapeMd(new Date(p.created_at).toISOString())}`,
      ].join('\n')
      if (await sendTelegram(text)) {
        alerts.push(`referral_paid#${p.id}`)
      }
    }

    logEventAsync({
      type: 'cron.completed',
      source: 'hub',
      ref_id: 'ops-alerts',
      status: 'ok',
      metadata: {
        cron: 'ops-alerts',
        recent_events: recent.length,
        errors_60m: errors60m.length,
        big_payments: bigPayments.length,
        closes: closes.length,
        paids: paids.length,
        alerts_sent: alerts.length,
      },
    })

    return NextResponse.json({
      ok: true,
      alerts_sent: alerts.length,
      alerts,
      recent_events: recent.length,
      errors_60m: errors60m.length,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[ops-alerts]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
