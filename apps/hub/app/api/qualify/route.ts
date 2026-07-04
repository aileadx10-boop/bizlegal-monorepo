import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/qualify
 *
 * Async qualifier chat. Receives a lead's first message, runs a
 * 4-question Haiku pipeline to score intent (0-100), and:
 *   - score >= 70: creates a deal_room row + returns deal_room_url
 *   - score < 70:  returns "nurture" path (newsletter + drip sequence)
 *
 * Body: { name, email, company, message, product? }
 * Returns: { ok, score, tier, deal_room_url?, nurture_enrolled }
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function scoreIntent(
  message: string,
  company: string,
  product: string,
  anthropicKey: string,
): Promise<{ score: number; tier: 'hot' | 'warm' | 'cold'; summary: string }> {
  if (!anthropicKey) return { score: 50, tier: 'warm', summary: 'No AI key — defaulting to warm' }

  const prompt = `You are a B2B sales qualifier. Score this inbound lead on buying intent (0-100).

Lead context:
- Company: ${company}
- Product interest: ${product}
- Message: ${message}

Scoring criteria:
- 80-100 (hot): budget confirmed, specific timeline, decision-maker language
- 50-79 (warm): genuine interest, exploring options, no clear timeline
- 0-49 (cold): information gathering, no budget, wrong ICP

Output JSON only: { "score": <number>, "tier": "<hot|warm|cold>", "summary": "<1 sentence>" }`

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 128,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const d = await r.json()
    let text: string = d.content?.[0]?.text ?? ''
    if (text.startsWith('```')) text = text.split('```')[1]?.replace(/^json/, '') ?? text
    const parsed = JSON.parse(text.trim())
    return {
      score: Math.min(100, Math.max(0, Number(parsed.score) || 50)),
      tier: parsed.tier === 'hot' ? 'hot' : parsed.tier === 'cold' ? 'cold' : 'warm',
      summary: String(parsed.summary || ''),
    }
  } catch {
    return { score: 50, tier: 'warm', summary: 'Scoring failed — defaulting to warm' }
  }
}

async function createDealRoom(
  supabase: ReturnType<typeof getSupabase>,
  lead: { name: string; email: string; company: string; product: string },
  score: number,
  summary: string,
): Promise<string | null> {
  const token = crypto.randomUUID().replace(/-/g, '')
  const { error } = await supabase.from('deal_rooms').insert({
    token,
    lead_name: lead.name,
    lead_email: lead.email,
    company: lead.company,
    product: lead.product,
    score,
    ai_summary: summary,
    status: 'active',
  })
  if (error) {
    console.error('[qualify] deal_room insert error:', error.message)
    return null
  }
  return `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bizlegal-ai.com'}/deal/${token}`
}

async function enrollNurture(
  supabase: ReturnType<typeof getSupabase>,
  email: string,
  name: string,
  product: string,
): Promise<void> {
  await supabase.from('lead_outreach').insert({
    lead_email: email,
    lead_name: name,
    company: '',
    pitch_variant: 'qualify-nurture',
    subject: `Resources for ${product} — BizLegal AI`,
    body_preview: `Hi ${name}, thanks for reaching out. Here are the resources most relevant to ${product} compliance.`,
    status: 'drafted',
    agent_run_id: `qualify-nurture-${Date.now()}`,
  }).then()
}

export async function POST(req: NextRequest) {
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name = '', email = '', company = '', message = '', product = 'compliance-ai' } = body

  if (!email || !message || !name) {
    return NextResponse.json({ error: 'name, email, and message are required' }, { status: 400 })
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY ?? ''
  const { score, tier, summary } = await scoreIntent(message, company, product, anthropicKey)

  const supabase = getSupabase()

  if (score >= 70) {
    const dealUrl = await createDealRoom(supabase, { name, email, company, product }, score, summary)
    return NextResponse.json({
      ok: true,
      score,
      tier,
      summary,
      deal_room_url: dealUrl,
      nurture_enrolled: false,
      next: dealUrl ? 'deal-room-ready' : 'manual-follow-up',
    })
  }

  await enrollNurture(supabase, email, name, product)
  return NextResponse.json({
    ok: true,
    score,
    tier,
    summary,
    deal_room_url: null,
    nurture_enrolled: true,
    next: 'nurture-sequence-started',
  })
}
