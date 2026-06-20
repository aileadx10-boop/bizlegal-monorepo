import { MetadataRoute } from 'next'

// GEO/AEO policy — single source of truth for /robots.txt (folds in the
// allow/block policy that previously lived in a shadowed public/robots.txt).

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

const PRIVATE: string[] = ['/api/', '/_next/']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE, crawlDelay: 1 },
      { userAgent: ALLOW, allow: '/', disallow: PRIVATE },
      { userAgent: BLOCK, disallow: '/' },
    ],
    sitemap: 'https://leadforge.bizlegal-ai.com/sitemap.xml',
    host: 'https://leadforge.bizlegal-ai.com',
  }
}
