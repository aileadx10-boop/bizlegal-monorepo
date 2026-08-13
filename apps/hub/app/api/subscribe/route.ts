/**
 * POST /api/subscribe — footer + homepage newsletter form.
 *
 * Delegates to the shared double-opt-in flow. This route previously upserted
 * `confirmed: false` and then sent a welcome email anyway, which meant every
 * address typed into the footer received mail it had never confirmed. Nothing
 * is sent now beyond the confirmation request itself; the address only becomes
 * mailable after /api/newsletter/confirm.
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { startDoubleOptIn, originFromHeaders } from '@/lib/newsletter-optin'

export const dynamic = 'force-dynamic'

const schema = z.object({
  email: z.string().email(),
  source: z.string().max(64).optional(),
})

export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof schema>
  try {
    parsed = schema.parse(await req.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  const result = await startDoubleOptIn({
    sb: supabaseAdmin,
    email: parsed.email,
    source: parsed.source ?? 'website_footer',
    origin: originFromHeaders(req.headers),
  })

  if (!result.ok) {
    if (result.error === 'invalid_email') {
      return NextResponse.json(
        { error: 'Please use a real, personal email address (no role inboxes)' },
        { status: 400 },
      )
    }
    if (result.error === 'suppressed') {
      return NextResponse.json({ error: 'This address cannot be subscribed' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Subscription failed — please try again' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: result.alreadyConfirmed
      ? "You're already subscribed."
      : 'Check your inbox to confirm. The link is valid for 7 days.',
  })
}
