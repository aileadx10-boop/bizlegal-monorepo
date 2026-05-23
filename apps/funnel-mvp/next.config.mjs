/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdfkit + pdf-parse use Node built-ins; force node runtime for any
  // route that imports them. Done per-route via `export const runtime`.
  serverExternalPackages: ['pdfkit', 'pdf-parse', 'mammoth'],
  reactStrictMode: true,
}

export default nextConfig
