import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  MICA_BASELINE,
  MICA_BASELINE_SOURCES,
  fetchEsmNews,
  isMicaRelevant,
  toView,
  type MicaDeadline,
} from '@/lib/mica-deadlines'
import { logEventAsync } from '@bizlegal/ops-log'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * GET /api/cron/mica-deadlines   (Vercel cron, CRON_SECRET bearer)
 *
 * Daily MiCA deadline tracker run:
 *  1. Seed the curated baseline (statutory dates + citations) into
 *     `mica_deadlines` — idempotent via the (source_url, deadline_date)
 *     unique constraint.
 *  2. Best-effort ESMA RSS pull for fresh MiCA activity (never fatal —
 *     a dead feed still leaves the baseline + digest intact).
 *  3. Email each active subscriber the daily digest (Resend raw fetch).
 *  4. Fire `mica.deadline.alert` + `cron.completed` ops events.
 *
 * Manual re-run: same GET with the CRON_SECRET bearer header.
 */

const SECRET = process.env.CRON_SECRET ?? ''
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'intelligence@intelligence.bizlegal-ai.com'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isAuthorized(req: NextRequest): boolean {
  if (!SECRET) return false
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${SECRET}`
}

/** Upsert the curated baseline. Returns {upserted, rows} counts. */
async function seedBaseline() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return { ok: false, reason: 'missing supabase env' }
  }

  const rows = MICA_BASELINE.map((r) => ({
    title: r.title,
    description: r.description,
    deadline_date: r.deadline_date,
    source_name: r.source_name,
    source_url: r.source_url,
    jurisdiction: r.jurisdiction,
    item_type: r.item_type,
  }))

  const { error } = await supabase
    .from('mica_deadlines')
    .upsert(rows, { onConflict: 'source_url,deadline_date', ignoreDuplicates: false })
  if (error) return { ok: false, reason: error.message }

  const { data, error: selErr } = await supabase
    .from('mica_deadlines')
    .select('*')
    .order('deadline_date', { ascending: true })
  if (selErr) return { ok: true, reason: `seed ok, select failed: ${selErr.message}`, rows: [] }

  return { ok: true, rows: data as Array<MicaDeadline & { id: number }> }
}

async function loadActiveSubscribers() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
  const { data, error } = await supabase
    .from('mica_deadline_subs')
    .select('email, jurisdiction')
    .eq('status', 'active')
    .order('created_at', { ascending: true })
  if (error) return []
  return (data ?? []).map((r) => ({ email: r.email as string, jurisdiction: (r.jurisdiction ?? 'EU') as string }))
}

function buildDigestHtml(view: ReturnType<typeof toView>, esmaHits: Array<{ title: string; link: string }>): string {
  const urgent = view.filter((v) => v.isUrgent && !v.isPast)
  const upcoming = view.filter((v) => !v.isUrgent && !v.isPast)
  const past = view.filter((v) => v.isPast)

  const rowsHtml = (rows: typeof view) =>
    rows
      .map(
        (r) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">
          <strong>${escapeHtml(r.title)}</strong><br/>
          <span style="color:#6b7280;">${escapeHtml(r.description)}</span><br/>
          <span style="font-size:11px;color:#9ca3af;">${escapeHtml(r.source_name)} · ${escapeHtml(r.jurisdiction)}</span>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;white-space:nowrap;font-weight:600;">
          ${r.deadline_date}
        </td>
      </tr>`
      )
      .join('')

  const esmaSection = esmaHits.length
    ? `<h3 style="font-size:15px;margin:24px 0 8px;">Fresh ESMA activity</h3>
       <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.6;">${esmaHits
         .map((h) => `<li><a href="${escapeHtml(h.link)}" style="color:#4f46e5;">${escapeHtml(h.title)}</a></li>`)
         .join('')}</ul>`
    : ''

  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111827;">
    <h1 style="font-size:20px;margin:0 0 4px;">MiCA Deadline Tracker — daily digest</h1>
    <p style="margin:0 0 16px;color:#6b7280;font-size:13px;">Curated statutory milestones with citations. Deadlines change — verify with your NCA.</p>

    ${urgent.length ? `<h2 style="font-size:16px;color:#b45309;">⚠️ Urgent (within 90 days)</h2><table style="border-collapse:collapse;width:100%;">${rowsHtml(urgent)}</table>` : ''}
    ${upcoming.length ? `<h2 style="font-size:16px;margin-top:24px;">Upcoming</h2><table style="border-collapse:collapse;width:100%;">${rowsHtml(upcoming)}</table>` : ''}
    ${past.length ? `<h2 style="font-size:16px;margin-top:24px;color:#6b7280;">Passed milestones</h2><table style="border-collapse:collapse;width:100%;">${rowsHtml(past)}</table>` : ''}

    ${esmaSection}

    <p style="margin-top:24px;font-size:11px;color:#9ca3af;line-height:1.5;">
      This digest cites official sources (EUR-Lex, ESMA). It is informational monitoring, not legal advice.
      Confirm every deadline against your National Competent Authority. <a href="https://bizlegal-ai.com/mica-deadlines" style="color:#4f46e5;">Open the live tracker</a>.
    </p>
  </div>`
}

async function sendDigest(email: string, html: string, jurisdiction: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `BizLegal AI Intelligence <${FROM_EMAIL}>`,
        to: [email],
        subject: `MiCA Deadline Tracker — ${jurisdiction} digest`,
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
  logEventAsync({ type: 'cron.fired', source: 'hub', ref_id: 'mica-deadlines', status: 'ok' })

  // 1. Seed baseline + load current rows.
  const seeded = await seedBaseline()
  const rows = seeded.rows ?? []
  if (!seeded.ok) {
    logEventAsync({ type: 'cron.completed', source: 'hub', ref_id: 'mica-deadlines', status: 'failed', metadata: { reason: seeded.reason } })
    return NextResponse.json({ ok: false, error: seeded.reason }, { status: 500 })
  }

  // 2. Best-effort ESMA RSS enhancement.
  const esmaItems = await fetchEsmNews()
  const esmaHits = esmaItems.filter((i) => isMicaRelevant(i.title)).slice(0, 8)

  // 3. Build + send digest to active subscribers.
  const subs = await loadActiveSubscribers()
  const view = toView(rows)
  const html = buildDigestHtml(view, esmaHits)
  let sent = 0
  let failed = 0
  for (const sub of subs) {
    const ok = await sendDigest(sub.email, html, sub.jurisdiction)
    if (ok) {
      sent++
      logEventAsync({
        type: 'mica.deadline.alert',
        source: 'hub',
        ref_id: 'mica-deadlines',
        email: sub.email,
        status: 'ok',
        metadata: { jurisdiction: sub.jurisdiction, urgent_count: view.filter((v) => v.isUrgent && !v.isPast).length },
      })
    } else {
      failed++
    }
  }

  logEventAsync({
    type: 'cron.completed',
    source: 'hub',
    ref_id: 'mica-deadlines',
    status: 'ok',
    metadata: {
      rows: rows.length,
      esma_hits: esmaHits.length,
      subscribers: subs.length,
      emails_sent: sent,
      emails_failed: failed,
      sources: MICA_BASELINE_SOURCES,
    },
  })

  return NextResponse.json({
    ok: true,
    rows: rows.length,
    esma_hits: esmaHits.length,
    subscribers: subs.length,
    emails_sent: sent,
    emails_failed: failed,
  })
}
