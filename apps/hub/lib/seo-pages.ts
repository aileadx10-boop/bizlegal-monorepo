import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * seo_pages → public URLs.
 *
 * The table now holds two disjoint sets, separated by the `hub` column:
 *
 *  1. `hub IS NULL` — the 231 legacy rows, served at
 *     https://blog.bizlegal-ai.com/<slug> by the Cloudflare Pages engine
 *     (bizlegal-ea repo), NOT by the hub. They must never be emitted into the
 *     hub sitemap (a hub-host URL would 404 and Google ignores cross-host
 *     entries). They ARE fair game for IndexNow under the blog host, whose key
 *     file is live at https://blog.bizlegal-ai.com/<INDEXNOW_KEY>.txt — the
 *     same mapping services/agents/index_watchdog.py uses.
 *
 *  2. `hub IN (compliance, solutions, glossary, playbooks)` — the page factory
 *     rows (services/seo-agents/page_factory.py), served BY the hub at
 *     https://bizlegal-ai.com/<hub>/<slug> via app/(seo)/[hub]/[slug]. Only
 *     rows with status='published' render; 'draft' / 'review' /
 *     'rejected_quality' 404 until Moses promotes them.
 *
 * Never throws: missing env, a query error or a network failure all return an
 * empty list / null so the caller's static set still goes out.
 */

export const SEO_PAGES_BASE = 'https://blog.bizlegal-ai.com'
export const HUB_BASE = 'https://bizlegal-ai.com'

/** Factory sections. Anything not in here is not rendered by the hub. */
export const FACTORY_HUBS = ['compliance', 'solutions', 'glossary', 'playbooks'] as const
export type FactoryHub = (typeof FACTORY_HUBS)[number]

export function isFactoryHub(value: string): value is FactoryHub {
  return (FACTORY_HUBS as readonly string[]).includes(value)
}

export interface SeoPageUrl {
  url: string
  lastModified: Date
}

export interface FactoryCitation {
  regulation?: string
  section?: string
  url?: string
}

export interface FactoryFaq {
  q?: string
  a?: string
}

export interface FactoryKeyDate {
  label?: string
  detail?: string
}

export interface FactoryPage {
  hub: FactoryHub
  slug: string
  title: string
  meta: string
  body: string
  faq: FactoryFaq[]
  keyDates: FactoryKeyDate[]
  citations: FactoryCitation[]
  matrixKeys: Record<string, string>
  updatedAt: Date
}

interface SeoPageRow {
  slug: string | null
  updated_at: string | null
}

interface FactoryRow extends SeoPageRow {
  hub: string | null
  title: string | null
  meta: string | null
  meta_desc: string | null
  content: string | null
  faq: unknown
  key_dates: unknown
  citations: unknown
  matrix_keys: unknown
}

const FACTORY_SELECT =
  'slug, hub, title, meta, meta_desc, content, faq, key_dates, citations, matrix_keys, updated_at'

/** Revalidate window shared by the route and its data reads (ISR, 1 hour). */
export const SEO_PAGE_REVALIDATE_SECONDS = 3600

function getSupabase(revalidateSeconds?: number): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  if (revalidateSeconds === undefined) return createClient(url, key)
  // Pin the fetch cache explicitly. Next's App Router caches supabase-js reads
  // through its own fetch; without this a route handler can serve a row that
  // is hours stale (see reference_next_fetch_cache_supabase).
  return createClient(url, key, {
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        // Bounded: during the 2026-09-15 outage PostgREST hung instead of
        // failing, which would have stalled next build (generateStaticParams)
        // and every sitemap render. 8s, then the callers' [] / null fallbacks.
        fetch(input, {
          ...init,
          signal: AbortSignal.timeout(8_000),
          next: { revalidate: revalidateSeconds },
        } as RequestInit),
    },
  })
}

function logAndEmpty<T>(scope: string, err: unknown, fallback: T): T {
  console.error(`[seo-pages] ${scope}:`, err instanceof Error ? err.message : String(err))
  return fallback
}

/**
 * Legacy blog rows only. Factory rows are excluded so IndexNow never submits
 * a hub path under the blog host.
 */
export async function getPublishedSeoPageUrls(): Promise<SeoPageUrl[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  try {
    const base = () =>
      supabase
        .from('seo_pages')
        .select('slug, updated_at')
        .eq('published', true)
        .eq('deployed', true)
        .order('updated_at', { ascending: false })
        .limit(1000)

    let { data, error } = await base().is('hub', null)
    if (error) {
      // `hub` may not exist yet (migration 20260915_seo_pages_page_factory
      // unapplied). Fall back to the unfiltered query rather than dropping
      // every blog URL out of IndexNow.
      ;({ data, error } = await base())
    }
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
    return logAndEmpty('unavailable', err, [])
  }
}

/**
 * Published factory pages, hub-hosted. Used by the render route's
 * generateStaticParams and (once S1 wires it) by app/sitemap.ts.
 */
export async function getPublishedFactoryPageUrls(): Promise<SeoPageUrl[]> {
  const supabase = getSupabase(SEO_PAGE_REVALIDATE_SECONDS)
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('seo_pages')
      .select('slug, updated_at')
      .eq('status', 'published')
      .in('hub', FACTORY_HUBS as unknown as string[])
      .order('updated_at', { ascending: false })
      .limit(10000)
    if (error || !data) {
      if (error) console.error('[seo-pages] factory query failed:', error.message)
      return []
    }
    return (data as SeoPageRow[]).flatMap((row) => {
      const path = normaliseFactorySlug(row.slug)
      if (!path) return []
      return [{
        url: `${HUB_BASE}/${path}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      }]
    })
  } catch (err: unknown) {
    return logAndEmpty('factory list unavailable', err, [])
  }
}

/** One published factory page, or null (draft / review / rejected / missing). */
export async function getPublishedFactoryPage(
  hub: string,
  slug: string,
): Promise<FactoryPage | null> {
  if (!isFactoryHub(hub) || !slug) return null
  const supabase = getSupabase(SEO_PAGE_REVALIDATE_SECONDS)
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('seo_pages')
      .select(FACTORY_SELECT)
      .eq('slug', `${hub}/${slug}`)
      .eq('hub', hub)
      .eq('status', 'published')
      .limit(1)
      .maybeSingle()
    if (error || !data) {
      if (error) console.error('[seo-pages] factory page query failed:', error.message)
      return null
    }
    const row = data as FactoryRow
    if (!row.title || !row.content) return null
    return {
      hub,
      slug,
      title: row.title,
      meta: row.meta_desc ?? row.meta ?? '',
      body: row.content,
      faq: asArray<FactoryFaq>(row.faq).filter((f) => f?.q && f?.a),
      keyDates: asArray<FactoryKeyDate>(row.key_dates).filter((k) => k?.label),
      citations: asArray<FactoryCitation>(row.citations).filter((c) => c?.url),
      matrixKeys: asRecord(row.matrix_keys),
      updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    }
  } catch (err: unknown) {
    return logAndEmpty('factory page unavailable', err, null)
  }
}

function normaliseFactorySlug(slug: string | null): string | null {
  const s = slug?.trim().replace(/^\/+/, '')
  if (!s) return null
  const [hub, ...rest] = s.split('/')
  if (!isFactoryHub(hub) || rest.length !== 1 || !rest[0]) return null
  return s
}

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value)
      return Array.isArray(parsed) ? (parsed as T[]) : []
    } catch {
      return []
    }
  }
  return []
}

function asRecord(value: unknown): Record<string, string> {
  const source: unknown = typeof value === 'string' ? safeParse(value) : value
  if (!source || typeof source !== 'object' || Array.isArray(source)) return {}
  return Object.fromEntries(
    Object.entries(source as Record<string, unknown>).map(([k, v]) => [k, String(v)]),
  )
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}
