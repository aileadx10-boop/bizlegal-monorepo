import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const text = await req.text()
  const params = new URLSearchParams(text)
  const email = params.get('email') ?? ''
  if (!email || !email.includes('@')) {
    return new Response('invalid_email', { status: 400 })
  }
  // DEMO mode: log only. Live would write to casepage_waitlist via service role.
  return Response.json({ ok: true, queued: true, email: email.slice(0, 2) + '***' })
}
