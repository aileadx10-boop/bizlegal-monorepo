import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/report/', '/api/'],
      },
    ],
    sitemap: 'https://bench.bizlegal-ai.com/sitemap.xml',
  }
}
