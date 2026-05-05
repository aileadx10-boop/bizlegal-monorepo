import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// D10 SECURITY-V3 C-2: lead_magnet_url MUST be derived server-side
// from the requested gap_slug, never from user-supplied form data.
// Pre-D10, this endpoint accepted an arbitrary URL and rendered it
// inside an email sent from a legit-SPF-aligned `hello@bizlegal-ai.com`
// — i.e. an open phishing relay. The mapping below is the allow-list;
// gap_slugs not in the mapping fall through to the generic guide.
const SAFE_LEAD_MAGNET_URLS: Record<string, string> = {
  // Specific magnet slugs go here. Examples (extend as gap pages add real assets):
  // 'eu-ai-act-faq': 'https://bizlegal-ai.com/guides/eu-ai-act-faq.pdf',
  // 'gdpr-checklist': 'https://bizlegal-ai.com/guides/gdpr-checklist.pdf',
}
const DEFAULT_LEAD_MAGNET_URL = 'https://bizlegal-ai.com/guides'

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

export async function POST(req: NextRequest) {
  // Backstop rate-limit before any DB write or email send. C-2 fix
  // closes the open-redirect relay; C-1 backstop closes the bot pump.
  const ip = clientIpFromHeaders(req.headers) ?? 'unknown'
  const rl = rateLimit('forge-lead-magnet', ip, { windowMs: 60_000, limit: 10 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limited', retry_after_ms: rl.retryAfterMs },
      { status: 429, headers: { 'retry-after': String(Math.ceil(rl.retryAfterMs / 1000)) } },
    )
  }

  const formData = await req.formData()
  const emailRaw = (formData.get('email') as string | null) ?? ''
  const gap_slug = (formData.get('gap_slug') as string | null) ?? ''
  const email = emailRaw.trim().toLowerCase()

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  // D10 SECURITY-V3 C-2: pick the magnet URL from the server-side
  // allow-list keyed by gap_slug. NEVER trust a user-supplied URL.
  const lead_magnet_url = SAFE_LEAD_MAGNET_URLS[gap_slug] ?? DEFAULT_LEAD_MAGNET_URL

  // Save lead to Supabase
  await supabase.from('leads').upsert(
    {
      email,
      source: 'gap_page',
      gap_slug,
      created_at: new Date().toISOString(),
    },
    { onConflict: 'email' }
  )

  // Send lead magnet via Resend
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `BizLegal AI <${process.env.RESEND_FROM ?? 'hello@bizlegal-ai.com'}>`,
        to: [email],
        subject: 'Your free compliance guide is ready',
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px">
            <p style="color:#333;font-size:16px;line-height:1.7">Thank you for your interest in BizLegal AI compliance intelligence.</p>
            <p style="margin:24px 0">
              <a href="${lead_magnet_url}"
                 style="display:inline-block;padding:14px 28px;background:#020408;color:#00C8FF;font-weight:600;font-size:14px;text-decoration:none;border-radius:6px">
                Download Your Free Guide &rarr;
              </a>
            </p>
            <p style="color:#666;font-size:14px">Questions? Reply to this email or visit <a href="https://bizlegal-ai.com" style="color:#00C8FF">bizlegal-ai.com</a></p>
            <p style="color:#999;font-size:11px;margin-top:32px;border-top:1px solid #eee;padding-top:16px">
              BizLegal AI &middot; team@bizlegal-ai.com &middot; Not legal advice.
            </p>
          </div>
        `,
      }),
    }).catch(console.error)
  }

  // Telegram alert
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (botToken && chatId) {
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `NEW LEAD: ${email}\nSource: gap page /${gap_slug}\nTime: ${new Date().toISOString()}`,
      }),
    }).catch(console.error)
  }

  logEventAsync({
    type: 'lead.inbound',
    source: 'forge',
    email,
    status: 'ok',
    metadata: { gap_slug, page: 'lead-magnet' },
  })

  return NextResponse.redirect(new URL('/thank-you', req.url))
}
