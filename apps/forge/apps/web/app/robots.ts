import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/_next/'] }],
    sitemap: 'https://forge.bizlegal-ai.com/sitemap.xml',
    host: 'https://forge.bizlegal-ai.com',
  }
}
