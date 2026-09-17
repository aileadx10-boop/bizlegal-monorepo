import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@bizlegal/closing-engine',
    '@bizlegal/deal-engine',
    '@bizlegal/email',
    '@bizlegal/rate-limit',
    '@bizlegal/turnstile-verify',
    '@bizlegal/turnstile-widget',
    '@bizlegal/nurture-enqueue',
  ],
  // @bizlegal/closing-engine and @bizlegal/deal-engine are authored
  // NodeNext-style: relative imports carry the .js extension, which their own
  // tsc builds require. Webpack does not map .js → .ts, so teach it to try the
  // .ts sibling first. Same fix as apps/hub/next.config.js.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.js'],
    }
    return config
  },

  experimental: {
    outputFileTracingRoot: path.resolve(__dirname, "../.."),
  },
}

export default nextConfig
