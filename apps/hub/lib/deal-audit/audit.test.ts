/**
 * Deal Audit logic tests. Run with: pnpm --filter @bizlegal/hub test:audit
 * (tsx --test lib/deal-audit/audit.test.ts)
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AE_DUBAI_RESIDENTIAL } from '@bizlegal/deal-engine'
import {
  reconcileDealAudit,
  runDealAudit,
  validateDealAuditInput,
} from './audit'

const VALID_INPUT = {
  closingDate: '2026-09-18',
  purchasePrice: 'AED 2,500,000',
  sellerName: 'ABC Holdings LLC',
  buyerName: 'Jane Buyer',
  propertyAddress: 'Marina Gate, Dubai Marina',
  depositAmount: 'AED 250,000',
  propertyArea: '1200 sqm',
}

// ── the gate ────────────────────────────────────────────────────────────────
test('audit is gated while the pack is unreviewed', () => {
  assert.equal(AE_DUBAI_RESIDENTIAL.reviewed, false)
  const result = runDealAudit(VALID_INPUT)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.reason, 'not_reviewed')
})

// ── validation ──────────────────────────────────────────────────────────────
test('validation rejects a non-object body', () => {
  const result = validateDealAuditInput('nope')
  assert.equal(result.ok, false)
  if (!result.ok) assert.match(result.error, /JSON object/)
})

test('validation rejects a missing required field', () => {
  const result = validateDealAuditInput({ ...VALID_INPUT, sellerName: '' })
  assert.equal(result.ok, false)
  if (!result.ok) assert.match(result.error, /sellerName/)
})

test('validation rejects a non-string optional field', () => {
  const result = validateDealAuditInput({ ...VALID_INPUT, nocExpiry: 123 })
  assert.equal(result.ok, false)
  if (!result.ok) assert.match(result.error, /nocExpiry/)
})

test('validation accepts a complete input', () => {
  const result = validateDealAuditInput(VALID_INPUT)
  assert.equal(result.ok, true)
})

// ── the reconcile pipeline (ungated) ────────────────────────────────────────
test('happy path with all facts entered produces no findings', () => {
  const findings = reconcileDealAudit(VALID_INPUT)
  assert.deepEqual(findings, [])
})

test('conflicting second source, expiring document and a missing fact sort by severity', () => {
  const findings = reconcileDealAudit({
    ...VALID_INPUT,
    propertyArea: '', // missing → medium
    closingDateAlt: '2026-09-24', // conflicts with 2026-09-18 → critical
    nocExpiry: '2026-09-01', // before closing → expired (high)
  })
  assert.equal(findings.length, 3)
  // Most actionable first: severity, then kind.
  assert.equal(findings[0]?.kind, 'conflict')
  assert.equal(findings[0]?.severity, 'critical')
  assert.equal(findings[1]?.kind, 'expired')
  assert.equal(findings[1]?.severity, 'high')
  assert.equal(findings[2]?.kind, 'missing')
  assert.equal(findings[2]?.severity, 'medium')
})

test('an ambiguous date becomes insufficient_evidence, never a silent pass', () => {
  const findings = reconcileDealAudit({
    ...VALID_INPUT,
    closingDate: '09/10/2026', // 9 Oct in Dubai, 10 Sep in the US
  })
  const ins = findings.filter((f) => f.kind === 'insufficient_evidence')
  assert.equal(ins.length, 1)
  assert.equal(ins[0]?.fact_key, 'contract.closing_date')
})

test('an area without a unit is flagged, not guessed', () => {
  const findings = reconcileDealAudit({
    ...VALID_INPUT,
    propertyArea: '1200', // no sqm / sq ft suffix
  })
  const ins = findings.filter((f) => f.kind === 'insufficient_evidence')
  assert.equal(ins.length, 1)
  assert.equal(ins[0]?.fact_key, 'property.area')
})

test('a document expiring after closing is not flagged', () => {
  const findings = reconcileDealAudit({
    ...VALID_INPUT,
    nocExpiry: '2026-10-01', // after closing 2026-09-18
  })
  assert.equal(findings.filter((f) => f.kind === 'expired').length, 0)
})
