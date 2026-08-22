/**
 * Canonicalisation. Comparison happens ONLY on normalised values.
 *
 * Two documents can both be correct and still look different: "AED 2,500,000"
 * vs "2500000.00", "18 September 2026" vs "2026-09-18", "ABC Holdings LLC" vs
 * "ABC Holdings, L.L.C.". Comparing raw strings would report all three as
 * conflicts, which is worse than useless — a report full of false conflicts
 * teaches the reader to ignore it.
 *
 * Everything here is pure and total: an input we cannot confidently canonicalise
 * returns null, and a null NEVER becomes a conflict — it becomes
 * insufficient_evidence. Guessing is the one thing this module must not do.
 */

export type Normalised =
  | { readonly kind: 'date'; readonly value: string }      // ISO-8601 YYYY-MM-DD
  | { readonly kind: 'money'; readonly value: string; readonly unit: string } // minor units
  | { readonly kind: 'area'; readonly value: string; readonly unit: 'sqm' }
  | { readonly kind: 'name'; readonly value: string }
  | { readonly kind: 'text'; readonly value: string }

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8,
  sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11,
  dec: 12, december: 12,
}

const CURRENCY_ALIASES: Record<string, string> = {
  aed: 'AED', dhs: 'AED', dh: 'AED', 'د.إ': 'AED',
  usd: 'USD', $: 'USD', 'us$': 'USD',
  gbp: 'GBP', '£': 'GBP',
  eur: 'EUR', '€': 'EUR',
}

/** Company-form suffixes stripped before comparing party names. */
const ENTITY_SUFFIXES = [
  'llc', 'l l c', 'ltd', 'limited', 'fze', 'fzco', 'fz llc', 'plc', 'inc',
  'incorporated', 'corp', 'corporation', 'co', 'company', 'llp', 'lp', 'pjsc', 'psc',
]

const SQFT_PER_SQM = 10.7639

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function isRealDate(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

/**
 * Dates → ISO-8601.
 *
 * Deliberately refuses all-numeric ambiguous forms like 09/10/2026: that is
 * 9 October to a UK/UAE reader and 10 September to a US one, and this product
 * spans both. Returning null (→ insufficient_evidence, "we could not verify")
 * is correct; picking a locale and being silently wrong about a closing date
 * is the worst failure this system could have.
 */
export function normaliseDate(raw: string): Normalised | null {
  const s = raw.trim().toLowerCase()
  if (!s) return null

  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (iso) {
    const [y, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])]
    return isRealDate(y, m, d) ? { kind: 'date', value: `${y}-${pad(m)}-${pad(d)}` } : null
  }

  // "18 September 2026" / "18 Sept 2026"
  const dmy = s.match(/^(\d{1,2})[\s.\-/]+([a-z]+)[\s.,\-/]+(\d{4})$/)
  if (dmy) {
    const m = dmy[2] ? MONTHS[dmy[2]] : undefined
    const [d, y] = [Number(dmy[1]), Number(dmy[3])]
    if (m && isRealDate(y, m, d)) return { kind: 'date', value: `${y}-${pad(m)}-${pad(d)}` }
    return null
  }

  // "September 18, 2026"
  const mdy = s.match(/^([a-z]+)[\s.]+(\d{1,2})(?:st|nd|rd|th)?[\s.,]+(\d{4})$/)
  if (mdy) {
    const m = mdy[1] ? MONTHS[mdy[1]] : undefined
    const [d, y] = [Number(mdy[2]), Number(mdy[3])]
    if (m && isRealDate(y, m, d)) return { kind: 'date', value: `${y}-${pad(m)}-${pad(d)}` }
    return null
  }

  return null // includes the ambiguous all-numeric forms, on purpose
}

/**
 * Money → integer minor units + currency, so 2,500,000.00 and 2500000 compare
 * equal without any floating-point involvement.
 */
export function normaliseMoney(raw: string, defaultUnit?: string): Normalised | null {
  const s = raw.trim().toLowerCase()
  if (!s) return null

  let unit: string | undefined
  for (const [alias, code] of Object.entries(CURRENCY_ALIASES)) {
    if (s.includes(alias)) { unit = code; break }
  }
  unit = unit ?? defaultUnit
  if (!unit) return null // an amount with no currency cannot be safely compared

  const numeric = s.replace(/[^0-9.,]/g, '')
  if (!numeric) return null

  // Last separator followed by exactly 2 digits is a decimal point; everything
  // else is a thousands separator. Handles 2,500,000.00 and 2.500.000,00 alike.
  const lastDot = numeric.lastIndexOf('.')
  const lastComma = numeric.lastIndexOf(',')
  const sepAt = Math.max(lastDot, lastComma)
  let whole = numeric
  let frac = '00'
  if (sepAt !== -1 && numeric.length - sepAt - 1 === 2) {
    whole = numeric.slice(0, sepAt)
    frac = numeric.slice(sepAt + 1)
  }
  const digits = whole.replace(/[^0-9]/g, '')
  if (!digits) return null

  const minor = BigInt(digits) * 100n + BigInt(frac)
  return { kind: 'money', value: minor.toString(), unit }
}

/** Areas → square metres, rounded to whole units. */
export function normaliseArea(raw: string): Normalised | null {
  const s = raw.trim().toLowerCase()
  const m = s.match(/([\d.,]+)\s*(sq\s*\.?\s*m|sqm|m2|m²|sq\s*\.?\s*ft|sqft|ft2|ft²)/)
  if (!m) return null
  const n = Number((m[1] ?? '').replace(/,/g, ''))
  if (!Number.isFinite(n) || n <= 0) return null
  const isFeet = /f/.test(m[2] ?? '')
  return { kind: 'area', value: String(Math.round(isFeet ? n / SQFT_PER_SQM : n)), unit: 'sqm' }
}

/**
 * Party names → comparison key. Strips entity suffixes, punctuation and case so
 * "ABC Holdings LLC" and "ABC Holdings, L.L.C." match.
 *
 * Note this is deliberately conservative: it does not attempt fuzzy matching.
 * "ABC Holding" vs "ABC Holdings" stays a conflict, because in a transaction
 * those may genuinely be two different entities and a human must decide.
 */
export function normaliseName(raw: string): Normalised | null {
  let s = raw.trim().toLowerCase()
  if (!s) return null
  s = s.replace(/[.,()]/g, ' ').replace(/\s+/g, ' ').trim()
  let changed = true
  while (changed) {
    changed = false
    for (const suffix of ENTITY_SUFFIXES) {
      if (s.endsWith(' ' + suffix)) { s = s.slice(0, -(suffix.length + 1)).trim(); changed = true }
    }
  }
  s = s.replace(/\s+/g, ' ').trim()
  return s ? { kind: 'name', value: s.toUpperCase() } : null
}

/** Which normaliser a fact_key uses. Unknown keys fall back to trimmed text. */
export function normaliseFact(factKey: string, raw: string, unit?: string): Normalised | null {
  if (/date|deadline|expiry|commencement|completion/.test(factKey)) return normaliseDate(raw)
  if (/price|amount|rent|deposit|fee|value|balance/.test(factKey)) return normaliseMoney(raw, unit)
  if (/area|size|sqft|sqm/.test(factKey)) return normaliseArea(raw)
  if (/name|party|buyer|seller|landlord|tenant|owner/.test(factKey)) return normaliseName(raw)
  const t = raw.trim().replace(/\s+/g, ' ')
  return t ? { kind: 'text', value: t.toUpperCase() } : null
}

/** Comparison key: two facts conflict when these differ. Unit is part of it. */
export function comparisonKey(n: Normalised): string {
  return 'unit' in n ? `${n.kind}:${n.value}:${n.unit}` : `${n.kind}:${n.value}`
}
