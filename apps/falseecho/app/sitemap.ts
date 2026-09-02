import { MetadataRoute } from 'next'

/**
 * FalseEcho sitemap — public marketing routes only.
 *
 * Excluded: /report/[scan_ref], /scan, /success (dynamic / per-user).
 * /seo/[engine]/[entity]/[hash] pages are indexable but emitted
 * per-detected-falsehood; they are linked from report pages and discovered
 * organically rather than enumerated here.
 */
const BASE = 'https://falseecho.bizlegal-ai.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/scan`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/disclaimer`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
