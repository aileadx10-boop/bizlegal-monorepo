import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logEventAsync } from '@/lib/ops/log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

interface ClassifyResult {
  hostility_score: number
  urgency_score: number
  logistics_score: number
  biff_needed: boolean
  flags: string[]
}

interface BiffResult {
  biff_text: string
  changes_summary: string
}

const OCI_BASE = process.env.OCI_BASE_URL ?? 'https://oci.bizlegal-ai.com'
const CLASSIFY_URL = `${OCI_BASE}/coguard/classify`
const BIFF_URL = `${OCI_BASE}/coguard/biff`

async function callOci<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const secret = process.env.BIZLEGAL_INBOUND_SECRET ?? ''
  const payload = JSON.stringify(body)
  const { createHmac } = await import('node:crypto')
  const sig = createHmac('sha256', secret).update(payload).digest('hex')

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-bizlegal-signature': sig, 'User-Agent': 'CoGuard/1.0' },
    body: payload,
  })
  if (!res.ok) throw new Error(`OCI ${url} failed: ${res.status}`)
  return res.json() as Promise<T>
}

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

    const { raw_draft } = (await req.json()) as { raw_draft?: string }
    if (!raw_draft?.trim()) return NextResponse.json({ error: 'raw_draft required' }, { status: 400 })
    if (raw_draft.length > 10000) return NextResponse.json({ error: 'draft too long' }, { status: 400 })

    const supabase = getServiceSupabase()
    const { data: subscriber } = await supabase
      .from('coguard_subscribers')
      .select('id, plan, status')
      .eq('email', user.email!)
      .eq('status', 'active')
      .maybeSingle()

    if (!subscriber) return NextResponse.json({ error: 'no active subscription' }, { status: 403 })

    // Step 1: classify tone
    const classification = await callOci<ClassifyResult>(CLASSIFY_URL, { text: raw_draft, subscriber_id: subscriber.id })

    let biffResult: BiffResult | null = null

    // Step 2: BIFF transform if needed
    if (classification.biff_needed) {
      biffResult = await callOci<BiffResult>(BIFF_URL, { text: raw_draft, subscriber_id: subscriber.id })
    }

    // Step 3: insert draft record
    const { data: draft, error: insertErr } = await supabase
      .from('coguard_drafts')
      .insert({
        subscriber_id: subscriber.id,
        raw_draft,
        biff_text: biffResult?.biff_text ?? null,
        tone_score: classification.hostility_score,
        biff_needed: classification.biff_needed,
        changes_summary: biffResult?.changes_summary ?? null,
        status: 'pending_approval',
      })
      .select('id')
      .single()

    if (insertErr || !draft) {
      return NextResponse.json({ error: 'draft save failed' }, { status: 500 })
    }

    logEventAsync({ type: 'coguard.draft.classified', source: 'coguard', ref_id: draft.id, metadata: { subscriber_id: subscriber.id, hostility_score: classification.hostility_score, biff_needed: classification.biff_needed } })

    return NextResponse.json({
      draft_id: draft.id,
      classification,
      raw_draft,
      biff_text: biffResult?.biff_text ?? null,
      changes_summary: biffResult?.changes_summary ?? null,
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'error' }, { status: 500 })
  }
}
