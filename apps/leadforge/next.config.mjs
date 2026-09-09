import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Monorepo root, not apps/leadforge — a wrong trace root excludes the
  // root node_modules from the lambda, so every API function crashes on
  // startup (500 on all /api/* routes) while prerendered pages still work.
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  transpilePackages: [
    '@bizlegal/themes',
    '@bizlegal/turnstile-widget',
    '@bizlegal/turnstile-verify',
    '@bizlegal/nurture-enqueue',
    '@bizlegal/rate-limit',
    '@bizlegal/ops-log',
    '@bizlegal/payment',
  ],
};

export default nextConfig;
