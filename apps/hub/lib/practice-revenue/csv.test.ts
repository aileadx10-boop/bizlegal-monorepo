import { test } from 'node:test'
import assert from 'node:assert/strict'
import { INVOICE_SYNONYMS, findPiiCells, mapHeaders, parseInvoicesCsv, parseTimeEntriesCsv, splitCsv, toCsv } from './csv'
import type { InvoiceField } from './csv'
import { detectDateFormat, parseBool, parseDate, parseHours, parseMoneyCents } from './normalise'

const ORDER: readonly InvoiceField[] = ['invoiceId', 'dueDate', 'paidDate', 'paid', 'balance', 'client', 'amount', 'issuedDate']

test('header mapping: exact wins, then whole-word substring', () => {
  const hm = mapHeaders<InvoiceField>(['Client Name', 'Bill Date', 'Invoice Total', 'Invoice #'], INVOICE_SYNONYMS, ORDER)
  assert.equal(hm.colOf.get('client'), 0)
  assert.equal(hm.colOf.get('issuedDate'), 1)
  assert.equal(hm.colOf.get('amount'), 2)
  assert.equal(hm.colOf.get('invoiceId'), 3)
})

test('header mapping: two candidates for one field is ambiguous, not a guess', () => {
  const hm = mapHeaders<InvoiceField>(['Invoice #', 'Client', 'Date', 'Subtotal Total', 'Grand Total'], INVOICE_SYNONYMS, ORDER)
  assert.equal(hm.colOf.has('amount'), false)
  assert.ok(hm.ambiguous.some((a) => a.field === 'amount' && a.candidates.length === 2))
})

test('description columns are recognised for dropping', () => {
  const hm = mapHeaders<InvoiceField>(['Date', 'Client', 'Hours', 'Description'], INVOICE_SYNONYMS, ['invoiceId'])
  assert.deepEqual(hm.droppedColumns, [3])
})

test('ambiguous numeric dates stay null until a format is declared', () => {
  const csv = 'Invoice,Client,Date,Amount,Paid\nA-1,Client 01,09/10/2026,100,0\nA-2,Client 01,03/04/2026,100,0\n'
  const without = parseInvoicesCsv(csv)
  assert.equal(without.ok, false)
  assert.equal(without.dateFormat, 'ambiguous')
  assert.ok(without.findings.some((f) => f.kind === 'ambiguous_date_format'))
  const dmy = parseInvoicesCsv(csv, { dateFormat: 'dmy' })
  assert.equal(dmy.ok, true)
  assert.equal(dmy.rows[0].issuedDate, '2026-10-09')
  const mdy = parseInvoicesCsv(csv, { dateFormat: 'mdy' })
  assert.equal(mdy.rows[0].issuedDate, '2026-09-10')
})

test('a column with one unambiguous cell decides the format for the rest', () => {
  assert.equal(detectDateFormat(['01/02/2026', '25/03/2026']), 'dmy')
  assert.equal(detectDateFormat(['01/02/2026', '03/25/2026']), 'mdy')
  assert.equal(detectDateFormat(['01/02/2026', '03/04/2026']), 'ambiguous')
  assert.equal(detectDateFormat(['2026-01-02']), 'iso')
  assert.equal(detectDateFormat(['18 September 2026']), 'text')
  assert.equal(parseDate('18 Sept 2026', null), '2026-09-18')
  assert.equal(parseDate('Sep 18, 2026', null), '2026-09-18')
  assert.equal(parseDate('2026-02-30', null), null)
})

test('money parsing to integer cents', () => {
  assert.equal(parseMoneyCents('(1,050.00)'), -105000)
  assert.equal(parseMoneyCents('$1,050.00'), 105000)
  assert.equal(parseMoneyCents('1.050,00'), 105000)
  assert.equal(parseMoneyCents('USD 2,500'), 250000)
  assert.equal(parseMoneyCents('2.5'), 250)
  assert.equal(parseMoneyCents('-12'), -1200)
  assert.equal(parseMoneyCents('abc'), null)
  assert.equal(parseMoneyCents(''), null)
})

test('hours parsing', () => {
  assert.equal(parseHours('1:30'), 1.5)
  assert.equal(parseHours('90m'), 1.5)
  assert.equal(parseHours('2h 15m'), 2.25)
  assert.equal(parseHours('1.5'), 1.5)
  assert.equal(parseHours('1,5'), 1.5)
  assert.equal(parseHours('-1'), null)
  assert.equal(parseHours('x'), null)
})

test('boolean parsing', () => {
  assert.equal(parseBool('Yes'), true)
  assert.equal(parseBool('non-billable'), false)
  assert.equal(parseBool('maybe'), null)
})

test('time file: required columns enforced with helpful error', () => {
  const res = parseTimeEntriesCsv('Client,Matter\nA,B\n')
  assert.equal(res.ok, false)
  assert.match(res.error ?? '', /date/)
})

test('PII scan flags emails and SSNs everywhere, phones outside numeric columns', () => {
  const grid = splitCsv('Invoice,Client,Amount\n1234567890123,Client 01,100\n2,jane@example.com,100\n3,123-45-6789,100\n4,+1 (212) 555-0100,100\n')
  const hits = findPiiCells(grid, new Set([0, 2]))
  assert.deepEqual(
    hits.map((h) => h.kind),
    ['email', 'ssn', 'phone'],
  )
})

test('csv round-trip quoting', () => {
  const grid = [
    ['a', 'b,c', 'd"e'],
    ['1', '2', '3'],
  ]
  assert.deepEqual(splitCsv(toCsv(grid)), grid)
})
