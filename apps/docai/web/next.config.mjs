import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // P2 downgrade (Next 14.2.29): typedRoutes is experimental here and
  // unnecessary for the small number of dynamic /methodology#<product>
  // anchors used.
  experimental: {
    outputFileTracingRoot: path.resolve(__dirname),
  },
}

export default nextConfig
