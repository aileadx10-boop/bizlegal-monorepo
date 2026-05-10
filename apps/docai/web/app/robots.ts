import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/_next/'] }],
    sitemap: 'https://docai.bizlegal-ai.com/sitemap.xml',
    host: 'https://docai.bizlegal-ai.com',
  }
}
