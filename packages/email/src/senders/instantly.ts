/**
 * Instantly adapter — the dedicated cold-email sender (rule 7 v2, item 6).
 *
 * Resend's acceptable-use policy forbids unsolicited mail, so cold outbound
 * never touches it or the transactional domain. Instantly holds the warmed
 * mailboxes on the dedicated sending domain, the daily per-mailbox limits,
 * the sending schedule and the one-click unsubscribe. We push one lead per
 * message into a campaign whose sequence renders the custom variables
 * {{subject}} and {{body}}; Instantly delivers within its own limits and
 * reports replies, bounces and unsubscribes to /api/webhooks/outbound.
 *
 * Request shape follows the public API v2 reference (POST /api/v2/leads)
 * as read in 2026-09. It is exercised for the first time when Moses adds
 * INSTANTLY_API_KEY; a 4xx here means adapter drift, not a lead problem, and
 * the dispatch cron records it as `send_failed` without retrying blindly.
 *
 * Raw fetch only — runs anywhere the rest of this package runs.
 */
import type { OutboundSender, SenderSendRequest, SenderSendResult } from './types'

const DEFAULT_BASE = 'https://api.instantly.ai/api/v2'

export interface InstantlyConfig {
  readonly apiKey: string
  readonly baseUrl?: string
  readonly fetchImpl?: typeof fetch
}

export function instantlySender(cfg: InstantlyConfig): OutboundSender {
  const base = (cfg.baseUrl ?? DEFAULT_BASE).replace(/\/$/, '')
  const doFetch = cfg.fetchImpl ?? fetch
  return {
    name: 'instantly',
    async send(req: SenderSendRequest): Promise<SenderSendResult> {
      if (!cfg.apiKey) return { ok: false, error: 'instantly_not_configured' }
      const payload = {
        campaign: req.campaignRef,
        email: req.email,
        first_name: req.firstName ?? '',
        company_name: req.companyName ?? '',
        custom_variables: { subject: req.subject, body: req.body, ...(req.variables ?? {}) },
        skip_if_in_workspace: true,
        skip_if_in_campaign: true,
      }
      try {
        const res = await doFetch(`${base}/leads`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${cfg.apiKey}`, 'content-type': 'application/json', 'user-agent': 'bizlegal-agent/1.0' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const detail = (await res.text().catch(() => '<unreadable>')).slice(0, 300)
          return { ok: false, error: `${res.status}: ${detail}` }
        }
        const json = (await res.json().catch(() => ({}))) as { id?: string }
        return { ok: true, id: json.id }
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'network_error' }
      }
    },
  }
}

/** Instantly webhook payloads vary by event; this is the subset we act on. */
export type InstantlyEventType = 'reply_received' | 'email_bounced' | 'lead_unsubscribed' | 'email_sent' | 'email_opened' | 'complaint' | 'unknown'

export interface NormalisedOutboundEvent {
  readonly type: InstantlyEventType
  readonly email: string
  readonly campaignRef: string | null
  readonly messageId: string | null
  readonly replyText: string | null
  readonly occurredAt: string
}

/** Map a raw Instantly webhook body onto the events the hub cares about. */
export function normaliseInstantlyEvent(raw: unknown): NormalisedOutboundEvent | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const str = (k: string): string | null => (typeof r[k] === 'string' && (r[k] as string).trim() ? (r[k] as string).trim() : null)
  const eventRaw = (str('event_type') ?? str('event') ?? str('type') ?? '').toLowerCase()
  const email = (str('lead_email') ?? str('email') ?? str('to_email') ?? '').toLowerCase()
  if (!email) return null
  let type: InstantlyEventType = 'unknown'
  if (eventRaw.includes('reply')) type = 'reply_received'
  else if (eventRaw.includes('bounce')) type = 'email_bounced'
  else if (eventRaw.includes('unsub')) type = 'lead_unsubscribed'
  else if (eventRaw.includes('complain') || eventRaw.includes('spam')) type = 'complaint'
  else if (eventRaw.includes('open')) type = 'email_opened'
  else if (eventRaw.includes('sent')) type = 'email_sent'
  return {
    type,
    email,
    campaignRef: str('campaign_id') ?? str('campaign') ?? null,
    messageId: str('email_id') ?? str('message_id') ?? str('id') ?? null,
    replyText: str('reply_text') ?? str('reply_text_snippet') ?? str('text') ?? str('body') ?? null,
    occurredAt: str('timestamp') ?? str('created_at') ?? new Date().toISOString(),
  }
}
