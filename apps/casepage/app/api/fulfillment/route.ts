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
  interval?: string
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
  const { error: accountError } = await supabase
    .from('cp_accounts')
    .upsert({ email, updated_at: new Date().toISOString() }, { onConflict: 'email' })
  if (accountError) {
    console.error('[casepage/fulfillment] account upsert failed', accountError.message)
    return Response.json({ ok: false, error: 'account_grant_failed' }, { status: 503 })
  }

  const productId =
    body.productId === 'casepage'
      ? body.tier === 'firm' ? 'cp_firm_149' : 'cp_solo_49'
      : body.productId
  const entitlement =
    productId === 'cp_firm_149'
      ? { max_pages: null }
      : productId === 'cp_solo_49'
        ? { max_pages: 10 }
        : { setup_service: true }
  const status = ['active', 'past_due', 'cancelled', 'expired', 'refunded'].includes(body.status ?? '')
    ? body.status!
    : 'active'
  const { data: existing } = await supabase.from('cp_subscriptions').select('id').eq('order_id', body.orderId).maybeSingle()
  const { error } = await supabase.from('cp_subscriptions').upsert(
    {
      owner_email: email,
      product_id: productId,
      order_id: body.orderId,
      gateway: body.gateway,
      gateway_subscription_id: body.gatewaySubscriptionId,
      status,
      entitlement,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'order_id' },
  )
  if (error) {
    console.error('[casepage/fulfillment] entitlement upsert failed', error.message)
    return Response.json({ ok: false, error: 'entitlement_grant_failed' }, { status: 503 })
  }
  if (!existing && status === 'active') {
    const token = issueLoginToken(email)
    const accessUrl = `https://casepage.bizlegal-ai.com/api/auth/verify?token=${encodeURIComponent(token)}`
    const sent = await sendEmail({
      to: email,
      subject: productId === 'cp_setup_490' ? 'CasePage setup purchased' : 'Your CasePage access',
      text: `Your CasePage purchase is active. Sign in: ${accessUrl}\n\nThe private link expires in 15 minutes.`,
      html: `<p>Your CasePage purchase is active.</p><p><a href="${accessUrl}">Open CasePage</a></p><p>This private sign-in link expires in 15 minutes.</p>`,
      kind: 'transactional',
      idempotencyKey: `casepage-grant-${body.orderId}`,
    })
    if (!sent.ok) console.warn('[casepage/fulfillment] access email failed', sent.error)
  }
  return Response.json({ ok: true, idempotency_key: body.orderId })
}
