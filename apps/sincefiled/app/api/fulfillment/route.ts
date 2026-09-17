import crypto from 'node:crypto'
import { sendEmail } from '@bizlegal/email'
import { issueLoginToken } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface FulfillmentBody {
  email?: string
  productId?: string
  tier?: string | null
  orderId?: string
  gateway?: string | null
  gatewaySubscriptionId?: string | null
  status?: string
}

function validSignature(raw: string, provided: string | null): boolean {
  const secret = process.env.BIZLEGAL_INBOUND_SECRET
  if (!secret || !provided) return false
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(provided)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export async function POST(req: Request) {
  const raw = await req.text()
  if (!validSignature(raw, req.headers.get('x-bizlegal-signature'))) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  let body: FulfillmentBody
  try {
    body = JSON.parse(raw) as FulfillmentBody
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }
  const email = body.email?.trim().toLowerCase()
  if (!email?.includes('@') || !body.productId || !body.orderId) {
    return Response.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { data: firm, error: firmError } = await supabase
    .from('sf_firms')
    .upsert(
      { owner_email: email, name: email.split('@')[0] || 'Firm' },
      { onConflict: 'owner_email' },
    )
    .select('id')
    .single()
  if (firmError || !firm) {
    console.error('[sincefiled/fulfillment] firm upsert failed', firmError?.message)
    return Response.json({ ok: false, error: 'firm_grant_failed' }, { status: 503 })
  }

  const productId =
    body.productId === 'sincefiled' && body.tier === 'firm'
      ? 'sf_firm_49'
      : body.productId
  const isPack = productId === 'sf_pack_us_19' || productId === 'sf_pack_both_29'
  const status = ['active', 'past_due', 'cancelled', 'expired', 'refunded'].includes(body.status ?? '')
    ? body.status!
    : 'active'
  const targetTable = isPack ? 'sf_pack_grants' : 'sf_subscriptions'
  const { data: existing } = await supabase.from(targetTable).select('id').eq('order_id', body.orderId).maybeSingle()
  if (isPack) {
    const { error } = await supabase.from('sf_pack_grants').upsert(
      { firm_id: firm.id, product_id: productId, order_id: body.orderId, status },
      { onConflict: 'order_id' },
    )
    if (error) {
      console.error('[sincefiled/fulfillment] pack grant failed', error.message)
      return Response.json({ ok: false, error: 'pack_grant_failed' }, { status: 503 })
    }
  } else {
    const { error } = await supabase.from('sf_subscriptions').upsert(
      {
        firm_id: firm.id,
        product_id: productId,
        order_id: body.orderId,
        gateway: body.gateway,
        gateway_subscription_id: body.gatewaySubscriptionId,
        status,
        entitlement: { unlimited_obligations: true },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'order_id' },
    )
    if (error) {
      console.error('[sincefiled/fulfillment] subscription grant failed', error.message)
      return Response.json({ ok: false, error: 'entitlement_grant_failed' }, { status: 503 })
    }
  }
  if (!existing && status === 'active') {
    const token = issueLoginToken(email)
    const path = isPack ? '/packs' : '/dashboard'
    const accessUrl = `https://sincefiled.bizlegal-ai.com/api/auth/verify?token=${encodeURIComponent(token)}&next=${encodeURIComponent(path)}`
    const sent = await sendEmail({
      to: email,
      subject: isPack ? 'Your SinceFiled rhythm pack' : 'Your SinceFiled access',
      text: `Your SinceFiled purchase is active. Open it here: ${accessUrl}\n\nThe private link expires in 15 minutes.`,
      html: `<p>Your SinceFiled purchase is active.</p><p><a href="${accessUrl}">Open SinceFiled</a></p><p>This private sign-in link expires in 15 minutes.</p>`,
      kind: 'transactional',
      idempotencyKey: `sincefiled-grant-${body.orderId}`,
    })
    if (!sent.ok) console.warn('[sincefiled/fulfillment] access email failed', sent.error)
  }
  return Response.json({ ok: true, idempotency_key: body.orderId })
}
