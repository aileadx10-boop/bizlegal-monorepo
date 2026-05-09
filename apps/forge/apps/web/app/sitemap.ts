import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

import { gapPageUrl, type GapPageSitemapRow } from '@/lib/types/gap-page'

// W3.2 — pull updated_at alongside published_at so /sitemap.xml's
// <lastmod> tracks edits, not just first-publish. Falls back to
// published_at for pre-W3.2 rows where the column is null.
//
// W3 audit silent-fail H-2 — the previous try/catch swallowed all
// errors silently; we now surface a single console.error in non-prod
// so runtime issues are diagnosable. Prod keeps the empty-list
// fallback so a broken Supabase doesn't 500 the sitemap and drop us
// out of the GSC sitemap-submission flow.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  let gapPages: GapPageSitemapRow[] = []
  if (url && key) {
    try {
      const supabase = createClient(url, key)
      const { data, error } = await supabase
        .from('gap_pages')
        .select('slug, jurisdiction, published_at, updated_at')
        .order('published_at', { ascending: false })
      if (error) {
        // eslint-disable-next-line no-console
        console.error('[sitemap] gap_pages query error:', error.message)
      }
      gapPages = (data ?? []) as GapPageSitemapRow[]
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[sitemap] gap_pages query threw:', err)
      // fall through with empty list — sitemap regenerates each request
    }
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://forge.bizlegal-ai.com', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://forge.bizlegal-ai.com/boi', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://forge.bizlegal-ai.com/audit', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://forge.bizlegal-ai.com/passport', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://forge.bizlegal-ai.com/pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://forge.bizlegal-ai.com/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://forge.bizlegal-ai.com/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://forge.bizlegal-ai.com/disclaimer', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const dynamicPages: MetadataRoute.Sitemap = gapPages.map(page => ({
    url: gapPageUrl(page),
    lastModified: new Date(page.updated_at ?? page.published_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticPages, ...dynamicPages]
}
