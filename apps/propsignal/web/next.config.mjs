import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Trace from monorepo root so workspace-hoisted node_modules
    // (styled-jsx, react, etc. at /node_modules/.pnpm/...) end up in
    // the serverless bundle. Scoping tracing to apps/propsignal/web
    // makes serverless functions fail at runtime with
    // "Cannot find module 'styled-jsx'" (see apps/docai/web).
    outputFileTracingRoot: path.resolve(__dirname, "../../.."),
  },
}

export default nextConfig
