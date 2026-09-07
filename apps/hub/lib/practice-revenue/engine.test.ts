/**
 * Engine tests against the synthetic fixture. Run from apps/hub:
 *   ./node_modules/.bin/tsx --test lib/practice-revenue/engine.test.ts
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInvoicesCsv, parseTimeEntriesCsv } from './csv'
import { computeReport } from './engine'
import { weekdaysBetween } from './normalise'
import { AS_OF, EXPECTED, INVOICES_CSV, TIME_CSV } from './fixtures/synthetic'
import type { PracticeRevenueReport } from './types'

function build(withTime = true): PracticeRevenueReport {
  const inv = parseInvoicesCsv(INVOICES_CSV)
  assert.equal(inv.ok, true, inv.error ?? '')
  const time = withTime ? parseTimeEntriesCsv(TIME_CSV) : null
  if (time) assert.equal(time.ok, true, time.error ?? '')
  return computeReport({
    time: time ? time.rows : [],
    invoices: inv.rows,
    timeColumns: time ? time.columns : [],
    invoiceColumns: inv.columns,
    hasTimeFile: withTime,
    options: { asOf: AS_OF },
    parseFindings: [...inv.findings, ...(time ? time.findings : [])],
  })
}

test('fixture: the unparseable-date row is skipped and reported', () => {
  const time = parseTimeEntriesCsv(TIME_CSV)
  assert.equal(time.skipped.length, EXPECTED.skippedTimeRows)
  const f = time.findings.find((x) => x.kind === 'rows_skipped')
  assert.ok(f && f.kind === 'rows_skipped' && f.count === 1 && f.reasons.unparseable_date === 1)
})

test('fixture: unbilled work totals and aged share', () => {
  const r = build()
  assert.equal(r.headline.unbilledCents, EXPECTED.unbilledCents)
  assert.equal(r.headline.unbilledAgedCents, EXPECTED.unbilledAgedCents)
  assert.equal(r.headline.unbilledHours, EXPECTED.unbilledHours)
  assert.equal(r.unbilled?.length, 3)
})

test('fixture: receivables aging by due date', () => {
  const r = build()
  assert.equal(r.headline.arOpenCents, EXPECTED.arOpenCents)
  assert.deepEqual(r.headline.aging, EXPECTED.buckets)
  assert.equal(r.headline.overdue60Cents, EXPECTED.overdue60Cents)
  assert.equal(r.agingBasis, 'due_date')
  assert.equal(r.headline.overdueInvoiceCount, 2)
})

test('fixture: realization, write-down, collection', () => {
  const r = build()
  assert.equal(r.headline.realizationPct, EXPECTED.realizationPct)
  assert.equal(r.headline.writeDownCents, EXPECTED.writeDownCents)
  assert.equal(r.headline.collectionPct, EXPECTED.collectionPct)
})

test('fixture: DSO and lockup', () => {
  const r = build()
  assert.equal(r.headline.dsoDays, EXPECTED.dsoDays)
  assert.equal(r.headline.lockupDays, EXPECTED.lockupDays)
})

test('fixture: utilization is a percentage with a stated assumption', () => {
  const r = build()
  assert.ok(r.headline.utilizationPct !== null && r.headline.utilizationPct > 0 && r.headline.utilizationPct < 100)
  assert.ok(r.findings.some((f) => f.kind === 'assumption' && f.section === 'rates'))
  assert.equal(weekdaysBetween('2026-09-01', '2026-09-07'), 5)
})

test('fixture: client ranking by collected per hour, invoice-only client unranked', () => {
  const r = build()
  const byId = new Map(r.clients.map((c) => [c.clientId, c]))
  for (const [id, cph] of Object.entries(EXPECTED.clientPerHour)) assert.equal(byId.get(id)?.collectedPerHourCents, cph)
  assert.equal(byId.get('CLIENT 04')?.collectedPerHourCents, null)
  assert.equal(byId.get('CLIENT 04')?.rank, null)
  assert.deepEqual(
    r.clients.slice(0, 3).map((c) => c.clientId),
    ['CLIENT 01', 'CLIENT 02', 'CLIENT 03'],
  )
  assert.ok((byId.get('CLIENT 03')?.repriceDeltaCents ?? 0) > 0)
})

test('fixture: time machine is timing only', () => {
  const r = build()
  assert.ok(r.timeMachine)
  assert.equal(r.timeMachine?.invoiceLagDaysWeighted, EXPECTED.invoiceLagDaysWeighted)
  assert.equal(r.timeMachine?.excessLagDollarDays, EXPECTED.excessLagDollarDays)
  assert.equal(r.timeMachine?.excessCollectDollarDays, EXPECTED.excessCollectDollarDays)
  assert.equal(r.timeMachine?.openPastTargetCents, EXPECTED.openPastTargetCents)
  assert.equal(r.timeMachine?.linkedInvoiceCount, 4)
})

test('fixture: closed-matter autopsy rows', () => {
  const r = build()
  assert.ok(r.matters)
  const closed = (r.matters ?? []).filter((m) => m.closed)
  assert.equal(closed.length, EXPECTED.closedMatters)
  const m0302 = closed.find((m) => m.matterId === 'M03-02')
  assert.equal(m0302?.invoicedCents, 200_000)
  assert.equal(m0302?.collectedCents, 0)
})

test('fixture: dormant clients', () => {
  const r = build()
  assert.equal(r.headline.dormantClientCount, EXPECTED.dormantCount)
  assert.equal(r.dormant[0]?.clientId, 'CLIENT 04')
})

test('fixture: benchmark block carries the verified Clio 2025 figures with their source', () => {
  const r = build()
  assert.ok(r.benchmark)
  assert.equal(r.benchmark?.utilizationPct, 38)
  assert.equal(r.benchmark?.realizationPct, 88)
  assert.equal(r.benchmark?.collectionPct, 93)
  assert.match(r.benchmark?.source.url ?? '', /clio\.com/)
})

test('fixture: drafts are neutral and reference only codes', () => {
  const r = build()
  assert.equal(r.drafts.reminders.length, 2)
  assert.equal(r.drafts.invoiceLines.length, 3)
  for (const d of r.drafts.reminders) {
    assert.doesNotMatch(d.body, /interest|late fee|collection|suspend|deadline/i)
    assert.match(d.body, /\{\{client\}\}/)
  }
})

test('invoice-only mode: cash sections computed, time sections dark with findings', () => {
  const r = build(false)
  assert.equal(r.headline.arOpenCents, EXPECTED.arOpenCents)
  assert.equal(r.headline.collectionPct, EXPECTED.collectionPct)
  assert.equal(r.headline.dsoDays, EXPECTED.dsoDays)
  assert.equal(r.headline.unbilledCents, null)
  assert.equal(r.headline.realizationPct, null)
  assert.equal(r.matters, null)
  assert.ok(r.findings.some((f) => f.kind === 'insufficient_evidence' && f.section === 'unbilled'))
  assert.equal(r.drafts.reminders.length, 2)
})

test('missing paid/balance column: aging is null, never zero', () => {
  const csv = 'Invoice,Client,Date,Amount\nA-1,Client 01,2026-08-01,100\n'
  const inv = parseInvoicesCsv(csv)
  assert.equal(inv.ok, true)
  const r = computeReport({
    time: [],
    invoices: inv.rows,
    timeColumns: [],
    invoiceColumns: inv.columns,
    hasTimeFile: false,
    options: { asOf: AS_OF },
    parseFindings: inv.findings,
  })
  assert.equal(r.headline.arOpenCents, null)
  assert.equal(r.headline.aging, null)
  assert.ok(r.findings.some((f) => f.kind === 'insufficient_evidence' && f.section === 'aging'))
})
