import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const email = formData.get('email') as string
  const gap_slug = formData.get('gap_slug') as string
  const lead_magnet_url = formData.get('lead_magnet_url') as string

  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

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
              <a href="${lead_magnet_url || 'https://bizlegal-ai.com/guides'}"
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
