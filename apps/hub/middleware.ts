import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect ops dashboard routes
  if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/login')) {
    const session = request.cookies.get('ops_session')
    if (!session) {
      const loginUrl = new URL('/dashboard/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect automation dashboard
  if (pathname.startsWith('/automation/dashboard')) {
    const cronHeader = request.headers.get('x-cron-secret')
    const envSecret = process.env.CRON_SECRET
    if (envSecret && cronHeader !== envSecret) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  // Security headers for all responses
  const response = NextResponse.next()
  
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/automation/dashboard/:path*',
    '/api/:path*',
  ],
}
