/**
 * Deterministic critical-date engine. No LLM, no deps — the same
 * abstract and clock always produce the same alerts. All math in UTC.
 */

import type { CriticalDate, LeaseAbstract } from './types'

export type AlertTier = 90 | 60 | 30 | 7

export interface UpcomingAlert {
  /** Machine key of the source critical date (or `${key}_notice_deadline`). */
  key: string
  label: string
  /** ISO date (YYYY-MM-DD) the alert is about. */
  date: string
  days_until: number
  tier: AlertTier
  /** True when this alert marks a notice-window deadline, not the event itself. */
  is_notice_deadline: boolean
}

const TIERS: readonly AlertTier[] = [7, 30, 60, 90]
const MS_PER_DAY = 86_400_000

function parseIsoDateUtc(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const parsed = new Date(`${iso}T00:00:00.000Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function daysBetweenUtc(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY)
}

/** Smallest tier whose window contains daysUntil, or null when out of range. */
export function tierFor(daysUntil: number): AlertTier | null {
  if (daysUntil < 0) return null
  const tier = TIERS.find((t) => daysUntil <= t)
  return tier ?? null
}

function alertForDate(
  key: string,
  label: string,
  date: Date,
  today: Date,
  isNoticeDeadline: boolean
): UpcomingAlert | null {
  const daysUntil = daysBetweenUtc(today, date)
  const tier = tierFor(daysUntil)
  if (tier === null) return null
  return {
    key,
    label,
    date: toIsoDate(date),
    days_until: daysUntil,
    tier,
    is_notice_deadline: isNoticeDeadline,
  }
}

function alertsForCriticalDate(cd: CriticalDate, today: Date): UpcomingAlert[] {
  const eventDate = parseIsoDateUtc(cd.date)
  if (!eventDate) return []

  const alerts: UpcomingAlert[] = []

  const eventAlert = alertForDate(cd.key, cd.label, eventDate, today, false)
  if (eventAlert) alerts.push(eventAlert)

  if (typeof cd.notice_window_days === 'number' && cd.notice_window_days > 0) {
    const noticeDeadline = new Date(eventDate.getTime() - cd.notice_window_days * MS_PER_DAY)
    const noticeAlert = alertForDate(
      `${cd.key}_notice_deadline`,
      `${cd.label} — notice deadline (${cd.notice_window_days} days required)`,
      noticeDeadline,
      today,
      true
    )
    if (noticeAlert) alerts.push(noticeAlert)
  }

  return alerts
}

/**
 * Derive every alert currently inside a 90-day window for one abstract.
 * Includes lease expiration (always a critical date, even if the
 * extraction omitted it) plus each extracted critical date and its
 * notice-window deadline. Sorted soonest-first.
 */
export function deriveCriticalDates(abstract: LeaseAbstract, now?: Date): UpcomingAlert[] {
  const today = startOfUtcDay(now ?? new Date())

  const expirationEntry: CriticalDate[] = abstract.critical_dates.some((cd) => cd.key === 'expiration')
    ? []
    : [{ key: 'expiration', label: 'Lease expiration', date: abstract.term.expiration }]

  const allDates = [...abstract.critical_dates, ...expirationEntry]

  return allDates
    .flatMap((cd) => alertsForCriticalDate(cd, today))
    .sort((a, b) => a.days_until - b.days_until)
}
