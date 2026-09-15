import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@bizlegal/closing-engine', '@bizlegal/themes'],

  // @bizlegal/closing-engine is authored NodeNext-style: relative imports carry
  // the .js extension, which its own tsc build requires. Webpack does not map
  // .js -> .ts, so teach it to try the .ts sibling first. Same fix as
  // apps/hub/next.config.js.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.js'],
    }
    return config
  },

  experimental: {
    // Trace from monorepo root so workspace-hoisted node_modules
    // (styled-jsx, react, etc. at /node_modules/.pnpm/...) end up in
    // the serverless bundle. Scoping tracing to apps/leaseparse/web
    // breaks at runtime with "Cannot find module 'styled-jsx'" (see
    // apps/docai/web/next.config.mjs for the original incident).
    outputFileTracingRoot: path.resolve(__dirname, "../../.."),
  },
}

export default nextConfig
