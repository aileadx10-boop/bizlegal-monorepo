import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Daily cron — pulls FinCEN BOI guidance from federalregister.gov, caches
 * to boi_rule_index, then notifies any boi_subscriptions row whose entity
 * type is affected by a new rule OR whose 30-day refile window approaches.
 *
 * Authentication: CRON_SECRET in Authorization: Bearer header.
 *
 * Schedule: 0 14 * * *  (daily 14:00 UTC)
 */

interface FederalRegisterDoc {
  document_number: string
  title: string
  abstract?: string | null
  publication_date: string  // YYYY-MM-DD
  effective_on?: string | null
  html_url: string
  agencies?: Array<{ name: string; raw_name?: string }>
  type: string  // 'Rule' | 'Proposed Rule' | 'Notice' | 'Presidential Document'
}

interface BoiSubRow {
  id: number
  user_email: string
  entity_legal_name: string
  entity_type: string | null
  entity_filing_date: string | null
  last_notified_at: string | null
}

const FINCEN_QUERY =
  'https://www.federalregister.gov/api/v1/documents?conditions[agencies][]=financial-crimes-enforcement-network&conditions[term]=beneficial+ownership&per_page=20&fields[]=document_number&fields[]=title&fields[]=abstract&fields[]=publication_date&fields[]=effective_on&fields[]=html_url&fields[]=agencies&fields[]=type'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

function affectsAllFilingTypes(title: string, abstract: string | null): string[] {
  // Heuristic: if abstract mentions specific entity types, narrow; else default to ['all']
  const text = `${title} ${abstract ?? ''}`.toLowerCase()
  const types: string[] = []
  if (text.includes('llc') || text.includes('limited liability company')) types.push('LLC')
  if (text.includes('corporation') || text.includes(' corp ')) types.push('Corp')
  if (text.includes('partnership') || text.includes('llp')) types.push('LLP', 'LP')
  if (text.includes('professional')) types.push('PLLC')
  return types.length > 0 ? types : ['all']
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') ?? ''
    const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
    if (!process.env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()
    const fetchedAt = new Date().toISOString()

    // 1. Pull latest FinCEN BOI documents
    const fr = await fetch(FINCEN_QUERY, { headers: { 'User-Agent': 'BizLegal-AI-BOI-Tracker/1.0' } })
    if (!fr.ok) {
      console.error('[cron/boi/check] federalregister fetch failed', fr.status)
      return NextResponse.json({ error: 'federalregister fetch failed' }, { status: 502 })
    }
    const frJson = (await fr.json()) as { results?: FederalRegisterDoc[] }
    const docs = frJson.results ?? []

    // 2. Upsert into boi_rule_index — only insert new ones (last 24h)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const newRules: typeof docs = []
    for (const doc of docs) {
      const { data: existing } = await supabase
        .from('boi_rule_index')
        .select('rule_id')
        .eq('rule_id', doc.document_number)
        .maybeSingle()
      if (existing) continue

      await supabase.from('boi_rule_index').insert({
        rule_id: doc.document_number,
        title: doc.title,
        abstract: doc.abstract ?? null,
        publication_date: doc.publication_date,
        effective_date: doc.effective_on ?? null,
        rule_url: doc.html_url,
        agency: 'fincen',
        affects_filing_types: affectsAllFilingTypes(doc.title, doc.abstract ?? null),
        fetched_at: fetchedAt,
      })

      // Only notify on rules published in the last 24h to avoid spamming on first cron run
      if (doc.publication_date >= since) newRules.push(doc)
    }

    // 3. Pull active subscribers
    const { data: subs } = await supabase
      .from('boi_subscriptions')
      .select('id, user_email, entity_legal_name, entity_type, entity_filing_date, last_notified_at')
      .eq('status', 'active')

    const subscribers = (subs ?? []) as BoiSubRow[]
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    let notifiedRules = 0
    let notifiedDeadlines = 0

    for (const sub of subscribers) {
      const newRulesForSub = newRules.filter((d) => {
        const types = affectsAllFilingTypes(d.title, d.abstract ?? null)
        return types.includes('all') || (sub.entity_type && types.includes(sub.entity_type))
      })

      // Deadline window: 30 days from a "material change" — proxy = filing_date + 30d
      // (When entity ownership/address actually changes, customer would update entity_filing_date.)
      let deadlineDue = false
      if (sub.entity_filing_date) {
        const filing = new Date(sub.entity_filing_date)
        const dueAt = new Date(filing.getTime() + 30 * 24 * 60 * 60 * 1000)
        const daysUntil = Math.floor((dueAt.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
        // Notify when 7, 3, 1 days remain
        deadlineDue = daysUntil === 7 || daysUntil === 3 || daysUntil === 1 || daysUntil === 0
      }

      if (newRulesForSub.length === 0 && !deadlineDue) continue

      await sendNotification(sub, newRulesForSub, deadlineDue)
      if (newRulesForSub.length > 0) notifiedRules++
      if (deadlineDue) notifiedDeadlines++

      logEventAsync({
        type: 'boi.alert.sent',
        source: 'hub',
        ref_id: String(sub.id),
        email: sub.user_email,
        status: 'ok',
        metadata: {
          new_rules: newRulesForSub.length,
          deadline_due: deadlineDue,
          entity_legal_name: sub.entity_legal_name,
        },
      })

      await supabase
        .from('boi_subscriptions')
        .update({ last_notified_at: fetchedAt })
        .eq('id', sub.id)
    }

    logEventAsync({
      type: 'cron.completed',
      source: 'hub',
      ref_id: 'boi/check',
      status: 'ok',
      metadata: {
        cron: 'boi/check',
        docs_fetched: docs.length,
        new_rules: newRules.length,
        subscribers: subscribers.length,
        notified_rules: notifiedRules,
        notified_deadlines: notifiedDeadlines,
      },
    })

    return NextResponse.json({
      ok: true,
      docs_fetched: docs.length,
      new_rules: newRules.length,
      subscribers: subscribers.length,
      notified_rules: notifiedRules,
      notified_deadlines: notifiedDeadlines,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[cron/boi/check]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function sendNotification(
  sub: BoiSubRow,
  newRules: FederalRegisterDoc[],
  deadlineDue: boolean,
): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'intelligence@intelligence.bizlegal-ai.com'
  const replyTo = process.env.RESEND_REPLY_TO ?? 'team@bizlegal-ai.com'

  const subject = deadlineDue
    ? `BOI deadline approaching · ${sub.entity_legal_name}`
    : `New FinCEN guidance affects ${sub.entity_legal_name}`

  const ruleBlocks = newRules
    .map(
      (r) => `<div style="border-left:3px solid #5b21b6;padding-left:16px;margin-bottom:16px">
<strong style="color:#0e0b1a">${escapeHtml(r.title)}</strong><br>
<span style="font-size:12px;color:#6b6188">Published ${r.publication_date} · ${escapeHtml(r.type)}</span><br>
<p style="line-height:1.55;color:#4b3f6a;margin:6px 0">${escapeHtml((r.abstract ?? '').slice(0, 320))}</p>
<a href="${r.html_url}" style="color:#5b21b6;font-size:13px">Read full text →</a>
</div>`,
    )
    .join('')

  const deadlineBlock = deadlineDue
    ? `<div style="background:#fef3c7;border:1px solid #f59e0b;padding:14px 18px;border-radius:8px;margin-bottom:18px">
<strong style="color:#7c2d12">Refile window opening soon.</strong><br>
<span style="font-size:13px;color:#7c2d12">If ownership, address, or beneficial-owner identity has changed since your last filing, you have 30 days from the change date to refile. Penalty for non-filing is up to $500/day capped at $10K.</span>
</div>`
    : ''

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `BizLegal AI Intelligence <${fromEmail}>`,
      to: [sub.user_email],
      reply_to: replyTo,
      subject,
      html: `<div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0e0b1a">
<h2 style="font-weight:800;letter-spacing:-0.02em;margin:0 0 16px">${escapeHtml(subject)}</h2>
${deadlineBlock}
${ruleBlocks}
<p style="font-size:12px;color:#6b6188;margin-top:24px">Tracking ${escapeHtml(sub.entity_legal_name)}. Disclosure v1.0.0-p4 — Intelligence not legal advice. Reply for support.</p>
</div>`,
    }),
  }).catch((e) => console.warn('[cron/boi/check] notify failed', e))
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
