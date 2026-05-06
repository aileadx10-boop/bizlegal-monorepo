/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: [
    '@bizlegal/themes',
    '@bizlegal/turnstile-widget',
    '@bizlegal/turnstile-verify',
    '@bizlegal/nurture-enqueue',
    '@bizlegal/rate-limit',
    '@bizlegal/ops-log',
    '@bizlegal/payment',
  ],
  experimental: {
    optimizePackageImports: ['framer-motion', '@supabase/supabase-js'],
  },
  async headers() {
    return [
      {
        source: '/.env:path*',
        headers: [{ key: 'x-robots-tag', value: 'noindex' }],
      },
    ]
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/.env', destination: '/404' },
        { source: '/.env.local', destination: '/404' },
        { source: '/.env.production', destination: '/404' },
        { source: '/.env.example', destination: '/404' },
        { source: '/.env:path(.+)', destination: '/404' },
      ],
    }
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
    };
    return config;
  },
}

module.exports = nextConfig
