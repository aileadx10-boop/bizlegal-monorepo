import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { logEventAsync } from '@bizlegal/ops-log'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/tools/ai-policy-generator
 *
 * W3-8 (O-010) — AI Policy Generator. Wizard inputs (firm size, practice
 * areas, AI tools) → Sonnet drafts a firm-wide AI usage policy with a
 * citation allowlist (ABA Formal Opinion 512 + Model Rules). The draft is
 * stored in ai_policy_drafts (status='draft') with a download_token; the
 * full-policy download is gated on $99 payment (webhook flips to 'paid').
 *
 * REVENUE+LIABILITY framing: the generated policy is a TEMPLATE — an
 * attorney must review and adopt it before use. No legal-advice claim.
 * Citations are constrained to the ABA allowlist; a post-processor drops
 * any section whose citations don't match.
 */

interface PolicySection {
  heading: string
  body: string
  citations: string[]
}

interface PolicyResponse {
  policy_title: string
  sections: PolicySection[]
  attorney_review_note: string
}

interface GenBody {
  email: string
  firm_size: 'solo' | 'small' | 'mid' | 'large'
  practice_areas: string[]
  ai_tools: string[]
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const FIRM_SIZES = new Set(['solo', 'small', 'mid', 'large'])

// Anti-hallucination allowlist — the ONLY citations the model may emit.
const ALLOWED_CITES = new Set([
  'ABA Formal Opinion 512 (2024)',
  'ABA Model Rule 1.1',
  'ABA Model Rule 1.6',
  'ABA Model Rule 5.3',
  'ABA Model Rule 5.5',
  'ABA Model Rule 8.4(c)',
])

const ipHits = new Map<string, { count: number; resetAt: number }>()

function allowed(req: NextRequest): boolean {
  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return true
  }
  entry.count += 1
  return entry.count <= 10
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const PROMPT = `You are a law-firm AI usage policy drafter. Draft a firm-wide AI
usage policy for a law firm based on the inputs below.

Output STRICT JSON (no prose):
{
  "policy_title": "<short policy title>",
  "sections": [
    {
      "heading": "<section heading>",
      "body": "<2-4 sentences of policy text>",
      "citations": ["ABA Formal Opinion 512 (2024)", "ABA Model Rule 1.1"]
    }
  ],
  "attorney_review_note": "<1-2 sentences: this is a template, attorney must review and adopt before use>"
}

Constraints:
- citations MUST be from this allowlist ONLY:
  "ABA Formal Opinion 512 (2024)", "ABA Model Rule 1.1", "ABA Model Rule 1.6",
  "ABA Model Rule 5.3", "ABA Model Rule 5.5", "ABA Model Rule 8.4(c)"
- Produce 6-10 sections covering: scope, permitted uses, prohibited uses,
  confidentiality & client data, competence, supervision of AI use, billing,
  client disclosure, and review.
- Each section MUST cite at least one allowlisted source.
- The policy is a TEMPLATE — state that an attorney must review and adopt it
  before use. Do not claim it is legal advice or bar-approved.

=== FIRM PROFILE ===
Firm size: {firm_size}
Practice areas: {practice_areas}
AI tools in use: {ai_tools}
=== END ===
`

async function generatePolicy(body: GenBody): Promise<PolicyResponse | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  const prompt = PROMPT
    .replace('{firm_size}', body.firm_size)
    .replace('{practice_areas}', body.practice_areas.join(', ') || 'Not specified')
    .replace('{ai_tools}', body.ai_tools.join(', ') || 'Not specified')

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 3000,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) {
      console.warn('[ai-policy-generator] Sonnet HTTP', res.status)
      return null
    }
    const blob = (await res.json()) as { content?: Array<{ type: string; text?: string }> }
    const text = (blob.content ?? []).find((c) => c.type === 'text')?.text?.trim()
    if (!text) return null
    const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(cleaned) as { policy_title?: unknown; sections?: unknown; attorney_review_note?: unknown }

    const title = String(parsed.policy_title ?? 'Firm AI Usage Policy').slice(0, 200)
    const raw = Array.isArray(parsed.sections) ? parsed.sections : []

    // Anti-hallucination: keep only sections with ≥1 allowlisted citation.
    const sections: PolicySection[] = []
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue
      const s = item as Record<string, unknown>
      const citations = (Array.isArray(s.citations) ? s.citations : [])
        .map((c) => String(c).trim())
        .filter((c) => ALLOWED_CITES.has(c))
        .slice(0, 4)
      if (citations.length === 0) continue
      sections.push({
        heading: String(s.heading ?? '').slice(0, 120),
        body: String(s.body ?? '').slice(0, 800),
        citations,
      })
      if (sections.length >= 10) break
    }

    const attorneyReviewNote = String(parsed.attorney_review_note ?? '').slice(0, 400)
    if (sections.length === 0) return null

    return {
      policy_title: title,
      sections,
      attorney_review_note:
        attorneyReviewNote ||
        'This is a template. An attorney must review and adopt it before use — it is not legal advice and is not bar-approved.',
    }
  } catch (err) {
    console.warn('[ai-policy-generator] Sonnet call failed:', err)
    return null
  }
}

function isValid(input: unknown): input is GenBody {
  if (!input || typeof input !== 'object') return false
  const o = input as Record<string, unknown>
  if (typeof o.email !== 'string' || !EMAIL_RE.test(o.email.trim())) return false
  if (typeof o.firm_size !== 'string' || !FIRM_SIZES.has(o.firm_size)) return false
  if (!Array.isArray(o.practice_areas) || !Array.isArray(o.ai_tools)) return false
  return true
}

export async function POST(req: NextRequest) {
  if (!allowed(req)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  if (!isValid(body)) {
    return NextResponse.json(
      { error: 'email, firm_size (solo|small|mid|large), practice_areas[], and ai_tools[] are required' },
      { status: 400 }
    )
  }

  const result = await generatePolicy(body)
  if (!result) {
    return NextResponse.json(
      { error: 'generator_unavailable; please retry shortly.' },
      { status: 503 }
    )
  }

  // Persist draft with a download token. Service-role; non-fatal.
  const downloadToken = randomBytes(24).toString('hex')
  let draftId = ''
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('ai_policy_drafts')
      .insert({
        user_email: body.email.trim().toLowerCase(),
        firm_size: body.firm_size,
        practice_areas: body.practice_areas,
        ai_tools: body.ai_tools,
        policy_title: result.policy_title,
        policy_markdown: renderMarkdown(result),
        citations: result.sections.flatMap((s) => s.citations),
        status: 'draft',
        download_token: downloadToken,
      })
      .select('id')
      .single()
    if (!error && data) draftId = String(data.id)
  } catch (err) {
    console.warn('[ai-policy-generator] persist failed:', err)
  }

  logEventAsync({
    type: 'report.generated',
    source: 'hub',
    ref_id: draftId || undefined,
    email: body.email.trim().toLowerCase(),
    status: 'ok',
    metadata: {
      tool: 'ai-policy-generator',
      firm_size: body.firm_size,
      sections_count: result.sections.length,
      citations_count: result.sections.flatMap((s) => s.citations).length,
    },
  })

  return NextResponse.json({
    ...result,
    draft_id: draftId,
    download_token: downloadToken,
    checkout: {
      product_id: 'ai_policy_generator',
      amount_cents: 9900,
    },
  })
}

/** Render the policy sections to markdown for storage + email. */
function renderMarkdown(p: PolicyResponse): string {
  const lines = [
    `# ${p.policy_title}`,
    '',
    ...p.sections.flatMap((s) => [
      `## ${s.heading}`,
      '',
      s.body,
      '',
      `*Citations: ${s.citations.join('; ')}*`,
      '',
    ]),
    '---',
    '',
    p.attorney_review_note,
    '',
    '*Generated by BizLegal AI AI Policy Generator. Template — attorney must review before adoption.*',
  ]
  return lines.join('\n')
}
