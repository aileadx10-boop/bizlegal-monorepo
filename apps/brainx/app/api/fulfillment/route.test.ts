import { test } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { POST } from './route'

/**
 * The signature-verification path needs no database and runs unconditionally.
 * The "activated" happy path needs a live subscribers table and is skipped
 * without NEON_DATABASE_URL — exercised for real by the Moses-ops test buy
 * (apps/brainx/CLAUDE.md §verification).
 */

const SECRET = 'test-secret-for-fulfillment-route'

function signedRequest(body: string, secret = SECRET): Request {
  const sig = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return new Request('https://brainx.bizlegal-ai.com/api/fulfillment', {
    method: 'POST',
    headers: { 'x-bizlegal-signature': sig },
    body,
  })
}

test('503 when BIZLEGAL_INBOUND_SECRET is not configured', async () => {
  const prev = process.env.BIZLEGAL_INBOUND_SECRET
  delete process.env.BIZLEGAL_INBOUND_SECRET
  try {
    const res = await POST(signedRequest('{}') as never)
    assert.equal(res.status, 503)
  } finally {
    if (prev !== undefined) process.env.BIZLEGAL_INBOUND_SECRET = prev
  }
})

test('401 when the signature header is missing', async () => {
  process.env.BIZLEGAL_INBOUND_SECRET = SECRET
  const req = new Request('https://brainx.bizlegal-ai.com/api/fulfillment', { method: 'POST', body: '{}' })
  const res = await POST(req as never)
  assert.equal(res.status, 401)
})

test('401 when the signature does not match', async () => {
  process.env.BIZLEGAL_INBOUND_SECRET = SECRET
  const req = signedRequest('{}', 'wrong-secret')
  const res = await POST(req as never)
  assert.equal(res.status, 401)
})

test('400 when the body is not valid JSON despite a correct signature', async () => {
  process.env.BIZLEGAL_INBOUND_SECRET = SECRET
  const req = signedRequest('not json')
  const res = await POST(req as never)
  assert.equal(res.status, 400)
})

test('400 when required fields are missing', async () => {
  process.env.BIZLEGAL_INBOUND_SECRET = SECRET
  const req = signedRequest(JSON.stringify({ event: 'activated' }))
  const res = await POST(req as never)
  assert.equal(res.status, 400)
})
