import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/resend'

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)

    // Upsert — silently ignore duplicates
    const { error } = await supabaseAdmin
      .from('subscribers')
      .upsert({ email, confirmed: false }, { onConflict: 'email', ignoreDuplicates: true })

    if (error && !error.message.includes('duplicate')) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    await sendWelcomeEmail(email).catch(() => null) // Don't fail if email fails

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
