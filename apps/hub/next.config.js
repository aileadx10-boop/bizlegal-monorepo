/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options',          value: 'nosniff' },
  { key: 'X-Frame-Options',                  value: 'DENY' },
  { key: 'Referrer-Policy',                  value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',               value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Cross-Origin-Opener-Policy',       value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy',     value: 'same-site' },
  { key: 'Origin-Agent-Cluster',             value: '?1' },
  { key: 'Strict-Transport-Security',        value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Source-only @bizlegal/* packages (no dist). Mirrors the pattern
  // shipped to the 6 subdomains in PR #46e7e2e.
  transpilePackages: [
    '@bizlegal/themes',
    '@bizlegal/turnstile-widget',
    '@bizlegal/ops-log',
    '@bizlegal/payment',
  ],

  experimental: {
    turbopack: true,
  },

  async redirects() {
    return [
      // Legacy SEO routes — content moved to blog.bizlegal-ai.com
      // (factory now lives in bizlegal-ea/projects/bizlegal-seo-site)
      //
      // /blog and /guides are DELIBERATELY absent: the hub owns both now.
      // app/blog/page.tsx is a real index (self-canonical, ItemList over all
      // GUIDES, sitemapped) and app/blog/[slug] canonicalises to /guides/[slug].
      // Redirect rules here run before routing, so reinstating them silently
      // kills those pages — which is exactly what happened until 2026-07-30.
      { source: '/articles',      destination: 'https://blog.bizlegal-ai.com/blog', permanent: true },
      { source: '/articles/:slug',destination: 'https://blog.bizlegal-ai.com/blog/:slug', permanent: true },
      // NOTE: no /guides rule here. The hub owns /guides now — 66 generated pages
      // with self-referencing canonicals, all listed in app/sitemap.ts. The old
      // '/guides/:path*' rule predated them (inherited 2026-05-01) and 308'd every
      // guide to the blog index. Do not reinstate it.
      { source: '/guide/:slug',   destination: 'https://blog.bizlegal-ai.com/blog/:slug', permanent: true },
      { source: '/posts',         destination: 'https://blog.bizlegal-ai.com/blog', permanent: true },
      { source: '/posts/:slug',   destination: 'https://blog.bizlegal-ai.com/blog/:slug', permanent: true },
      { source: '/pages',         destination: 'https://blog.bizlegal-ai.com/blog', permanent: true },

      // www → apex
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.bizlegal-ai.com' }],
        destination: 'https://bizlegal-ai.com/:path*',
        permanent: true,
      },

      // Broken/removed pages → redirects
      { source: '/enterprise',   destination: '/pricing', permanent: true },
      { source: '/security',     destination: '/trust', permanent: true },
      { source: '/docstack',     destination: 'https://docai.bizlegal-ai.com', permanent: true },
      { source: '/marketplace',  destination: 'https://leadforge.bizlegal-ai.com', permanent: true },
      { source: '/scan',         destination: '/risk-engine', permanent: true },

      // Product stubs → subdomains
      { source: '/tracr',        destination: 'https://tracr.bizlegal-ai.com', permanent: true },
      { source: '/brai',         destination: 'https://brai.bizlegal-ai.com', permanent: true },
      { source: '/lexaudit',     destination: 'https://lexaudit.bizlegal-ai.com', permanent: true },
      { source: '/docai',        destination: 'https://docai.bizlegal-ai.com', permanent: true },
      { source: '/forge',        destination: 'https://forge.bizlegal-ai.com', permanent: true },
      { source: '/leadforge',    destination: 'https://leadforge.bizlegal-ai.com', permanent: true },
      { source: '/leadforge/:path*', destination: 'https://leadforge.bizlegal-ai.com/:path*', permanent: true },
    ]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig