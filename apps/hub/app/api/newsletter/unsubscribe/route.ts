/**
 * GET /api/newsletter/unsubscribe?id=<subscriber-uuid>&sig=<hmac>
 *
 * One-click unsubscribe for newsletter_subscribers, linked from the
 * footer of every digest email. Signature is HMAC-SHA256 of the
 * subscriber's id (see lib/newsletter-token.ts) — no separate token
 * column to store or expire.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import { verifySubscriberSig } from '@/lib/newsletter-token'

export const dynamic = 'force-dynamic'

function htmlResponse(status: number, title: string, bodyInner: string): NextResponse {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${title} — BizLegal AI</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow" />
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;margin:60px auto;padding:24px;color:#1a1a1a}
  h1{font-size:22px;margin-bottom:16px}
  p{line-height:1.55;color:#444}
  a{color:#0a2540;text-decoration:underline}
  .ok{background:#d4edda;border-left:4px solid #28a745;padding:12px 16px;border-radius:4px;margin:16px 0}
  .err{background:#f8d7da;border-left:4px solid #dc3545;padding:12px 16px;border-radius:4px;margin:16px 0}
</style>
</head>
<body>
<h1>${title}</h1>
${bodyInner}
<p style="margin-top:32px;font-size:13px;color:#888">
  <a href="https://bizlegal-ai.com/">Back to bizlegal-ai.com</a>
</p>
</body>
</html>`
  return new NextResponse(html, { status, headers: { 'content-type': 'text/html; charset=utf-8' } })
}

async function handle(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url)
  const id = url.searchParams.get('id') ?? ''
  const sig = url.searchParams.get('sig') ?? ''

  if (!id || !sig || !verifySubscriberSig(id, sig)) {
    return htmlResponse(400, 'Invalid unsubscribe link',
      `<div class="err">This unsubscribe link is invalid or has been tampered with. Reply to any BizLegal AI email and we'll opt you out manually.</div>`)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !key) {
    return htmlResponse(503, 'Service unavailable',
      `<p>Briefly degraded — please try again in a minute, or reply to any of our emails to opt out manually.</p>`)
  }
  const sb = createClient(supabaseUrl, key)
  const now = new Date().toISOString()
  const { data, error } = await sb
    .from('newsletter_subscribers')
    .update({ active: false, unsubscribed_at: now })
    .eq('id', id)
    .select('email')
    .maybeSingle()

  if (error) {
    console.error('[newsletter-unsubscribe] update failed:', error.message)
    return htmlResponse(500, 'Could not opt out',
      `<p>Something went wrong on our end. Reply to any of our emails to opt out manually.</p>`)
  }
  if (!data) {
    return htmlResponse(200, 'Already unsubscribed',
      `<div class="ok">This address is already off the list.</div>`)
  }

  // Reusing nurture.opt_out (no new OpsEventType values — see packages/ops-log/CLAUDE.md);
  // metadata.table disambiguates from lead_nurture_state opt-outs.
  logEventAsync({
    type: 'nurture.opt_out',
    source: 'hub',
    ref_id: id,
    status: 'ok',
    metadata: { email: data.email, table: 'newsletter_subscribers' },
  })

  return htmlResponse(200, "You're unsubscribed",
    `<div class="ok">Done — you won't get the Regulatory Pulse anymore. If this was a mistake, subscribe again any time at <a href="https://bizlegal-ai.com/guides">bizlegal-ai.com/guides</a>.</div>`)
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return handle(req)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handle(req)
}
