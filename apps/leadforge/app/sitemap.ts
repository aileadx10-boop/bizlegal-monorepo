import { MetadataRoute } from 'next'

/**
 * LeadForge sitemap — public marketing routes only.
 *
 * /pipe is the live-transparency dashboard surface (public observability
 * of the lead intake pipeline) and is included.
 *
 * Referenced from the apex sitemap-index at
 * https://bizlegal-ai.com/sitemap-index.xml.
 */
const BASE = 'https://leadforge.bizlegal-ai.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/decision-tree`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE}/pipe`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
  ]
}
