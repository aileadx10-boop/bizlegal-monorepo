/**
 * Holiday tables, attached to a calendar.
 *
 * Kept separate from `calendar.ts` because the weekend is a fact that never
 * changes (Israel works Sun-Thu, full stop) while holidays are per-year data
 * that goes stale. Conflating them would let a stale table quietly poison a
 * correct working week.
 */

import type { Calendar } from '../calendar.js'

/**
 * Return a copy of `cal` that also treats the given ISO dates as non-working.
 *
 * `years` is the coverage claim, and it is load-bearing: a date outside it is
 * reported by `coversDate` as unknown, which becomes a visible
 * "holidays_not_configured" warning rather than a silent wrong answer. Passing
 * dates without their years would produce exactly the confidently-wrong
 * deadlines this design exists to prevent.
 */
export function withHolidays(
  cal: Calendar,
  isoDates: readonly string[],
  years: readonly number[],
): Calendar {
  const table = new Set(isoDates)
  return {
    id: `${cal.id}+holidays`,
    weekendDays: cal.weekendDays,
    isHoliday: (iso: string) => table.has(iso),
    holidayYears: [...years].sort((a, b) => a - b),
  }
}
