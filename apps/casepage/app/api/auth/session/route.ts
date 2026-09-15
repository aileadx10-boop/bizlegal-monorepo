import { issueToken } from '@/lib/auth'
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = body?.email as string | undefined
  if (!email || !email.includes('@')) return Response.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  const token = issueToken({ email, firmName: email.split('@')[0] ?? 'Firm', issuedAt: new Date().toISOString() })
  return Response.json({ ok: true, token })
}
