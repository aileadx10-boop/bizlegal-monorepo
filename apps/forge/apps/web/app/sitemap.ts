import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

type GapPage = { slug: string; jurisdiction: string | null; published_at: string }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Skip the dynamic-pages query when Supabase env isn't present
  // (build time on Vercel without runtime env). Fall back to static
  // pages only — sitemap regenerates each request anyway.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  let gapPages: GapPage[] = []
  if (url && key) {
    try {
      const supabase = createClient(url, key)
      const { data } = await supabase
        .from('gap_pages')
        .select('slug, jurisdiction, published_at')
        .order('published_at', { ascending: false })
      gapPages = (data ?? []) as GapPage[]
    } catch {
      /* fall through with empty list */
    }
  }

  const staticPages = [
    { url: 'https://forge.bizlegal-ai.com', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
    { url: 'https://forge.bizlegal-ai.com/boi', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: 'https://forge.bizlegal-ai.com/audit', lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: 'https://forge.bizlegal-ai.com/passport', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: 'https://forge.bizlegal-ai.com/pricing', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: 'https://forge.bizlegal-ai.com/terms', lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: 'https://forge.bizlegal-ai.com/privacy', lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: 'https://forge.bizlegal-ai.com/disclaimer', lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  const dynamicPages = (gapPages || []).map(page => ({
    url: `https://forge.bizlegal-ai.com/gap/${(page.jurisdiction || 'global').toLowerCase().replace(/\s+/g, '-')}/${page.slug}`,
    lastModified: new Date(page.published_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

  return [...staticPages, ...dynamicPages]
}
