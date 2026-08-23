import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@bizlegal/themes',
    '@bizlegal/turnstile-widget',
    '@bizlegal/turnstile-verify',
    '@bizlegal/rate-limit',
    '@bizlegal/ops-log',
    '@bizlegal/payment',
    '@bizlegal/email',
  ],
  experimental: {
    outputFileTracingRoot: path.resolve(__dirname, "../../.."),
  },
}

export default nextConfig
