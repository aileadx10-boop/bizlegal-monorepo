import { MetadataRoute } from 'next'

/**
 * robots.txt for the apex hub.
 *
 * Advertises the sitemap-index FIRST so GSC + Bingbot discover all
 * three per-domain sitemaps (hub, forge, blog) from a single fetch.
 * The hub-only sitemap.xml stays advertised as a fallback for crawlers
 * that don't follow sitemap-index spec (older bots).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/ops', '/ops/'],
      },
    ],
    sitemap: [
      'https://bizlegal-ai.com/sitemap-index.xml',
      'https://bizlegal-ai.com/sitemap.xml',
    ],
    host: 'https://bizlegal-ai.com',
  }
}
