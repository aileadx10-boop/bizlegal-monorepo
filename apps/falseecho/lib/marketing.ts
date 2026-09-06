/**
 * Marketing event emitter — fire-and-forget POST to the hub's
 * /api/marketing/trigger (goal M.3 in-repo half).
 *
 * When a scan flags a falsehood, we hand the event to the marketing
 * content queue. n8n (external, goal M.2) turns it into blog/LinkedIn/SEO
 * output and calls back to /api/marketing/callback.
 *
 * Failures are swallowed — marketing must never break a scan.
 *
 * Required envs:
 *   MARKETING_TRIGGER_URL (e.g. https://bizlegal-ai.com/api/marketing/trigger)
 *   BIZLEGAL_INBOUND_SECRET (HMAC-SHA256 over body — already used for ops log)
 */

import crypto from "node:crypto"

export interface MarketingEvent {
  product: "falseecho" | "sellerradar"
  event_type: "falsehood_detected" | "fee_change_detected"
  payload: Record<string, unknown>
  content_types?: string[]
}

export async function emitMarketingEvent(input: MarketingEvent): Promise<void> {
  try {
    const url = process.env.MARKETING_TRIGGER_URL
    const secret = process.env.BIZLEGAL_INBOUND_SECRET ?? ""
    if (!url || !secret) return // silently no-op when not configured

    const body = JSON.stringify({
      product: input.product,
      event_type: input.event_type,
      payload: input.payload,
      content_types: input.content_types,
    })
    const sig = crypto.createHmac("sha256", secret).update(body).digest("hex")

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bizlegal-signature": sig,
      },
      body,
    })
  } catch (err) {
    console.warn("[marketing]", err instanceof Error ? err.message : err)
  }
}

export function emitMarketingEventAsync(input: MarketingEvent): void {
  void emitMarketingEvent(input).catch(() => {})
}
