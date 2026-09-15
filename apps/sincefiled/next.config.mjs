import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Workspace packages ship TypeScript source (main: ./src/index.ts).
  transpilePackages: ['@bizlegal/payment', '@bizlegal/ops-log', '@bizlegal/themes'],
  // @bizlegal/payment is authored NodeNext-style (relative imports carry .js);
  // webpack does not map .js → .ts, so try the .ts sibling first. Same fix as
  // apps/hub and apps/deal44.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.js'],
    }
    return config
  },
  experimental: {
    // Trace from the monorepo root so lambdas see the root node_modules
    // (leadforge 500'd on every API route when this pointed at the app dir).
    outputFileTracingRoot: path.resolve(__dirname, '../..'),
  },
}

export default nextConfig
