import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { writeAuditRun } from '@/lib/audit-chain'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: undelivered } = await supabase
    .from('payment_orders')
    .select('id, user_email, product, tier, status, metadata')
    .eq('status', 'confirmed')
    .is('metadata->>delivered_at', null)
    .limit(20)

  let delivered = 0
  const errors: string[] = []

  for (const order of undelivered ?? []) {
    try {
      const deliveryUrl = getDeliveryUrl(order.product, order.tier)
      const subject = getDeliverySubject(order.product)

      if (process.env.RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'AI Conductor <ai.leadx10@gmail.com>',
            to: order.user_email,
            subject,
            html: `<p>Your purchase is confirmed. Access your product here:</p><p><a href="${deliveryUrl}">${deliveryUrl}</a></p><p>Thank you for choosing AI Conductor.</p><p>— Moses, BizLegal AI</p>`,
          }),
        })
      }

      await supabase
        .from('payment_orders')
        .update({ metadata: { ...(order.metadata as Record<string, unknown> || {}), delivered_at: new Date().toISOString() } })
        .eq('id', order.id)

      await writeAuditRun(supabase, {
        agent_name: 'lead_commander',
        workflow_id: 'WF-3',
        action: 'delivery.sent',
        status: 'success',
        target_email: order.user_email,
        details: { product: order.product, tier: order.tier },
      })

      delivered++
    } catch (err) {
      errors.push(`${order.user_email}: ${err instanceof Error ? err.message : 'Unknown'}`)
    }
  }

  return NextResponse.json({ agent: 'lead_commander', workflow: 'WF-3', delivered, errors })
}

function getDeliveryUrl(product: string, tier?: string): string {
  const BASE = 'https://docai.bizlegal-ai.com'
  if (product?.includes('conductor')) return `${BASE}/dashboard`
  if (product?.includes('docai')) return `${BASE}/dashboard`
  if (product?.includes('boi')) return 'https://forge.bizlegal-ai.com/boi'
  if (product?.includes('tracr')) return 'https://tracr.bizlegal-ai.com'
  if (product?.includes('lexaudit')) return 'https://lexaudit.bizlegal-ai.com'
  return `${BASE}/dashboard`
}

function getDeliverySubject(product: string): string {
  if (product?.includes('conductor')) return 'Your AI Conductor access is ready'
  if (product?.includes('boi')) return 'Your BOI Compliance Kit is ready'
  if (product?.includes('tracr')) return 'Your TRACR forensic report is ready'
  return 'Your BizLegal AI purchase is confirmed'
}
