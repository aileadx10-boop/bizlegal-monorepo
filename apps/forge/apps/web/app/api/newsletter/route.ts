import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, source } = body

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Upsert into newsletter_subscribers
    const supabase = createServerClient()
    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          source: source || 'website',
          subscribed_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )

    if (dbError) {
      console.error('Newsletter subscribe error:', dbError)
      return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 })
    }

    // Send welcome email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Forge Compliance <noreply@forge.bizlegal-ai.com>',
            to: [normalizedEmail],
            subject: 'Welcome to Forge Compliance Intelligence',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="font-size: 24px; font-weight: 700; color: #0f1117; margin-bottom: 16px;">Welcome to Forge</h1>
                <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
                  You're now subscribed to compliance intelligence updates from Forge.
                  We'll keep you informed about regulatory changes that affect your business — including state transparency act developments,
                  CIPA enforcement actions, GDPR developments, and more.
                </p>
                <a href="https://forge.bizlegal-ai.com/audit" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                  Run Your Free Compliance Scan
                </a>
                <p style="font-size: 13px; color: #9ca3af; margin-top: 32px; line-height: 1.5;">
                  Forge Compliance Engine &middot; BizLegal AI<br/>
                  This is regulatory intelligence, not legal advice.
                </p>
              </div>
            `,
          }),
        })
      } catch (emailError) {
        // Log but don't fail the subscription if email sending fails
        console.error('Welcome email send error:', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
