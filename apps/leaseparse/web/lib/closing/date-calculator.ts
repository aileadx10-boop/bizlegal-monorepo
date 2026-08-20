/**
 * Deterministic business-day deadline math for real-estate closings.
 *
 * All functions are pure and immutable — inputs are never mutated,
 * every returned Date is a new object. No external dependencies.
 *
 * "Business day" here = Mon–Fri, no holiday calendar yet. A holiday
 * layer (federal + state) is a planned jurisdiction override — see
 * checklist-templates.ts applyJurisdictionOverrides.
 */

export type TransactionType =
  | 'residential_purchase'
  | 'residential_refi'
  | 'commercial'
  | 'exchange_1031'

export const TRANSACTION_TYPES: readonly TransactionType[] = [
  'residential_purchase',
  'residential_refi',
  'commercial',
  'exchange_1031',
]

export function isTransactionType(value: unknown): value is TransactionType {
  return typeof value === 'string' && (TRANSACTION_TYPES as readonly string[]).includes(value)
}

export interface Deadline {
  key: string
  label: string
  dueDate: Date
  /** Offset relative to closing date in business days (negative = before closing). */
  offsetBusinessDays: number
}

const MS_PER_DAY = 86_400_000

function isWeekend(d: Date): boolean {
  const day = d.getUTCDay()
  return day === 0 || day === 6
}

/**
 * Add (or subtract, when `days` is negative) whole business days.
 * Weekend start dates first roll to the nearest business day in the
 * direction of travel, then counting begins.
 */
export function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start.getTime())
  if (days === 0) return result

  const step = days > 0 ? 1 : -1
  let remaining = Math.abs(days)

  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + step)
    if (!isWeekend(result)) remaining -= 1
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

interface DeadlineSpec {
  key: string
  label: string
  offsetBusinessDays: number
}

/**
 * Standard critical-path offsets per transaction type, expressed in
 * business days before (negative) the closing date. Derived from
 * common contract practice; jurisdiction overrides refine these later.
 */
const DEADLINE_SPECS: Record<TransactionType, readonly DeadlineSpec[]> = {
  residential_purchase: [
    { key: 'earnest_money', label: 'Earnest money deposited', offsetBusinessDays: -25 },
    { key: 'inspection', label: 'Inspection period ends', offsetBusinessDays: -14 },
    { key: 'financing_contingency', label: 'Financing contingency deadline', offsetBusinessDays: -21 },
    { key: 'appraisal', label: 'Appraisal completed', offsetBusinessDays: -12 },
    { key: 'title_commitment', label: 'Title commitment delivered', offsetBusinessDays: -10 },
    { key: 'doc_collection', label: 'All closing documents collected', offsetBusinessDays: -7 },
    { key: 'clear_to_close', label: 'Lender clear-to-close', offsetBusinessDays: -3 },
    { key: 'final_walkthrough', label: 'Final walkthrough', offsetBusinessDays: -1 },
    { key: 'closing', label: 'Closing day', offsetBusinessDays: 0 },
  ],
  residential_refi: [
    { key: 'application_complete', label: 'Loan application complete', offsetBusinessDays: -20 },
    { key: 'appraisal', label: 'Appraisal completed', offsetBusinessDays: -12 },
    { key: 'title_commitment', label: 'Title commitment delivered', offsetBusinessDays: -10 },
    { key: 'payoff_statement', label: 'Payoff statement ordered', offsetBusinessDays: -7 },
    { key: 'clear_to_close', label: 'Lender clear-to-close', offsetBusinessDays: -3 },
    { key: 'closing', label: 'Closing / signing day', offsetBusinessDays: 0 },
    { key: 'rescission_ends', label: 'Rescission period ends (owner-occupied)', offsetBusinessDays: 3 },
  ],
  commercial: [
    { key: 'due_diligence_start', label: 'Due-diligence period opens', offsetBusinessDays: -45 },
    { key: 'title_survey_review', label: 'Title + survey objection deadline', offsetBusinessDays: -25 },
    { key: 'environmental', label: 'Phase I environmental complete', offsetBusinessDays: -20 },
    { key: 'estoppels', label: 'Tenant estoppels + SNDAs received', offsetBusinessDays: -10 },
    { key: 'financing_commitment', label: 'Financing commitment issued', offsetBusinessDays: -15 },
    { key: 'doc_collection', label: 'Closing document set finalized', offsetBusinessDays: -5 },
    { key: 'closing', label: 'Closing day', offsetBusinessDays: 0 },
  ],
  exchange_1031: [
    { key: 'relinquished_closing', label: 'Relinquished property closes (day 0)', offsetBusinessDays: -30 },
    { key: 'qi_engaged', label: 'Qualified intermediary engaged', offsetBusinessDays: -35 },
    { key: 'title_commitment', label: 'Title commitment on replacement property', offsetBusinessDays: -10 },
    { key: 'doc_collection', label: 'Exchange documents collected', offsetBusinessDays: -7 },
    { key: 'closing', label: 'Replacement property closing', offsetBusinessDays: 0 },
  ],
}

/**
 * Derive the dated critical path for a transaction, sorted soonest-first.
 * NOTE: 1031 identification (45 calendar days) and completion (180 calendar
 * days) run from the relinquished closing on CALENDAR days by statute —
 * they are appended here from the closing date as calendar-day deadlines.
 */
export function deriveDeadlines(closingDate: Date, type: TransactionType): Deadline[] {
  const deadlines: Deadline[] = DEADLINE_SPECS[type].map((spec) => ({
    key: spec.key,
    label: spec.label,
    dueDate: addBusinessDays(closingDate, spec.offsetBusinessDays),
    offsetBusinessDays: spec.offsetBusinessDays,
  }))

  if (type === 'exchange_1031') {
    const relinquished = addBusinessDays(closingDate, -30)
    deadlines.push(
      {
        key: 'identification_45',
        label: '45-day identification deadline (calendar days, statutory)',
        dueDate: new Date(relinquished.getTime() + 45 * MS_PER_DAY),
        offsetBusinessDays: 0,
      },
      {
        key: 'completion_180',
        label: '180-day exchange completion deadline (calendar days, statutory)',
        dueDate: new Date(relinquished.getTime() + 180 * MS_PER_DAY),
        offsetBusinessDays: 0,
      },
    )
  }

  return [...deadlines].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
}
