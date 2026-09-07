/**
 * Campaign state for the dispatch cron: caps from sales_cap (constants),
 * per-campaign counters from sales_outreach, per-recipient cadence, and the
 * trailing reputation window. Every number comes from a table query; nothing
 * is remembered between runs.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { OutboundCampaignState, OutboundThresholds, OutboundTrailingStats } from '@bizlegal/email'
import { DEFAULT_THRESHOLDS } from '@bizlegal/email'

export interface CampaignRow {
  readonly id: string
  readonly name: string
  readonly status: OutboundCampaignState['status']
  readonly approved_by: string | null
  readonly sender_campaign_ref: string | null
  readonly sender_domain: string | null
  readonly mailboxes: number | null
  readonly daily_cap: number | null
  readonly lawful_basis: string | null
  readonly jurisdictions: readonly string[] | null
  readonly product_id: string | null
}

export interface OutboundCaps {
  readonly dailyCapPerMailbox: number
  readonly hardMaxPerMailbox: number
  readonly cooldownDays: number
  readonly maxTouchesPer30d: number
  readonly trailingWindow: number
  readonly thresholds: OutboundThresholds
  readonly replyAutoSend: boolean
  readonly followupsMax: number
}

export const CAP_DEFAULTS: OutboundCaps = {
  dailyCapPerMailbox: 20,
  hardMaxPerMailbox: 50,
  cooldownDays: 5,
  maxTouchesPer30d: 3,
  trailingWindow: 200,
  thresholds: DEFAULT_THRESHOLDS,
  replyAutoSend: true,
  followupsMax: 2,
}

/** sales_cap rows → caps. Unknown or missing rows keep the conservative default. */
export function capsFromRows(rows: ReadonlyArray<{ name: string; value_int: number | null; value_text: string | null }>): OutboundCaps {
  const get = (name: string, fallback: number): number => {
    const r = rows.find((x) => x.name === name)
    return r && typeof r.value_int === 'number' ? r.value_int : fallback
  }
  const dailyCapPerMailbox = Math.min(get('outbound_daily_cap_per_mailbox', CAP_DEFAULTS.dailyCapPerMailbox), CAP_DEFAULTS.hardMaxPerMailbox)
  return {
    dailyCapPerMailbox,
    hardMaxPerMailbox: CAP_DEFAULTS.hardMaxPerMailbox,
    cooldownDays: get('cooldown_days_between_touches', CAP_DEFAULTS.cooldownDays),
    maxTouchesPer30d: get('max_outreach_per_lead_per_30d', CAP_DEFAULTS.maxTouchesPer30d),
    trailingWindow: get('outbound_trailing_window', CAP_DEFAULTS.trailingWindow),
    thresholds: {
      minSends: get('outbound_auto_pause_min_sends', CAP_DEFAULTS.thresholds.minSends),
      bouncePct: get('outbound_auto_pause_bounce_pct_x100', CAP_DEFAULTS.thresholds.bouncePct * 100) / 100,
      complaintPct: get('outbound_auto_pause_complaint_pct_x100', CAP_DEFAULTS.thresholds.complaintPct * 100) / 100,
    },
    replyAutoSend: get('outbound_reply_auto_send', 1) === 1,
    followupsMax: get('outbound_followups_max', CAP_DEFAULTS.followupsMax),
  }
}

export async function readCaps(supabase: SupabaseClient): Promise<OutboundCaps> {
  const { data } = await supabase.from('sales_cap').select('name, value_int, value_text')
  return capsFromRows((data ?? []) as Array<{ name: string; value_int: number | null; value_text: string | null }>)
}

/** Trailing reputation window from the last N sends of a campaign. */
export function trailingStats(rows: ReadonlyArray<{ status: string }>): OutboundTrailingStats {
  let bounces = 0
  let complaints = 0
  for (const r of rows) {
    if (r.status === 'bounced') bounces++
    if (r.status === 'complained') complaints++
  }
  return { sends: rows.length, bounces, complaints }
}

function daysBetweenIso(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000)
}

export async function campaignStateFor(
  supabase: SupabaseClient,
  campaign: CampaignRow,
  leadId: string,
  caps: OutboundCaps,
  now = new Date(),
): Promise<OutboundCampaignState> {
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
  const since30 = new Date(now.getTime() - 30 * 86_400_000).toISOString()

  const [{ count: sentToday }, { data: trailingRows }, { data: touches }] = await Promise.all([
    supabase.from('sales_outreach').select('id', { count: 'exact', head: true }).eq('campaign_id', campaign.id).not('sent_at', 'is', null).gte('sent_at', todayStart),
    supabase.from('sales_outreach').select('status').eq('campaign_id', campaign.id).not('sent_at', 'is', null).order('sent_at', { ascending: false }).limit(caps.trailingWindow),
    supabase.from('sales_outreach').select('sent_at').eq('lead_id', leadId).not('sent_at', 'is', null).gte('sent_at', since30).order('sent_at', { ascending: false }),
  ])

  const touchRows = (touches ?? []) as Array<{ sent_at: string }>
  const last = touchRows[0]?.sent_at ?? null

  return {
    id: campaign.id,
    status: campaign.status,
    approvedBy: campaign.approved_by,
    providerCampaignRef: campaign.sender_campaign_ref,
    dailyCapPerMailbox: Math.min(campaign.daily_cap ?? caps.dailyCapPerMailbox, caps.dailyCapPerMailbox),
    mailboxes: Math.max(1, campaign.mailboxes ?? 1),
    sentToday: sentToday ?? 0,
    touchesLast30d: touchRows.length,
    daysSinceLastTouch: last ? daysBetweenIso(last, now.toISOString()) : null,
    cooldownDays: caps.cooldownDays,
    maxTouchesPer30d: caps.maxTouchesPer30d,
    trailing: trailingStats((trailingRows ?? []) as Array<{ status: string }>),
  }
}
