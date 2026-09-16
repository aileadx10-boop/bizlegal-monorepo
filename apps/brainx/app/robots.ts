import { MetadataRoute } from 'next'
import { buildRobots } from '@bizlegal/themes/seo'

/**
 * GEO/AEO policy — the crawler allow/block lists come from
 * packages/themes/src/seo.ts so every surface in the fleet ships one policy.
 *
 * The subscriber dashboard (/radar, /enter, /access, /api) must never be
 * crawled — it is the deliverable a paying customer bought, not marketing
 * content. The 2026-09-16 build had this backwards: six dashboard pages were
 * public AND listed in sitemap.xml.
 */

const PRIVATE: string[] = ['/radar', '/enter', '/access']

export default function robots(): MetadataRoute.Robots {
  return buildRobots({
    host: 'https://brainx.bizlegal-ai.com',
    extraDisallow: PRIVATE,
  })
}
