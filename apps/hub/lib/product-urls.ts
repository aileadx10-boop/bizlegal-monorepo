/**
 * Single source of truth for product URLs
 * All hub links should use these subdomain URLs (not internal paths)
 * because each product is deployed on its own Vercel project
 */
export const PRODUCT_URLS = {
  tracr: 'https://tracr.bizlegal-ai.com',
  brai: 'https://brai.bizlegal-ai.com',
  lexaudit: 'https://lexaudit.bizlegal-ai.com',
  docai: 'https://docai.bizlegal-ai.com',
  forge: 'https://forge.bizlegal-ai.com',
  leadforge: '/leadforge', // stays on hub until subdomain is deployed
} as const

export type ProductKey = keyof typeof PRODUCT_URLS