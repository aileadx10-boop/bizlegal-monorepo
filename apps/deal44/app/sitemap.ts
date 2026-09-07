import type { MetadataRoute } from 'next'

/**
 * Public pages only. `/r/*` rooms are private transactions between named
 * people and are excluded here, in robots.ts, and by an `X-Robots-Tag` header
 * in vercel.json — three layers because a leaked room URL is somebody's
 * property purchase.
 *
 * robots.ts already advertises this file; without it the sitemap line pointed
 * at a 404.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_DEAL44_SITE_URL ?? 'https://deal44.bizlegal-ai.com').replace(/\/$/, '')
  const now = new Date()
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority,
  })

  return [
    page('', 1),
    page('/start', 0.9),
    page('/en', 0.8),
    page('/en/start', 0.8),
    page('/pricing', 0.7),
    page('/privacy', 0.3),
    page('/terms', 0.3),
    page('/disclaimer', 0.3),
  ]
}
