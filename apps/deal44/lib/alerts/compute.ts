/**
 * What to email this morning. Pure — no database, no clock, no network — so the
 * rules are unit-testable and a dry run gives exactly the real answer.
 *
 * Two decisions worth stating, because both were the difference between a
 * useful reminder and an ignored one:
 *
 * 1. ONE DIGEST PER PARTY PER DAY, not one email per crossing. A room with five
 *    parties and twenty tasks would otherwise send dozens of emails in a
 *    morning, and Resend's free tier is 100/day across the whole fleet.
 * 2. A CROSSING IS ANNOUNCED ONCE. Tier rows in `deal_alerts` are the ledger;
 *    without them a daily cron re-announces the same deadline every morning
 *    until someone ticks it, which is how people learn to filter you.
 */

import { OVERDUE_TIER, tierFor, type Tier } from '@bizlegal/closing-engine'
import type { PartyRow, TaskRow } from '@/lib/db'

export interface Crossing {
  readonly taskId: string
  readonly taskKey: string
  readonly tier: Tier
  readonly daysUntil: number
  readonly dueDate: string
  readonly assigneeRole: string
  readonly isOwn: boolean
}

export interface PartyDigest {
  readonly party: PartyRow
  /** New tier crossings for this party — the reason to send at all. */
  readonly crossings: readonly Crossing[]
  /** Everything still open, soonest first, for the body of the digest. */
  readonly openTasks: readonly TaskRow[]
}

/** Priority when the daily send cap bites: the most urgent thing goes first. */
export function crossingPriority(tier: Tier): number {
  if (tier === OVERDUE_TIER) return 4
  return tier // 0 today, 1 tomorrow, 7, 30
}

function daysBetweenUtc(fromIso: string, to: Date): number {
  const from = new Date(`${fromIso.slice(0, 10)}T00:00:00.000Z`)
  if (Number.isNaN(from.getTime())) return Number.NaN
  const a = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate())
  const b = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
  return Math.round((b - a) / 86_400_000)
}

/**
 * @param alreadySent keys of the form `${taskId}:${partyId}:${tier}` — every
 *   crossing already in `deal_alerts`.
 */
export function computeDigests(
  tasks: readonly TaskRow[],
  parties: readonly PartyRow[],
  alreadySent: ReadonlySet<string>,
  today: Date,
): readonly PartyDigest[] {
  const open = tasks
    .filter((t) => t.status === 'open' && t.due_date)
    .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''))

  const withTier = open.flatMap((task) => {
    const days = daysBetweenUtc(task.due_date as string, today)
    if (Number.isNaN(days)) return []
    const tier = tierFor(days)
    if (tier === null) return []
    return [{ task, tier, days }]
  })

  return parties
    .filter((party) => party.alerts_enabled)
    .map((party) => {
      const crossings = withTier
        .filter(({ task, tier }) => !alreadySent.has(`${task.id}:${party.id}:${tier}`))
        .map(({ task, tier, days }): Crossing => ({
          taskId: task.id,
          taskKey: task.key,
          tier,
          daysUntil: days,
          dueDate: task.due_date as string,
          assigneeRole: task.assignee_role,
          isOwn: task.assignee_role === party.role || party.role === 'broker',
        }))
        .sort((a, b) => crossingPriority(a.tier) - crossingPriority(b.tier))

      return { party, crossings, openTasks: open }
    })
    .filter((digest) => digest.crossings.length > 0)
}

/**
 * Trim to the daily send budget, most urgent first.
 *
 * What is cut is simply not sent today and — critically — its tier rows are not
 * written, so tomorrow's run picks it up rather than losing it silently.
 */
export function applySendCap(
  digests: readonly PartyDigest[],
  remaining: number,
): readonly PartyDigest[] {
  if (remaining <= 0) return []
  const ranked = [...digests].sort((a, b) => {
    const aTop = Math.min(...a.crossings.map((c) => crossingPriority(c.tier)))
    const bTop = Math.min(...b.crossings.map((c) => crossingPriority(c.tier)))
    return aTop - bTop
  })
  return ranked.slice(0, remaining)
}

export function alertKey(taskId: string, partyId: string, tier: Tier): string {
  return `${taskId}:${partyId}:${tier}`
}

export function digestIdempotencyKey(partyId: string, today: Date): string {
  return `deal44:digest:${partyId}:${today.toISOString().slice(0, 10)}`
}
