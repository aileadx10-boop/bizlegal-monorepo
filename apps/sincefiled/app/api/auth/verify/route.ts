import { NextRequest, NextResponse } from 'next/server'
import { issueSession, verifyLoginToken } from '@/lib/auth'

export function GET(req: NextRequest) {
  const claim = verifyLoginToken(req.nextUrl.searchParams.get('token') ?? '')
  if (!claim) return NextResponse.redirect(new URL('/login?error=invalid_or_expired', req.url))
  const requested = req.nextUrl.searchParams.get('next')
  const destination = requested === '/packs' ? '/packs' : '/dashboard'
  const response = NextResponse.redirect(new URL(destination, req.url))
  response.cookies.set('sf_session', issueSession(claim.email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  })
  return response
}
