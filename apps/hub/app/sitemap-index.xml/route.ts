import { NextResponse } from 'next/server'

/**
 * Sitemap-index — XML hub that points crawlers at every per-domain
 * sitemap we own. Submit https://bizlegal-ai.com/sitemap-index.xml to
 * Google Search Console once and GSC discovers all child sitemaps from
 * a single submission.
 *
 * Children:
 *   - hub:    https://bizlegal-ai.com/sitemap.xml (apps/hub/app/sitemap.ts)
 *   - forge:  https://forge.bizlegal-ai.com/sitemap.xml (gap_pages dynamic)
 *   - blog:   https://blog.bizlegal-ai.com/sitemap.xml (Cloudflare Pages,
 *             generated from MDX frontmatter at build time — coming via
 *             bizlegal-ea/projects/bizlegal-seo-site)
 *
 * `lastmod` here is the index file's own freshness signal — Google uses
 * this to decide when to re-fetch the index. Per-URL freshness lives in
 * the child sitemaps. Re-rendered on every request (force-dynamic) so
 * Date.now() is always current; the cost is trivial (3 strings, no DB).
 *
 * Note: keep this in sync with apps/hub/app/robots.ts — that file
 * advertises this index URL to crawlers via the Sitemap: directive.
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const CHILDREN = [
  'https://bizlegal-ai.com/sitemap.xml',
  'https://forge.bizlegal-ai.com/sitemap.xml',
  'https://blog.bizlegal-ai.com/sitemap.xml',
] as const

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(): Promise<NextResponse> {
  const lastmod = new Date().toISOString()
  const sitemaps = CHILDREN.map(
    url => `  <sitemap>\n    <loc>${escapeXml(url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`,
  ).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>
`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
