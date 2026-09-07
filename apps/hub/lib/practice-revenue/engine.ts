/**
 * Practice Revenue Report — the pure engine. No LLM, no I/O, no guessing.
 *
 * Each section is computed only when its inputs exist; otherwise it is null
 * and carries an `insufficient_evidence` finding. Conventions the report
 * prints inline (the formula is the citation):
 *   unbilled     billable entries with no invoice link and not flagged billed
 *   aging        open balance bucketed by days past the due date (issued date
 *                when the export has no due-date column; basis is printed)
 *   realization  invoiced billable hours ÷ billable hours (Clio's definition)
 *   collection   collected ÷ invoiced (dollars)
 *   utilization  billable hours ÷ (weekdays in range × hoursPerDay)
 *   DSO          open AR ÷ (invoiced in trailing window ÷ window days)
 *   lockup       unbilled ÷ that daily rate + DSO
 *   time machine timing shifts only — "earlier", never "more"
 *   reprice      hours × median collected-per-hour − collected, never "fire"
 */
import { activeBenchmark } from './benchmarks'
import { buildDrafts } from './drafts'
import { addDays, daysBetween, maxIso, minIso, weekdaysBetween } from './normalise'
import type {
  AgingBuckets,
  Cents,
  ClientRow,
  DormantRow,
  EngineOptions,
  Finding,
  Headline,
  Invoice,
  IsoDate,
  MatterRow,
  OverdueRow,
  PracticeRevenueReport,
  TimeEntry,
  TimeMachine,
  UnbilledRow,
} from './types'
import { DEFAULT_ENGINE_OPTIONS } from './types'

export interface EngineInput {
  readonly time: readonly TimeEntry[]
  readonly invoices: readonly Invoice[]
  readonly timeColumns: readonly string[]
  readonly invoiceColumns: readonly string[]
  readonly hasTimeFile: boolean
  readonly options?: Partial<EngineOptions>
  readonly parseFindings?: readonly Finding[]
}

const pct = (num: number, den: number): number | null => (den > 0 ? Math.round((num / den) * 1000) / 10 : null)
const round1 = (n: number): number => Math.round(n * 10) / 10
const sum = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0)

/** Paid amount of an invoice, or null when the export cannot say. */
export function paidOf(inv: Invoice): Cents | null {
  if (inv.paidCents !== null) return inv.paidCents
  if (inv.balanceCents !== null) return inv.amountCents - inv.balanceCents
  return null
}

/** Open balance of an invoice, or null when the export cannot say. */
export function openOf(inv: Invoice): Cents | null {
  if (inv.balanceCents !== null) return inv.balanceCents
  if (inv.paidCents !== null) return inv.amountCents - inv.paidCents
  return null
}

function entryCents(e: TimeEntry): Cents | null {
  if (e.amountCents !== null) return e.amountCents
  if (e.rateCents !== null) return Math.round(e.hours * e.rateCents)
  return null
}

function isBillable(e: TimeEntry): boolean {
  return e.billable !== false
}

function isInvoiced(e: TimeEntry): boolean {
  return e.invoiceId !== null || e.billed === true
}

// ── Sections ────────────────────────────────────────────────────────────────

export function unbilledWork(
  time: readonly TimeEntry[],
  timeColumns: readonly string[],
  opts: EngineOptions,
): { rows: UnbilledRow[]; totalCents: Cents | null; agedCents: Cents | null; hours: number } | null {
  if (!timeColumns.includes('invoiceId') && !timeColumns.includes('billed')) return null
  const rows: UnbilledRow[] = []
  let total = 0
  let aged = 0
  let allPriced = true
  for (const e of time) {
    if (!isBillable(e) || isInvoiced(e)) continue
    const cents = entryCents(e)
    const age = daysBetween(e.date, opts.asOf)
    if (cents === null) allPriced = false
    else {
      total += cents
      if (age > opts.unbilledAgeDays) aged += cents
    }
    rows.push({ row: e.row, date: e.date, clientId: e.clientId, matterId: e.matterId, hours: e.hours, amountCents: cents, ageDays: age })
  }
  rows.sort((a, b) => b.ageDays - a.ageDays)
  return { rows, totalCents: allPriced ? total : null, agedCents: allPriced ? aged : null, hours: sum(rows.map((r) => r.hours)) }
}

function bucketOf(days: number): keyof AgingBuckets {
  if (days <= 30) return 'b0_30'
  if (days <= 60) return 'b31_60'
  if (days <= 90) return 'b61_90'
  return 'b90p'
}

export function receivablesAging(
  invoices: readonly Invoice[],
  invoiceColumns: readonly string[],
  opts: EngineOptions,
): { rows: OverdueRow[]; buckets: AgingBuckets; arOpenCents: Cents; overdue60Cents: Cents; basis: 'due_date' | 'issued_date' } | null {
  if (!invoiceColumns.includes('paid') && !invoiceColumns.includes('balance')) return null
  const basis: 'due_date' | 'issued_date' = invoiceColumns.includes('dueDate') ? 'due_date' : 'issued_date'
  const rows: OverdueRow[] = []
  const buckets: { b0_30: number; b31_60: number; b61_90: number; b90p: number } = { b0_30: 0, b31_60: 0, b61_90: 0, b90p: 0 }
  for (const inv of invoices) {
    const open = openOf(inv)
    if (open === null || open <= 0) continue
    const basisDate = basis === 'due_date' && inv.dueDate ? inv.dueDate : inv.issuedDate
    const daysPast = Math.max(0, daysBetween(basisDate, opts.asOf))
    const bucket = bucketOf(daysPast)
    buckets[bucket] += open
    rows.push({ invoiceId: inv.id, clientId: inv.clientId, issuedDate: inv.issuedDate, dueDate: inv.dueDate, amountCents: inv.amountCents, openCents: open, daysPast, bucket })
  }
  rows.sort((a, b) => b.daysPast - a.daysPast)
  const arOpenCents = buckets.b0_30 + buckets.b31_60 + buckets.b61_90 + buckets.b90p
  return { rows, buckets, arOpenCents, overdue60Cents: buckets.b61_90 + buckets.b90p, basis }
}

export function rates(
  time: readonly TimeEntry[],
  invoices: readonly Invoice[],
  timeColumns: readonly string[],
  invoiceColumns: readonly string[],
  hasTimeFile: boolean,
  opts: EngineOptions,
): {
  realizationPct: number | null
  writeDownCents: Cents | null
  collectionPct: number | null
  utilizationPct: number | null
  dsoDays: number | null
  lockupDays: number | null
  findings: Finding[]
} {
  const findings: Finding[] = []
  const linkable = hasTimeFile && (timeColumns.includes('invoiceId') || timeColumns.includes('billed'))
  const billable = time.filter(isBillable)
  const billableHours = sum(billable.map((e) => e.hours))

  // Realization (hours basis).
  let realizationPct: number | null = null
  if (linkable) {
    realizationPct = pct(sum(billable.filter(isInvoiced).map((e) => e.hours)), billableHours)
  } else if (hasTimeFile) {
    findings.push({ kind: 'insufficient_evidence', section: 'rates', reason: 'realization needs an invoice link or billed flag in the time export' })
  }

  // Write-down: worked value above the linked invoice amount.
  let writeDownCents: Cents | null = null
  if (linkable && timeColumns.includes('invoiceId')) {
    const byInvoice = new Map<string, Invoice>()
    for (const inv of invoices) byInvoice.set(inv.id, inv)
    const worked = new Map<string, { cents: number; priced: boolean }>()
    for (const e of billable) {
      if (!e.invoiceId || !byInvoice.has(e.invoiceId)) continue
      const cur = worked.get(e.invoiceId) ?? { cents: 0, priced: true }
      const c = entryCents(e)
      if (c === null) cur.priced = false
      else cur.cents += c
      worked.set(e.invoiceId, cur)
    }
    let total = 0
    let any = false
    worked.forEach((w, id) => {
      if (!w.priced) return
      any = true
      total += Math.max(0, w.cents - (byInvoice.get(id) as Invoice).amountCents)
    })
    writeDownCents = any ? total : null
  }

  // Collection (dollars).
  let collectionPct: number | null = null
  const collectable = invoices.filter((i) => paidOf(i) !== null)
  if (collectable.length > 0) {
    collectionPct = pct(sum(collectable.map((i) => paidOf(i) as number)), sum(collectable.map((i) => i.amountCents)))
  } else {
    findings.push({ kind: 'insufficient_evidence', section: 'rates', reason: 'collection rate needs a paid or balance column in the invoice export' })
  }

  // Utilization.
  let utilizationPct: number | null = null
  if (hasTimeFile && time.length > 0) {
    const first = minIso(time.map((e) => e.date)) as IsoDate
    const last = maxIso(time.map((e) => e.date)) as IsoDate
    const capacity = weekdaysBetween(first, last) * opts.hoursPerDay
    utilizationPct = pct(billableHours, capacity)
    findings.push({ kind: 'assumption', section: 'rates', text: `Utilization assumes ${opts.hoursPerDay} available hours per weekday from ${first} to ${last}.` })
  }

  // DSO + lockup.
  let dsoDays: number | null = null
  let lockupDays: number | null = null
  const windowStart = addDays(opts.asOf, -opts.dsoWindowDays)
  const invoicedInWindow = sum(invoices.filter((i) => i.issuedDate > windowStart && i.issuedDate <= opts.asOf).map((i) => i.amountCents))
  const daily = invoicedInWindow / opts.dsoWindowDays
  const opens = invoices.map(openOf).filter((o): o is number => o !== null && o > 0)
  if (daily > 0 && (invoiceColumns.includes('paid') || invoiceColumns.includes('balance'))) {
    const arOpen = sum(opens)
    dsoDays = round1(arOpen / daily)
    const ub = unbilledWork(time, timeColumns, opts)
    if (ub && ub.totalCents !== null) lockupDays = round1(ub.totalCents / daily + arOpen / daily)
  } else if (invoices.length > 0) {
    findings.push({ kind: 'insufficient_evidence', section: 'aging', reason: `DSO needs invoices issued in the last ${opts.dsoWindowDays} days and a paid or balance column` })
  }

  return { realizationPct, writeDownCents, collectionPct, utilizationPct, dsoDays, lockupDays, findings }
}

interface ClientAgg {
  hours: number
  hasHours: boolean
  workedCents: number
  workedPriced: boolean
  invoicedCents: number
  collectedCents: number
  collectedKnown: boolean
  openCents: number
  openKnown: boolean
  last: IsoDate | null
}

function aggregateClients(time: readonly TimeEntry[], invoices: readonly Invoice[]): Map<string, ClientAgg> {
  const m = new Map<string, ClientAgg>()
  const get = (id: string): ClientAgg => {
    let a = m.get(id)
    if (!a) {
      a = { hours: 0, hasHours: false, workedCents: 0, workedPriced: true, invoicedCents: 0, collectedCents: 0, collectedKnown: false, openCents: 0, openKnown: false, last: null }
      m.set(id, a)
    }
    return a
  }
  for (const e of time) {
    const a = get(e.clientId)
    a.last = maxIso([a.last, e.date])
    if (!isBillable(e)) continue
    a.hours += e.hours
    a.hasHours = true
    const c = entryCents(e)
    if (c === null) a.workedPriced = false
    else a.workedCents += c
  }
  for (const inv of invoices) {
    const a = get(inv.clientId)
    a.invoicedCents += inv.amountCents
    a.last = maxIso([a.last, inv.issuedDate, inv.paidDate])
    const paid = paidOf(inv)
    if (paid !== null) {
      a.collectedCents += paid
      a.collectedKnown = true
    }
    const open = openOf(inv)
    if (open !== null) {
      a.openCents += Math.max(0, open)
      a.openKnown = true
    }
  }
  return m
}

export function clientRanking(time: readonly TimeEntry[], invoices: readonly Invoice[]): ClientRow[] {
  const aggs = aggregateClients(time, invoices)
  const rows: ClientRow[] = []
  aggs.forEach((a, clientId) => {
    const cph = a.hasHours && a.collectedKnown && a.hours > 0 ? Math.round(a.collectedCents / a.hours) : null
    rows.push({
      clientId,
      billableHours: a.hasHours ? a.hours : null,
      workedCents: a.hasHours && a.workedPriced ? a.workedCents : null,
      invoicedCents: a.invoicedCents,
      collectedCents: a.collectedKnown ? a.collectedCents : null,
      openCents: a.openKnown ? a.openCents : null,
      collectedPerHourCents: cph,
      rank: null,
      repriceDeltaCents: null,
      lastActivity: a.last,
    })
  })
  const ranked = rows
    .filter((r) => r.collectedPerHourCents !== null)
    .sort((x, y) => (y.collectedPerHourCents as number) - (x.collectedPerHourCents as number))
  const values = ranked.map((r) => r.collectedPerHourCents as number)
  const median =
    values.length === 0
      ? null
      : values.length % 2 === 1
        ? values[(values.length - 1) / 2]
        : Math.round((values[values.length / 2 - 1] + values[values.length / 2]) / 2)
  const rankOf = new Map<string, number>()
  ranked.forEach((r, i) => rankOf.set(r.clientId, i + 1))
  return rows
    .map((r) => {
      const rank = rankOf.get(r.clientId) ?? null
      const reprice =
        median !== null && r.billableHours !== null && r.collectedCents !== null
          ? Math.max(0, Math.round(r.billableHours * median - r.collectedCents))
          : null
      return { ...r, rank, repriceDeltaCents: reprice }
    })
    .sort((x, y) => (x.rank ?? 1e9) - (y.rank ?? 1e9) || y.invoicedCents - x.invoicedCents)
}

export function matterAutopsy(time: readonly TimeEntry[], invoices: readonly Invoice[], timeColumns: readonly string[], opts: EngineOptions): MatterRow[] | null {
  if (!timeColumns.includes('matter')) return null
  const byInvoice = new Map<string, Invoice>()
  for (const inv of invoices) byInvoice.set(inv.id, inv)
  const matters = new Map<string, { clientId: string; hours: number; cents: number; priced: boolean; invoiceIds: Set<string>; unbilledHours: number; last: IsoDate }>()
  for (const e of time) {
    if (!e.matterId) continue
    const key = `${e.clientId}|${e.matterId}`
    const m = matters.get(key) ?? { clientId: e.clientId, hours: 0, cents: 0, priced: true, invoiceIds: new Set<string>(), unbilledHours: 0, last: e.date }
    m.last = maxIso([m.last, e.date]) as IsoDate
    if (isBillable(e)) {
      m.hours += e.hours
      const c = entryCents(e)
      if (c === null) m.priced = false
      else m.cents += c
      if (e.invoiceId) m.invoiceIds.add(e.invoiceId)
      if (!isInvoiced(e)) m.unbilledHours += e.hours
    }
    matters.set(key, m)
  }
  const rows: MatterRow[] = []
  matters.forEach((m, key) => {
    const matterId = key.slice(key.indexOf('|') + 1)
    let invoiced = 0
    let collected = 0
    let collectedKnown = true
    m.invoiceIds.forEach((id) => {
      const inv = byInvoice.get(id)
      if (!inv) return
      invoiced += inv.amountCents
      const p = paidOf(inv)
      if (p === null) collectedKnown = false
      else collected += p
    })
    const quiet = daysBetween(m.last, opts.asOf) > opts.closedMatterQuietDays
    rows.push({
      clientId: m.clientId,
      matterId,
      billableHours: m.hours,
      workedCents: m.priced ? m.cents : null,
      invoicedCents: invoiced,
      collectedCents: m.invoiceIds.size > 0 && collectedKnown ? collected : null,
      unbilledHours: m.unbilledHours,
      lastEntry: m.last,
      closed: quiet && m.unbilledHours === 0,
    })
  })
  return rows.sort((a, b) => (a.closed === b.closed ? b.billableHours - a.billableHours : a.closed ? -1 : 1))
}

export function timeMachine(time: readonly TimeEntry[], invoices: readonly Invoice[], timeColumns: readonly string[], opts: EngineOptions): TimeMachine | null {
  const hasPaid = invoices.some((i) => paidOf(i) !== null)
  if (!hasPaid && !timeColumns.includes('invoiceId')) return null
  const lastEntryByInvoice = new Map<string, IsoDate>()
  if (timeColumns.includes('invoiceId')) {
    for (const e of time) {
      if (!e.invoiceId) continue
      lastEntryByInvoice.set(e.invoiceId, maxIso([lastEntryByInvoice.get(e.invoiceId) ?? null, e.date]) as IsoDate)
    }
  }
  const lagRows: Array<{ invoiceId: string; lagDays: number; amountCents: Cents }> = []
  let lagWeighted = 0
  let lagAmount = 0
  let excessLag = 0
  for (const inv of invoices) {
    const last = lastEntryByInvoice.get(inv.id)
    if (!last) continue
    const lag = daysBetween(last, inv.issuedDate)
    lagRows.push({ invoiceId: inv.id, lagDays: lag, amountCents: inv.amountCents })
    lagWeighted += lag * inv.amountCents
    lagAmount += inv.amountCents
    excessLag += inv.amountCents * Math.max(0, lag - opts.invoiceLagTargetDays)
  }
  let payWeighted = 0
  let payAmount = 0
  let excessCollect = 0
  let openPast = 0
  for (const inv of invoices) {
    const paid = paidOf(inv)
    if (paid !== null && paid > 0 && inv.paidDate) {
      const d = daysBetween(inv.issuedDate, inv.paidDate)
      payWeighted += d * paid
      payAmount += paid
      excessCollect += paid * Math.max(0, d - opts.collectTargetDays)
    }
    const open = openOf(inv)
    if (open !== null && open > 0 && daysBetween(inv.issuedDate, opts.asOf) > opts.collectTargetDays) openPast += open
  }
  return {
    invoiceLagDaysWeighted: lagAmount > 0 ? round1(lagWeighted / lagAmount) : null,
    excessLagDollarDays: Math.round(excessLag / 100),
    linkedInvoiceCount: lagRows.length,
    daysToPayWeighted: payAmount > 0 ? round1(payWeighted / payAmount) : null,
    excessCollectDollarDays: Math.round(excessCollect / 100),
    openPastTargetCents: openPast,
    lagRows: lagRows.sort((a, b) => b.lagDays - a.lagDays),
  }
}

export function dormantClients(time: readonly TimeEntry[], invoices: readonly Invoice[], opts: EngineOptions): DormantRow[] {
  const aggs = aggregateClients(time, invoices)
  const rows: DormantRow[] = []
  aggs.forEach((a, clientId) => {
    if (!a.collectedKnown || a.collectedCents <= 0 || !a.last) return
    const days = daysBetween(a.last, opts.asOf)
    if (days > opts.dormantDays) rows.push({ clientId, lastActivity: a.last, daysSince: days, lifetimeCollectedCents: a.collectedCents })
  })
  return rows.sort((x, y) => y.lifetimeCollectedCents - x.lifetimeCollectedCents)
}

// ── The report ──────────────────────────────────────────────────────────────

export function computeReport(input: EngineInput): PracticeRevenueReport {
  const opts: EngineOptions = {
    ...DEFAULT_ENGINE_OPTIONS,
    ...(input.options ?? {}),
    asOf: input.options?.asOf ?? new Date().toISOString().slice(0, 10),
  }
  const findings: Finding[] = [...(input.parseFindings ?? [])]
  const { time, invoices, timeColumns, invoiceColumns, hasTimeFile } = input

  if (hasTimeFile && !timeColumns.includes('billable')) {
    findings.push({ kind: 'assumption', section: 'unbilled', text: 'No billable flag in the time export — every entry is treated as billable.' })
  }

  const ub = hasTimeFile ? unbilledWork(time, timeColumns, opts) : null
  if (hasTimeFile && !ub) findings.push({ kind: 'insufficient_evidence', section: 'unbilled', reason: 'no invoice link or billed flag in the time export' })
  if (!hasTimeFile) findings.push({ kind: 'insufficient_evidence', section: 'unbilled', reason: 'no time-entry export was provided' })
  if (ub && ub.totalCents === null && ub.rows.length > 0) {
    findings.push({ kind: 'insufficient_evidence', section: 'unbilled', reason: 'some unbilled entries have no rate or amount, so the dollar total is not computable' })
  }

  const aging = receivablesAging(invoices, invoiceColumns, opts)
  if (!aging) findings.push({ kind: 'insufficient_evidence', section: 'aging', reason: 'no paid or balance column in the invoice export' })
  else if (aging.basis === 'issued_date') findings.push({ kind: 'assumption', section: 'aging', text: 'No due-date column — aging is counted from the issue date.' })

  const r = rates(time, invoices, timeColumns, invoiceColumns, hasTimeFile, opts)
  findings.push(...r.findings)

  const clients = clientRanking(time, invoices)
  const matters = hasTimeFile ? matterAutopsy(time, invoices, timeColumns, opts) : null
  if (hasTimeFile && !matters) findings.push({ kind: 'insufficient_evidence', section: 'matters', reason: 'no matter column in the time export' })
  if (matters) findings.push({ kind: 'assumption', section: 'matters', text: `A matter counts as closed when it has no entry in the last ${opts.closedMatterQuietDays} days and nothing unbilled.` })

  const tm = timeMachine(time, invoices, timeColumns, opts)
  if (!tm) findings.push({ kind: 'insufficient_evidence', section: 'timeMachine', reason: 'needs a paid column or an invoice link in the time export' })

  const dormant = dormantClients(time, invoices, opts)
  const canCollect = invoiceColumns.includes('paid') || invoiceColumns.includes('balance')
  if (!canCollect) findings.push({ kind: 'insufficient_evidence', section: 'dormant', reason: 'dormant clients need a paid or balance column' })

  const dates = [...time.map((e) => e.date), ...invoices.map((i) => i.issuedDate)]
  const first = minIso(dates)
  const last = maxIso(dates)

  const headline: Headline = {
    unbilledCents: ub ? ub.totalCents : null,
    unbilledAgedCents: ub ? ub.agedCents : null,
    unbilledHours: ub ? round1(ub.hours) : null,
    arOpenCents: aging ? aging.arOpenCents : null,
    overdue60Cents: aging ? aging.overdue60Cents : null,
    aging: aging ? aging.buckets : null,
    realizationPct: r.realizationPct,
    collectionPct: r.collectionPct,
    utilizationPct: r.utilizationPct,
    writeDownCents: r.writeDownCents,
    dsoDays: r.dsoDays,
    lockupDays: r.lockupDays,
    dormantClientCount: canCollect ? dormant.length : null,
    overdueInvoiceCount: aging ? aging.rows.filter((x) => x.daysPast > 0).length : null,
  }

  return {
    version: 1,
    asOf: opts.asOf,
    currency: opts.currency,
    options: opts,
    coverage: { timeEntries: time.length, invoices: invoices.length, dateRange: first && last ? [first, last] : null, hasTimeFile },
    headline,
    findings,
    benchmark: activeBenchmark(),
    unbilled: ub ? ub.rows : null,
    overdue: aging ? aging.rows : null,
    agingBasis: aging ? aging.basis : null,
    clients,
    matters,
    timeMachine: tm,
    dormant,
    drafts: buildDrafts(aging ? aging.rows : null, ub ? ub.rows : null, opts.currency),
  }
}
