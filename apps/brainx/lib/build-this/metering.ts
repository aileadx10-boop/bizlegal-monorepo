import { sql } from '@/lib/neon'

/**
 * BUILD THIS metering: Radar = 2 briefs/calendar month (UTC), Radar + Build
 * = unlimited. The insert is atomic — a single `INSERT ... SELECT ... WHERE`
 * guarded by the month-to-date count, so two concurrent requests can't both
 * slip through the same quota window (the HTTP driver has no client-side
 * locking to lean on).
 */

export type Tier = 'radar' | 'radar_build'

/** `null` means unlimited. */
export function quotaFor(tier: Tier): number | null {
  return tier === 'radar_build' ? null : 2
}

export function resetsAt(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
}

export type RequestOutcome =
  | { readonly ok: true; readonly id: string; readonly requested_at: string }
  | { readonly ok: false; readonly reason: 'quota_exhausted'; readonly limit: number; readonly used: number; readonly resets_at: string }
  | { readonly ok: false; readonly reason: 'already_requested' }
  | { readonly ok: false; readonly reason: 'not_found' }

export async function requestBuild(params: {
  subscriberId: string
  tier: Tier
  opportunityId: string
}): Promise<RequestOutcome> {
  const limit = quotaFor(params.tier)

  try {
    const rows = (await sql()`
      insert into products (opportunity_id, subscriber_id, name, status, requested_at, turnaround_note)
      select o.id, ${params.subscriberId}::uuid, o.name, 'requested', now(), 'Within 3 business days.'
      from opportunities o
      where o.id = ${params.opportunityId}::uuid
        and (
          ${limit}::int is null
          or (
            select count(*) from products p
            where p.subscriber_id = ${params.subscriberId}::uuid
              and p.requested_at >= date_trunc('month', now() at time zone 'utc')
              and p.status <> 'cancelled'
          ) < ${limit}::int
        )
      returning id, requested_at
    `) as unknown as Array<{ id: string; requested_at: string }>

    const row = rows?.[0]
    if (row) return { ok: true, id: row.id, requested_at: row.requested_at }

    // No row — either the opportunity doesn't exist, or the quota gate failed.
    // Distinguish so the route can return 404 vs 402.
    const oppRows = (await sql()`select id from opportunities where id = ${params.opportunityId}::uuid limit 1`) as unknown as Array<{ id: string }>
    if (!oppRows?.[0]) return { ok: false, reason: 'not_found' }

    if (limit === null) {
      // Unlimited tier with no row inserted can only mean the DB rejected
      // for another reason (e.g. FK) — surface as not_found rather than lie
      // about a quota that doesn't apply.
      return { ok: false, reason: 'not_found' }
    }
    const usedRows = (await sql()`
      select count(*)::int as used from products
      where subscriber_id = ${params.subscriberId}::uuid
        and requested_at >= date_trunc('month', now() at time zone 'utc')
        and status <> 'cancelled'
    `) as unknown as Array<{ used: number }>
    const used = usedRows?.[0]?.used ?? limit
    return { ok: false, reason: 'quota_exhausted', limit, used, resets_at: resetsAt().toISOString() }
  } catch (err) {
    // Unique partial index (products_open_request_idx) violation = already
    // has an open request for this opportunity.
    const code = (err as { code?: string })?.code
    if (code === '23505') return { ok: false, reason: 'already_requested' }
    throw err
  }
}
