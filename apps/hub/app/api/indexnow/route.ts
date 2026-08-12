import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://bizlegal-ai.com'

// URLs to submit on each ping — the highest-value pages that change frequently.
const URLS = [
  BASE,
  `${BASE}/agents`,
  `${BASE}/regulations`,
  `${BASE}/regulations/sec`,
  `${BASE}/regulations/mica`,
  `${BASE}/regulations/vara`,
  `${BASE}/regulations/gdpr`,
  `${BASE}/regulations/aml`,
  `${BASE}/mica-regulation-2025`,
  `${BASE}/cross-border-compliance`,
  `${BASE}/digital-asset-risk-analysis`,
  `${BASE}/digital-asset-regulatory-intelligence`,
  `${BASE}/tools`,
  `${BASE}/tools/wallet-screener`,
  `${BASE}/tools/stablecoin-classifier`,
  `${BASE}/reserve-report`,
  `${BASE}/mica-deadlines`,
  `${BASE}/faq`,
  `${BASE}/pricing`,
]

// IndexNow supports Bing, Yandex, and Seznam simultaneously.
// Bing indexes → ChatGPT Bing Browse + Copilot pick it up.
const INDEXNOW_HOSTS = ['api.indexnow.org', 'www.bing.com']

export async function POST(req: NextRequest) {
  // Require CRON_SECRET for all callers (same pattern as other crons).
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key = process.env.INDEXNOW_KEY?.trim()
  if (!key) {
    return NextResponse.json({ error: 'INDEXNOW_KEY not set' }, { status: 503 })
  }

  const body = {
    host: 'bizlegal-ai.com',
    key,
    keyLocation: `${BASE}/${key}.txt`,
    urlList: URLS,
  }

  const results: Record<string, number> = {}
  await Promise.allSettled(
    INDEXNOW_HOSTS.map(async (host) => {
      try {
        const res = await fetch(`https://${host}/indexnow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(body),
        })
        results[host] = res.status
      } catch {
        results[host] = 0
      }
    })
  )

  return NextResponse.json({ submitted: URLS.length, results })
}

// GET: verify the endpoint is alive and key is configured (for /ops health checks).
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t') ?? ''
  if (token !== process.env.OPS_DASHBOARD_TOKEN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.json({
    configured: !!process.env.INDEXNOW_KEY,
    urls: URLS.length,
    note: 'POST with Bearer CRON_SECRET to submit URLs to Bing/IndexNow',
  })
}
