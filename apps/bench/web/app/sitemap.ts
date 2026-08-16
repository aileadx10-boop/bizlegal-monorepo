import type { MetadataRoute } from 'next'
import { BENCHMARKS } from '@/lib/benchmarks'

const SITE = 'https://bench.bizlegal-ai.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    '',
    '/benchmarks',
    '/methodology',
    '/pricing',
    '/sample',
    '/audit/request',
    '/experts',
    '/legal/terms',
    '/legal/dpa',
  ].map((path) => ({
    url: `${SITE}${path}`,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }))

  const benchmarkPages = BENCHMARKS.map((b) => ({
    url: `${SITE}/benchmarks/${b.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...benchmarkPages]
}
