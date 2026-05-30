import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = body?.email?.trim()?.toLowerCase()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'Invalid email address.' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://docai.bizlegal-ai.com'

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl}/api/auth/callback` },
  })

  if (error) {
    return NextResponse.json({ ok: false, error: 'Failed to send magic link. Try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
