import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@bizlegal/email',
    '@bizlegal/themes',
    '@bizlegal/turnstile-widget',
    '@bizlegal/turnstile-verify',
    '@bizlegal/nurture-enqueue',
  ],
  webpack: (config) => {
    config.resolve.alias['@'] = __dirname
    // Workspace packages authored NodeNext-style carry the .js extension on
    // their own relative imports. Webpack does not map .js → .ts, so teach it
    // to try the .ts sibling first. Same fix as apps/hub and apps/deal44.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.js'],
    }
    return config
  },

  // Without this the Vercel file tracer roots at apps/falseecho and omits
  // every pnpm-hoisted workspace package, so each API lambda throws
  // MODULE_NOT_FOUND on its first request. This is the leadforge lesson:
  // the build goes green and the runtime is dead.
  experimental: {
    outputFileTracingRoot: path.resolve(__dirname, '../..'),
  },
}

export default nextConfig
