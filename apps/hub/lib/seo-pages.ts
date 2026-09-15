import { createClient } from '@supabase/supabase-js'

/**
 * seo_pages → public URLs.
 *
 * The 231 rows in `seo_pages` are the blog's programmatic pages, served at
 * https://blog.bizlegal-ai.com/<slug> by the Cloudflare Pages engine
 * (bizlegal-ea repo) — NOT by the hub. No hub route renders them, so they
 * must never be emitted into the hub sitemap (a hub-host URL would 404 and
 * Google ignores cross-host entries). They ARE fair game for IndexNow under
 * the blog host, whose key file is live at
 * https://blog.bizlegal-ai.com/<INDEXNOW_KEY>.txt — the same mapping
 * services/agents/index_watchdog.py uses in fetch_published_urls().
 *
 * Never throws: missing env, a query error or a network failure all return
 * an empty list so the caller's static set still goes out.
 */

export const SEO_PAGES_BASE = 'https://blog.bizlegal-ai.com'

export interface SeoPageUrl {
  url: string
  lastModified: Date
}

interface SeoPageRow {
  slug: string | null
  updated_at: string | null
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function getPublishedSeoPageUrls(): Promise<SeoPageUrl[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('seo_pages')
      .select('slug, updated_at')
      .eq('published', true)
      .eq('deployed', true)
      .order('updated_at', { ascending: false })
      .limit(1000)
    if (error || !data) {
      if (error) console.error('[seo-pages] query failed:', error.message)
      return []
    }
    return (data as SeoPageRow[]).flatMap((row) => {
      const slug = row.slug?.trim().replace(/^\/+/, '')
      if (!slug) return []
      return [{
        url: `${SEO_PAGES_BASE}/${slug}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      }]
    })
  } catch (err: unknown) {
    console.error('[seo-pages] unavailable:', err instanceof Error ? err.message : String(err))
    return []
  }
}
