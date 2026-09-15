import type { MetadataRoute } from 'next'
import { buildRobots } from '@bizlegal/themes/seo'

/**
 * Fleet GEO/AEO policy, from the one shared list (packages/themes/src/seo.ts) —
 * not a fourth inline copy that drifts. Answer engines are welcome on the
 * landing page; the dashboard and the generated abstracts are private customer
 * documents and must never be crawled.
 */
export default function robots(): MetadataRoute.Robots {
  return buildRobots({
    host: 'https://leaseparse.bizlegal-ai.com',
    extraDisallow: ['/dashboard'],
  })
}
