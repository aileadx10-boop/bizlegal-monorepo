// app/api/cron/outbound-dispatch/route.ts
//
// The only caller of sendOutbound() in the fleet (rule 7 v2). Every 30
// minutes: for each RUNNING campaign, take drafted/approved rows, verify the
// address if it has never been verified, derive the lawful basis from the
// jurisdiction matrix, compute the campaign state from tables, and hand the
// message to @bizlegal/email, which refuses unless every invariant holds.
//
// Fail-closed switches, all of which must be true for a single send:
//   OUTBOUND_AUTOSEND=1 · campaign.status='running' · campaign.approved_by
//   · INSTANTLY_API_KEY present · sender_campaign_ref present ·
//   OUTBOUND_SENDING_DOMAIN + OUTBOUND_POSTAL_ADDRESS present (non-placeholder).
//
// Auth: Bearer CRON_SECRET (404 on mismatch, like social-queue).

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { instantlySender, sendOutbound, shouldAutoPause, type OutboundRefusal } from '@bizlegal/email'
import { logEventAsync } from '@/lib/ops/log'
import { sendToTelegram } from '@/lib/agents/ea-runner'
import { campaignStateFor, readCaps, trailingStats, type CampaignRow } from '@/lib/outbound/campaign'
import { basisFor } from '@/lib/outbound/lawful-basis'
import { verifyEmailAddress } from '@/lib/outbound/verify'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_PER_RUN = 50
/** Refusals that will never clear on their own: the row is closed, not retried. */
const PERMANENT: ReadonlySet<OutboundRefusal> = new Set(['not_valid', 'role_inbox', 'blocked_domain', 'suppressed', 'invalid_recipient', 'no_lawful_basis', 'unsupported_basis', 'no_source_url'])

interface LeadRow {
  id: string
  email: string
  full_name: string | null
  company: string | null
  jurisdiction: string | null
  lawful_basis: string | null
  source_url: string | null
  email_verified_at: string | null
  verification_status: string | null
  status: string
}

interface OutreachRow {
  id: string
  lead_id: string
  subject: string | null
  body: string
  status: string
  variant: string | null
  step: number | null
  approved_at: string | null
  approved_by: string | null
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization') ?? ''
  const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (new URL(req.url).searchParams.get('token') ?? '')
  const expected = process.env.CRON_SECRET ?? ''
  if (!expected || provided !== expected) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'supabase env missing' }, { status: 500 })
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  const autosendEnabled = process.env.OUTBOUND_AUTOSEND === '1'
  const senderDomain = process.env.OUTBOUND_SENDING_DOMAIN ?? null
  const postalAddress = process.env.OUTBOUND_POSTAL_ADDRESS ?? null
  const apiKey = process.env.INSTANTLY_API_KEY ?? ''
  const sender = apiKey ? instantlySender({ apiKey }) : null

  const caps = await readCaps(sb)
  const { data: campaigns } = await sb.from('sales_campaign').select('*').eq('status', 'running').limit(10)

  const summary = { campaigns: campaigns?.length ?? 0, considered: 0, sent: 0, refused: 0, paused: 0, refusals: {} as Record<string, number> }
  let budget = MAX_PER_RUN

  for (const campaign of (campaigns ?? []) as CampaignRow[]) {
    if (budget <= 0) break

    // 7 — reputation breach pauses the campaign before anything else runs.
    const { data: trailingRows } = await sb.from('sales_outreach').select('status').eq('campaign_id', campaign.id).not('sent_at', 'is', null).order('sent_at', { ascending: false }).limit(caps.trailingWindow)
    const stats = trailingStats((trailingRows ?? []) as Array<{ status: string }>)
    if (shouldAutoPause(stats, caps.thresholds)) {
      await sb.from('sales_campaign').update({ status: 'paused', paused_reason: `auto: bounces ${stats.bounces}/${stats.sends}, complaints ${stats.complaints}/${stats.sends}`, updated_at: new Date().toISOString() }).eq('id', campaign.id)
      await sendToTelegram(`*Outbound auto-paused* — ${campaign.name}\nbounces ${stats.bounces}/${stats.sends} · complaints ${stats.complaints}/${stats.sends}\nResume on /sales only after the list is cleaned.`)
      summary.paused++
      continue
    }

    const { data: rows } = await sb.from('sales_outreach').select('id, lead_id, subject, body, status, variant, step, approved_at, approved_by').eq('campaign_id', campaign.id).in('status', ['drafted', 'approved']).order('drafted_at', { ascending: true }).limit(budget)

    for (const row of (rows ?? []) as OutreachRow[]) {
      if (budget <= 0) break
      summary.considered++
      const { data: lead } = await sb.from('sales_lead').select('id, email, full_name, company, jurisdiction, lawful_basis, source_url, email_verified_at, verification_status, status').eq('id', row.lead_id).maybeSingle()
      if (!lead) continue
      const l = lead as LeadRow

      // 1 — verify once, persist the provider's answer, never construct an address.
      let verifiedAt = l.email_verified_at
      let verificationStatus = l.verification_status
      if (!verifiedAt) {
        const v = await verifyEmailAddress(l.email)
        if (v.provider !== 'none') {
          verifiedAt = v.checkedAt
          verificationStatus = v.status
          await sb.from('sales_lead').update({ email_verified_at: verifiedAt, verification_status: verificationStatus, verification_sub_status: v.subStatus }).eq('id', l.id)
        }
      }

      // 2 — lawful basis from the matrix (US only in v1), persisted when first derived.
      let basis = l.lawful_basis
      if (!basis) {
        basis = basisFor(l.jurisdiction)
        if (basis) await sb.from('sales_lead').update({ lawful_basis: basis }).eq('id', l.id)
      }

      const state = await campaignStateFor(sb, campaign, l.id, caps)
      const result = await sendOutbound(
        {
          recipient: {
            email: l.email,
            jurisdiction: l.jurisdiction,
            lawfulBasis: (basis as 'us_can_spam' | 'ca_casl_published' | 'au_spam_act_published' | 'uk_pecr_corporate' | null) ?? null,
            sourceUrl: l.source_url,
            verifiedAt,
            verificationStatus: l.status === 'unsubscribed' ? 'unsubscribed' : verificationStatus,
            firstName: (l.full_name ?? '').split(' ')[0] || undefined,
            companyName: l.company ?? undefined,
          },
          campaign: state,
          subject: row.subject ?? 'A note from BizLegal AI',
          body: row.body,
          postalAddress,
          // Instantly renders its own one-click unsubscribe from this merge tag inside the footer.
          unsubscribeUrl: '{{unsubscribe}}',
          senderDomain,
          autosendEnabled,
          variables: { variant: row.variant ?? 'a', step: String(row.step ?? 0) },
        },
        sender,
      )

      const now = new Date().toISOString()
      if (!result.ok) {
        summary.refused++
        summary.refusals[result.refusal] = (summary.refusals[result.refusal] ?? 0) + 1
        const patch: Record<string, unknown> = { last_refusal: result.refusal, last_refusal_at: now }
        if (PERMANENT.has(result.refusal)) patch.status = 'rejected_suppressed'
        await sb.from('sales_outreach').update(patch).eq('id', row.id)
        if (PERMANENT.has(result.refusal)) await sb.from('sales_event').insert({ lead_id: l.id, outreach_id: row.id, event_type: 'suppressed', details: { refusal: result.refusal, detail: result.detail ?? null }, actor: 'outbound-dispatch' })
        continue
      }

      // 8 — consent log → send log → outreach row → lead status, in that order so a crash leaves evidence, not a phantom send.
      const { data: consent } = await sb.from('sales_consent_log').insert({ lead_id: l.id, outreach_id: row.id, consent_type: 'published_business_address', evidence_url: l.source_url }).select('id').maybeSingle()
      await sb.from('email_send_log').insert({
        to_email: l.email.toLowerCase(),
        from_email: `outbound@${senderDomain}`,
        subject: row.subject ?? '',
        body_excerpt: result.body.slice(0, 200),
        resend_message_id: result.providerMessageId ?? null,
        resend_status: 'sent',
        campaign: campaign.id,
        consent_log_id: consent?.id ?? null,
        suppression_checked: true,
        sent_at: now,
      })
      await sb.from('sales_outreach').update({
        status: 'sent',
        sent_at: now,
        approved_at: row.approved_at ?? campaign.approved_by ? now : null,
        approved_by: row.approved_by ?? campaign.approved_by,
        sender_provider: result.sender,
        sender_message_id: result.providerMessageId ?? null,
        consent_logged: true,
        suppression_checked: true,
        last_refusal: null,
      }).eq('id', row.id)
      await sb.from('sales_lead').update({ status: 'contacted', updated_at: now }).eq('id', l.id).in('status', ['new', 'qualifying'])
      await sb.from('sales_event').insert({ lead_id: l.id, outreach_id: row.id, event_type: 'sent', details: { campaign: campaign.id, variant: row.variant ?? 'a', step: row.step ?? 0, provider: result.sender }, actor: 'outbound-dispatch' })
      logEventAsync({ type: 'email.sent', source: 'hub', ref_id: row.id, email: l.email, status: 'ok', metadata: { campaign: campaign.id, provider: result.sender, kind: 'outbound' } })
      summary.sent++
      budget--
    }
  }

  logEventAsync({ type: 'cron.completed', source: 'hub', ref_id: 'outbound-dispatch', metadata: { cron: 'outbound-dispatch', ...summary, autosend: autosendEnabled, sender: sender?.name ?? null } })
  return NextResponse.json({ ok: true, autosend: autosendEnabled, sender: sender?.name ?? null, ...summary })
}
