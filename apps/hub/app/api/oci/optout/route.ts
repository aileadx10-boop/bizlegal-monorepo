// app/api/oci/optout/route.ts
//
// GET /api/oci/optout?lead_id=<uuid>
//
// Opt-out endpoint for OCI referral-contract emails. Every email sent by
// email_contract.py includes a 48-hour opt-out link pointing here.
// This route:
//   1. Validates the lead_id query param.
//   2. Patches deal_router_leads: outcome='no_show', contact_email=null.
//   3. Returns a plain HTML confirmation page (not JSON) so the link
//      resolves to a human-readable page when clicked from an email client.
//
// No auth required — the lead_id is already a UUID opaque enough to serve
// as an unguessable token for a low-stakes opt-out action (no PII is
// returned, only PII is *cleared*).

import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function htmlPage(title: string, body: string): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — BizLegal AI</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 520px; margin: 80px auto; padding: 0 24px; color: #111; line-height: 1.6; }
    h1 { font-size: 22px; margin-bottom: 12px; }
    p { font-size: 15px; color: #444; }
    a { color: #0057ff; }
  </style>
</head>
<body>
  ${body}
</body>
</html>`
  return new NextResponse(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const leadId = (url.searchParams.get('lead_id') ?? '').trim()

  if (!leadId || !UUID_RE.test(leadId)) {
    return htmlPage(
      'Invalid link',
      `<h1>Invalid opt-out link</h1>
       <p>This link appears to be malformed. If you received it in an email from BizLegal-AI, please reply directly to that email with "stop" and we will remove the introduction.</p>
       <p><a href="https://bizlegal-ai.com">Return home</a></p>`
    )
  }

  try {
    // Patch outcome to no_show and clear contact PII.
    // Filter: only update if outcome is 'pending' or null (not yet actioned).
    // Won/lost leads are already closed; no need to touch them.
    const { error } = await supabaseAdmin
      .from('deal_router_leads')
      .update({ outcome: 'no_show', contact_email: null })
      .eq('lead_id', leadId)
      .or('outcome.eq.pending,outcome.is.null')

    if (error) {
      console.error('[oci/optout] supabase patch error', error)
      logEventAsync({
        type: 'referral.received',
        source: 'hub',
        ref_id: leadId,
        status: 'failed',
        metadata: { action: 'optout', error: error.message?.slice(0, 200) },
      })
      return htmlPage(
        'Opt-out error',
        `<h1>Something went wrong</h1>
         <p>We could not process your opt-out automatically. Please reply to the introduction email with "stop" and we will handle it manually within 24 hours.</p>
         <p><a href="mailto:team@bizlegal-ai.com">Contact us</a></p>`
      )
    }

    logEventAsync({
      type: 'referral.received',
      source: 'hub',
      ref_id: leadId,
      status: 'ok',
      metadata: { action: 'optout' },
    })

    return htmlPage(
      'Opt-out confirmed',
      `<h1>Introduction cancelled</h1>
       <p>We have received your opt-out request. The partner introduction will not proceed and your contact details have been removed from our routing records.</p>
       <p>If you submitted a matter you would like us to revisit in the future, you are welcome to <a href="https://bizlegal-ai.com/realestate">re-submit at any time</a>.</p>
       <p style="font-size:13px; color:#888; margin-top:32px;">BizLegal-AI Intelligence — operated by DOR INNOVATIONS</p>`
    )
  } catch (err) {
    console.error('[oci/optout] unexpected error', err)
    return htmlPage(
      'Opt-out error',
      `<h1>Something went wrong</h1>
       <p>An unexpected error occurred. Please reply to the introduction email with "stop" and we will handle it manually within 24 hours.</p>
       <p><a href="mailto:team@bizlegal-ai.com">Contact us</a></p>`
    )
  }
}

export const POST = () =>
  NextResponse.json({ error: 'GET only' }, { status: 405 })
