import type { MetadataRoute } from 'next'
import { buildRobots } from '@bizlegal/themes'

// Fleet convention (packages/themes/src/seo.ts): AI crawlers allowed, scrapers
// blocked. Subscriber areas are private — the attorney portal and dashboard
// hold evidentiary records and must never be indexed.
export default function robots(): MetadataRoute.Robots {
  return buildRobots({
    host: 'https://coguard.bizlegal-ai.com',
    extraDisallow: ['/dashboard/', '/attorney/', '/login'],
  })
}
