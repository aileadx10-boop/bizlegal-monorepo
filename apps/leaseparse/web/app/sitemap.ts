import type { MetadataRoute } from 'next'
import { staticSitemap } from '@bizlegal/themes/seo'

/**
 * One public page today. `/dashboard` and the generated abstracts are private
 * and are excluded here as well as in robots.ts — a sitemap that lists a
 * customer's report is a leak, not an optimisation.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return staticSitemap({
    host: 'https://leaseparse.bizlegal-ai.com',
    paths: [{ path: '/', priority: 1, changeFrequency: 'weekly' }],
  })
}
