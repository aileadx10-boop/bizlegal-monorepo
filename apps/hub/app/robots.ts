import { MetadataRoute } from 'next'
import { AI_CRAWLER_ALLOW, SCRAPER_BLOCK } from '@bizlegal/themes'

// GEO/AEO policy — single source of truth for /robots.txt. The crawler
// allow/block lists live in @bizlegal/themes (packages/themes/src/seo.ts)
// so every surface ships the same policy.

// '/admin/' ported 2026-09-15 from the retired public/robots.txt, which
// shadowed this file (and wrongly allowed Bytespider/CCBot/Diffbot).
const PRIVATE: string[] = ['/api/', '/_next/', '/ops', '/ops/', '/admin/']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE, crawlDelay: 1 },
      { userAgent: [...AI_CRAWLER_ALLOW], allow: '/', disallow: PRIVATE },
      { userAgent: [...SCRAPER_BLOCK], disallow: '/' },
    ],
    sitemap: [
      'https://bizlegal-ai.com/sitemap-index.xml',
      'https://bizlegal-ai.com/sitemap.xml',
    ],
    host: 'https://bizlegal-ai.com',
  }
}
