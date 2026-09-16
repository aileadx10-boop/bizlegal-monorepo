#!/usr/bin/env tsx
/**
 * tools/verify-urls.ts --fixtures [--stamp]
 *
 * Re-resolves every evidence URL in lib/fixtures/sample.ts over the network
 * (HEAD, falling back to GET on 405/403) and reports which ones fail. This
 * is the network half of the check lib/fixtures/sample.test.ts runs
 * statically — run it before any deploy that touches the sample fixtures.
 *
 * --stamp is a no-op today (verified_at is a single shared constant,
 * SAMPLE_VERIFIED_AT, set by hand when the research was done) but is kept as
 * a flag for parity with the ingest tool's interface.
 */
import { SAMPLE_OPPORTUNITIES } from '../lib/fixtures/sample'

const TIMEOUT_MS = 10_000
const MAX_REDIRECTS = 3

async function resolves(url: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'BrainXVerify/1.0 (+https://brainx.bizlegal-ai.com)' } })
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'BrainXVerify/1.0 (+https://brainx.bizlegal-ai.com)' } })
    }
    return { ok: res.status >= 200 && res.status < 400, status: res.status }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  } finally {
    clearTimeout(timer)
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  if (!args.includes('--fixtures')) {
    console.error('Usage: tsx tools/verify-urls.ts --fixtures [--stamp]')
    process.exit(1)
  }

  let failures = 0
  let checked = 0
  const seen = new Map<string, { ok: boolean; status?: number; error?: string }>()

  for (const o of SAMPLE_OPPORTUNITIES) {
    for (const e of o.evidence) {
      if (!seen.has(e.url)) seen.set(e.url, await resolves(e.url))
      const result = seen.get(e.url)!
      checked += 1
      if (result.ok) {
        console.log(`OK   ${result.status}  ${e.url}`)
      } else {
        failures += 1
        console.error(`FAIL ${result.status ?? result.error}  ${o.slug} / ${e.id}  ${e.url}`)
      }
    }
  }

  console.log(`\n${checked} URLs checked (${seen.size} unique), ${failures} failed.`)
  process.exit(failures > 0 ? 3 : 0)
}

void main()
