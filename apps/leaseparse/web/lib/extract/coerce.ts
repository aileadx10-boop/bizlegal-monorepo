/**
 * Shared, defensive coercion of raw LLM JSON into a LeaseAbstract.
 *
 * Both engines (Hermes and Claude) return free-form JSON that is *shaped like*
 * the EXTRACTION_PROMPT schema but is never guaranteed to match it. This module
 * is the single boundary where untrusted model output becomes a typed value:
 * every field is checked, unknown enum members are dropped, non-ISO dates are
 * discarded rather than guessed, and anything missing becomes an explicit
 * absence that scoreConfidence() can see and penalise.
 *
 * Never invent data here. A dropped field lowers confidence and can trigger the
 * Claude fallback; a fabricated field ships a wrong lease abstract to a paying
 * customer.
 */

import type {
  CriticalDate,
  LeaseAbstract,
  RentEscalation,
  RiskClause,
  RiskFlag,
  RiskSeverity,
} from './types'

const RISK_CLAUSES: readonly RiskClause[] = [
  'co_tenancy',
  'go_dark',
  'assignment_restriction',
  'exclusive_use',
  'relocation',
  'demolition',
]

const RISK_SEVERITIES: readonly RiskSeverity[] = ['info', 'warn', 'high']

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Model output is prose-shaped; cap it so one runaway field can't bloat a row. */
const MAX_FIELD_CHARS = 4_000
const MAX_LIST_ITEMS = 60

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function asString(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, MAX_FIELD_CHARS)
}

function asOptionalString(value: unknown): string | undefined {
  const s = asString(value)
  return s.length > 0 ? s : undefined
}

/** ISO date or nothing — a malformed date is dropped, never repaired. */
function asIsoDate(value: unknown): string {
  const s = asString(value)
  if (!ISO_DATE.test(s)) return ''
  const parsed = new Date(`${s}T00:00:00Z`)
  return Number.isNaN(parsed.getTime()) ? '' : s
}

/**
 * Money arrives as cents, dollars, or "$4,500.00" depending on the model's mood.
 * Only a non-negative integer count of cents survives; ambiguous input is zero,
 * which scoreConfidence() reads as "missing".
 */
function asCents(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.round(value)
  }
  if (typeof value === 'string') {
    const digits = value.replace(/[^0-9.]/g, '')
    const n = Number.parseFloat(digits)
    if (Number.isFinite(n) && n >= 0) return Math.round(n)
  }
  return 0
}

function asOptionalCents(value: unknown): number | undefined {
  const cents = asCents(value)
  return cents > 0 ? cents : undefined
}

function asPositiveInt(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return Math.round(value)
  if (typeof value === 'string') {
    const n = Number.parseInt(value.replace(/[^0-9]/g, ''), 10)
    if (Number.isFinite(n) && n > 0) return n
  }
  return undefined
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value.slice(0, MAX_LIST_ITEMS) : []
}

function coerceEscalations(value: unknown, warnings: string[]): RentEscalation[] {
  const out: RentEscalation[] = []
  for (const item of asArray(value)) {
    const rec = asRecord(item)
    const effective = asIsoDate(rec.effective)
    const rent = asCents(rec.base_rent_cents)
    if (!effective || rent <= 0) {
      warnings.push('dropped escalation with missing effective date or rent')
      continue
    }
    out.push({ effective, base_rent_cents: rent })
  }
  return out
}

function coerceCriticalDates(value: unknown, warnings: string[]): CriticalDate[] {
  const out: CriticalDate[] = []
  const seen = new Set<string>()
  for (const item of asArray(value)) {
    const rec = asRecord(item)
    const date = asIsoDate(rec.date)
    if (!date) {
      warnings.push('dropped critical date with a non-ISO or missing date')
      continue
    }
    const key = asString(rec.key) || 'unlabelled'
    const dedupe = `${key}|${date}`
    if (seen.has(dedupe)) continue
    seen.add(dedupe)
    out.push({
      key,
      label: asString(rec.label) || key.replace(/_/g, ' '),
      date,
      notice_window_days: asPositiveInt(rec.notice_window_days),
    })
  }
  return out
}

function coerceRiskFlags(value: unknown, warnings: string[]): RiskFlag[] {
  const out: RiskFlag[] = []
  const seen = new Set<RiskClause>()
  for (const item of asArray(value)) {
    const rec = asRecord(item)
    const clause = asString(rec.clause).toLowerCase() as RiskClause
    if (!RISK_CLAUSES.includes(clause)) {
      warnings.push(`dropped risk flag with unknown clause "${asString(rec.clause).slice(0, 40)}"`)
      continue
    }
    if (seen.has(clause)) continue
    const excerpt = asString(rec.excerpt)
    if (excerpt.length === 0) {
      // An unsupported flag is an assertion about a lease with no evidence.
      warnings.push(`dropped risk flag "${clause}" with no supporting excerpt`)
      continue
    }
    const rawSeverity = asString(rec.severity).toLowerCase() as RiskSeverity
    const severity: RiskSeverity = RISK_SEVERITIES.includes(rawSeverity) ? rawSeverity : 'info'
    seen.add(clause)
    out.push({ clause, excerpt, severity })
  }
  return out
}

export interface CoercedAbstract {
  abstract: LeaseAbstract
  warnings: string[]
}

export function coerceLeaseAbstract(raw: unknown): CoercedAbstract {
  const warnings: string[] = []
  const root = asRecord(raw)
  const parties = asRecord(root.parties)
  const premises = asRecord(root.premises)
  const term = asRecord(root.term)
  const financial = asRecord(root.financial)

  const abstract: LeaseAbstract = {
    parties: {
      landlord: asString(parties.landlord),
      tenant: asString(parties.tenant),
      guarantor: asOptionalString(parties.guarantor),
    },
    premises: {
      address: asString(premises.address),
      city: asString(premises.city),
      state: asString(premises.state).toUpperCase().slice(0, 2),
      square_feet: asPositiveInt(premises.square_feet),
      suite: asOptionalString(premises.suite),
    },
    term: {
      commencement: asIsoDate(term.commencement),
      expiration: asIsoDate(term.expiration),
      renewal_options: asOptionalString(term.renewal_options),
    },
    financial: {
      base_rent_cents: asCents(financial.base_rent_cents),
      escalations: coerceEscalations(financial.escalations, warnings),
      cam: asOptionalString(financial.cam),
      percentage_rent: asOptionalString(financial.percentage_rent),
      security_deposit_cents: asOptionalCents(financial.security_deposit_cents),
    },
    critical_dates: coerceCriticalDates(root.critical_dates, warnings),
    risk_flags: coerceRiskFlags(root.risk_flags, warnings),
  }

  return { abstract, warnings }
}

/**
 * Pull the first balanced JSON object out of a model response.
 *
 * Ollama's `format: 'json'` usually returns clean JSON, but models still leak
 * ```json fences, a leading apology, or trailing commentary. Scanning for a
 * balanced brace run (string- and escape-aware) recovers the object without a
 * regex that a nested brace would defeat.
 */
export function extractJsonObject(text: string): string | null {
  const start = text.indexOf('{')
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < text.length; i += 1) {
    const ch = text[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (ch === '\\') {
      if (inString) escaped = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

/** Parse model output into a plain object, tolerating fences and chatter. */
export function parseModelJson(text: string): unknown | null {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    // fall through to the balanced-brace recovery
  }
  const candidate = extractJsonObject(trimmed)
  if (!candidate) return null
  try {
    return JSON.parse(candidate)
  } catch {
    return null
  }
}
