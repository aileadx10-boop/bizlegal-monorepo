import { MetadataRoute } from 'next'
import { staticSitemap } from '@bizlegal/themes/seo'
import { GUIDES } from '@/content/guides'

const HOST = 'https://brainx.bizlegal-ai.com'

// Individual /sample/<slug> opportunity pages are noindex (see their own
// page metadata) — the sample RADAR is the indexable surface, not each card.
export default function sitemap(): MetadataRoute.Sitemap {
  return staticSitemap({
    host: HOST,
    paths: [
      { path: '/', priority: 1, changeFrequency: 'weekly' },
      { path: '/sample', priority: 0.9, changeFrequency: 'weekly' },
      { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
      ...GUIDES.map((g) => ({ path: `/guides/${g.slug}`, priority: 0.7, changeFrequency: 'monthly' as const })),
      { path: '/disclaimer', priority: 0.3 },
      { path: '/privacy', priority: 0.3 },
      { path: '/terms', priority: 0.3 },
      { path: '/contact', priority: 0.3 },
    ],
  })
}
