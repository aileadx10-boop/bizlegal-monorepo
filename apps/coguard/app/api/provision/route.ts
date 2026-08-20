import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import { logEventAsync } from '@/lib/ops/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

// Write alias → subscriber_id mapping to CF KV via REST API
async function writeToCloudflareKV(aliasUuid: string, subscriberId: string): Promise<void> {
  const kvNamespaceId = process.env.CF_COGUARD_KV_NAMESPACE_ID
  const cfAccountId = process.env.CF_ACCOUNT_ID
  const cfApiToken = process.env.CLOUDFLARE_API_TOKEN
  if (!kvNamespaceId || !cfAccountId || !cfApiToken) {
    console.warn('[provision] CF KV env missing — skipping KV write')
    return
  }
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/storage/kv/namespaces/${kvNamespaceId}/values/${aliasUuid}`,
    {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${cfApiToken}`, 'Content-Type': 'text/plain' },
      body: subscriberId,
    }
  )
  if (!res.ok) {
    console.warn('[provision] CF KV write failed', res.status)
  }
}

function slugify(email: string): string {
  return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)
}

interface ProvisionBody {
  payment_order_id: string
  email: string
  tier: string
}

export async function POST(req: NextRequest) {
  const internalSecret = process.env.COGUARD_INTERNAL_SECRET
  if (!internalSecret) return NextResponse.json({ error: 'internal secret not configured' }, { status: 500 })

  const provided = req.headers.get('x-internal-secret')
  if (provided !== internalSecret) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const body = (await req.json()) as Partial<ProvisionBody>
    if (!body.payment_order_id || !body.email) {
      return NextResponse.json({ error: 'payment_order_id and email required' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Idempotent: check if subscriber already exists for this order
    const { data: existing } = await supabase
      .from('coguard_subscribers')
      .select('id, inbox_alias, reply_address')
      .eq('payment_order_id', body.payment_order_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ ok: true, subscriber_id: existing.id, inbox_alias: existing.inbox_alias, reply_address: existing.reply_address, duplicate: true })
    }

    const aliasUuid = randomUUID()
    const slug = slugify(body.email)
    const replyAddress = `${slug}-${aliasUuid.slice(0, 8)}@reply.coguard.bizlegal-ai.com`
    const inboxAlias = `${aliasUuid}@inbox.coguard.bizlegal-ai.com`
    const plan = body.tier?.includes('litigation') ? 'litigation' : 'solo'

    // Upsert subscriber — link to auth.users by email if they've signed in
    const { data: userLookup } = await supabase.from('coguard_subscribers').select('id').eq('email', body.email).maybeSingle()

    const { data: subscriber, error: insertErr } = await supabase
      .from('coguard_subscribers')
      .upsert({
        email: body.email,
        plan,
        status: 'active',
        inbox_alias: aliasUuid,
        reply_address: replyAddress,
        payment_order_id: body.payment_order_id,
      }, { onConflict: 'email' })
      .select('id')
      .single()

    if (insertErr || !subscriber) {
      console.error('[provision] subscriber upsert failed', insertErr)
      return NextResponse.json({ error: 'subscriber creation failed' }, { status: 500 })
    }

    // Write alias → subscriber_id to CF KV so the Worker can look it up
    await writeToCloudflareKV(aliasUuid, subscriber.id)

    logEventAsync({ type: 'coguard.subscriber.provisioned', source: 'coguard', ref_id: subscriber.id, email: body.email, metadata: { plan, inbox_alias: inboxAlias, reply_address: replyAddress } })

    return NextResponse.json({ ok: true, subscriber_id: subscriber.id, inbox_alias: inboxAlias, reply_address: replyAddress })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  }
}
