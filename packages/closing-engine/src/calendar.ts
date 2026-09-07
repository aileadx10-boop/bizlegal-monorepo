/**
 * Working-week calendar — the thing that was hardcoded and wrong.
 *
 * `apps/closeflow/web/lib/date-calculator.ts` assumed `day === 0 || day === 6`
 * is the weekend. That is Sat-Sun. In Israel the working week is Sun-Thu and
 * the weekend is Fri-Sat, so the old assumption is wrong in BOTH directions:
 * it counts Sunday as a weekend (it is a working day) and Friday as a working
 * day (it is not). A deadline computed that way is off by days, and a missed
 * statutory deadline on a lawyer-run product is malpractice-adjacent.
 *
 * So the weekend became a parameter. `MON_FRI` reproduces the old behaviour
 * exactly, which is why the US move below is a move and not a rewrite.
 *
 * Everything here is pure: no network, no ambient clock. `daysUntil` reads the
 * clock only when the caller declines to pass one.
 */

export interface Calendar {
  readonly id: string
  /** Day numbers that are NOT working days. 0=Sun … 6=Sat. */
  readonly weekendDays: readonly number[]
  /** ISO (YYYY-MM-DD) → true when the date is a non-working holiday. */
  readonly isHoliday: (isoDate: string) => boolean
  /**
   * Gregorian years the holiday table actually covers. A date outside this
   * range is not "no holidays", it is "unknown" — see `coversDate`. Empty
   * means no holiday table is configured at all.
   */
  readonly holidayYears: readonly number[]
}

export const MS_PER_DAY = 86_400_000

const noHolidays = (): boolean => false

/** Mon-Fri working week, no holiday table. The legacy US default. */
export const MON_FRI: Calendar = {
  id: 'mon-fri',
  weekendDays: [0, 6],
  isHoliday: noHolidays,
  holidayYears: [],
}

/**
 * Sun-Thu working week (Israel, UAE), no holiday table.
 *
 * The weekend is correct and verifiable. Holidays are a separate, riskier
 * question — a stale hardcoded list produces confidently wrong deadlines, so
 * a calendar with an empty `holidayYears` must be reported to the user as
 * "holidays not configured" rather than silently treated as "no holidays".
 */
export const FRI_SAT: Calendar = {
  id: 'fri-sat',
  weekendDays: [5, 6],
  isHoliday: noHolidays,
  holidayYears: [],
}

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function parseIsoDateUtc(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const parsed = new Date(`${iso}T00:00:00.000Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

export function isWeekend(d: Date, cal: Calendar = MON_FRI): boolean {
  return cal.weekendDays.includes(d.getUTCDay())
}

export function isWorkingDay(d: Date, cal: Calendar = MON_FRI): boolean {
  return !isWeekend(d, cal) && !cal.isHoliday(toIsoDate(d))
}

/**
 * True when the calendar's holiday table covers this date's year. False means
 * the business-day answer may be wrong because holidays are unknown — surface
 * it, never swallow it.
 */
export function coversDate(d: Date, cal: Calendar): boolean {
  return cal.holidayYears.includes(d.getUTCFullYear())
}

/**
 * Add (or subtract, when `days` is negative) whole working days.
 *
 * A non-working start date first rolls to the nearest working day in the
 * direction of travel, then counting begins — the behaviour the US engine
 * already had, now holiday-aware.
 */
export function addBusinessDays(start: Date, days: number, cal: Calendar = MON_FRI): Date {
  const result = new Date(start.getTime())
  if (days === 0) return result

  const step = days > 0 ? 1 : -1
  let remaining = Math.abs(days)

  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + step)
    if (isWorkingDay(result, cal)) remaining -= 1
  }
  return result
}

/** Add whole calendar days. Statutory clocks do not care about weekends. */
export function addCalendarDays(start: Date, days: number): Date {
  return new Date(start.getTime() + days * MS_PER_DAY)
}

/** Roll a date forward to the next working day. Used by statutory deadlines that extend. */
export function rollForwardToWorkingDay(d: Date, cal: Calendar = MON_FRI): Date {
  const result = new Date(d.getTime())
  while (!isWorkingDay(result, cal)) {
    result.setUTCDate(result.getUTCDate() + 1)
  }
  return result
}

/** Whole calendar days from `now` (default: current time) until `target`. Negative = past due. */
export function daysUntil(target: Date, now?: Date): number {
  const reference = now ?? new Date()
  const targetUtc = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate())
  const nowUtc = Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate())
  return Math.round((targetUtc - nowUtc) / MS_PER_DAY)
}
