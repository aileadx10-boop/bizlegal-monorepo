import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // (app) route group surfaces auth-gated workspace pages —
        // also covered by per-page noindex but belt-and-suspenders.
        disallow: ['/api/', '/_next/', '/clients', '/deals', '/pipeline', '/report/', '/scan', '/success'],
      },
    ],
    sitemap: 'https://tracr.bizlegal-ai.com/sitemap.xml',
    host: 'https://tracr.bizlegal-ai.com',
  }
}
