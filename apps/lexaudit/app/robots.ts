import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Auth-gated tenant surfaces — kept out of crawl to avoid login-
        // wall thin content getting indexed.
        disallow: ['/api/', '/_next/', '/dashboard', '/login', '/matter/', '/certificate/'],
      },
    ],
    sitemap: 'https://lexaudit.bizlegal-ai.com/sitemap.xml',
    host: 'https://lexaudit.bizlegal-ai.com',
  }
}
