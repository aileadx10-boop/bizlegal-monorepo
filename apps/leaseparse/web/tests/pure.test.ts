/**
 * Unit tests for the deterministic core: the risk scorer, the critical-date
 * engine, and the untrusted-JSON coercion boundary. All three are pure, so
 * they are testable without a network, a database, or an LLM — which is the
 * whole reason the scoring and date logic were kept out of the model.
 *
 * No test runner is configured in this workspace, so this file runs on
 * node:test + node:assert via `node tests/run.cjs` (see that script; it
 * compiles this file and its imports to CommonJS first).
 */

import assert from 'node:assert/strict'
import { test } from 'node:test'

import { deriveCriticalDates, tierFor } from '../lib/extract/date-engine'
import type { LeaseAbstract, RiskFlag } from '../lib/extract/types'
import { coerceLeaseAbstract, extractJsonObject, parseModelJson } from '../lib/extract/coerce'
import {
  CLAUSE_WEIGHTS,
  SEVERITY_WEIGHTS,
  deductionFor,
  gradeFor,
  scoreRiskFlags,
} from '../lib/risk/score-engine'

// ─── helpers ───────────────────────────────────────────────────────────────

function flag(
  clause: RiskFlag['clause'],
  severity: RiskFlag['severity'],
  excerpt = 'verbatim excerpt'
): RiskFlag {
  return { clause, excerpt, severity }
}

function abstractWith(overrides: Partial<LeaseAbstract> = {}): LeaseAbstract {
  return {
    parties: { landlord: 'Acme Holdings LLC', tenant: 'Blue Bottle Retail Inc' },
    premises: { address: '1 Market St', city: 'San Francisco', state: 'CA' },
    term: { commencement: '2024-01-01', expiration: '2029-12-31' },
    financial: { base_rent_cents: 1_250_000, escalations: [] },
    critical_dates: [],
    risk_flags: [],
    ...overrides,
  }
}

// ─── risk scorer ───────────────────────────────────────────────────────────

test('scores a clean lease at 100 with grade A and no drivers', () => {
  const result = scoreRiskFlags([])
  assert.equal(result.score, 100)
  assert.equal(result.grade, 'A')
  assert.deepEqual(result.drivers, [])
  assert.equal(result.flagged_clause_count, 0)
})

test('deducts severity weight times clause weight', () => {
  // Arrange
  const high = flag('demolition', 'high')
  // Act
  const deduction = deductionFor(high)
  // Assert — demolition carries the full clause weight
  assert.equal(deduction, SEVERITY_WEIGHTS.high * CLAUSE_WEIGHTS.demolition)
  assert.equal(scoreRiskFlags([high]).score, 100 - 30)
})

test('applies the clause multiplier so exclusive_use costs less than demolition', () => {
  const exclusive = scoreRiskFlags([flag('exclusive_use', 'high')]).score
  const demolition = scoreRiskFlags([flag('demolition', 'high')]).score
  assert.ok(exclusive > demolition, 'a narrower clause must deduct fewer points')
})

test('collapses a duplicated clause to its worst occurrence', () => {
  const once = scoreRiskFlags([flag('relocation', 'high')])
  const thrice = scoreRiskFlags([
    flag('relocation', 'info'),
    flag('relocation', 'high'),
    flag('relocation', 'warn'),
  ])
  assert.equal(thrice.score, once.score, 'a repeated flag must not inflate the deduction')
  assert.equal(thrice.flagged_clause_count, 1)
})

test('never returns a score below zero', () => {
  const everything: RiskFlag[] = (
    ['co_tenancy', 'go_dark', 'assignment_restriction', 'exclusive_use', 'relocation', 'demolition'] as const
  ).map(c => flag(c, 'high'))
  const result = scoreRiskFlags(everything)
  assert.ok(result.score >= 0, 'score clamps at 0')
  assert.equal(result.grade, 'F')
})

test('orders drivers by impact and caps the list at five', () => {
  const everything: RiskFlag[] = (
    ['exclusive_use', 'assignment_restriction', 'go_dark', 'co_tenancy', 'relocation', 'demolition'] as const
  ).map(c => flag(c, 'high'))
  const { drivers } = scoreRiskFlags(everything)
  assert.equal(drivers.length, 5, 'top drivers capped at 5')
  for (let i = 1; i < drivers.length; i += 1) {
    assert.ok(drivers[i - 1].deduction >= drivers[i].deduction, 'drivers sorted descending')
  }
  assert.ok(
    drivers[0].clause === 'demolition' || drivers[0].clause === 'relocation',
    'heaviest clause leads'
  )
})

test('does not mutate the caller’s flag array', () => {
  const flags = [flag('go_dark', 'warn'), flag('demolition', 'high')]
  const snapshot = JSON.parse(JSON.stringify(flags))
  scoreRiskFlags(flags)
  assert.deepEqual(JSON.parse(JSON.stringify(flags)), snapshot)
})

test('maps scores to grades at the documented thresholds', () => {
  assert.equal(gradeFor(100), 'A')
  assert.equal(gradeFor(90), 'A')
  assert.equal(gradeFor(89), 'B')
  assert.equal(gradeFor(75), 'B')
  assert.equal(gradeFor(74), 'C')
  assert.equal(gradeFor(60), 'C')
  assert.equal(gradeFor(59), 'D')
  assert.equal(gradeFor(40), 'D')
  assert.equal(gradeFor(39), 'F')
  assert.equal(gradeFor(0), 'F')
})

// ─── date engine ───────────────────────────────────────────────────────────

test('tierFor picks the smallest containing tier and rejects past dates', () => {
  assert.equal(tierFor(-1), null)
  assert.equal(tierFor(0), 7)
  assert.equal(tierFor(7), 7)
  assert.equal(tierFor(8), 30)
  assert.equal(tierFor(30), 30)
  assert.equal(tierFor(61), 90)
  assert.equal(tierFor(91), null, 'beyond the widest tier there is no alert')
})

test('derives an alert for a critical date inside the 90-day window', () => {
  const now = new Date('2026-01-01T00:00:00Z')
  const alerts = deriveCriticalDates(
    abstractWith({
      critical_dates: [{ key: 'expiration', label: 'Lease expiration', date: '2026-02-15' }],
    }),
    now
  )
  const expiration = alerts.find(a => a.key === 'expiration')
  assert.ok(expiration, 'expiration alert present')
  assert.equal(expiration.days_until, 45)
  assert.equal(expiration.tier, 60)
  assert.equal(expiration.is_notice_deadline, false)
})

test('ignores critical dates outside the 90-day window and in the past', () => {
  const now = new Date('2026-01-01T00:00:00Z')
  const alerts = deriveCriticalDates(
    abstractWith({
      critical_dates: [
        { key: 'far_future', label: 'Far future', date: '2027-06-01' },
        { key: 'already_passed', label: 'Passed', date: '2025-06-01' },
      ],
    }),
    now
  )
  assert.deepEqual(alerts, [])
})

test('emits a separate notice-deadline alert ahead of the event', () => {
  const now = new Date('2026-01-01T00:00:00Z')
  const alerts = deriveCriticalDates(
    abstractWith({
      critical_dates: [
        { key: 'renewal', label: 'Renewal option', date: '2026-03-25', notice_window_days: 30 },
      ],
    }),
    now
  )
  const notice = alerts.find(a => a.is_notice_deadline)
  assert.ok(notice, 'a notice-window deadline is surfaced as its own alert')
  assert.equal(notice.date, '2026-02-23', 'notice deadline is 30 days before the event')
})

// ─── coercion boundary ─────────────────────────────────────────────────────

test('recovers a JSON object from fenced, chatty model output', () => {
  const raw = 'Sure! Here is the JSON:\n```json\n{"a": {"b": 1}}\n```\nHope that helps.'
  assert.equal(extractJsonObject(raw), '{"a": {"b": 1}}')
  assert.deepEqual(parseModelJson(raw), { a: { b: 1 } })
})

test('is not fooled by braces inside strings', () => {
  const raw = '{"excerpt": "the tenant may not {sublet}", "ok": true}'
  assert.deepEqual(parseModelJson(raw), { excerpt: 'the tenant may not {sublet}', ok: true })
})

test('returns null rather than guessing when output is unparseable', () => {
  assert.equal(parseModelJson('I could not read that lease.'), null)
  assert.equal(parseModelJson('{"unclosed": '), null)
})

test('drops non-ISO dates instead of repairing them', () => {
  const { abstract, warnings } = coerceLeaseAbstract({
    term: { commencement: 'January 1st, 2024', expiration: '2029-12-31' },
    critical_dates: [{ key: 'renewal', label: 'Renewal', date: 'next spring' }],
  })
  assert.equal(abstract.term.commencement, '', 'a prose date is discarded, not parsed')
  assert.equal(abstract.term.expiration, '2029-12-31')
  assert.deepEqual(abstract.critical_dates, [])
  assert.ok(warnings.some(w => w.includes('critical date')))
})

test('drops risk flags with unknown clauses or no supporting excerpt', () => {
  const { abstract, warnings } = coerceLeaseAbstract({
    risk_flags: [
      { clause: 'rent_control', excerpt: 'something', severity: 'high' },
      { clause: 'go_dark', excerpt: '', severity: 'high' },
      { clause: 'co_tenancy', excerpt: 'If the anchor tenant vacates...', severity: 'high' },
    ],
  })
  assert.equal(abstract.risk_flags.length, 1, 'only the evidenced, known clause survives')
  assert.equal(abstract.risk_flags[0].clause, 'co_tenancy')
  assert.equal(warnings.length, 2)
})

test('normalises money strings and rejects nonsense', () => {
  const { abstract } = coerceLeaseAbstract({
    financial: { base_rent_cents: '$1,250,000', security_deposit_cents: 'unknown' },
  })
  assert.equal(abstract.financial.base_rent_cents, 1_250_000)
  assert.equal(abstract.financial.security_deposit_cents, undefined)
})

test('defaults an unknown severity to info rather than dropping the flag', () => {
  const { abstract } = coerceLeaseAbstract({
    risk_flags: [{ clause: 'relocation', excerpt: 'Landlord may relocate', severity: 'catastrophic' }],
  })
  assert.equal(abstract.risk_flags[0].severity, 'info')
})

test('survives entirely absent input without throwing', () => {
  const { abstract } = coerceLeaseAbstract(null)
  assert.equal(abstract.parties.landlord, '')
  assert.deepEqual(abstract.critical_dates, [])
  assert.deepEqual(abstract.risk_flags, [])
})

test('an empty abstract scores low enough to trigger the Claude fallback', async () => {
  const { scoreConfidence } = await import('../lib/extract/hermes-first')
  const { shouldFallback, CONFIDENCE_FLOOR } = await import('../lib/extract/claude-fallback')
  const { abstract } = coerceLeaseAbstract({})
  const confidence = scoreConfidence(abstract)
  assert.equal(confidence, 0)
  assert.ok(confidence < CONFIDENCE_FLOOR)
  assert.equal(
    shouldFallback({ abstract, confidence, engine: 'hermes', warnings: [] }),
    true
  )
})

test('a complete abstract clears the confidence floor and skips Claude', async () => {
  const { scoreConfidence } = await import('../lib/extract/hermes-first')
  const { shouldFallback } = await import('../lib/extract/claude-fallback')
  const abstract = abstractWith({
    critical_dates: [{ key: 'expiration', label: 'Expiration', date: '2029-12-31' }],
  })
  const confidence = scoreConfidence(abstract)
  assert.equal(confidence, 1)
  assert.equal(shouldFallback({ abstract, confidence, engine: 'hermes', warnings: [] }), false)
})
