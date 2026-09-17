import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@bizlegal/email',
    '@bizlegal/rate-limit',
    '@bizlegal/scoring',
    '@bizlegal/themes',
    '@bizlegal/turnstile-verify',
    '@bizlegal/turnstile-widget',
    '@bizlegal/nurture-enqueue',
  ],
  webpack: (config) => {
    config.resolve.alias['@'] = __dirname
    // Workspace packages authored NodeNext-style carry the .js extension on
    // their own relative imports. Webpack does not map .js → .ts, so teach it
    // to try the .ts sibling first. Same fix as apps/hub and apps/sellerradar.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.js'],
    }
    return config
  },
  // Next 14.2 reads this key under `experimental`; at the top level it is
  // silently ignored, the Vercel tracer roots at apps/brainx, omits every
  // pnpm-hoisted workspace package, and each API lambda throws MODULE_NOT_FOUND
  // on its first request — a green build over a dead runtime (the leadforge lesson).
  experimental: {
    outputFileTracingRoot: path.resolve(__dirname, '../..'),
  },
  async redirects() {
    // The 2026-09-16 dashboard stubs (public, unauthenticated, in the sitemap)
    // are gone. Anything that indexed them lands on the gated radar.
    return [
      { source: '/overview', destination: '/radar', permanent: true },
      { source: '/opportunities', destination: '/radar', permanent: true },
      { source: '/opportunities/:id', destination: '/radar', permanent: true },
      { source: '/signals', destination: '/radar', permanent: true },
      { source: '/competitors', destination: '/radar', permanent: true },
      { source: '/voices', destination: '/radar', permanent: true },
      { source: '/regulatory', destination: '/radar', permanent: true },
    ]
  },
}

export default nextConfig
