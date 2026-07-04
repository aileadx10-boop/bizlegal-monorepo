import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/cron/invoices
 *
 * Daily invoice follow-up cron (10:00 UTC via Vercel).
 * Finds payment_orders in 'pending' status older than 24h that have an
 * associated lead email, and sends a Resend reminder.
 *
 * Auth: Vercel cron auth header (CRON_SECRET).
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function sendResendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'BizLegal AI <team@bizlegal-ai.com>',
        to,
        subject,
        text,
      }),
    })
    return r.ok
  } catch {
    return false
  }
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: orders, error } = await supabase
    .from('payment_orders')
    .select('id, user_email, product, amount_cents, created_at, gateway')
    .eq('status', 'pending')
    .lt('created_at', cutoff)
    .limit(50)

  if (error) {
    console.error('[cron/invoices] query error:', error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  let sent = 0
  let skipped = 0

  for (const order of orders ?? []) {
    if (!order.user_email) { skipped++; continue }

    const amountDollars = ((order.amount_cents ?? 0) / 100).toFixed(2)
    const subject = `Your BizLegal AI order is waiting — complete checkout`
    const text = [
      `Hi there,`,
      ``,
      `You started a checkout for ${order.product} ($${amountDollars}) on BizLegal AI but didn't complete it.`,
      ``,
      `Your order is still reserved. To complete it, visit:`,
      `https://hub.bizlegal-ai.com/checkout`,
      ``,
      `If you have any questions, just reply to this email.`,
      ``,
      `— Moses`,
      `BizLegal AI | intelligence@bizlegal-ai.com`,
    ].join('\n')

    const ok = await sendResendEmail(order.user_email, subject, text)
    if (ok) {
      await supabase
        .from('payment_orders')
        .update({ status: 'invoice_sent' })
        .eq('id', order.id)
      sent++
    } else {
      skipped++
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    total: (orders ?? []).length,
    timestamp: new Date().toISOString(),
  })
}
