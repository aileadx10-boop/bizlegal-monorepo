import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sql } from './neon'

/**
 * BrainX subscriber access — a magic-link token in an HttpOnly cookie, gated
 * on the paid window (`active_until`), never on tier or status. This is the
 * fleet rule from sellerradar/practice-revenue: "the paid gate is a single
 * column, never a status string that's writable earlier in the flow."
 *
 * `status` still excludes 'revoked' (a refund rotates the token and zeroes
 * active_until — see app/api/fulfillment/route.ts — so this check is
 * belt-and-suspenders, not the primary gate).
 */

export const ACCESS_COOKIE = 'bx_access'
const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60 // 30 days

export interface Subscriber {
  readonly id: string
  readonly email: string
  readonly tier: 'radar' | 'radar_build'
  readonly interval: 'monthly' | 'yearly'
  readonly status: 'active' | 'past_due' | 'cancelled' | 'revoked'
  readonly active_until: string
  readonly access_token: string
}

type SubscriberRow = {
  id: string
  email: string
  tier: string
  interval: string
  status: string
  active_until: string
  access_token: string
}

function toSubscriber(r: SubscriberRow): Subscriber {
  return {
    id: r.id,
    email: r.email,
    tier: r.tier === 'radar_build' ? 'radar_build' : 'radar',
    interval: r.interval === 'yearly' ? 'yearly' : 'monthly',
    status: (['active', 'past_due', 'cancelled', 'revoked'] as const).includes(r.status as never)
      ? (r.status as Subscriber['status'])
      : 'revoked',
    active_until: r.active_until,
    access_token: r.access_token,
  }
}

/** Looks up a subscriber by access token. Does not redirect — for API routes. */
export async function findByToken(token: string): Promise<Subscriber | null> {
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) return null
  try {
    const rows = (await sql())`
      select id, email, tier, "interval", status, active_until, access_token
      from subscribers
      where access_token = ${token}::uuid
        and active_until > now()
        and status <> 'revoked'
      limit 1
    ` as unknown as SubscriberRow[]
    const row = rows?.[0]
    return row ? toSubscriber(row) : null
  } catch (err) {
    console.warn('[access] findByToken failed:', err)
    return null
  }
}

/** For API routes: reads the cookie, returns null instead of redirecting. */
export async function getSubscriber(): Promise<Subscriber | null> {
  const token = cookies().get(ACCESS_COOKIE)?.value
  if (!token) return null
  const sub = await findByToken(token)
  if (sub) touchLastSeen(sub.id)
  return sub
}

/** For server pages: redirects to /access when there is no valid subscriber. */
export async function requireSubscriber(): Promise<Subscriber> {
  const sub = await getSubscriber()
  if (!sub) redirect('/access?reason=missing')
  return sub
}

const lastTouch = new Map<string, number>()
const TOUCH_THROTTLE_MS = 60 * 60 * 1000

function touchLastSeen(id: string): void {
  const last = lastTouch.get(id) ?? 0
  const now = Date.now()
  if (now - last < TOUCH_THROTTLE_MS) return
  lastTouch.set(id, now)
  void (sql())`update subscribers set last_seen_at = now() where id = ${id}::uuid`.catch(() => {})
}

export function setAccessCookie(token: string): void {
  cookies().set(ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  })
}
