import { MetadataRoute } from 'next'

// GEO/AEO policy — SellerRadar uses curated fee fixtures (never scrapes
// gated content), and in turn welcomes the engines' crawlers here.

const ALLOW: string[] = [
  'Googlebot', 'Bingbot', 'DuckDuckBot', 'Slurp', 'Baiduspider', 'YandexBot',
  'OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'ClaudeBot', 'Claude-Web', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'GoogleOther', 'Gemini',
  'Applebot-Extended', 'Applebot', 'meta-externalagent', 'meta-webindexer', 'xAI', 'grok',
  'cohere-ai', 'cohere-training-data-crawler', 'YouBot', 'MistralAI-User', 'DeepSeekBot',
  'DuckAssistBot', 'Amazonbot', 'facebookexternalhit', 'Twitterbot', 'LinkedInBot',
  'Slackbot', 'TelegramBot', 'WhatsApp',
]

const BLOCK: string[] = [
  'Bytespider', 'CCBot', 'Diffbot', 'ImagesiftBot', 'PetalBot',
  'SemrushBot', 'AhrefsBot', 'MJ12bot', 'DotBot', 'BLEXBot',
]

const PRIVATE: string[] = ['/api/', '/_next/', '/report/', '/analyze', '/success']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE, crawlDelay: 1 },
      { userAgent: ALLOW, allow: '/', disallow: PRIVATE },
      { userAgent: BLOCK, disallow: '/' },
    ],
    sitemap: 'https://sellerradar.bizlegal-ai.com/sitemap.xml',
    host: 'https://sellerradar.bizlegal-ai.com',
  }
}
