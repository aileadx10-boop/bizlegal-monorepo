import { MetadataRoute } from 'next'

/**
 * TRACR sitemap — public marketing routes only.
 *
 * Excluded:
 *   - /(app)/* route group (workspace pages — clients, deals, pipeline)
 *     are auth-gated and noindex'd by their layouts.
 *   - /report/[report_id], /scan, /success — dynamic / per-user surfaces.
 *
 * Referenced from the apex sitemap-index at
 * https://bizlegal-ai.com/sitemap-index.xml.
 */
const BASE = 'https://tracr.bizlegal-ai.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/decision-tree`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE}/analyze`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/methodology`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/refund`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/disclaimer`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/acceptable-use`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
