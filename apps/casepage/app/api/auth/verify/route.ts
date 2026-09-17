import { NextRequest, NextResponse } from 'next/server'
import { issueSession, verifyLoginToken } from '@/lib/auth'

export function GET(req: NextRequest) {
  const claim = verifyLoginToken(req.nextUrl.searchParams.get('token') ?? '')
  if (!claim) return NextResponse.redirect(new URL('/login?error=invalid_or_expired', req.url))
  const response = NextResponse.redirect(new URL('/dashboard', req.url))
  response.cookies.set('cp_session', issueSession(claim.email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  })
  return response
}
