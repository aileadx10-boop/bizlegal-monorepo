import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: gapPages } = await supabase
    .from('gap_pages')
    .select('slug, jurisdiction, published_at')
    .order('published_at', { ascending: false })

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
