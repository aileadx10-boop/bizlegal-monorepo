import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // @bizlegal/email ships raw TS source (runs on Node + Workers) — Next must
  // transpile it, same pattern as hub/lexaudit/forge with @bizlegal/payment.
  transpilePackages: ["@bizlegal/email"],
  experimental: {
    // Trace from monorepo root so workspace-hoisted node_modules end up in the
    // serverless bundle — scoping tracing to apps/bench/web breaks at runtime
    // with "Cannot find module 'styled-jsx'" (see apps/docai/web).
    outputFileTracingRoot: path.resolve(__dirname, "../../.."),
  },
}

export default nextConfig
