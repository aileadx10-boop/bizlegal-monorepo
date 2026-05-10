import { MetadataRoute } from 'next'

/**
 * BRAI sitemap — public marketing + sanctions-screening conversion-funnel
 * routes. Referenced from the apex sitemap-index at
 * https://bizlegal-ai.com/sitemap-index.xml.
 */
const BASE = 'https://brai.bizlegal-ai.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/decision-tree`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/network`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/methodology`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/trust`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/refund`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/disclaimer`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/acceptable-use`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
