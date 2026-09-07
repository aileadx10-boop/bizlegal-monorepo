/**
 * Practice Revenue Report — shared types.
 *
 * Everything the engine consumes and produces. Money is integer cents, dates
 * are ISO-8601 (YYYY-MM-DD) strings, and every identifier is a pseudonym
 * assigned in the buyer's browser ("Client 01", "Matter 01-02", "INV-0001") —
 * the server never sees a client's name. See pseudonymise.ts.
 *
 * Sections are nullable on purpose: a section whose inputs are missing is
 * null with an `insufficient_evidence` finding, never zero. Missing ≠ leak.
 */

export type IsoDate = string
export type Cents = number
export type FileKind = 'time' | 'invoices'
export type SectionId = 'unbilled' | 'aging' | 'rates' | 'clients' | 'matters' | 'timeMachine' | 'dormant'
export type DateFormat = 'iso' | 'dmy' | 'mdy' | 'text'
export type DateFormatDetection = DateFormat | 'ambiguous' | 'none'

export interface TimeEntry {
  readonly row: number
  readonly date: IsoDate
  readonly clientId: string
  readonly matterId: string | null
  readonly hours: number
  readonly rateCents: Cents | null
  readonly amountCents: Cents | null
  /** null = the export has no billable column */
  readonly billable: boolean | null
  readonly invoiceId: string | null
  /** null = the export has no billed/invoiced column */
  readonly billed: boolean | null
}

export interface Invoice {
  readonly row: number
  readonly id: string
  readonly clientId: string
  readonly issuedDate: IsoDate
  readonly dueDate: IsoDate | null
  readonly amountCents: Cents
  readonly paidCents: Cents | null
  readonly balanceCents: Cents | null
  readonly paidDate: IsoDate | null
}

export interface EngineOptions {
  readonly asOf: IsoDate
  readonly unbilledAgeDays: number
  readonly dormantDays: number
  readonly invoiceLagTargetDays: number
  readonly collectTargetDays: number
  readonly closedMatterQuietDays: number
  readonly dsoWindowDays: number
  readonly hoursPerDay: number
  readonly currency: string
}

export const DEFAULT_ENGINE_OPTIONS: Omit<EngineOptions, 'asOf'> = {
  unbilledAgeDays: 30,
  dormantDays: 180,
  invoiceLagTargetDays: 3,
  collectTargetDays: 14,
  closedMatterQuietDays: 90,
  dsoWindowDays: 90,
  hoursPerDay: 8,
  currency: 'USD',
}

export type Finding =
  | { readonly kind: 'missing_column'; readonly file: FileKind; readonly field: string; readonly affects: readonly SectionId[] }
  | { readonly kind: 'ambiguous_column'; readonly file: FileKind; readonly field: string; readonly candidates: readonly string[] }
  | { readonly kind: 'ambiguous_date_format'; readonly file: FileKind; readonly sample: string }
  | { readonly kind: 'rows_skipped'; readonly file: FileKind; readonly count: number; readonly reasons: Readonly<Record<string, number>> }
  | { readonly kind: 'insufficient_evidence'; readonly section: SectionId; readonly reason: string }
  | { readonly kind: 'assumption'; readonly section: SectionId; readonly text: string }

export interface AgingBuckets {
  readonly b0_30: Cents
  readonly b31_60: Cents
  readonly b61_90: Cents
  readonly b90p: Cents
}

/** The FREE view. Every field is null when its section could not be computed. */
export interface Headline {
  readonly unbilledCents: Cents | null
  readonly unbilledAgedCents: Cents | null
  readonly unbilledHours: number | null
  readonly arOpenCents: Cents | null
  readonly overdue60Cents: Cents | null
  readonly aging: AgingBuckets | null
  readonly realizationPct: number | null
  readonly collectionPct: number | null
  readonly utilizationPct: number | null
  readonly writeDownCents: Cents | null
  readonly dsoDays: number | null
  readonly lockupDays: number | null
  readonly dormantClientCount: number | null
  readonly overdueInvoiceCount: number | null
}

export interface UnbilledRow {
  readonly row: number
  readonly date: IsoDate
  readonly clientId: string
  readonly matterId: string | null
  readonly hours: number
  readonly amountCents: Cents | null
  readonly ageDays: number
}

export interface OverdueRow {
  readonly invoiceId: string
  readonly clientId: string
  readonly issuedDate: IsoDate
  readonly dueDate: IsoDate | null
  readonly amountCents: Cents
  readonly openCents: Cents
  readonly daysPast: number
  readonly bucket: keyof AgingBuckets
}

export interface ClientRow {
  readonly clientId: string
  readonly billableHours: number | null
  readonly workedCents: Cents | null
  readonly invoicedCents: Cents
  readonly collectedCents: Cents | null
  readonly openCents: Cents | null
  readonly collectedPerHourCents: Cents | null
  readonly rank: number | null
  readonly repriceDeltaCents: Cents | null
  readonly lastActivity: IsoDate | null
}

export interface MatterRow {
  readonly clientId: string
  readonly matterId: string
  readonly billableHours: number
  readonly workedCents: Cents | null
  readonly invoicedCents: Cents
  readonly collectedCents: Cents | null
  readonly unbilledHours: number
  readonly lastEntry: IsoDate
  readonly closed: boolean
}

export interface TimeMachine {
  readonly invoiceLagDaysWeighted: number | null
  readonly excessLagDollarDays: Cents
  readonly linkedInvoiceCount: number
  readonly daysToPayWeighted: number | null
  readonly excessCollectDollarDays: Cents
  readonly openPastTargetCents: Cents
  readonly lagRows: readonly { readonly invoiceId: string; readonly lagDays: number; readonly amountCents: Cents }[]
}

export interface DormantRow {
  readonly clientId: string
  readonly lastActivity: IsoDate
  readonly daysSince: number
  readonly lifetimeCollectedCents: Cents
}

export interface Draft {
  readonly kind: 'reminder' | 'invoice_line'
  readonly ref: string
  readonly subject: string
  readonly body: string
  readonly placeholders: readonly string[]
}

export interface Benchmark {
  readonly utilizationPct: number
  readonly realizationPct: number
  readonly collectionPct: number
  readonly source: { readonly title: string; readonly url: string; readonly edition: number }
}

export interface Coverage {
  readonly timeEntries: number
  readonly invoices: number
  readonly dateRange: readonly [IsoDate, IsoDate] | null
  readonly hasTimeFile: boolean
}

export interface PracticeRevenueReport {
  readonly version: 1
  readonly asOf: IsoDate
  readonly currency: string
  readonly options: EngineOptions
  readonly coverage: Coverage
  readonly headline: Headline
  readonly findings: readonly Finding[]
  readonly benchmark: Benchmark | null
  readonly unbilled: readonly UnbilledRow[] | null
  readonly overdue: readonly OverdueRow[] | null
  readonly agingBasis: 'due_date' | 'issued_date' | null
  readonly clients: readonly ClientRow[]
  readonly matters: readonly MatterRow[] | null
  readonly timeMachine: TimeMachine | null
  readonly dormant: readonly DormantRow[]
  readonly drafts: { readonly reminders: readonly Draft[]; readonly invoiceLines: readonly Draft[] }
}
