import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  normaliseDate, normaliseMoney, normaliseArea, normaliseName,
  reconcile, sortFindings, AE_DUBAI_RESIDENTIAL,
} from '../dist/index.js'

const REQUIRED = [
  { fact_key: 'contract.closing_date', label: 'Closing date', severity: 'critical' },
  { fact_key: 'financial.purchase_price', label: 'Purchase price', severity: 'critical' },
]

const fact = (o) => ({
  id: o.id, fact_key: o.fact_key, raw_value: o.raw_value, unit: o.unit ?? null,
  source_document_id: o.doc, page: o.page ?? 1, quote: o.quote ?? 'q', confidence: 0.9,
})
const doc = (id, filename, extra = {}) => ({ id, filename, ...extra })

// ── normalisation ───────────────────────────────────────────────────────────
test('dates in different formats normalise equal', () => {
  const a = normaliseDate('18 September 2026')
  const b = normaliseDate('2026-09-18')
  const c = normaliseDate('September 18, 2026')
  assert.equal(a.value, '2026-09-18')
  assert.equal(b.value, '2026-09-18')
  assert.equal(c.value, '2026-09-18')
})

test('ambiguous numeric dates are refused rather than guessed', () => {
  // 09/10/2026 is 9 Oct in Dubai and 10 Sep in the US. Guessing a closing
  // date wrong is the worst failure this system could have.
  assert.equal(normaliseDate('09/10/2026'), null)
})

test('impossible dates are rejected', () => {
  assert.equal(normaliseDate('2026-02-30'), null)
})

test('money normalises across separators and currency spellings', () => {
  const a = normaliseMoney('AED 2,500,000.00')
  const b = normaliseMoney('2500000', 'AED')
  assert.equal(a.value, b.value)
  assert.equal(a.unit, 'AED')
})

test('money without a currency anywhere is refused', () => {
  assert.equal(normaliseMoney('2,500,000'), null)
})

test('areas convert to square metres', () => {
  const sqm = normaliseArea('1200 sqm')
  const sqft = normaliseArea('12,916 sq ft')
  assert.equal(sqm.value, '1200')
  assert.equal(sqft.value, '1200') // 12916 / 10.7639 ≈ 1200
})

test('entity suffixes do not create false name conflicts', () => {
  assert.equal(normaliseName('ABC Holdings LLC').value, normaliseName('ABC Holdings, L.L.C.').value)
})

test('genuinely different names stay different', () => {
  assert.notEqual(normaliseName('ABC Holding').value, normaliseName('ABC Holdings').value)
})

// ── reconciliation ──────────────────────────────────────────────────────────
test('two documents disagreeing on closing date produce one conflict naming both', () => {
  const findings = reconcile({
    documents: [doc('d1', 'contract.pdf'), doc('d2', 'closing-statement.pdf')],
    facts: [
      fact({ id: 'f1', fact_key: 'contract.closing_date', raw_value: '18 September 2026', doc: 'd1' }),
      fact({ id: 'f2', fact_key: 'contract.closing_date', raw_value: '2026-09-24', doc: 'd2' }),
      fact({ id: 'f3', fact_key: 'financial.purchase_price', raw_value: 'AED 2,500,000', doc: 'd1' }),
    ],
    required: REQUIRED,
  })
  const conflicts = findings.filter((f) => f.kind === 'conflict')
  assert.equal(conflicts.length, 1)
  assert.equal(conflicts[0].fact_key, 'contract.closing_date')
  assert.deepEqual([...conflicts[0].claimant_document_ids].sort(), ['d1', 'd2'])
  assert.equal(conflicts[0].severity, 'critical')
})

test('same date written two ways is NOT a conflict', () => {
  const findings = reconcile({
    documents: [doc('d1', 'a.pdf'), doc('d2', 'b.pdf')],
    facts: [
      fact({ id: 'f1', fact_key: 'contract.closing_date', raw_value: '18 September 2026', doc: 'd1' }),
      fact({ id: 'f2', fact_key: 'contract.closing_date', raw_value: '2026-09-18', doc: 'd2' }),
    ],
    required: [],
  })
  assert.equal(findings.filter((f) => f.kind === 'conflict').length, 0)
})

test('a fact in zero documents is missing — not a conflict and not a pass', () => {
  const findings = reconcile({ documents: [doc('d1', 'a.pdf')], facts: [], required: REQUIRED })
  const missing = findings.filter((f) => f.kind === 'missing')
  assert.equal(missing.length, 2)
  assert.equal(findings.filter((f) => f.kind === 'conflict').length, 0)
  assert.ok(missing.every((f) => f.claimant_document_ids.length === 0))
})

test('an unreadable value becomes insufficient_evidence, never a silent pass', () => {
  const findings = reconcile({
    documents: [doc('d1', 'a.pdf')],
    facts: [fact({ id: 'f1', fact_key: 'contract.closing_date', raw_value: '09/10/2026', doc: 'd1' })],
    required: REQUIRED,
  })
  const ins = findings.filter((f) => f.kind === 'insufficient_evidence')
  assert.equal(ins.length, 1)
  assert.equal(ins[0].fact_key, 'contract.closing_date')
})

test('an amendment supersedes its original instead of conflicting with it', () => {
  const findings = reconcile({
    documents: [doc('d1', 'contract.pdf'), doc('d2', 'addendum.pdf', { supersedes: 'd1' })],
    facts: [
      fact({ id: 'f1', fact_key: 'contract.closing_date', raw_value: '2026-09-18', doc: 'd1' }),
      fact({ id: 'f2', fact_key: 'contract.closing_date', raw_value: '2026-09-24', doc: 'd2' }),
    ],
    required: [],
  })
  assert.equal(findings.filter((f) => f.kind === 'conflict').length, 0)
})

test('a document expiring before closing is flagged', () => {
  const findings = reconcile({
    documents: [doc('d1', 'noc.pdf', { expires_at: '2026-09-01' })],
    facts: [],
    required: [],
    closingDate: '2026-09-18',
  })
  const expired = findings.filter((f) => f.kind === 'expired')
  assert.equal(expired.length, 1)
  assert.deepEqual(expired[0].claimant_document_ids, ['d1'])
})

test('findings sort most actionable first', () => {
  const sorted = sortFindings([
    { kind: 'missing', fact_key: 'x', severity: 'low', summary: '', claimant_document_ids: [], fact_ids: [] },
    { kind: 'conflict', fact_key: 'y', severity: 'critical', summary: '', claimant_document_ids: [], fact_ids: [] },
  ])
  assert.equal(sorted[0].severity, 'critical')
})

// ── the Dubai pack ──────────────────────────────────────────────────────────
test('Dubai pack uses the Friday-Saturday weekend', () => {
  assert.deepEqual([...AE_DUBAI_RESIDENTIAL.weekendDays], [5, 6])
})

test('Dubai pack is marked unreviewed until a practitioner signs it off', () => {
  assert.equal(AE_DUBAI_RESIDENTIAL.reviewed, false)
})
