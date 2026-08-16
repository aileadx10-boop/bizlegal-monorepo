/**
 * Minimal in-memory rate limiter for public POST routes. Per-lambda scope is
 * accepted for a scaffold (Vercel functions are short-lived; this bounds
 * burst abuse, and the strict Zod-style validation bounds payload abuse).
 * If bench outgrows this, swap for @bizlegal/rate-limit.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export function isRateLimited(
  key: string,
  { max = 5, windowMs = 10 * 60 * 1000 }: { max?: number; windowMs?: number } = {},
): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  bucket.count += 1
  return bucket.count > max
}

export function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  return (fwd ? fwd.split(',')[0] : null)?.trim() || 'unknown'
}
