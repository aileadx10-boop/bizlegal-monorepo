import { NextResponse, type NextRequest } from 'next/server'

// Security headers — applied to all hub.bizlegal-ai.com responses
// Per O7 standing order: "never claim done based on code looking
// correct; verify the headers actually ship."

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https: blob:",
  "media-src 'self' https:",
  "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://api.firecrawl.dev https://api.resend.com https://api.apify.com https://api.telegram.org wss:",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://hooks.stripe.com",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ')

// Per-IP rate limiter (in-memory; survives only the lambda's lifecycle)
// For Vercel edge: this resets on cold start, which is fine for our scale
const RATE_BUCKETS = new Map<string, { count: number; reset: number }>()
const WINDOW_MS = 60_000  // 1 min
const LIMIT = 120          // 120 req/min per IP

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const bucket = RATE_BUCKETS.get(ip)
  if (!bucket || bucket.reset < now) {
    RATE_BUCKETS.set(ip, { count: 1, reset: now + WINDOW_MS })
    return true
  }
  bucket.count++
  if (bucket.count > LIMIT) return false
  return true
}

export function middleware(req: NextRequest) {
  // 1. Rate limit (skip static + the /ops dashboard)
  if (!req.nextUrl.pathname.startsWith('/_next') &&
      !req.nextUrl.pathname.startsWith('/favicon')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') || 'unknown'
    if (!rateLimit(ip)) {
      return new NextResponse('Too Many Requests', { status: 429, headers: { 'Retry-After': '60' } })
    }
  }

  // 2. Security headers on every response
  const res = NextResponse.next()
  res.headers.set('Content-Security-Policy', CSP)
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '0')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  res.headers.set('X-DNS-Prefetch-Control', 'off')

  // 3. Block obvious scanner paths
  const ua = req.headers.get('user-agent') || ''
  if (ua.includes('sqlmap') || ua.includes('nikto') || ua.includes('masscan')) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  return res
}

export const config = {
  matcher: ['/((?!api/health|_next/static|_next/image|favicon.ico).*)'],
}
