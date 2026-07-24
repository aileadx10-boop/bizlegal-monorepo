import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Stable per-subscriber unsubscribe signature — HMAC over the subscriber's
 * UUID, not a persisted token column. Recomputed on verify, so there's
 * nothing to expire or rotate; the same link works until the subscriber
 * unsubscribes.
 */
export function signSubscriberId(id: string): string {
  const secret = process.env.BIZLEGAL_NEWSLETTER_SECRET
    || process.env.SUPABASE_SERVICE_KEY
    || 'fallback-do-not-use-in-prod'
  return createHmac('sha256', secret).update(id).digest('hex').slice(0, 16)
}

export function verifySubscriberSig(id: string, sig: string): boolean {
  if (!id || !sig) return false
  const expected = signSubscriberId(id)
  const a = Buffer.from(sig, 'hex')
  const b = Buffer.from(expected, 'hex')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
