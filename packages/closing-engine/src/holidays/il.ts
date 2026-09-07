/**
 * Israel: working week and holidays.
 *
 * THE WEEKEND IS SETTLED. Israel works Sunday to Thursday; Friday and Saturday
 * are the weekend. `IL_WORKING_WEEK` encodes that and nothing else, and it is
 * correct today with no further input.
 *
 * THE HOLIDAY TABLE IS DELIBERATELY EMPTY. Jewish holidays follow the Hebrew
 * calendar and land on different Gregorian dates every year, so a hardcoded
 * list is wrong the moment it goes stale — and a wrong non-working day shifts
 * every business-day deadline computed through it. The identical argument is
 * recorded for the Hijri calendar in
 * packages/deal-engine/src/packs/ae-dubai-residential.ts, where `holidays` is
 * also left empty on purpose.
 *
 * Until a table is supplied, `coversDate` reports every date as uncovered and
 * `materialiseTasks` emits a `holidays_not_configured` warning that the room UI
 * shows to the broker. That is the honest state: the Sun-Thu week is applied,
 * holidays are not, and the user is told so.
 *
 * TWO WAYS TO FILL IT, in preference order:
 *
 * 1. Compute per year from @hebcal/core (Israel scheme) and pass the result to
 *    `withHolidays`. That is the durable answer and needs one dependency:
 *
 *      import { HebrewCalendar, Location } from '@hebcal/core'
 *      const events = HebrewCalendar.calendar({ year, isHebrewYear: false, il: true })
 *
 * 2. Supply an explicit reviewed list per year via `israelCalendar(dates, years)`.
 *    Fine for one or two years, and it fails loud outside them.
 *
 * WHICH DAYS COUNT is a practitioner question, not a library question, and it
 * is interview question 4 in decisions/DEAL44-WORKFLOW44-2026-09-07.md: only
 * the statutory rest days, or also erev chag, chol hamoed, Purim, fast days,
 * and Friday half-days? Registries, banks and the courts do not all answer the
 * same way. Do not guess on the founder's behalf.
 */

import { FRI_SAT, type Calendar } from '../calendar.js'
import { withHolidays } from './index.js'

/** Sun-Thu working week, no holiday table. Correct weekend, honest about the rest. */
export const IL_WORKING_WEEK: Calendar = { ...FRI_SAT, id: 'il' }

/**
 * Sun-Thu working week plus an explicit, reviewed holiday table.
 *
 * @param isoDates non-working dates, YYYY-MM-DD
 * @param years    the Gregorian years those dates actually cover
 */
export function israelCalendar(isoDates: readonly string[], years: readonly number[]): Calendar {
  return { ...withHolidays(IL_WORKING_WEEK, isoDates, years), id: 'il+holidays' }
}
