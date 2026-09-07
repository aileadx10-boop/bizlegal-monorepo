/**
 * The cold-sender adapter contract. A sender owns the warmed mailboxes, the
 * schedule, the one-click unsubscribe and the reply/bounce webhooks; this
 * package owns every invariant that decides whether a message may reach it.
 */
export interface SenderSendRequest {
  /** Provider-side campaign identifier (the sequence that carries the mailboxes and unsubscribe). */
  readonly campaignRef: string
  readonly email: string
  readonly subject: string
  /** Plain text, footer already appended by @bizlegal/email. */
  readonly body: string
  readonly firstName?: string
  readonly companyName?: string
  readonly variables?: Readonly<Record<string, string>>
}

export type SenderSendResult = { readonly ok: true; readonly id?: string } | { readonly ok: false; readonly error: string }

export interface OutboundSender {
  readonly name: string
  send(req: SenderSendRequest): Promise<SenderSendResult>
}
