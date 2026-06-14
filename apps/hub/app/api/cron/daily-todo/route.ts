import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/cron/daily-todo
 *
 * Fires at 06:00 UTC via Vercel Cron.
 * Pulls live signals from Supabase (payments, scans, errors, curator),
 * asks Claude Haiku to rank and phrase them as a 3–7 item action list,
 * then posts to Telegram as the morning to-do.
 *
 * Auth: CRON_SECRET Bearer header (same as all other hub crons).
 */

interface PaymentRow {
  id: string
  status: string
  gateway: string
  amount_cents: number
  created_at: string
}

interface ScanRow {
  paid: boolean
  created_at: string
}

interface OpsEvent {
  event_type: string
  source: string
  created_at: string
}

interface CuratorRow {
  picked: number | null
  published: number | null
  run_date: string
}

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
  if (!token || !chatId) {
    console.warn('[daily-todo] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set')
    return false
  }
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
    if (!res.ok) {
      const body = await res.text()
      console.warn('[daily-todo] telegram error:', res.status, body)
    }
    return res.ok
  } catch (err) {
    console.warn('[daily-todo] telegram send failed:', err)
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
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Gather signals in parallel
    const [ordersRes, scansRes, errorsRes, curatorRes] = await Promise.all([
      supabase
        .from('payment_orders')
        .select('id, status, gateway, amount_cents, created_at')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('contract_scans')
        .select('paid, created_at')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('ops_events')
        .select('event_type, source, created_at')
        .eq('event_type', 'error')
        .gte('created_at', since24h)
        .limit(50),
      // curator daily_gaps table tracks pick/publish counts
      supabase
        .from('daily_gaps')
        .select('picked, published, run_date')
        .gte('run_date', since7d)
        .order('run_date', { ascending: false })
        .limit(7),
    ])

    const orders = (ordersRes.data ?? []) as PaymentRow[]
    const scans = (scansRes.data ?? []) as ScanRow[]
    const errors24h = (errorsRes.data ?? []) as OpsEvent[]
    const curatorDays = (curatorRes.data ?? []) as CuratorRow[]

    // Compute signal summary
    const totalOrders = orders.length
    const activeOrders = orders.filter((o) => o.status === 'active').length
    const pendingOrders = orders.filter((o) => o.status === 'pending').length
    const totalScans = scans.length
    const paidScans = scans.filter((s) => s.paid).length
    const errorCount24h = errors24h.length
    const errorSources = Array.from(new Set(errors24h.map((e) => e.source))).join(', ')

    const curatorAvgPicked =
      curatorDays.length > 0
        ? (curatorDays.reduce((s, d) => s + (d.picked ?? 0), 0) / curatorDays.length).toFixed(1)
        : 'n/a'
    const curatorAvgPublished =
      curatorDays.length > 0
        ? (curatorDays.reduce((s, d) => s + (d.published ?? 0), 0) / curatorDays.length).toFixed(1)
        : 'n/a'

    // Revenue total from active orders
    const revenueCents = orders
      .filter((o) => o.status === 'active')
      .reduce((s, o) => s + (o.amount_cents ?? 0), 0)
    const revenueUsd = (revenueCents / 100).toFixed(2)

    const signals = {
      date: new Date().toISOString().slice(0, 10),
      revenue: { total_usd: revenueUsd, active_orders: activeOrders, pending_orders: pendingOrders },
      docai_scans: { total: totalScans, paid: paidScans, unpaid: totalScans - paidScans },
      errors_24h: { count: errorCount24h, sources: errorSources || 'none' },
      curator_7d: { avg_picked_per_day: curatorAvgPicked, avg_published_per_day: curatorAvgPublished },
      paypal_enabled: process.env.NEXT_PUBLIC_PAYPAL_SCAN_ENABLED === 'true',
    }

    // Call Claude Haiku to rank and phrase the to-do
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    let todoText: string

    if (anthropicKey) {
      const client = new Anthropic({ apiKey: anthropicKey })
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: `You are the executive assistant for BizLegal AI, a B2B legal-tech startup.
Today's date: ${signals.date}
Goal: $0 → first $97 revenue by 2026-07-01 (${Math.ceil((new Date('2026-07-01').getTime() - Date.now()) / 86400000)} days away).

Live system state:
${JSON.stringify(signals, null, 2)}

Context:
- active_orders = 0 means $0 ever captured. THE main blocker.
- curator published < 1/day means content engine stalled (Hermes/Ollama model mismatch on Hetzner).
- errors_24h > 0 means something is broken that needs attention.
- paypal_enabled: false means only crypto checkout works.
- DocAI $97 contract scan is the primary revenue surface (docai.bizlegal-ai.com).

Produce EXACTLY 3–7 ranked action items for Moses today.
Format each item on its own line: "N. [EMOJI] TITLE — one-sentence action"
- #1 must be the hardest blocker to first revenue.
- Use plain text only (no markdown bold/italic). Keep each item under 120 chars total.
- Do NOT add a header, greeting, or trailing text. Just the numbered list.`,
          },
        ],
      })
      todoText = (msg.content[0] as { type: string; text: string }).text.trim()
    } else {
      // Fallback: deterministic list when no API key
      const items: string[] = []
      if (activeOrders === 0) {
        items.push('1. 🔴 NO REVENUE — Run a real $97 DocAI payment end-to-end to prove the loop')
      }
      if (!signals.paypal_enabled) {
        items.push(`${items.length + 1}. 💳 PayPal disabled — Redeploy docai to activate NEXT_PUBLIC_PAYPAL_SCAN_ENABLED`)
      }
      if (Number(curatorAvgPublished) < 1) {
        items.push(`${items.length + 1}. 🤖 Curator stalled (${curatorAvgPublished}/day) — SSH Hetzner, fix Ollama model, restart brain/publisher`)
      }
      if (errorCount24h > 0) {
        items.push(`${items.length + 1}. ⚠️ ${errorCount24h} errors in 24h on ${errorSources} — Check /ops for root cause`)
      }
      if (paidScans === 0 && totalScans > 0) {
        items.push(`${items.length + 1}. 📝 ${totalScans - paidScans} unpaid scans — Send follow-up to each email in contract_scans`)
      }
      items.push(`${items.length + 1}. 📧 Cold outreach — Send 20 DocAI intro emails to B2B SaaS SOC-2 targets today`)
      todoText = items.join('\n')
    }

    // Escape and format for Telegram MarkdownV2
    const nowUTC = new Date().toUTCString().replace(/:\d\d GMT/, ' UTC')
    const header = `*📋 BizLegal Daily To\\-Do — ${escapeMd(signals.date)}*\n`
    const stats = [
      `Revenue: \\$${escapeMd(revenueUsd)} \\(${activeOrders} active, ${pendingOrders} pending\\)`,
      `DocAI scans: ${paidScans} paid / ${totalScans} total`,
      `Errors 24h: ${errorCount24h}`,
      `Curator: ${curatorAvgPublished} published/day`,
    ]
      .map((s) => `_${s}_`)
      .join(' · ')

    const escapedTodo = todoText
      .split('\n')
      .map((line) => escapeMd(line))
      .join('\n')

    const message = `${header}\n${stats}\n\n${escapedTodo}`

    const sent = await sendTelegram(message)

    return NextResponse.json({
      ok: true,
      sent,
      signals,
      items: todoText.split('\n').length,
    })
  } catch (err) {
    console.error('[daily-todo] error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
