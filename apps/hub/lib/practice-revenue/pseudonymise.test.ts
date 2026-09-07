import { test } from 'node:test'
import assert from 'node:assert/strict'
import { splitCsv } from './csv'
import { createPseudonymState, keyFromCsv, keyToCsv, mergedSpellings, pseudonymiseGrid, relabel, reverseKey } from './pseudonymise'

test('grid pseudonymisation is stable, merges spellings, drops columns, and is reversible', () => {
  const grid = splitCsv(
    'Date,Client,Matter,Hours,Description,Invoice\n2026-01-01,Acme LLC,Lease,1,secret text,INV-77\n2026-01-02,acme llc,Lease,2,more,INV-77\n2026-01-03,Smith,Will,1,x,\n',
  )
  const state = createPseudonymState()
  const out = pseudonymiseGrid(grid, { client: 1, matter: 2, invoice: 5, drop: [4] }, state)
  assert.deepEqual(out[0], ['Date', 'Client', 'Matter', 'Hours', 'Invoice'])
  assert.deepEqual(out[1], ['2026-01-01', 'Client 01', 'Matter 01-01', '1', 'INV-0001'])
  assert.deepEqual(out[2], ['2026-01-02', 'Client 01', 'Matter 01-01', '2', 'INV-0001'])
  assert.deepEqual(out[3], ['2026-01-03', 'Client 02', 'Matter 02-01', '1', ''])
  assert.ok(out.every((row) => !row.includes('secret text')))
  const key = reverseKey(state)
  assert.equal(relabel('Client 01', key), 'Acme LLC')
  assert.equal(relabel('Matter 02-01', key), 'Will')
  assert.equal(relabel('INV-0001', key), 'INV-77')
  assert.equal(relabel('Client 09', key), 'Client 09')
  const merged = mergedSpellings(state)
  assert.ok(merged.some((m) => m.spellings.includes('Acme LLC') && m.spellings.includes('acme llc')))
})

test('key CSV round-trips including quoted names', () => {
  const state = createPseudonymState()
  pseudonymiseGrid(splitCsv('Client,Invoice\n"Doe, Jane",A-1\n'), { client: 0, invoice: 1 }, state)
  const csv = keyToCsv(reverseKey(state))
  const back = keyFromCsv(csv)
  assert.equal(back.clients['Client 01'], 'Doe, Jane')
  assert.equal(back.invoices['INV-0001'], 'A-1')
})
