/* Smoke check for /api/cron/monitor — no network, no real API keys.
   Verifies (1) the route module imports cleanly, (2) the token gate returns
   404 without/with a wrong token, (3) with a valid token but no Supabase
   env the run degrades gracefully: 200 + {scanned, alerted, skipped, errors}
   summary with supabase_not_configured.

   Run from apps/falseecho:  ./node_modules/.bin/tsx scripts/smoke-monitor-cron.ts */

import assert from 'node:assert/strict'

process.env.CRON_SECRET = 'smoke-secret'
delete process.env.NEXT_PUBLIC_SUPABASE_URL
delete process.env.SUPABASE_SERVICE_KEY
delete process.env.SUPABASE_SERVICE_ROLE_KEY
delete process.env.RESEND_API_KEY

function fakeReq(token?: string) {
  return {
    url: 'https://falseecho.local/api/cron/monitor',
    headers: new Headers(token ? { authorization: `Bearer ${token}` } : {}),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any
}

async function main() {
  const { GET } = await import('../app/api/cron/monitor/route')

  const noToken = await GET(fakeReq())
  assert.equal(noToken.status, 404, 'no token should 404')

  const wrongToken = await GET(fakeReq('nope'))
  assert.equal(wrongToken.status, 404, 'wrong token should 404')

  const ok = await GET(fakeReq('smoke-secret'))
  assert.equal(ok.status, 200, 'valid token should 200 even without Supabase env')
  const body = await ok.json()
  assert.equal(body.ok, true)
  assert.equal(body.scanned, 0)
  assert.equal(body.alerted, 0)
  assert.equal(body.skipped, 0)
  assert.ok(Array.isArray(body.errors) && body.errors.includes('supabase_not_configured'))

  console.log('smoke-monitor-cron: all assertions passed', JSON.stringify(body))
}

main().catch((err) => {
  console.error('smoke-monitor-cron FAILED:', err)
  process.exit(1)
})
