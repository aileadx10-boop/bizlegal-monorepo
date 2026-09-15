import type { MetadataRoute } from 'next'

/**
 * Fleet GEO/AEO policy — the ONE source for the crawler allow/block lists and
 * three pure builders any app can lean on from its `app/robots.ts`,
 * `app/sitemap.ts` and `app/llms.txt/route.ts`. No env, no I/O.
 *
 * The lists were copied verbatim from apps/hub/app/robots.ts (2026-09-15);
 * the hub now imports them from here. Per-app inline copies in
 * tracr/brai/lexaudit/leadforge predate this file and must stay identical.
 */

// Search + answer-engine crawlers we WANT citing us.
export const AI_CRAWLER_ALLOW: readonly string[] = [
  'Googlebot', 'Bingbot', 'DuckDuckBot', 'Slurp', 'Baiduspider', 'YandexBot',
  'OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'ClaudeBot', 'Claude-Web', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'GoogleOther', 'Gemini',
  'Applebot-Extended', 'Applebot', 'meta-externalagent', 'meta-webindexer', 'xAI', 'grok',
  'cohere-ai', 'cohere-training-data-crawler', 'YouBot', 'MistralAI-User', 'DeepSeekBot',
  'DuckAssistBot', 'Amazonbot', 'facebookexternalhit', 'Twitterbot', 'LinkedInBot',
  'Slackbot', 'TelegramBot', 'WhatsApp',
]

// Training scrapers + SEO-tool bots we don't want.
export const SCRAPER_BLOCK: readonly string[] = [
  'Bytespider', 'CCBot', 'Diffbot', 'ImagesiftBot', 'PetalBot',
  'SemrushBot', 'AhrefsBot', 'MJ12bot', 'DotBot', 'BLEXBot',
]

// Never crawlable on any Next.js surface.
export const DEFAULT_DISALLOW: readonly string[] = ['/api/', '/_next/']

function trimTrailingSlash(host: string): string {
  return host.replace(/\/+$/, '')
}

function absolute(origin: string, path: string): string {
  if (path.startsWith('http')) return path
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

export interface BuildRobotsOptions {
  /** Absolute origin, e.g. 'https://bench.bizlegal-ai.com'. */
  host: string
  /** App-specific private paths, appended to DEFAULT_DISALLOW. */
  extraDisallow?: readonly string[]
}

/** The `MetadataRoute.Robots` object for `app/robots.ts` — same three rules on every surface. */
export function buildRobots({ host, extraDisallow = [] }: BuildRobotsOptions): MetadataRoute.Robots {
  const origin = trimTrailingSlash(host)
  const disallow = [
    ...DEFAULT_DISALLOW,
    ...extraDisallow.filter((path) => !DEFAULT_DISALLOW.includes(path)),
  ]
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: [...disallow], crawlDelay: 1 },
      { userAgent: [...AI_CRAWLER_ALLOW], allow: '/', disallow: [...disallow] },
      { userAgent: [...SCRAPER_BLOCK], disallow: '/' },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  }
}

export interface LlmsLink {
  label: string
  /** Path on `host` ('/pricing') or an absolute URL. */
  path: string
  note?: string
}

export interface BuildLlmsTxtOptions {
  name: string
  host: string
  /** One or more sentences; newlines become separate blockquote lines. */
  summary: string
  links: readonly LlmsLink[]
  /** Trailing caveats (e.g. "not legal advice"). The fleet line is always appended. */
  notes?: readonly string[]
}

/** The llms.txt body (llmstxt.org shape) for `app/llms.txt/route.ts`. */
export function buildLlmsTxt({ name, host, summary, links, notes = [] }: BuildLlmsTxtOptions): string {
  const origin = trimTrailingSlash(host)
  const quote = summary.split('\n').map((line) => `> ${line}`.trimEnd())
  const pages = links.map(({ label, path, note }) => {
    const url = absolute(origin, path)
    return note ? `- [${label}](${url}): ${note}` : `- [${label}](${url})`
  })
  return [
    `# ${name}`,
    '',
    ...quote,
    '',
    '## Pages',
    ...pages,
    '',
    '## Notes',
    ...notes.map((note) => `- ${note}`),
    '- Part of the BizLegal AI fleet: https://bizlegal-ai.com',
    '',
  ].join('\n')
}

export type SitemapChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

export interface SitemapPath {
  path: string
  priority?: number
  changeFrequency?: SitemapChangeFrequency
}

export interface StaticSitemapOptions {
  host: string
  paths: readonly SitemapPath[]
  /** Defaults to build/request time — the fleet's existing lastmod semantics. */
  lastModified?: Date
}

/** A `MetadataRoute.Sitemap` for surfaces whose public pages are a fixed list. */
export function staticSitemap({ host, paths, lastModified = new Date() }: StaticSitemapOptions): MetadataRoute.Sitemap {
  const origin = trimTrailingSlash(host)
  return paths.map(({ path, priority, changeFrequency }) => {
    const isRoot = path === '' || path === '/'
    return {
      url: isRoot ? origin : absolute(origin, path),
      lastModified,
      changeFrequency: changeFrequency ?? (isRoot ? 'weekly' : 'monthly'),
      priority: priority ?? (isRoot ? 1 : 0.7),
    }
  })
}
