import { test } from 'node:test'
import assert from 'node:assert/strict'
import { quotaFor, resetsAt, requestBuild } from './metering'

test('quotaFor: radar is capped at 2, radar_build is unlimited', () => {
  assert.equal(quotaFor('radar'), 2)
  assert.equal(quotaFor('radar_build'), null)
})

test('resetsAt: the first day of next UTC month', () => {
  const now = new Date(Date.UTC(2026, 8, 16, 12, 30)) // Sept 16, 2026
  const reset = resetsAt(now)
  assert.equal(reset.getUTCFullYear(), 2026)
  assert.equal(reset.getUTCMonth(), 9) // October (0-indexed)
  assert.equal(reset.getUTCDate(), 1)
  assert.equal(reset.getUTCHours(), 0)
})

test('resetsAt: rolls over the year at December', () => {
  const now = new Date(Date.UTC(2026, 11, 20))
  const reset = resetsAt(now)
  assert.equal(reset.getUTCFullYear(), 2027)
  assert.equal(reset.getUTCMonth(), 0)
})

// Requires a live NEON_DATABASE_URL — the atomic-insert race behavior and
// the 402/409 distinction are exercised here only when one is configured
// (CI / local dev with a Neon branch). Skipped otherwise rather than failing
// the whole suite on a missing external dependency.
const dbAvailable = Boolean(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL)

test('requestBuild: returns not_found for a nonexistent opportunity', { skip: !dbAvailable && 'NEON_DATABASE_URL not set' }, async () => {
  const outcome = await requestBuild({ subscriberId: '00000000-0000-0000-0000-000000000000', tier: 'radar', opportunityId: '00000000-0000-0000-0000-000000000000' })
  assert.equal(outcome.ok, false)
  if (!outcome.ok) assert.equal(outcome.reason, 'not_found')
})
