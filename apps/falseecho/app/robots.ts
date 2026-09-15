import { MetadataRoute } from 'next'
import { buildRobots } from '@bizlegal/themes/seo'

/**
 * GEO/AEO policy — the crawler allow/block lists come from
 * packages/themes/src/seo.ts so every surface in the fleet ships one policy.
 * The lists used to be copy-pasted here; a copy is a list that drifts.
 *
 * FalseEcho probes public AI APIs (it never scrapes gated content), and in
 * turn welcomes the answer engines' crawlers.
 */

// App-specific private paths. '/api/' and '/_next/' come from the shared
// DEFAULT_DISALLOW and are not repeated.
const PRIVATE: string[] = ['/report/', '/scan', '/success']

export default function robots(): MetadataRoute.Robots {
  return buildRobots({
    host: 'https://falseecho.bizlegal-ai.com',
    extraDisallow: PRIVATE,
  })
}
