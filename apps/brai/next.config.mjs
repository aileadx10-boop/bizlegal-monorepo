/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: [
    '@bizlegal/themes',
    '@bizlegal/turnstile-widget',
    '@bizlegal/turnstile-verify',
    '@bizlegal/nurture-enqueue',
    '@bizlegal/rate-limit',
    '@bizlegal/ops-log',
    '@bizlegal/payment',
  ],
}

export default nextConfig
