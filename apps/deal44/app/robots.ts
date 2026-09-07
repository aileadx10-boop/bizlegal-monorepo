import type { MetadataRoute } from 'next'

/**
 * Rooms are private transactions between named people. `/r/` must never be
 * crawled, and `vercel.json` sets `X-Robots-Tag: noindex` on those paths too —
 * robots.txt is a request, a header is an instruction.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_DEAL44_SITE_URL ?? 'https://deal44.bizlegal-ai.com'
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/r/', '/admin', '/api/'] }],
    sitemap: `${base.replace(/\/$/, '')}/sitemap.xml`,
  }
}
