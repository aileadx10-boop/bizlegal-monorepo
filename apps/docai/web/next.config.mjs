import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  // P2 downgrade (Next 14.2.29): typedRoutes is experimental here and
  // unnecessary for the small number of dynamic /methodology#<product>
  // anchors used.
  experimental: {
    // Trace from monorepo root so workspace-hoisted node_modules
    // (styled-jsx, react, etc. at /node_modules/.pnpm/...) end up in
    // the serverless bundle. Was path.resolve(__dirname) — scoped
    // tracing to apps/docai/web and the function failed at runtime
    // with "Cannot find module 'styled-jsx'".
    outputFileTracingRoot: path.resolve(__dirname, "../../.."),
  },
}

export default nextConfig
