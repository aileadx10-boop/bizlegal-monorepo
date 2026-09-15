import { test } from 'node:test'
import assert from 'node:assert/strict'
import { weightedScore, statusFor, SCORING_VERSION } from './index'

test('scoring status mapping', () => {
  assert.equal(statusFor(88.7), 'build')
  assert.equal(statusFor(70), 'validate')
  assert.equal(statusFor(55), 'watch')
  assert.equal(statusFor(40), 'ignore')
})

test('scoring returns stable weighted total', () => {
  const f = { demand: 90, pain: 80, wtp: 70, competition: 60, legal: 75, automation: 50, acquisition: 40 }
  const score = weightedScore(f)
  assert.ok(score > 60 && score < 80, `score=${score}`)
  assert.equal(SCORING_VERSION, 'v1')
})
