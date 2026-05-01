import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter
const attempts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 }) // 5 attempts per 15 min
    return false
  }
  
  entry.count++
  if (entry.count > 5) {
    return true
  }
  
  return false
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  
  // Rate limiting check
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again in 15 minutes.' },
      { status: 429 }
    )
  }
  
  const { password } = await req.json()
  const correct = process.env.DASHBOARD_PASSWORD
  
  if (!correct || password !== correct) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Clear attempts on success
  attempts.delete(ip)
  
  const res = NextResponse.json({ ok: true })
  res.cookies.set('ops_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  })
  return res
}
