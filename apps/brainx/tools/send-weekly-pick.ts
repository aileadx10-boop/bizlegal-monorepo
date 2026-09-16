#!/usr/bin/env tsx
/**
 * tools/send-weekly-pick.ts --free | --subscribers
 *
 * Two distinct sends, same underlying "here's this week's radar" content,
 * deliberately different consent bases:
 *
 *   --free        The public "one evidence-linked opportunity a week" list
 *                 (source='brainx' in the hub's newsletter_subscribers).
 *                 kind: 'marketing' — @bizlegal/email re-checks
 *                 double_optin_confirmed and suppression itself; a send here
 *                 that isn't actually confirmed is silently refused, not
 *                 silently sent.
 *   --subscribers The weekly radar email to PAYING subscribers. kind:
 *                 'transactional' — it is the deliverable the tier sells,
 *                 not a promotion of it (same justification pattern as
 *                 sellerradar's sendMonitorAlert).
 *
 * Picks the highest-scoring opportunity from the most recently completed
 * run. No nurture sequence — this is the entire cadence.
 */
import { sql } from '../lib/neon'
import { sendEmail } from '@bizlegal/email'
import { logEvent } from '../lib/ops/log'

interface TopOpportunity {
  id: string
  name: string
  problem: string
  slug: string | null
  opportunity_score: number
}

async function topOpportunity(): Promise<TopOpportunity | null> {
  const rows = (await sql()`
    select o.id, o.name, o.problem, o.slug, o.opportunity_score
    from opportunities o
    where o.status in ('build', 'validate')
    order by o.opportunity_score desc, o.last_scored_at desc
    limit 1
  `) as unknown as TopOpportunity[]
  return rows?.[0] ?? null
}

const SITE = process.env.NEXT_PUBLIC_BRAINX_SITE_URL ?? 'https://brainx.bizlegal-ai.com'

function pickHtml(top: TopOpportunity, ctaHref: string, ctaLabel: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family: Inter, -apple-system, sans-serif; background:#070A12; color:#E6ECF8; padding:40px 20px; margin:0;">
<div style="max-width:560px; margin:0 auto;">
  <div style="font-family:'JetBrains Mono',monospace; font-size:20px; font-weight:600; margin-bottom:24px;">Brain<span style="color:#43E0F5;">X</span></div>
  <h1 style="font-size:22px;">${top.name}</h1>
  <p style="font-size:14px; color:#9AA6C4; line-height:1.7;">${top.problem.slice(0, 400)}${top.problem.length > 400 ? '…' : ''}</p>
  <p style="font-size:12px; color:#5A6488;">Decision score: ${top.opportunity_score}/100</p>
  <a href="${ctaHref}" style="display:block; text-align:center; padding:14px; background:#43E0F5; color:#070A12; text-decoration:none; border-radius:8px; font-weight:700; margin-top:20px;">${ctaLabel} →</a>
  <p style="font-size:11px; color:#5A6488; font-family:'JetBrains Mono',monospace; margin-top:32px;">BrainX · ${SITE}<br>Weekly radar. Not legal advice; no outcome guarantee.</p>
</div></body></html>`
}

async function restSelect(path: string): Promise<ReadonlyArray<Record<string, unknown>>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return []
  const res = await fetch(`${url}/rest/v1/${path}`, { headers: { apikey: key, Authorization: `Bearer ${key}`, 'user-agent': 'bizlegal-agent/1.0' } })
  if (!res.ok) return []
  return (await res.json()) as ReadonlyArray<Record<string, unknown>>
}

async function sendFree(top: TopOpportunity): Promise<void> {
  const rows = await restSelect(`newsletter_subscribers?source=eq.brainx&double_optin_confirmed=eq.true&select=email`)
  console.log(`Sending weekly pick to ${rows.length} confirmed free subscribers...`)
  for (const r of rows) {
    const email = String(r.email ?? '')
    if (!email) continue
    const res = await sendEmail({ to: email, subject: `This week's opportunity: ${top.name}`, html: pickHtml(top, `${SITE}/pricing`, 'See the full radar'), kind: 'marketing' })
    if (!res.ok) console.warn(`  ${email}: ${res.error}`)
    else void logEvent({ type: 'email.sent', source: 'brainx', email, status: 'ok', metadata: { kind: 'weekly_pick_free', opportunity_id: top.id } })
  }
}

async function sendSubscribers(top: TopOpportunity): Promise<void> {
  const rows = (await sql()`select email from subscribers where active_until > now() and status <> 'revoked'`) as unknown as Array<{ email: string }>
  console.log(`Sending weekly radar to ${rows.length} paying subscribers...`)
  for (const r of rows) {
    const res = await sendEmail({ to: r.email, subject: `Your weekly radar: ${top.name}`, html: pickHtml(top, `${SITE}/radar`, 'Open your radar'), kind: 'transactional' })
    if (!res.ok) console.warn(`  ${r.email}: ${res.error}`)
    else void logEvent({ type: 'email.sent', source: 'brainx', email: r.email, status: 'ok', metadata: { kind: 'weekly_radar_subscriber', opportunity_id: top.id } })
  }
}

async function main(): Promise<void> {
  const mode = process.argv.includes('--subscribers') ? 'subscribers' : process.argv.includes('--free') ? 'free' : null
  if (!mode) {
    console.error('Usage: tsx tools/send-weekly-pick.ts --free | --subscribers')
    process.exit(2)
  }
  const top = await topOpportunity()
  if (!top) {
    console.log('No build/validate opportunity to send yet.')
    return
  }
  if (mode === 'free') await sendFree(top)
  else await sendSubscribers(top)
}

void main()
