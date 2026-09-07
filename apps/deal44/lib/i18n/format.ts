/**
 * Locale-aware formatting via `Intl`.
 *
 * Replaces the hardcoded `toLocaleDateString('en-US', ...)` in the LeaseParse
 * checklist UI this room's view is lifted from — which would have rendered
 * "Sep 20, 2026" and "$" to an Israeli broker.
 *
 * Everything is computed in UTC. Dates in this product are calendar dates, not
 * instants: a deadline is "20 September", not "20 September 00:00 in whatever
 * timezone the viewer's laptop is set to".
 */

import { t, type Locale } from './index'

export function fmtDate(locale: Locale, iso: string | null): string {
  if (!iso) return ''
  const d = new Date(`${iso.slice(0, 10)}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d)
}

export function fmtMoney(locale: Locale, minorUnits: number, currency: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(minorUnits / 100)
}

/** "in 5 days" / "today" / "3 days overdue" — never a bare negative number. */
export function fmtDaysLeft(locale: Locale, days: number): string {
  if (days === 0) return t(locale, 'room.today')
  if (days === 1) return t(locale, 'room.tomorrow')
  if (days < 0) return t(locale, 'room.overdue_by', { n: Math.abs(days) })
  return t(locale, 'room.days_left', { n: days })
}
