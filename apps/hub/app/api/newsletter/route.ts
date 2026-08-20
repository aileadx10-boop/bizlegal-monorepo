/**
 * POST /api/newsletter
 *
 * Double opt-in newsletter subscribe. The actual fix that makes
 * opt_in_outreach shippable.
 *
 * Built 2026-07-10 after the spam-pipeline incident (ef3d90e). The previous
 * route just did `upsert({active: true, ...})` which set NO confirmation
 * flag — every subscribed address was effectively a spam target.
 *
 * New flow:
 *   1. POST {email, source} here
 *   2. Validate email + check suppression_list (NEVER confirm a suppressed addr)
 *   3. Generate a signed token
 *   4. Upsert with double_optin_confirmed=false, double_optin_token=token
 *   5. Send confirmation email via Resend with the magic link
 *   6. User clicks /newsletter/confirm?token=X
 *   7. GET /api/newsletter/confirm flips the flag + writes email_consent_log
 *
 * After step 7, the address becomes mailable (subject to all other safety
 * checks: not suppressed, not bounced, not complained, etc.)
 *
 * Steps 2-5 live in lib/newsletter-optin.ts so /api/subscribe, /api/leads,
 * /api/inbound-lead and /api/mica-deadlines/subscribe share one consent
 * implementation rather than each rolling their own (2026-08-14).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { startDoubleOptIn, originFromHeaders } from '@/lib/newsletter-optin'

export const dynamic = 'force-dynamic'

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  ) as any
}

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { email, source = 'website', vertical_interest = null } = body || {}

  const result = await startDoubleOptIn({
    sb: getClient(),
    email: String(email ?? ''),
    source,
    verticalInterest: vertical_interest,
    origin: originFromHeaders(req.headers),
  })

  if (!result.ok) {
    if (result.error === 'invalid_email') {
      return NextResponse.json({ error: 'Please use a real, personal email address (no role inboxes)' }, { status: 400 })
    }
    if (result.error === 'suppressed') {
      return NextResponse.json({ error: 'This address cannot be subscribed' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Subscription failed — please try again' }, { status: 500 })
  }

  if (result.alreadyConfirmed) {
    return NextResponse.json({
      success: true,
      message: "You're already subscribed.",
      email_sent: false,
    })
  }

  if (!result.emailSent) {
    // The address is saved; only the confirmation send failed. It stays
    // unconfirmed and therefore unmailable until they get a working link.
    return NextResponse.json({
      success: true,
      message: "Subscribed. Confirmation email is on the way (if you don't see it in 5 min, check spam or reply to any @bizlegal-ai.com email).",
      email_sent: false,
    })
  }

  return NextResponse.json({
    success: true,
    message: 'Check your inbox to confirm. The link is valid for 7 days.',
    email_sent: true,
  })
}
