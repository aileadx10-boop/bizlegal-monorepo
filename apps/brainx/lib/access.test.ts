import { test } from 'node:test'
import assert from 'node:assert/strict'
import { findByToken, ACCESS_COOKIE } from './access'

/**
 * `getSubscriber`/`requireSubscriber`/`setAccessCookie` call Next.js's
 * `cookies()`/`redirect()`, which only work inside a request-scoped render
 * and throw outside one — they are exercised end-to-end by the manual
 * cold-prospect test (see apps/brainx/CLAUDE.md), not here. This file
 * covers the guard clauses that don't need that context.
 */

test('ACCESS_COOKIE has the expected name', () => {
  assert.equal(ACCESS_COOKIE, 'bx_access')
})

test('findByToken rejects a malformed token before touching the database', async () => {
  assert.equal(await findByToken(''), null)
  assert.equal(await findByToken('not-a-uuid'), null)
  assert.equal(await findByToken('../../etc/passwd'), null)
})
