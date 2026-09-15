import { NextRequest, NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/blog'
import { getPublishedSeoPageUrls } from '@/lib/seo-pages'

// Reads headers + Supabase on every call; never serve a cached response.
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 30

const BASE = 'https://bizlegal-ai.com'
const HUB_HOST = 'bizlegal-ai.com'
const BLOG_HOST = 'blog.bizlegal-ai.com'

// Hub URLs to submit on each ping — the highest-value pages that change
// frequently. Blog posts are appended dynamically so fresh content is pinged
// the moment it lands (the hub blog serves monorepo content/blog at /blog/[slug]).
const HUB_URLS = [
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
  `${BASE}/tools/ofac-watcher`,
  `${BASE}/tools/obligation-extractor`,
  `${BASE}/tools/ai-policy-generator`,
  `${BASE}/tools/stablecoin-classifier`,
  `${BASE}/tools/fixed-fee-pricing-calculator`,
  `${BASE}/guides/fixed-fee-pricing-playbook`,
  `${BASE}/agents/casp-bundle`,
  `${BASE}/reserve-report`,
  `${BASE}/mica-deadlines`,
  `${BASE}/faq`,
  `${BASE}/pricing`,
  ...getAllPosts().map((post) => `${BASE}/blog/${post.slug}`),
]

// IndexNow supports Bing, Yandex, and Seznam simultaneously.
// Bing indexes → ChatGPT Bing Browse + Copilot pick it up.
const INDEXNOW_HOSTS = ['api.indexnow.org', 'www.bing.com']

interface BatchResult {
  host: string
  submitted: number
  results: Record<string, number>
}

/**
 * One IndexNow batch. The protocol requires every URL in `urlList` to sit on
 * `host` and the key file to be served from that same host — which is why the
 * seo_pages rows (blog.bizlegal-ai.com) go out as a second batch instead of
 * being mixed into the hub list. Both hosts serve the same key file.
 */
async function submitBatch(host: string, key: string, urlList: string[]): Promise<BatchResult> {
  const body = { host, key, keyLocation: `https://${host}/${key}.txt`, urlList }
  const results: Record<string, number> = {}
  await Promise.allSettled(
    INDEXNOW_HOSTS.map(async (endpoint) => {
      try {
        const res = await fetch(`https://${endpoint}/indexnow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(body),
        })
        results[endpoint] = res.status
      } catch {
        results[endpoint] = 0
      }
    })
  )
  return { host, submitted: urlList.length, results }
}

// Bearer CRON_SECRET, same pattern as every other cron route.
function isCronCaller(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET
  return !!secret && auth === `Bearer ${secret}`
}

async function submitAll(): Promise<NextResponse> {
  const key = process.env.INDEXNOW_KEY?.trim()
  if (!key) {
    return NextResponse.json({ error: 'INDEXNOW_KEY not set' }, { status: 503 })
  }

  const seoPages = await getPublishedSeoPageUrls()
  const hub = await submitBatch(HUB_HOST, key, HUB_URLS)
  const blog = seoPages.length > 0
    ? await submitBatch(BLOG_HOST, key, seoPages.map((page) => page.url))
    : null

  return NextResponse.json({
    submitted: hub.submitted + (blog?.submitted ?? 0),
    batches: { hub, blog },
  })
}

// POST: manual / CI trigger.
export async function POST(req: NextRequest) {
  if (!isCronCaller(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return submitAll()
}

// GET: the Vercel cron (vercel.json, 05:30 UTC daily) arrives as GET with
// `Authorization: Bearer CRON_SECRET` and submits. Without that header the
// route stays the /ops liveness probe (OPS_DASHBOARD_TOKEN via ?t=).
export async function GET(req: NextRequest) {
  if (isCronCaller(req)) {
    return submitAll()
  }

  const token = req.nextUrl.searchParams.get('t') ?? ''
  if (token !== process.env.OPS_DASHBOARD_TOKEN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const seoPages = await getPublishedSeoPageUrls()
  return NextResponse.json({
    configured: !!process.env.INDEXNOW_KEY,
    urls: HUB_URLS.length,
    seoPages: seoPages.length,
    note: 'GET or POST with Bearer CRON_SECRET to submit URLs to Bing/IndexNow',
  })
}
