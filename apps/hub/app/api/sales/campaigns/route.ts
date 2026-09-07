/**
 * /api/sales/campaigns — the per-campaign approval gate (rule 7 v2, item 5).
 *
 *   GET   list campaigns with counts from tables (drafted / sent today / sent / replied / bounced)
 *   POST  create a draft campaign (the sourcing routine or a session files it)
 *   PATCH {id, action: approve | pause | resume | archive}
 *
 * Auth: OPS_DASHBOARD_TOKEN (Bearer or ?token=), same as /api/sales/drafts.
 * Approving sets status='running' + approved_by='moses'; nothing sends until
 * the dispatch cron also sees OUTBOUND_AUTOSEND=1 and a provider campaign ref.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseIcp } from '@/lib/outbound/icp'
import { basisFor } from '@/lib/outbound/lawful-basis'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const OPS_TOKEN = process.env.OPS_DASHBOARD_TOKEN || ''

function sb() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
}

function authed(req: NextRequest): boolean {
  if (!OPS_TOKEN) return false
  const auth = req.headers.get('authorization') || ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  const q = req.nextUrl.searchParams.get('token') || ''
  return bearer === OPS_TOKEN || q === OPS_TOKEN
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const client = sb()
  const { data: campaigns, error } = await client.from('sales_campaign').select('*').neq('status', 'archived').order('created_at', { ascending: false }).limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const out = []
  for (const c of campaigns ?? []) {
    const [drafted, sentToday, sent, replied, bounced, leads] = await Promise.all([
      client.from('sales_outreach').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('status', 'drafted'),
      client.from('sales_outreach').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).gte('sent_at', todayStart.toISOString()),
      client.from('sales_outreach').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).not('sent_at', 'is', null),
      client.from('sales_outreach').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('status', 'replied'),
      client.from('sales_outreach').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('status', 'bounced'),
      client.from('sales_lead').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('verification_status', 'valid'),
    ])
    out.push({
      ...c,
      counts: { drafted: drafted.count ?? 0, sent_today: sentToday.count ?? 0, sent: sent.count ?? 0, replied: replied.count ?? 0, bounced: bounced.count ?? 0, verified_leads: leads.count ?? 0 },
    })
  }
  return NextResponse.json({ campaigns: out, autosend: process.env.OUTBOUND_AUTOSEND === '1', sender_domain: process.env.OUTBOUND_SENDING_DOMAIN ?? null })
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const icp = parseIcp(body.icp)
  if (!icp.ok) return NextResponse.json({ error: `icp: ${icp.error}` }, { status: 400 })
  const jurisdictions = icp.icp.jurisdictions
  const basis = basisFor(jurisdictions[0])
  if (!basis) return NextResponse.json({ error: `jurisdiction ${jurisdictions[0]} has no enabled lawful basis` }, { status: 400 })

  const { data, error } = await sb()
    .from('sales_campaign')
    .insert({
      name,
      product_id: typeof body.product_id === 'string' ? body.product_id : null,
      icp: icp.icp,
      template_a: typeof body.template_a === 'string' ? body.template_a : null,
      template_b: typeof body.template_b === 'string' ? body.template_b : null,
      reply_set: body.reply_set && typeof body.reply_set === 'object' ? body.reply_set : {},
      jurisdictions,
      lawful_basis: basis,
      daily_cap: typeof body.daily_cap === 'number' ? Math.max(1, Math.min(50, Math.floor(body.daily_cap))) : 20,
      mailboxes: typeof body.mailboxes === 'number' ? Math.max(1, Math.min(5, Math.floor(body.mailboxes))) : 1,
      sender_campaign_ref: typeof body.sender_campaign_ref === 'string' ? body.sender_campaign_ref : null,
      sender_domain: typeof body.sender_domain === 'string' ? body.sender_domain : process.env.OUTBOUND_SENDING_DOMAIN ?? null,
      cta_url: typeof body.cta_url === 'string' ? body.cta_url : null,
      status: 'draft',
      created_by: typeof body.created_by === 'string' ? body.created_by : 'agent',
    })
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, campaign: data })
}

export async function PATCH(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id, action, sender_campaign_ref, daily_cap } = (await req.json().catch(() => ({}))) as { id?: string; action?: string; sender_campaign_ref?: string; daily_cap?: number }
  if (!id || !action) return NextResponse.json({ error: 'id and action required' }, { status: 400 })
  const client = sb()
  const { data: c } = await client.from('sales_campaign').select('id, status, template_a, sender_campaign_ref').eq('id', id).maybeSingle()
  if (!c) return NextResponse.json({ error: 'campaign not found' }, { status: 404 })
  const now = new Date().toISOString()

  if (action === 'approve') {
    if (!c.template_a) return NextResponse.json({ error: 'campaign has no template' }, { status: 400 })
    const patch: Record<string, unknown> = { status: 'running', approved_by: 'moses', approved_at: now, paused_reason: null, updated_at: now }
    if (typeof sender_campaign_ref === 'string' && sender_campaign_ref.trim()) patch.sender_campaign_ref = sender_campaign_ref.trim()
    if (typeof daily_cap === 'number') patch.daily_cap = Math.max(1, Math.min(50, Math.floor(daily_cap)))
    const { error } = await client.from('sales_campaign').update(patch).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, status: 'running', note: process.env.OUTBOUND_AUTOSEND === '1' ? 'autosend on' : 'OUTBOUND_AUTOSEND is not 1 — nothing sends until it is' })
  }
  if (action === 'pause') {
    const { error } = await client.from('sales_campaign').update({ status: 'paused', paused_reason: 'moses', updated_at: now }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, status: 'paused' })
  }
  if (action === 'resume') {
    const { error } = await client.from('sales_campaign').update({ status: 'running', paused_reason: null, updated_at: now }).eq('id', id).not('approved_by', 'is', null)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, status: 'running' })
  }
  if (action === 'archive') {
    const { error } = await client.from('sales_campaign').update({ status: 'archived', updated_at: now }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, status: 'archived' })
  }
  return NextResponse.json({ error: `unknown action '${action}'` }, { status: 400 })
}
