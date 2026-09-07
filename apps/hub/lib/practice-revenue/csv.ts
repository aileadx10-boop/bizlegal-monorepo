/**
 * CSV → typed rows for the Practice Revenue Report. Pure, no dependencies.
 *
 * splitCsv is ported from apps/sellerradar/lib/csv.ts (BOM, quotes, CRLF,
 * tab paste). Header mapping is tolerant but never guesses: exact synonym
 * first, then whole-word substring; two candidates for one field is an
 * `ambiguous_column` finding and the field stays unmapped. A required column
 * that is missing fails the file; an optional one produces a finding and the
 * dependent section goes dark in the engine (never zero).
 *
 * This module is isomorphic — the browser uses the same header mapping to
 * find the client/matter/invoice columns it pseudonymises before upload.
 */
import { detectDateFormat, normaliseKey, parseBool, parseDate, parseHours, parseMoneyCents } from './normalise'
import type { DateFormat, DateFormatDetection, FileKind, Finding, Invoice, TimeEntry } from './types'

export const MAX_TIME_ROWS = 10_000
export const MAX_INVOICE_ROWS = 5_000
export const MAX_CSV_CHARS = 4 * 1024 * 1024

export type TimeField = 'date' | 'client' | 'matter' | 'hours' | 'rate' | 'amount' | 'billable' | 'billed' | 'invoiceId'
export type InvoiceField = 'invoiceId' | 'client' | 'issuedDate' | 'dueDate' | 'amount' | 'paid' | 'paidDate' | 'balance'

/** Columns never uploaded: recognised only so the browser can drop them. */
export const DROPPED_HEADERS: readonly string[] = [
  'description', 'narrative', 'notes', 'note', 'memo', 'comment', 'comments', 'details',
  'activity description', 'line description', 'work description', 'task description', 'summary',
]

export const TIME_SYNONYMS: Readonly<Record<TimeField, readonly string[]>> = {
  date: ['date', 'entry date', 'activity date', 'work date', 'date of service', 'service date', 'time entry date'],
  client: ['client', 'client name', 'contact', 'customer', 'customer name', 'client/contact', 'account', 'account name'],
  matter: ['matter', 'matter name', 'matter number', 'matter id', 'matter description', 'case', 'case name', 'case number', 'project', 'project name', 'job'],
  hours: ['hours', 'hrs', 'quantity', 'qty', 'duration', 'time', 'hours worked', 'billable hours', 'time hours', 'hours spent'],
  rate: ['rate', 'hourly rate', 'bill rate', 'billing rate', 'unit price', 'price', 'rate $'],
  amount: ['amount', 'total', 'line total', 'subtotal', 'value', 'billable amount', 'total amount', 'amount $'],
  billable: ['billable', 'is billable', 'billable?', 'billable status', 'billable y n'],
  billed: ['billed', 'invoiced', 'is billed', 'billed?', 'billing status', 'invoice status', 'billed status'],
  invoiceId: ['invoice', 'invoice id', 'invoice #', 'invoice number', 'invoice no', 'invoice no.', 'bill', 'bill #', 'bill number', 'bill id', 'num'],
}

export const INVOICE_SYNONYMS: Readonly<Record<InvoiceField, readonly string[]>> = {
  invoiceId: ['invoice', 'invoice id', 'invoice #', 'invoice number', 'invoice no', 'invoice no.', 'bill', 'bill #', 'bill number', 'bill id', 'num', 'number', 'id', 'no', 'no.'],
  client: ['client', 'client name', 'contact', 'customer', 'customer name', 'client/contact', 'account', 'account name', 'bill to', 'billed to'],
  issuedDate: ['issue date', 'issued', 'invoice date', 'bill date', 'date issued', 'txn date', 'transaction date', 'date', 'created', 'created date'],
  dueDate: ['due date', 'due', 'payment due', 'date due', 'due on'],
  amount: ['amount', 'total', 'invoice total', 'invoice amount', 'bill total', 'total amount', 'gross', 'amount billed', 'amount $'],
  paid: ['paid', 'amount paid', 'paid amount', 'payments', 'received', 'amount received', 'total paid', 'payment', 'applied'],
  paidDate: ['paid date', 'date paid', 'payment date', 'last payment date', 'settled', 'settled date', 'paid on'],
  balance: ['balance', 'balance due', 'outstanding', 'amount due', 'open balance', 'amount outstanding', 'remaining', 'unpaid'],
}

/** Field order for the substring pass: specific before generic. */
export const TIME_ORDER: readonly TimeField[] = ['invoiceId', 'billable', 'billed', 'matter', 'client', 'hours', 'rate', 'amount', 'date']
export const INVOICE_ORDER: readonly InvoiceField[] = ['invoiceId', 'dueDate', 'paidDate', 'paid', 'balance', 'client', 'amount', 'issuedDate']

/**
 * The columns the browser must pseudonymise or drop before upload, found with
 * the same mapping the server will use. `mapped` is the field → header table
 * shown to the user in the pre-upload preview.
 */
export function locateIdentifierColumns(
  headerRow: readonly string[],
  kind: FileKind,
): { client?: number; matter?: number; invoice?: number; drop: number[]; mapped: Readonly<Record<string, string>>; unmapped: readonly string[] } {
  if (kind === 'time') {
    const hm = mapHeaders<TimeField>(headerRow, TIME_SYNONYMS, TIME_ORDER)
    return { client: hm.colOf.get('client'), matter: hm.colOf.get('matter'), invoice: hm.colOf.get('invoiceId'), drop: [...hm.droppedColumns], mapped: hm.mapped, unmapped: hm.unmapped }
  }
  const hm = mapHeaders<InvoiceField>(headerRow, INVOICE_SYNONYMS, INVOICE_ORDER)
  return { client: hm.colOf.get('client'), invoice: hm.colOf.get('invoiceId'), drop: [...hm.droppedColumns], mapped: hm.mapped, unmapped: hm.unmapped }
}

const TIME_REQUIRED: readonly TimeField[] = ['date', 'client', 'hours']
const INVOICE_REQUIRED: readonly InvoiceField[] = ['invoiceId', 'client', 'issuedDate', 'amount']

export function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .replace(/["']/g, '')
    .replace(/[_\-/]+/g, ' ')
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Split CSV text into rows of cells. Quoted fields, embedded commas/newlines, CRLF, tabs. */
export function splitCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(cell)
      cell = ''
      if (row.length > 1 || row[0].trim() !== '') rows.push(row)
      row = []
    } else if (ch === '\t') {
      row.push(cell)
      cell = ''
    } else {
      cell += ch
    }
  }
  row.push(cell)
  if (row.length > 1 || row[0].trim() !== '') rows.push(row)
  return rows
}

/** Rows of cells → CSV text (RFC-4180 quoting). */
export function toCsv(grid: readonly (readonly string[])[]): string {
  return grid
    .map((row) => row.map((c) => (/[",\r\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(','))
    .join('\n')
}

export interface HeaderMap<F extends string> {
  readonly colOf: ReadonlyMap<F, number>
  /** field → original header text */
  readonly mapped: Readonly<Record<string, string>>
  readonly unmapped: readonly F[]
  readonly ambiguous: ReadonlyArray<{ readonly field: F; readonly candidates: readonly string[] }>
  readonly droppedColumns: readonly number[]
}

function wordMatch(header: string, syn: string): boolean {
  const escaped = syn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|\\s)${escaped}(\\s|$)`).test(header)
}

export function mapHeaders<F extends string>(
  headerRow: readonly string[],
  synonyms: Readonly<Record<F, readonly string[]>>,
  order: readonly F[],
): HeaderMap<F> {
  const headers = headerRow.map(normalizeHeader)
  const colOf = new Map<F, number>()
  const taken = new Set<number>()
  const mapped: Record<string, string> = {}
  const ambiguous: Array<{ field: F; candidates: string[] }> = []
  const droppedColumns: number[] = []

  headers.forEach((h, idx) => {
    if (DROPPED_HEADERS.includes(h)) {
      droppedColumns.push(idx)
      taken.add(idx)
    }
  })

  // Pass 1 — exact synonym, first header wins, one field per header.
  for (const field of order) {
    const syns = synonyms[field]
    for (let idx = 0; idx < headers.length; idx++) {
      if (taken.has(idx)) continue
      if (syns.includes(headers[idx])) {
        colOf.set(field, idx)
        taken.add(idx)
        mapped[field] = headerRow[idx].trim()
        break
      }
    }
  }

  // Pass 2 — whole-word substring for still-unmapped fields.
  for (const field of order) {
    if (colOf.has(field)) continue
    const candidates: number[] = []
    for (let idx = 0; idx < headers.length; idx++) {
      if (taken.has(idx)) continue
      if (synonyms[field].some((syn) => wordMatch(headers[idx], syn))) candidates.push(idx)
    }
    if (candidates.length === 1) {
      colOf.set(field, candidates[0])
      taken.add(candidates[0])
      mapped[field] = headerRow[candidates[0]].trim()
    } else if (candidates.length > 1) {
      ambiguous.push({ field, candidates: candidates.map((i) => headerRow[i].trim()) })
    }
  }

  const unmapped = order.filter((f) => !colOf.has(f))
  return { colOf, mapped, unmapped, ambiguous, droppedColumns }
}

export interface PiiHit {
  readonly row: number
  readonly column: number
  readonly kind: 'email' | 'ssn' | 'phone'
}

const EMAIL_RE = /[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}/i
const SSN_RE = /\b\d{3}-\d{2}-\d{4}\b/
const PHONE_RE = /^\s*\+?[\d\s().-]{10,}\s*$/

/**
 * Cells that look like personal contact details. Email and SSN patterns are
 * checked everywhere; the phone pattern only in columns the caller has not
 * mapped to a numeric field (invoice numbers and amounts would false-positive).
 */
export function findPiiCells(grid: readonly (readonly string[])[], numericColumns: ReadonlySet<number>): PiiHit[] {
  const hits: PiiHit[] = []
  for (let r = 1; r < grid.length; r++) {
    const row = grid[r]
    for (let c = 0; c < row.length; c++) {
      const cell = row[c]
      if (!cell) continue
      const digits = (cell.match(/\d/g) ?? []).length
      if (EMAIL_RE.test(cell)) hits.push({ row: r, column: c, kind: 'email' })
      else if (SSN_RE.test(cell)) hits.push({ row: r, column: c, kind: 'ssn' })
      else if (!numericColumns.has(c) && PHONE_RE.test(cell) && digits >= 10 && digits <= 15) hits.push({ row: r, column: c, kind: 'phone' })
      if (hits.length >= 20) return hits
    }
  }
  return hits
}

export interface ParseResult<T, F extends string> {
  readonly ok: boolean
  readonly error: string | null
  readonly rows: readonly T[]
  readonly findings: readonly Finding[]
  readonly headerMap: HeaderMap<F> | null
  readonly columns: readonly F[]
  readonly skipped: ReadonlyArray<{ readonly row: number; readonly reason: string }>
  readonly dateFormat: DateFormatDetection
  readonly dataRowCount: number
}

interface ParseOptions {
  readonly dateFormat?: DateFormat
}

function failed<T, F extends string>(error: string, findings: Finding[] = []): ParseResult<T, F> {
  return { ok: false, error, rows: [], findings, headerMap: null, columns: [], skipped: [], dateFormat: 'none', dataRowCount: 0 }
}

function skippedFinding(file: FileKind, skipped: ReadonlyArray<{ row: number; reason: string }>): Finding | null {
  if (skipped.length === 0) return null
  const reasons: Record<string, number> = {}
  for (const s of skipped) reasons[s.reason] = (reasons[s.reason] ?? 0) + 1
  return { kind: 'rows_skipped', file, count: skipped.length, reasons }
}

function resolveDateFormat(
  grid: readonly (readonly string[])[],
  dateCols: readonly number[],
  declared: DateFormat | undefined,
): { format: DateFormat | null; detection: DateFormatDetection; sample: string | null } {
  const samples: string[] = []
  for (let r = 1; r < grid.length && samples.length < 500; r++) {
    for (const c of dateCols) {
      const v = (grid[r][c] ?? '').trim()
      if (v) samples.push(v)
    }
  }
  const detection = detectDateFormat(samples)
  let sample: string | null = null
  if (detection === 'ambiguous') {
    sample = samples.find((s) => /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/.test(s)) ?? samples[0] ?? null
  }
  if (declared) return { format: declared, detection, sample }
  if (detection === 'dmy' || detection === 'mdy' || detection === 'iso' || detection === 'text') return { format: detection, detection, sample }
  return { format: null, detection, sample }
}

export function parseTimeEntriesCsv(text: string, opts: ParseOptions = {}): ParseResult<TimeEntry, TimeField> {
  const file: FileKind = 'time'
  if (!text || text.trim() === '') return failed('The time-entry file is empty.')
  if (text.length > MAX_CSV_CHARS) return failed('The time-entry file is larger than 4 MB.')
  const grid = splitCsv(text)
  if (grid.length < 2) return failed('Only a header row was found in the time-entry file.')
  if (grid.length - 1 > MAX_TIME_ROWS) return failed(`Too many time entries (${grid.length - 1}); the limit is ${MAX_TIME_ROWS}.`)

  const hm = mapHeaders<TimeField>(grid[0], TIME_SYNONYMS, TIME_ORDER)
  const findings: Finding[] = []
  for (const a of hm.ambiguous) findings.push({ kind: 'ambiguous_column', file, field: a.field, candidates: a.candidates })
  const missingRequired = TIME_REQUIRED.filter((f) => !hm.colOf.has(f))
  if (missingRequired.length > 0) {
    return failed(
      `The time-entry file needs columns for ${missingRequired.join(', ')}. Accepted headers: ${missingRequired
        .map((f) => TIME_SYNONYMS[f].slice(0, 3).join(' / '))
        .join('; ')}.`,
      findings,
    )
  }
  if (!hm.colOf.has('rate') && !hm.colOf.has('amount')) findings.push({ kind: 'missing_column', file, field: 'rate', affects: ['unbilled', 'rates', 'clients'] })
  if (!hm.colOf.has('invoiceId') && !hm.colOf.has('billed')) findings.push({ kind: 'missing_column', file, field: 'invoiceId', affects: ['unbilled', 'rates', 'matters', 'timeMachine'] })
  if (!hm.colOf.has('billable')) findings.push({ kind: 'missing_column', file, field: 'billable', affects: ['unbilled', 'rates'] })
  if (!hm.colOf.has('matter')) findings.push({ kind: 'missing_column', file, field: 'matter', affects: ['matters'] })

  const dateCol = hm.colOf.get('date') as number
  const { format, detection, sample } = resolveDateFormat(grid, [dateCol], opts.dateFormat)
  if (format === null && detection === 'ambiguous' && sample) findings.push({ kind: 'ambiguous_date_format', file, sample })

  const get = (cells: readonly string[], f: TimeField): string => {
    const idx = hm.colOf.get(f)
    return idx === undefined ? '' : (cells[idx] ?? '').trim()
  }

  const rows: TimeEntry[] = []
  const skipped: Array<{ row: number; reason: string }> = []
  for (let r = 1; r < grid.length; r++) {
    const cells = grid[r]
    const date = parseDate(get(cells, 'date'), format)
    if (!date) {
      skipped.push({ row: r, reason: 'unparseable_date' })
      continue
    }
    const client = normaliseKey(get(cells, 'client'))
    if (!client) {
      skipped.push({ row: r, reason: 'missing_client' })
      continue
    }
    const hours = parseHours(get(cells, 'hours'))
    if (hours === null) {
      skipped.push({ row: r, reason: 'unparseable_hours' })
      continue
    }
    const matterRaw = get(cells, 'matter')
    const invoiceRaw = get(cells, 'invoiceId')
    const rateRaw = get(cells, 'rate')
    const amountRaw = get(cells, 'amount')
    rows.push({
      row: r,
      date,
      clientId: client,
      matterId: matterRaw ? normaliseKey(matterRaw) : null,
      hours,
      rateCents: rateRaw ? parseMoneyCents(rateRaw) : null,
      amountCents: amountRaw ? parseMoneyCents(amountRaw) : null,
      billable: hm.colOf.has('billable') ? parseBool(get(cells, 'billable')) : null,
      invoiceId: invoiceRaw ? normaliseKey(invoiceRaw) : null,
      billed: hm.colOf.has('billed') ? parseBool(get(cells, 'billed')) : null,
    })
  }
  const sf = skippedFinding(file, skipped)
  if (sf) findings.push(sf)
  const columns = Array.from(hm.colOf.keys())
  if (rows.length === 0) {
    return { ...failed<TimeEntry, TimeField>('No usable time entries — every row was skipped.', findings), headerMap: hm, columns, skipped, dateFormat: detection, dataRowCount: grid.length - 1 }
  }
  return { ok: true, error: null, rows, findings, headerMap: hm, columns, skipped, dateFormat: detection, dataRowCount: grid.length - 1 }
}

export function parseInvoicesCsv(text: string, opts: ParseOptions = {}): ParseResult<Invoice, InvoiceField> {
  const file: FileKind = 'invoices'
  if (!text || text.trim() === '') return failed('The invoice file is empty.')
  if (text.length > MAX_CSV_CHARS) return failed('The invoice file is larger than 4 MB.')
  const grid = splitCsv(text)
  if (grid.length < 2) return failed('Only a header row was found in the invoice file.')
  if (grid.length - 1 > MAX_INVOICE_ROWS) return failed(`Too many invoices (${grid.length - 1}); the limit is ${MAX_INVOICE_ROWS}.`)

  const hm = mapHeaders<InvoiceField>(grid[0], INVOICE_SYNONYMS, INVOICE_ORDER)
  const findings: Finding[] = []
  for (const a of hm.ambiguous) findings.push({ kind: 'ambiguous_column', file, field: a.field, candidates: a.candidates })
  const missingRequired = INVOICE_REQUIRED.filter((f) => !hm.colOf.has(f))
  if (missingRequired.length > 0) {
    return failed(
      `The invoice file needs columns for ${missingRequired.join(', ')}. Accepted headers: ${missingRequired
        .map((f) => INVOICE_SYNONYMS[f].slice(0, 3).join(' / '))
        .join('; ')}.`,
      findings,
    )
  }
  if (!hm.colOf.has('paid') && !hm.colOf.has('balance')) findings.push({ kind: 'missing_column', file, field: 'paid', affects: ['aging', 'rates', 'clients', 'timeMachine', 'dormant'] })
  if (!hm.colOf.has('dueDate')) findings.push({ kind: 'missing_column', file, field: 'dueDate', affects: ['aging'] })
  if (!hm.colOf.has('paidDate')) findings.push({ kind: 'missing_column', file, field: 'paidDate', affects: ['timeMachine'] })

  const dateCols = (['issuedDate', 'dueDate', 'paidDate'] as const).map((f) => hm.colOf.get(f)).filter((c): c is number => c !== undefined)
  const { format, detection, sample } = resolveDateFormat(grid, dateCols, opts.dateFormat)
  if (format === null && detection === 'ambiguous' && sample) findings.push({ kind: 'ambiguous_date_format', file, sample })

  const get = (cells: readonly string[], f: InvoiceField): string => {
    const idx = hm.colOf.get(f)
    return idx === undefined ? '' : (cells[idx] ?? '').trim()
  }

  const rows: Invoice[] = []
  const skipped: Array<{ row: number; reason: string }> = []
  for (let r = 1; r < grid.length; r++) {
    const cells = grid[r]
    const id = normaliseKey(get(cells, 'invoiceId'))
    if (!id) {
      skipped.push({ row: r, reason: 'missing_invoice_id' })
      continue
    }
    const client = normaliseKey(get(cells, 'client'))
    if (!client) {
      skipped.push({ row: r, reason: 'missing_client' })
      continue
    }
    const issuedDate = parseDate(get(cells, 'issuedDate'), format)
    if (!issuedDate) {
      skipped.push({ row: r, reason: 'unparseable_date' })
      continue
    }
    const amountCents = parseMoneyCents(get(cells, 'amount'))
    if (amountCents === null) {
      skipped.push({ row: r, reason: 'unparseable_amount' })
      continue
    }
    const paidRaw = get(cells, 'paid')
    const balanceRaw = get(cells, 'balance')
    const dueRaw = get(cells, 'dueDate')
    const paidDateRaw = get(cells, 'paidDate')
    rows.push({
      row: r,
      id,
      clientId: client,
      issuedDate,
      dueDate: dueRaw ? parseDate(dueRaw, format) : null,
      amountCents,
      paidCents: hm.colOf.has('paid') ? (paidRaw ? parseMoneyCents(paidRaw) : 0) : null,
      balanceCents: balanceRaw ? parseMoneyCents(balanceRaw) : null,
      paidDate: paidDateRaw ? parseDate(paidDateRaw, format) : null,
    })
  }
  const sf = skippedFinding(file, skipped)
  if (sf) findings.push(sf)
  const columns = Array.from(hm.colOf.keys())
  if (rows.length === 0) {
    return { ...failed<Invoice, InvoiceField>('No usable invoices — every row was skipped.', findings), headerMap: hm, columns, skipped, dateFormat: detection, dataRowCount: grid.length - 1 }
  }
  return { ok: true, error: null, rows, findings, headerMap: hm, columns, skipped, dateFormat: detection, dataRowCount: grid.length - 1 }
}
