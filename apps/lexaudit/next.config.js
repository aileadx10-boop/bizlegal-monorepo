/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@bizlegal/themes',
    '@bizlegal/turnstile-widget',
    '@bizlegal/turnstile-verify',
    '@bizlegal/nurture-enqueue',
    '@bizlegal/rate-limit',
    '@bizlegal/ops-log',
    '@bizlegal/payment',
  ],
  async redirects() {
    return [
      { source: '/legal/disclaimer', destination: '/disclaimer', permanent: true },
      { source: '/legal/privacy', destination: '/privacy', permanent: true },
      { source: '/legal/terms', destination: '/terms', permanent: true },
      { source: '/legal/refund', destination: '/refund', permanent: true },
      { source: '/legal/acceptable-use', destination: '/acceptable-use', permanent: true },
    ]
  },
}
module.exports = nextConfig
