import { test } from 'node:test'
import assert from 'node:assert/strict'
import { FREE_LIMIT } from './paywall.ts'

test('free tier limit is 3', () => {
  assert.equal(FREE_LIMIT, 3)
})
