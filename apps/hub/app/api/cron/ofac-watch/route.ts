import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@bizlegal/ops-log'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/cron/ofac-watch   (Vercel cron, CRON_SECRET bearer)
 *
 * Daily OFAC Sanctions List Watcher run (W2-6, O-008):
 *  1. Load every active watched address/entity from `watched_addresses`.
 *  2. Screen each against the `sanctions_cache` replica (OFAC SDN / UN / EU)
 *     using the same Postgres containment query as brai `screenAddress()`.
 *  3. Dedupe via `sanctions_alert_log` — a (email, address, list) match is
 *     alerted once.
 *  4. Email each new match (Resend raw fetch) with the SDN entry + source URL.
 *  5. Fire `sdn.match_detected` + `cron.completed` ops events.
 *
 * Manual re-run: same GET with the CRON_SECRET bearer header.
 */

const SECRET = process.env.CRON_SECRET ?? ''
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'intelligence@intelligence.bizlegal-ai.com'
const LISTS = ['ofac', 'un', 'eu'] as const
const LIST_SOURCES: Record<string, string> = {
  ofac: 'https://www.treasury.gov/ofac/downloads/sdn.xml',
  un: 'https://scsanctions.un.org/resources/xml/en/consolidated.xml',
  eu: 'https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content',
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function isAuthorized(req: NextRequest): boolean {
  if (!SECRET) return false
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${SECRET}`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface WatchedRow {
  id: number
  email: string
  address: string
  entity_name: string | null
  status: string
}

interface MatchHit {
  email: string
  address: string
  list: string
  matched_entity: string
  source_url: string
  list_version: string | null
}

/** Screen one address against the sanctions_cache replica (containment query). */
async function screenCached(address: string): Promise<Array<{ list: string; list_version: string | null }>> {
  const supabase = getSupabase()
  const lowered = address.toLowerCase()
  const hits: Array<{ list: string; list_version: string | null }> = []
  for (const list of LISTS) {
    const { data, error } = await supabase
      .from('sanctions_cache')
      .select('fetched_at,list_version')
      .eq('list', list)
      .contains('addresses', [lowered])
    if (error) continue
    if (data && data.length > 0) {
      hits.push({ list, list_version: (data[0].list_version as string | null) ?? null })
    }
  }
  return hits
}

async function alreadyAlerted(email: string, address: string, list: string): Promise<boolean> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('sanctions_alert_log')
    .select('id')
    .eq('email', email)
    .eq('address', address)
    .eq('list', list)
    .limit(1)
  return (data?.length ?? 0) > 0
}

async function recordAlert(hit: MatchHit): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase.from('sanctions_alert_log').insert({
    email: hit.email,
    address: hit.address,
    list: hit.list,
    matched_entity: hit.matched_entity,
    source_url: hit.source_url,
    list_version: hit.list_version,
  })
  return !error
}

async function sendAlertEmail(hit: MatchHit): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111827;">
    <h1 style="font-size:20px;margin:0 0 4px;">⚠️ Sanctions list match detected</h1>
    <p style="margin:0 0 16px;color:#6b7280;font-size:13px;">Your watched address/entity appeared on a sanctions list.</p>
    <table style="border-collapse:collapse;width:100%;font-size:13px;">
      <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Watched</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;">${escapeHtml(hit.address)}</td></tr>
      <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">List</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;">${escapeHtml(hit.list.toUpperCase())}</td></tr>
      <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Match</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${escapeHtml(hit.matched_entity)}</td></tr>
      <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Source</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;"><a href="${escapeHtml(hit.source_url)}" style="color:#4f46e5;">${escapeHtml(hit.source_url)}</a></td></tr>
    </table>
    <p style="margin-top:24px;font-size:11px;color:#9ca3af;line-height:1.5;">
      This is a <strong>possible match</strong> — verify independently against the official list before taking any action.
      This alert is monitoring intelligence, not a legal opinion, and carries no guarantee against false positives or negatives.
    </p>
  </div>`
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `BizLegal AI Intelligence <${FROM_EMAIL}>`,
        to: [hit.email],
        subject: `Sanctions match: ${hit.address} on ${hit.list.toUpperCase()}`,
        html,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  logEventAsync({ type: 'cron.fired', source: 'hub', ref_id: 'ofac-watch', status: 'ok' })

  try {
    const supabase = getSupabase()

    // 1. Load active watched addresses.
    const { data: watched, error: watchErr } = await supabase
      .from('watched_addresses')
      .select('id,email,address,entity_name,status')
      .eq('status', 'active')
      .order('created_at', { ascending: true })
    if (watchErr) {
      logEventAsync({ type: 'cron.completed', source: 'hub', ref_id: 'ofac-watch', status: 'failed', metadata: { reason: watchErr.message } })
      return NextResponse.json({ ok: false, error: watchErr.message }, { status: 500 })
    }
    const rows = (watched ?? []) as WatchedRow[]

    // 2-4. Screen each, dedupe, alert.
    const newHits: MatchHit[] = []
    let screened = 0
    let alreadySeen = 0
    let emailSent = 0
    let emailFailed = 0

    for (const row of rows) {
      screened++
      const matches = await screenCached(row.address)
      for (const m of matches) {
        if (await alreadyAlerted(row.email, row.address, m.list)) {
          alreadySeen++
          continue
        }
        const hit: MatchHit = {
          email: row.email,
          address: row.address,
          list: m.list,
          matched_entity: row.entity_name ?? `${m.list.toUpperCase()} list entry (address match)`,
          source_url: LIST_SOURCES[m.list] ?? '',
          list_version: m.list_version,
        }
        const recorded = await recordAlert(hit)
        if (!recorded) continue
        newHits.push(hit)
        const ok = await sendAlertEmail(hit)
        if (ok) {
          emailSent++
          logEventAsync({
            type: 'sdn.match_detected',
            source: 'hub',
            ref_id: 'ofac-watch',
            email: row.email,
            status: 'ok',
            metadata: { address: row.address, list: m.list, matched_entity: hit.matched_entity },
          })
        } else {
          emailFailed++
        }
      }
      // Mark checked.
      await supabase.from('watched_addresses').update({ last_checked_at: new Date().toISOString() }).eq('id', row.id)
    }

    logEventAsync({
      type: 'cron.completed',
      source: 'hub',
      ref_id: 'ofac-watch',
      status: 'ok',
      metadata: {
        watched: rows.length,
        screened,
        already_seen: alreadySeen,
        new_matches: newHits.length,
        emails_sent: emailSent,
        emails_failed: emailFailed,
      },
    })

    return NextResponse.json({
      ok: true,
      watched: rows.length,
      screened,
      already_seen: alreadySeen,
      new_matches: newHits.length,
      emails_sent: emailSent,
      emails_failed: emailFailed,
    })
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown error'
    logEventAsync({ type: 'cron.completed', source: 'hub', ref_id: 'ofac-watch', status: 'failed', metadata: { reason } })
    return NextResponse.json({ ok: false, error: reason }, { status: 500 })
  }
}
