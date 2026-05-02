/** @type {import('next').NextConfig} */
const nextConfig = {
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
