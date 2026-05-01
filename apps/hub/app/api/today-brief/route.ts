import { NextResponse } from 'next/server'

/**
 * Today's Brief feed — server-side proxy that fetches the canonical blog
 * RSS feed at https://blog.bizlegal-ai.com/feed.xml, parses the latest 5
 * items, and returns them as JSON for the hub homepage. Two reasons for
 * the proxy:
 *   1. CORS — the blog subdomain doesn't need to allow cross-origin reads
 *      from the hub if we proxy here.
 *   2. Cache — Vercel Edge can cache this response for 10 minutes,
 *      independent of the blog's own Cloudflare Pages cache.
 *
 * If the blog is offline or the feed parse fails, we return an empty
 * `items` array with `degraded: true`. The hub homepage falls back to a
 * static placeholder card rather than rendering an empty section.
 */

interface BriefItem {
  readonly title: string
  readonly link: string
  readonly slug: string
  readonly pubDate: string
  readonly category: string
  readonly description: string
}

interface BriefResponse {
  readonly items: ReadonlyArray<BriefItem>
  readonly fetchedAt: string
  readonly degraded?: boolean
}

const FEED_URL = 'https://blog.bizlegal-ai.com/feed.xml'
const MAX_ITEMS = 5

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

function extractTag(itemXml: string, tag: string): string {
  const cdataPattern = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`)
  const cdata = itemXml.match(cdataPattern)
  if (cdata) return cdata[1].trim()
  const plain = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  return plain ? decodeXmlEntities(plain[1].trim()) : ''
}

function parseFeed(xml: string): ReadonlyArray<BriefItem> {
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/g) ?? []
  const items: BriefItem[] = []
  for (const block of itemBlocks) {
    const title = extractTag(block, 'title')
    const link = extractTag(block, 'link')
    const pubDate = extractTag(block, 'pubDate')
    const description = extractTag(block, 'description')
    const category = extractTag(block, 'category') || 'INTELLIGENCE'
    if (!title || !link) continue
    const slug = link.replace(/^.*\/blog\//, '').replace(/\/$/, '')
    items.push({ title, link, slug, pubDate, category, description })
    if (items.length >= MAX_ITEMS) break
  }
  return items
}

export async function GET(): Promise<NextResponse> {
  const fetchedAt = new Date().toISOString()
  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: 600 },
      headers: { accept: 'application/rss+xml,text/xml;q=0.9' },
    })
    if (!res.ok) {
      const body: BriefResponse = { items: [], fetchedAt, degraded: true }
      return NextResponse.json(body, {
        status: 200,
        headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=300' },
      })
    }
    const xml = await res.text()
    const items = parseFeed(xml)
    const body: BriefResponse = { items, fetchedAt }
    return NextResponse.json(body, {
      status: 200,
      headers: { 'cache-control': 'public, s-maxage=600, stale-while-revalidate=1800' },
    })
  } catch {
    const body: BriefResponse = { items: [], fetchedAt, degraded: true }
    return NextResponse.json(body, {
      status: 200,
      headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  }
}
