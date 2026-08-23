import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function verifySignature(body: string, header: string, secret: string): boolean {
  try {
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header))
  } catch { return false }
}

interface LeadPayload {
  email: string
  name?: string
  source?: string
  metadata?: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.BIZLEGAL_INBOUND_SECRET
    if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 500 })

    const sig = req.headers.get('x-bizlegal-signature') ?? ''
    const rawBody = await req.text()

    if (!verifySignature(rawBody, sig, secret)) {
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody) as LeadPayload
    if (!payload.email) return NextResponse.json({ error: 'email required' }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
    if (url && key) {
      const supabase = createClient(url, key)
      await supabase.from('leads').upsert({ email: payload.email.toLowerCase(), name: payload.name, source: payload.source ?? 'coguard', metadata: payload.metadata ?? {} }, { onConflict: 'email' })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  }
}
