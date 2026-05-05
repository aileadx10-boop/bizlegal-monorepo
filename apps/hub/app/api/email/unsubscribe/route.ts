/**
 * GET / POST /api/email/unsubscribe?lead_id=XYZ
 *
 * One-click unsubscribe endpoint. Linked from every nurture email's
 * List-Unsubscribe header (RFC 8058). Mailbox providers (Gmail, Outlook,
 * Yahoo) hit this URL automatically when a user clicks "Unsubscribe"
 * in their inbox UI; users can also visit directly.
 *
 * Behavior:
 *   - Sets opted_out=true on the matching lead_nurture_state row
 *   - Sets archived_at so future cron passes skip cheaply
 *   - Returns a tiny HTML confirmation page
 *   - GET + POST both supported (RFC 8058 List-Unsubscribe-Post:
 *     List-Unsubscribe=One-Click sends POST without confirmation)
 *
 * Security: lead_id is the public, low-entropy identifier we put in
 * the email's URL. It's effectively a per-lead unsubscribe token.
 * Anyone with the URL can opt out that specific lead — that's by
 * design (matches Gmail/Outlook expectations of click-and-done).
 *
 * No CSRF protection: opt-out is a one-way operation that benefits
 * the user; an "attacker" forcing an opt-out is just stopping our
 * own emails. Cost of a malicious opt-out: zero. Cost of friction
 * on a legitimate opt-out: spam complaints + sender reputation hit.
 * Pick the right tradeoff.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

async function unsubscribe(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url)
  const leadId = url.searchParams.get('lead_id')

  if (!leadId) {
    return htmlResponse(
      400,
      'Missing lead_id',
      `<p>This unsubscribe link is malformed. If you keep receiving emails, reply to any of them and we'll handle it manually.</p>`,
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !key) {
    console.error('[unsubscribe] Supabase env missing')
    return htmlResponse(
      503,
      'Service unavailable',
      `<p>Briefly degraded — please try again in a minute, or reply to any of our emails to opt out manually.</p>`,
    )
  }

  const sb = createClient(supabaseUrl, key)
  const now = new Date().toISOString()
  const { data, error } = await sb
    .from('lead_nurture_state')
    .update({
      opted_out: true,
      next_step: 'done',
      archived_at: now,
    })
    .eq('lead_id', leadId)
    .select('email')
    .maybeSingle()

  if (error) {
    console.warn(`[unsubscribe] update failed for ${leadId}:`, error.message)
    return htmlResponse(
      500,
      'Could not opt out',
      `<p>Something went wrong on our end. Please reply to any of our emails to opt out manually — we read everything.</p>`,
    )
  }

  // Fire ops event so /ops dashboard reflects the opt-out.
  logEventAsync({
    type: 'nurture.opt_out',
    source: 'hub',
    status: 'ok',
    metadata: { lead_id: leadId, email: data?.email ?? null, ts: now },
  })

  return htmlResponse(
    200,
    'You\'re unsubscribed',
    `<p>Done — you won't get any more emails from us. If this was a mistake, reply to any past message and we'll add you back.</p>`,
  )
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return unsubscribe(req)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return unsubscribe(req)
}

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
</style>
</head>
<body>
<h1>${title}</h1>
${bodyInner}
<p style="margin-top:32px;font-size:13px;color:#888;">
  <a href="https://bizlegal-ai.com/">Back to bizlegal-ai.com</a>
</p>
</body>
</html>`
  return new NextResponse(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
