import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Trace from monorepo root so workspace-hoisted node_modules
    // (styled-jsx, react, etc. at /node_modules/.pnpm/...) end up in
    // the serverless bundle. Scoping tracing to apps/dealdesk/web
    // makes the function fail at runtime with missing-module errors
    // (same failure docai hit before adopting this).
    outputFileTracingRoot: path.resolve(__dirname, "../../.."),
  },
}

export default nextConfig
