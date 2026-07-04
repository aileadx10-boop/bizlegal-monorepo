import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * GET /api/ops/command
 *
 * WP6 of REVENUE-MACHINE-24-7-2026-07-04 — the command dashboard aggregate.
 *
 * One JSON payload answering "what is every engine doing right now?":
 *   revenue     — payment_orders: today confirmed, MRR estimate, last 7d
 *   funnel      — qualifier_sessions → deal_rooms → leadforge_leads
 *   outreach    — lead_outreach sent/replies 7d + lead_nurture_state bounces
 *   content     — daily_gaps published 7d + latest geo_citation agent_run
 *   agents      — agent_heartbeats summary (same shape as /api/ops/live)
 *   next_actions— Week-1 first-dollar gate items (static; daily-todo cron
 *                 only sends Telegram and stores nothing queryable)
 *
 * Every section is independently try/caught: a missing table (e.g.
 * qualifier_sessions / deal_rooms land via a parallel migration) returns
 * null for that section instead of failing the whole route.
 *
 * Token-gated by OPS_DASHBOARD_TOKEN via ?t= / ?token= / x-ops-token header
 * (same auth pattern as /api/ops/feed). 404 on mismatch.
 */

const DAY_MS = 24 * 60 * 60 * 1000
// Same confirmed-money definition as /ops/snapshot.
const PAID_STATUSES = new Set(['active', 'paid', 'completed'])

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** Run a section loader; a thrown error (missing table, bad column) → null. */
async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch {
    return null
  }
}

function countByStatus(rows: Array<Record<string, unknown>>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const r of rows) {
    const st = String(r.status ?? 'unknown')
    out[st] = (out[st] ?? 0) + 1
  }
  return out
}

/** deal_rooms price column may land as price (usd), price_cents, or amount_cents. */
function rowUsd(r: Record<string, unknown>): number {
  if (typeof r.price_cents === 'number') return r.price_cents / 100
  if (typeof r.amount_cents === 'number') return r.amount_cents / 100
  if (typeof r.price === 'number') return r.price
  return 0
}

// ─── revenue — payment_orders ───────────────────────────────────────────────

async function loadRevenue(sb: SupabaseClient) {
  const now = new Date()
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
  const since7d = new Date(now.getTime() - 7 * DAY_MS).toISOString()

  const [last7dRes, activeRes] = await Promise.all([
    sb
      .from('payment_orders')
      .select('amount_cents, status, created_at')
      .gte('created_at', since7d)
      .limit(2000),
    sb
      .from('payment_orders')
      .select('amount_cents, billing_interval')
      .eq('status', 'active')
      .limit(2000),
  ])
  if (last7dRes.error) throw last7dRes.error
  if (activeRes.error) throw activeRes.error

  let todayUsd = 0
  let todayCount = 0
  let week7dUsd = 0
  let week7dCount = 0
  for (const o of last7dRes.data ?? []) {
    const status = String(o.status ?? '').toLowerCase()
    if (!PAID_STATUSES.has(status)) continue
    const usd = (typeof o.amount_cents === 'number' ? o.amount_cents : 0) / 100
    week7dUsd += usd
    week7dCount += 1
    if (String(o.created_at) >= todayStart) {
      todayUsd += usd
      todayCount += 1
    }
  }

  // MRR estimate: active recurring orders — monthly at face value, yearly / 12.
  let mrrUsd = 0
  for (const o of activeRes.data ?? []) {
    const usd = (typeof o.amount_cents === 'number' ? o.amount_cents : 0) / 100
    const interval = String(o.billing_interval ?? '')
    if (interval === 'monthly') mrrUsd += usd
    else if (interval === 'yearly') mrrUsd += usd / 12
  }

  return {
    today_confirmed_usd: Math.round(todayUsd * 100) / 100,
    today_confirmed_count: todayCount,
    mrr_estimate_usd: Math.round(mrrUsd * 100) / 100,
    last_7d_usd: Math.round(week7dUsd * 100) / 100,
    last_7d_count: week7dCount,
  }
}

// ─── funnel — qualifier_sessions → deal_rooms → leadforge_leads ─────────────

async function loadQualifierSessions(sb: SupabaseClient) {
  const { data, error } = await sb.from('qualifier_sessions').select('status').limit(2000)
  if (error) throw error
  const rows = (data ?? []) as Array<Record<string, unknown>>
  return { total: rows.length, by_status: countByStatus(rows) }
}

async function loadDealRooms(sb: SupabaseClient) {
  const { data, error } = await sb.from('deal_rooms').select('*').limit(2000)
  if (error) throw error
  const rows = (data ?? []) as Array<Record<string, unknown>>
  // Open value: rooms that haven't been paid or expired yet.
  const openValueUsd = rows
    .filter((r) => ['open', 'viewed'].includes(String(r.status ?? '')))
    .reduce((s, r) => s + rowUsd(r), 0)
  return {
    total: rows.length,
    by_status: countByStatus(rows),
    open_value_usd: Math.round(openValueUsd * 100) / 100,
  }
}

async function loadLeadforgeNew7d(sb: SupabaseClient) {
  const since7d = new Date(Date.now() - 7 * DAY_MS).toISOString()
  const { count, error } = await sb
    .from('leadforge_leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since7d)
  if (error) throw error
  return count ?? 0
}

// ─── outreach — lead_outreach + lead_nurture_state ──────────────────────────

async function loadOutreach(sb: SupabaseClient) {
  const since7d = new Date(Date.now() - 7 * DAY_MS).toISOString()

  // sent_at / replied_at set by cold_email_sender.py + lead_nurture.py
  // (schema: apps/hub/supabase/migrations/20260527_conductor_platform.sql).
  const sent7d = await safe(async () => {
    const { count, error } = await sb
      .from('lead_outreach')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', since7d)
    if (error) throw error
    return count ?? 0
  })

  const replies7d = await safe(async () => {
    const { count, error } = await sb
      .from('lead_outreach')
      .select('*', { count: 'exact', head: true })
      .gte('replied_at', since7d)
    if (error) throw error
    return count ?? 0
  })

  // Bounce indicator: lead_nurture_state.bounce_reason is set by the Resend
  // bounce webhook (20260505_lead_nurture_state.sql). lead_outreach itself
  // has no bounce column.
  const bounced = await safe(async () => {
    const { count, error } = await sb
      .from('lead_nurture_state')
      .select('*', { count: 'exact', head: true })
      .not('bounce_reason', 'is', null)
    if (error) throw error
    return count ?? 0
  })

  if (sent7d === null && replies7d === null && bounced === null) return null
  return { sent_7d: sent7d, replies_7d: replies7d, bounced_total: bounced }
}

// ─── content — daily_gaps + geo_citation agent_runs ─────────────────────────

async function loadContent(sb: SupabaseClient) {
  const since7d = new Date(Date.now() - 7 * DAY_MS).toISOString()

  const published7d = await safe(async () => {
    const { count, error } = await sb
      .from('daily_gaps')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('published_at', since7d)
    if (error) throw error
    return count ?? 0
  })

  // geo_citation.py writes its daily poll to agent_runs
  // (agent_name='geo_citation', details: { citation_rate, gap_count,
  // queries_polled }) plus a file report on the Hetzner box.
  const citations = await safe(async () => {
    const { data, error } = await sb
      .from('agent_runs')
      .select('details, status, created_at')
      .eq('agent_name', 'geo_citation')
      .order('created_at', { ascending: false })
      .limit(1)
    if (error) throw error
    const row = (data ?? [])[0] as { details?: Record<string, unknown>; created_at?: string } | undefined
    if (!row) return null
    const d = row.details ?? {}
    return {
      citation_rate_pct: typeof d.citation_rate === 'number' ? d.citation_rate : null,
      queries_polled: typeof d.queries_polled === 'number' ? d.queries_polled : null,
      gap_count: typeof d.gap_count === 'number' ? d.gap_count : null,
      polled_at: row.created_at ?? null,
    }
  })

  if (published7d === null && citations === null) return null
  return {
    published_7d: published7d,
    citations,
    note: citations === null ? 'no geo_citation run recorded in agent_runs yet (full report is file-based on Hetzner)' : null,
  }
}

// ─── agents — agent_heartbeats (same aggregation shape as /api/ops/live) ────

async function loadAgents(sb: SupabaseClient, staleSeconds: number) {
  const { data, error } = await sb
    .from('agent_heartbeats')
    .select('service, status, last_action, pinged_at')
    .order('pinged_at', { ascending: false })
    .limit(500)
  if (error) throw error

  const byService = new Map<string, Record<string, unknown>>()
  for (const hb of data ?? []) {
    const key = String(hb.service)
    if (!byService.has(key)) byService.set(key, hb)
  }

  const now = Date.now()
  const statusCounts = { alive: 0, degraded: 0, dead: 0, starting: 0, stopping: 0 }
  let stale = 0
  let fresh = 0
  const alerts: Array<{ service: string; last_ping: unknown; age_seconds: number; last_action: unknown }> = []
  for (const hb of Array.from(byService.values() as Iterable<Record<string, unknown>>)) {
    const age = Math.max(0, Math.floor((now - new Date(String(hb.pinged_at)).getTime()) / 1000))
    const st = String(hb.status ?? 'unknown')
    if (st in statusCounts) (statusCounts as Record<string, number>)[st] += 1
    if (age > staleSeconds) {
      stale += 1
      alerts.push({ service: String(hb.service), last_ping: hb.pinged_at, age_seconds: age, last_action: hb.last_action })
    } else {
      fresh += 1
    }
  }

  return { total: byService.size, fresh, stale, ...statusCounts, alerts }
}

// ─── next actions ────────────────────────────────────────────────────────────

/**
 * /api/cron/daily-todo only posts to Telegram and returns its list in the
 * cron response — it persists nothing queryable. Until it does, surface the
 * top Week-1 first-dollar gate items (decisions/MRR-40K-90-DAY-PLAN-2026-07-02.md §1).
 */
const NEXT_ACTIONS_STATIC = [
  'M1 — Verify NEXT_PUBLIC_SITE_URL on DocAI Vercel = https://docai.bizlegal-ai.com (the IPN black hole), redeploy',
  'M2 — Push NOWPAYMENTS_IPN_SECRET to all 7 Vercel projects; run one real $97 self-purchase on docai; confirm processed_webhook_events gets its first row',
  'M3 — Create the top 5 PayPal plan IDs (DocAI Team $69, LexAudit Monitor $99, Hub Pro $149, DocAI Firm $199, LexAudit Mid-Market $599) + confirm client ID is LIVE not sandbox',
]

// ─── route ───────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const expected = process.env.OPS_DASHBOARD_TOKEN ?? ''
  const provided = req.nextUrl.searchParams.get('token') ?? req.nextUrl.searchParams.get('t') ?? ''
  const headerToken = req.headers.get('x-ops-token') ?? ''
  const tokenInput = provided || headerToken
  if (!expected || !tokenInput || !timingSafeEq(expected, tokenInput)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const staleSeconds = Number(req.nextUrl.searchParams.get('stale_seconds') ?? '900')

  let supabase: SupabaseClient
  try {
    supabase = getSupabase()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  const [revenue, qualifierSessions, dealRooms, leadforgeNew7d, outreach, content, agents] = await Promise.all([
    safe(() => loadRevenue(supabase)),
    safe(() => loadQualifierSessions(supabase)),
    safe(() => loadDealRooms(supabase)),
    safe(() => loadLeadforgeNew7d(supabase)),
    safe(() => loadOutreach(supabase)),
    safe(() => loadContent(supabase)),
    safe(() => loadAgents(supabase, staleSeconds)),
  ])

  return NextResponse.json(
    {
      generated_at: new Date().toISOString(),
      revenue,
      funnel: {
        qualifier_sessions: qualifierSessions,
        deal_rooms: dealRooms,
        leadforge_new_7d: leadforgeNew7d,
      },
      outreach,
      content,
      agents,
      next_actions: { source: 'static', items: NEXT_ACTIONS_STATIC },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
