import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import crypto from 'node:crypto'
import { logEventAsync } from '@/lib/ops/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

const COGUARD_FOOTER = `\n\n---\n[Sent via CoGuard · Professional Co-Parenting Communication]\nReference: `

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const { draft_id, to_email, subject } = (await req.json()) as { draft_id?: string; to_email?: string; subject?: string }
    if (!draft_id || !to_email) return NextResponse.json({ error: 'draft_id and to_email required' }, { status: 400 })

    const supabase = getServiceSupabase()

    // Verify subscriber owns this draft
    const { data: subscriber } = await supabase
      .from('coguard_subscribers')
      .select('id, email, reply_address, status')
      .eq('email', user.email!)
      .eq('status', 'active')
      .maybeSingle()

    if (!subscriber) return NextResponse.json({ error: 'no active subscription' }, { status: 403 })

    const { data: draft } = await supabase
      .from('coguard_drafts')
      .select('id, raw_draft, biff_text, status, biff_needed')
      .eq('id', draft_id)
      .eq('subscriber_id', subscriber.id)
      .eq('status', 'pending_approval')
      .single()

    if (!draft) return NextResponse.json({ error: 'draft not found or already processed' }, { status: 404 })

    // Use BIFF text if available, otherwise raw draft
    const bodyToSend = draft.biff_text ?? draft.raw_draft

    // Bates reference for footer
    const shortId = subscriber.id.slice(0, 6).toUpperCase()
    const batesRef = `BL-${shortId}-${Date.now().toString().slice(-7)}`
    const fullBody = bodyToSend + COGUARD_FOOTER + batesRef

    // SHA-256 of the body BEFORE sending — this is the invariant
    const bodySha256 = crypto.createHash('sha256').update(fullBody).digest('hex')

    // Log to DB first (append-only, before sending)
    const receivedAt = new Date().toISOString()
    const { error: msgErr } = await supabase
      .from('coguard_messages')
      .insert({
        subscriber_id: subscriber.id,
        channel: 'outgoing',
        subject: subject ?? '(no subject)',
        raw_body: draft.raw_draft,
        body_sha256: bodySha256,
        neutralized_body: draft.biff_text ?? null,
        received_at: receivedAt,
        processed_at: receivedAt,
      })

    if (msgErr) {
      return NextResponse.json({ error: 'message logging failed — send aborted' }, { status: 500 })
    }

    // Send via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) return NextResponse.json({ error: 'Resend not configured' }, { status: 500 })

    const fromAddress = subscriber.reply_address ?? `coguard@reply.coguard.bizlegal-ai.com`

    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromAddress,
        to: [to_email],
        bcc: [subscriber.email],
        subject: subject ?? '(no subject)',
        text: fullBody,
      }),
    })

    if (!sendRes.ok) {
      const errText = await sendRes.text().catch(() => '')
      return NextResponse.json({ error: `Resend failed: ${sendRes.status} ${errText}` }, { status: 502 })
    }

    // Mark draft as sent
    await supabase.from('coguard_drafts').update({ status: 'sent', sent_at: receivedAt }).eq('id', draft_id)

    logEventAsync({ type: 'coguard.message.sent', source: 'coguard', ref_id: subscriber.id, metadata: { bates_ref: batesRef, biff_used: !!draft.biff_text, body_sha256: bodySha256 } })

    return NextResponse.json({ ok: true, bates_ref: batesRef, body_sha256: bodySha256 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  }
}
