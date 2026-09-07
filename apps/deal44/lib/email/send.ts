/**
 * The only place DEAL44 sends email, and it goes through @bizlegal/email.
 *
 * WHY `kind: 'transactional'` IS THE HONEST CLASSIFICATION HERE
 *
 * A room invite is triggered by an identified paying customer — the broker —
 * adding a named participant to one specific transaction that participant is
 * already a party to. It contains that transaction's checklist link and nothing
 * else: no offer, no product promotion, no newsletter, no second message unless
 * a deadline in their own transaction moves. The broker is the sender-of-record
 * and the reply-to. Every message carries a one-line stop instruction that is
 * honoured. This is the DocuSign / shared-document class of service email.
 *
 * It is NOT a bypass of consent for marketing. `@bizlegal/email` deliberately
 * offers no `skipConsent` flag and none is added here; suppression is still
 * checked on every send and still fails closed.
 *
 * ⚠️ MOSES DECISION OUTSTANDING: the position under the Israeli Communications
 * Law s.30A for a message to a party who never wrote to us. Until he confirms,
 * rooms are created with `send_invites: false` and he forwards the links
 * himself. See decisions/DEAL44-WORKFLOW44-2026-09-07.md.
 */

import { sendEmail } from '@bizlegal/email'
import { logEventAsync } from '@/lib/ops/log'
import type { BuiltEmail } from './messages'

export interface SendResult {
  readonly ok: boolean
  readonly id?: string
  readonly error?: string
}

export async function sendRoomEmail(params: {
  to: string
  built: BuiltEmail
  idempotencyKey: string
  replyTo?: string
  dealId: string
}): Promise<SendResult> {
  const { to, built, idempotencyKey, replyTo, dealId } = params

  const result = await sendEmail({
    to,
    subject: built.subject,
    html: built.html,
    text: built.text,
    kind: 'transactional',
    replyTo,
    idempotencyKey,
  })

  if (result.ok) {
    logEventAsync({
      type: 'email.sent',
      source: 'deal44',
      ref_id: dealId,
      email: to,
      status: 'ok',
      metadata: { idempotency_key: idempotencyKey },
    })
    return { ok: true, id: result.id }
  }

  logEventAsync({
    type: 'email.failed',
    source: 'deal44',
    ref_id: dealId,
    email: to,
    status: 'failed',
    metadata: { error: result.error, idempotency_key: idempotencyKey },
  })
  return { ok: false, error: result.error }
}

/** The room link a party opens. */
export function roomLink(token: string): string {
  const base = process.env.NEXT_PUBLIC_DEAL44_SITE_URL ?? 'https://deal44.bizlegal-ai.com'
  return `${base.replace(/\/$/, '')}/r/${token}`
}
