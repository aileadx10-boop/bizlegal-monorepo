/**
 * @bizlegal/email — kind 'outbound' (rule 7 v2, amended 2026-09-07).
 *
 * The 2026-07-10 pipeline fabricated addresses, sent from the transactional
 * domain with no approval step, and had a kill-switch that failed open. Every
 * one of those failure modes is an invariant here, enforced inside the
 * package so a caller that forgets is indistinguishable from one that
 * decided not to:
 *
 *   1. the address is provider-verified (`valid`), never constructed;
 *      role inboxes and blocked domains are refused
 *   2. a lawful basis for the recipient's jurisdiction is recorded with the
 *      URL where the business address was published
 *   3. suppression is checked with a fail-closed store lookup
 *   4. the campaign is approved AND running AND the autosend switch is on;
 *      any of them absent → refuse (fail closed)
 *   5. caps are constants supplied by the caller from sales_cap, with a hard
 *      per-mailbox ceiling here that no table value can raise
 *   6. the CAN-SPAM footer (postal address, unsubscribe, the two required
 *      lines) is assembled here, never by a template
 *   7. a campaign whose trailing bounce or complaint rate breached its
 *      threshold is refused until a person resumes it
 *
 * Cold mail goes to the dedicated sender adapter, never to Resend.
 */
import { isSuppressed, readConfig, type EmailConfig } from './index'
import type { OutboundSender } from './senders/types'

export type LawfulBasis = 'us_can_spam' | 'ca_casl_published' | 'au_spam_act_published' | 'uk_pecr_corporate'

/** Bases the fleet is allowed to send under today. Phase 2 adds CA/AU/UK-corporate. */
export const V1_LAWFUL_BASES: ReadonlySet<LawfulBasis> = new Set<LawfulBasis>(['us_can_spam'])

/** No table value can raise this. */
export const HARD_MAX_PER_MAILBOX_PER_DAY = 50

export const ROLE_INBOX_PREFIXES: readonly string[] = [
  'info', 'admin', 'office', 'contact', 'hello', 'sales', 'support', 'billing', 'accounts', 'accounting',
  'compliance', 'legal', 'abuse', 'noreply', 'no-reply', 'donotreply', 'postmaster', 'webmaster', 'marketing',
  'team', 'mail', 'enquiries', 'inquiries', 'reception', 'intake', 'help', 'press', 'privacy', 'security', 'hr', 'jobs', 'careers',
]

export const BLOCKED_DOMAIN_SUFFIXES: readonly string[] = ['.gov', '.mil', '.edu', '.gov.uk', '.gc.ca', '.gov.au', '.gov.il']

export const COMPETITOR_DOMAINS: readonly string[] = [
  'clio.com', 'mycase.com', 'smokeball.com', 'pointone.com', 'laurel.ai', 'tempello.ai', 'billables.ai', 'wisetime.com',
  'memtime.com', 'practicepanther.com', 'rocketmatter.com', 'lawmatics.com', 'timesolv.com', 'bill4time.com', 'leanlaw.co',
]

export interface OutboundRecipient {
  readonly email: string
  readonly jurisdiction: string | null
  readonly lawfulBasis: LawfulBasis | null
  readonly sourceUrl: string | null
  readonly verifiedAt: string | null
  readonly verificationStatus: string | null
  readonly firstName?: string
  readonly companyName?: string
}

export interface OutboundTrailingStats {
  readonly sends: number
  readonly bounces: number
  readonly complaints: number
}

export interface OutboundCampaignState {
  readonly id: string
  readonly status: 'draft' | 'approved' | 'running' | 'paused' | 'done' | 'archived'
  readonly approvedBy: string | null
  readonly providerCampaignRef: string | null
  /** sales_cap outbound_daily_cap_per_mailbox */
  readonly dailyCapPerMailbox: number
  readonly mailboxes: number
  readonly sentToday: number
  /** per recipient */
  readonly touchesLast30d: number
  readonly daysSinceLastTouch: number | null
  readonly cooldownDays: number
  readonly maxTouchesPer30d: number
  readonly trailing: OutboundTrailingStats
}

export interface OutboundThresholds {
  /** trailing window must hold at least this many sends before rates count */
  readonly minSends: number
  readonly bouncePct: number
  readonly complaintPct: number
}

export const DEFAULT_THRESHOLDS: OutboundThresholds = { minSends: 50, bouncePct: 2, complaintPct: 0.1 }

export interface OutboundSendInput {
  readonly recipient: OutboundRecipient
  readonly campaign: OutboundCampaignState
  readonly subject: string
  readonly body: string
  readonly postalAddress: string | null
  readonly unsubscribeUrl: string | null
  readonly senderDomain: string | null
  readonly autosendEnabled: boolean
  readonly allowedBases?: ReadonlySet<LawfulBasis>
  readonly thresholds?: OutboundThresholds
  readonly variables?: Readonly<Record<string, string>>
}

export type OutboundRefusal =
  | 'not_configured'
  | 'autosend_off'
  | 'campaign_unapproved'
  | 'campaign_not_running'
  | 'auto_paused'
  | 'unverified'
  | 'not_valid'
  | 'role_inbox'
  | 'blocked_domain'
  | 'no_lawful_basis'
  | 'unsupported_basis'
  | 'no_source_url'
  | 'suppressed'
  | 'daily_cap'
  | 'cooldown'
  | 'touch_cap'
  | 'no_postal_address'
  | 'placeholder_address'
  | 'no_unsubscribe'
  | 'no_sender_domain'
  | 'no_provider_campaign'
  | 'invalid_recipient'
  | 'missing_footer'
  | 'send_failed'

export type OutboundSendResult =
  | { readonly ok: true; readonly providerMessageId?: string; readonly body: string; readonly sender: string }
  | { readonly ok: false; readonly refusal: OutboundRefusal; readonly detail?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isRoleInbox(email: string): boolean {
  const local = email.toLowerCase().split('@')[0] ?? ''
  return ROLE_INBOX_PREFIXES.includes(local) || ROLE_INBOX_PREFIXES.some((p) => local === `${p}.` || local.startsWith(`${p}+`))
}

export function isBlockedDomain(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1] ?? ''
  if (!domain) return true
  if (BLOCKED_DOMAIN_SUFFIXES.some((s) => domain === s.slice(1) || domain.endsWith(s))) return true
  return COMPETITOR_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))
}

export function isPlaceholderAddress(addr: string | null): boolean {
  if (!addr) return true
  const s = addr.trim()
  return s.length < 12 || /\[|\]|todo|placeholder|xxx|tbd/i.test(s)
}

export function shouldAutoPause(stats: OutboundTrailingStats, thresholds: OutboundThresholds = DEFAULT_THRESHOLDS): boolean {
  if (stats.sends < thresholds.minSends) return false
  const bouncePct = (stats.bounces / stats.sends) * 100
  const complaintPct = (stats.complaints / stats.sends) * 100
  return bouncePct > thresholds.bouncePct || complaintPct > thresholds.complaintPct
}

export const FOOTER_LINE_NOT_ADVICE = 'This is not legal advice.'
export const FOOTER_LINE_STOP = 'To stop these emails, reply STOP or use this link:'

export function assembleFooter(postalAddress: string, unsubscribeUrl: string): string {
  return [
    '--',
    postalAddress.trim(),
    `${FOOTER_LINE_NOT_ADVICE} ${FOOTER_LINE_STOP} ${unsubscribeUrl}`,
    'BizLegal AI (DOR INNOVATIONS) is a software company, not a law firm.',
  ].join('\n')
}

/** Pure. Returns the first refusal in a fixed order, or null when every invariant holds. */
export function checkOutboundInvariants(input: OutboundSendInput): OutboundRefusal | null {
  const { recipient: r, campaign: c } = input
  const email = (r.email ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(email)) return 'invalid_recipient'

  // 4 — fail-closed switches, in order of blast radius.
  if (!input.autosendEnabled) return 'autosend_off'
  if (!c.approvedBy) return 'campaign_unapproved'
  if (c.status !== 'running') return 'campaign_not_running'
  if (!c.providerCampaignRef) return 'no_provider_campaign'

  // 7 — reputation breach.
  if (shouldAutoPause(c.trailing, input.thresholds ?? DEFAULT_THRESHOLDS)) return 'auto_paused'

  // 1 — the address.
  if (!r.verifiedAt) return 'unverified'
  if (r.verificationStatus !== 'valid') return 'not_valid'
  if (isRoleInbox(email)) return 'role_inbox'
  if (isBlockedDomain(email)) return 'blocked_domain'

  // 2 — the basis.
  if (!r.lawfulBasis) return 'no_lawful_basis'
  if (!(input.allowedBases ?? V1_LAWFUL_BASES).has(r.lawfulBasis)) return 'unsupported_basis'
  if (!r.sourceUrl || !/^https?:\/\//i.test(r.sourceUrl)) return 'no_source_url'

  // 5 — caps and cadence.
  const perMailbox = Math.min(Math.max(0, c.dailyCapPerMailbox), HARD_MAX_PER_MAILBOX_PER_DAY)
  const dailyCap = perMailbox * Math.max(1, c.mailboxes)
  if (c.sentToday >= dailyCap) return 'daily_cap'
  if (c.daysSinceLastTouch !== null && c.daysSinceLastTouch < c.cooldownDays) return 'cooldown'
  if (c.touchesLast30d >= c.maxTouchesPer30d) return 'touch_cap'

  // 6 — the footer inputs.
  if (!input.postalAddress) return 'no_postal_address'
  if (isPlaceholderAddress(input.postalAddress)) return 'placeholder_address'
  if (!input.unsubscribeUrl) return 'no_unsubscribe'
  if (!input.senderDomain) return 'no_sender_domain'

  return null
}

/**
 * The only way a cold email leaves the fleet. Pure invariants first, then the
 * fail-closed suppression lookup, then the footer, then the sender adapter.
 */
export async function sendOutbound(input: OutboundSendInput, sender: OutboundSender | null, cfg?: EmailConfig): Promise<OutboundSendResult> {
  if (!sender) return { ok: false, refusal: 'not_configured', detail: 'no sender adapter' }
  const refusal = checkOutboundInvariants(input)
  if (refusal) return { ok: false, refusal }

  const c = readConfig(cfg)
  // Unlike transactional mail, an unconfigured suppression store is a refusal here.
  if (!c.supabaseUrl || !c.supabaseKey) return { ok: false, refusal: 'not_configured', detail: 'suppression store not configured' }
  const email = input.recipient.email.trim().toLowerCase()
  if (await isSuppressed(email, c)) return { ok: false, refusal: 'suppressed' }

  const footer = assembleFooter(input.postalAddress as string, input.unsubscribeUrl as string)
  const body = `${input.body.trimEnd()}\n\n${footer}`
  if (!body.includes(FOOTER_LINE_NOT_ADVICE) || !body.includes('STOP')) return { ok: false, refusal: 'missing_footer' }

  const r = await sender.send({
    campaignRef: input.campaign.providerCampaignRef as string,
    email,
    subject: input.subject,
    body,
    firstName: input.recipient.firstName,
    companyName: input.recipient.companyName,
    variables: input.variables,
  })
  if (!r.ok) return { ok: false, refusal: 'send_failed', detail: r.error }
  return { ok: true, providerMessageId: r.id, body, sender: sender.name }
}
