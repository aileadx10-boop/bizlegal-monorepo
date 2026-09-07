/**
 * Alert tiers — when a deadline is close enough to be worth an email.
 *
 * Generalised from the LeaseParse date engine, whose 90/60/30/7 tiers suit a
 * lease renewal. A closing runs on a much shorter clock, so the tiers became a
 * parameter rather than a second hardcoded list.
 */

export type Tier = number

/** Default closing tiers: a month out, a week out, tomorrow, today. */
export const CLOSING_TIERS: readonly Tier[] = [30, 7, 1, 0]

/** Tier used for anything already past due. */
export const OVERDUE_TIER = -1

/**
 * Smallest tier whose window contains `days`, or null when out of range.
 *
 * Past-due collapses to a single OVERDUE_TIER so an overdue task is announced
 * exactly once rather than every morning until someone ticks it.
 */
export function tierFor(days: number, tiers: readonly Tier[] = CLOSING_TIERS): Tier | null {
  if (days < 0) return OVERDUE_TIER
  const ascending = [...tiers].sort((a, b) => a - b)
  const hit = ascending.find((t) => days <= t)
  return hit ?? null
}
