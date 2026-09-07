/**
 * Canonicalisation for the Practice Revenue Report. Pure and total.
 *
 * Borrowed rules from packages/deal-engine/src/normalise.ts: compare only
 * normalised values; an input we cannot confidently canonicalise returns
 * null; null never becomes a number. The one thing this module must not do
 * is guess — a date column that reads 09/10/2026 is 9 October to one reader
 * and 10 September to another, so the engine refuses to pick a locale and
 * the user declares the format instead (see detectDateFormat).
 */
import type { Cents, DateFormat, DateFormatDetection, IsoDate } from './types'

const MONTHS: Readonly<Record<string, number>> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8,
  sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11,
  dec: 12, december: 12,
}

const ISO_RE = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T].*)?$/
const NUMERIC_RE = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})(?:[ T].*)?$/
const TEXT_DMY_RE = /^(\d{1,2})(?:st|nd|rd|th)?[\s.\-/,]+([a-z]+)[\s.,\-/]+(\d{4})$/
const TEXT_MDY_RE = /^([a-z]+)[\s.\-/]+(\d{1,2})(?:st|nd|rd|th)?[\s.,\-/]+(\d{4})$/

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function isRealDate(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

function toIso(y: number, m: number, d: number): IsoDate | null {
  return isRealDate(y, m, d) ? `${y}-${pad(m)}-${pad(d)}` : null
}

function fullYear(raw: string): number {
  const n = Number(raw)
  return raw.length === 2 ? 2000 + n : n
}

export type DateClass = 'iso' | 'text' | 'dmy' | 'mdy' | 'ambiguous' | 'invalid'

/** What a single cell tells us about the column's date format. */
export function classifyDate(raw: string): DateClass {
  const s = raw.trim().toLowerCase()
  if (!s) return 'invalid'
  if (ISO_RE.test(s)) return 'iso'
  if (TEXT_DMY_RE.test(s) || TEXT_MDY_RE.test(s)) return 'text'
  const m = s.match(NUMERIC_RE)
  if (!m) return 'invalid'
  const a = Number(m[1])
  const b = Number(m[2])
  if (a > 31 || b > 31 || a === 0 || b === 0) return 'invalid'
  if (a > 12 && b > 12) return 'invalid'
  if (a > 12) return 'dmy'
  if (b > 12) return 'mdy'
  return 'ambiguous'
}

/**
 * Decide a column's numeric date format from all its cells. Returns
 * 'ambiguous' when every all-numeric cell is ≤ 12 in both positions or when
 * the cells contradict each other; the caller then asks the user.
 */
export function detectDateFormat(samples: readonly string[]): DateFormatDetection {
  let iso = 0
  let text = 0
  let dmy = 0
  let mdy = 0
  let ambiguous = 0
  for (const s of samples) {
    const c = classifyDate(s)
    if (c === 'iso') iso++
    else if (c === 'text') text++
    else if (c === 'dmy') dmy++
    else if (c === 'mdy') mdy++
    else if (c === 'ambiguous') ambiguous++
  }
  if (dmy > 0 && mdy > 0) return 'ambiguous'
  if (dmy > 0) return 'dmy'
  if (mdy > 0) return 'mdy'
  if (ambiguous > 0) return 'ambiguous'
  if (iso > 0) return 'iso'
  if (text > 0) return 'text'
  return 'none'
}

/** ISO and text forms always parse; all-numeric forms need a declared format. */
export function parseDate(raw: string, format: DateFormat | null): IsoDate | null {
  const s = raw.trim().toLowerCase()
  if (!s) return null
  const iso = s.match(ISO_RE)
  if (iso) return toIso(Number(iso[1]), Number(iso[2]), Number(iso[3]))
  const tdmy = s.match(TEXT_DMY_RE)
  if (tdmy) {
    const m = MONTHS[tdmy[2]]
    return m ? toIso(Number(tdmy[3]), m, Number(tdmy[1])) : null
  }
  const tmdy = s.match(TEXT_MDY_RE)
  if (tmdy) {
    const m = MONTHS[tmdy[1]]
    return m ? toIso(Number(tmdy[3]), m, Number(tmdy[2])) : null
  }
  const num = s.match(NUMERIC_RE)
  if (!num) return null
  const a = Number(num[1])
  const b = Number(num[2])
  const y = fullYear(num[3])
  if (format === 'dmy') return toIso(y, b, a)
  if (format === 'mdy') return toIso(y, a, b)
  // No declared format: only an unambiguous cell may parse.
  if (a > 12 && b <= 12) return toIso(y, b, a)
  if (b > 12 && a <= 12) return toIso(y, a, b)
  return null
}

/**
 * Money → integer cents, string arithmetic only (no float parsing of the
 * whole value). Handles "$1,050.00", "(350.00)", "-12", "1.050,00", "USD 2,500",
 * "2.5". A dot or comma followed by exactly three digits with no other
 * separator kind present is treated as a thousands separator.
 */
export function parseMoneyCents(raw: string): Cents | null {
  let s = raw.trim()
  if (!s) return null
  let negative = false
  if (/^\(.*\)$/.test(s)) {
    negative = true
    s = s.slice(1, -1)
  }
  s = s.replace(/[^\d.,-]/g, '')
  if (s.startsWith('-')) {
    negative = !negative
    s = s.slice(1)
  }
  if (s.includes('-') || !/\d/.test(s)) return null
  const lastDot = s.lastIndexOf('.')
  const lastComma = s.lastIndexOf(',')
  const sepIdx = Math.max(lastDot, lastComma)
  let intPart: string
  let fracPart: string
  if (sepIdx === -1) {
    intPart = s
    fracPart = ''
  } else {
    const sep = s[sepIdx]
    const other = sep === '.' ? ',' : '.'
    const before = s.slice(0, sepIdx)
    const after = s.slice(sepIdx + 1)
    if (!/^\d*$/.test(after)) return null
    if (after.length === 3 && !before.includes(other)) {
      intPart = before + after
      fracPart = ''
    } else if (after.length <= 2) {
      intPart = before
      fracPart = after
    } else {
      return null
    }
  }
  intPart = intPart.replace(/[.,]/g, '')
  if (!/^\d*$/.test(intPart)) return null
  const cents = Number(intPart || '0') * 100 + Number((fracPart + '00').slice(0, 2))
  if (!Number.isFinite(cents)) return null
  return negative ? -cents : cents
}

/** "1.5" | "1,5" | "1:30" | "90m" | "2h 15m" | "2h" → hours; else null. */
export function parseHours(raw: string): number | null {
  const s = raw.trim().toLowerCase()
  if (!s) return null
  const hm = s.match(/^(\d{1,3}):(\d{2})$/)
  if (hm) return Number(hm[1]) + Number(hm[2]) / 60
  const hmin = s.match(/^(?:(\d+(?:[.,]\d+)?)\s*h(?:ours?|rs?)?)?\s*(?:(\d+)\s*m(?:in(?:utes?)?)?)?$/)
  if (hmin && (hmin[1] || hmin[2])) {
    const h = hmin[1] ? Number(hmin[1].replace(',', '.')) : 0
    const m = hmin[2] ? Number(hmin[2]) : 0
    return h + m / 60
  }
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : null
}

const TRUE_WORDS = new Set(['yes', 'y', 'true', 't', '1', 'x', '✓', 'billable', 'billed', 'invoiced', 'paid', 'on'])
const FALSE_WORDS = new Set([
  'no', 'n', 'false', 'f', '0', 'non-billable', 'nonbillable', 'unbillable', 'not billable', 'unbilled', 'not billed',
  'uninvoiced', 'unpaid', 'off', 'none',
])

export function parseBool(raw: string): boolean | null {
  const s = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!s) return null
  if (TRUE_WORDS.has(s)) return true
  if (FALSE_WORDS.has(s)) return false
  return null
}

/** Identifier key for joins: trim, collapse whitespace, case-fold. */
export function normaliseKey(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toUpperCase()
}

function utcMs(iso: IsoDate): number {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Whole days from a to b (positive when b is later). */
export function daysBetween(a: IsoDate, b: IsoDate): number {
  return Math.round((utcMs(b) - utcMs(a)) / 86_400_000)
}

export function addDays(iso: IsoDate, n: number): IsoDate {
  const dt = new Date(utcMs(iso) + n * 86_400_000)
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`
}

/** Inclusive count of Monday–Friday days between two dates. */
export function weekdaysBetween(a: IsoDate, b: IsoDate): number {
  if (utcMs(b) < utcMs(a)) return 0
  let count = 0
  for (let t = utcMs(a); t <= utcMs(b); t += 86_400_000) {
    const dow = new Date(t).getUTCDay()
    if (dow !== 0 && dow !== 6) count++
  }
  return count
}

export function maxIso(values: readonly (IsoDate | null)[]): IsoDate | null {
  let best: IsoDate | null = null
  for (const v of values) if (v && (!best || v > best)) best = v
  return best
}

export function minIso(values: readonly (IsoDate | null)[]): IsoDate | null {
  let best: IsoDate | null = null
  for (const v of values) if (v && (!best || v < best)) best = v
  return best
}
