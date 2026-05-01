import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/ai-act/classify
 *
 * V1 — AI-Act Risk Classifier. Takes a system description + 6 structured
 * questions about the AI feature, calls Sonnet 4.6 to classify into
 * {minimal, limited, high, unacceptable} per EU AI Act Article 6 + Annex III,
 * cites Article numbers / Annex sections, and produces a draft documentation
 * checklist for the customer's compliance file.
 *
 * REVENUE+LIABILITY framing: this is decision-support intelligence, not a
 * legal opinion. The output explicitly tells the user that the
 * classification must be confirmed by their counsel before reliance.
 *
 * Anti-hallucination: model is constrained to cite ONLY Article numbers
 * from a fixed allowed list (Article 5, 6, 9, 10, 13, 14, 15, 17, 50,
 * 52, 53, 55) and Annex III categories (1-8). A post-processor strips
 * any cite that doesn't match the regex.
 */

interface ClassifyBody {
  email: string
  system_description: string
  uses_biometrics?: boolean
  makes_critical_decisions?: boolean
  used_in_education_or_employment?: boolean
  used_in_law_enforcement_or_justice?: boolean
  is_general_purpose_ai?: boolean
  eu_market_access: boolean
}

interface ClassifyResponse {
  classification_id: string
  risk_tier: 'minimal' | 'limited' | 'high' | 'unacceptable'
  rationale: string
  articles_cited: string[]
  annex_sections_cited: string[]
  documentation_checklist: string[]
  legal_notice: string
  disclaimer_version: string
  generated_at: string
}

const ALLOWED_ARTICLE_RE = /^Article (5|6|9|10|13|14|15|17|50|52|53|55)(\([0-9a-z]+\))?$/
const ALLOWED_ANNEX_RE = /^Annex III\(([1-8])\)$/

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const PROMPT = `You are an EU AI Act compliance specialist. Classify the system below
into ONE of: minimal, limited, high, unacceptable per Article 6 + Annex III.

Output STRICT JSON (no prose):
{
  "risk_tier": "minimal" | "limited" | "high" | "unacceptable",
  "rationale": "<3-5 sentences citing the specific provision that governs>",
  "articles_cited": ["Article 6", "Article 6(2)", ...],
  "annex_sections_cited": ["Annex III(1)", ...],
  "documentation_checklist": ["<actionable line item>", ...]
}

Constraints:
- articles_cited entries MUST match the pattern "Article N" or "Article N(M)"
  where N is one of 5,6,9,10,13,14,15,17,50,52,53,55. Do not invent.
- annex_sections_cited MUST be of the form "Annex III(K)" where K is 1-8.
- Output 5-10 documentation_checklist items, each prefixed with the
  obligation source (e.g., "Article 9 — Establish a risk management system…")
- Be conservative: when in doubt between two tiers, pick the higher one.
- If the system is a general-purpose AI model (e.g. foundation LLM used as
  an API), apply Article 55 obligations.

=== SYSTEM DESCRIPTION ===
{description}

Uses biometric data: {biometrics}
Makes consequential automated decisions about people: {decisions}
Used in education or employment context: {education}
Used in law enforcement or judicial context: {justice}
Is a general-purpose AI model: {gpai}
EU market access: {eu}
=== END ===
`

async function classifyWithSonnet(body: ClassifyBody): Promise<ClassifyResponse | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  const prompt = PROMPT
    .replace('{description}', body.system_description)
    .replace('{biometrics}', String(Boolean(body.uses_biometrics)))
    .replace('{decisions}', String(Boolean(body.makes_critical_decisions)))
    .replace('{education}', String(Boolean(body.used_in_education_or_employment)))
    .replace('{justice}', String(Boolean(body.used_in_law_enforcement_or_justice)))
    .replace('{gpai}', String(Boolean(body.is_general_purpose_ai)))
    .replace('{eu}', String(Boolean(body.eu_market_access)))

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
        max_tokens: 1500,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) {
      console.warn('[ai-act/classify] Sonnet HTTP', res.status)
      return null
    }
    const blob = (await res.json()) as { content?: Array<{ type: string; text?: string }> }
    const text = (blob.content ?? []).find((c) => c.type === 'text')?.text?.trim()
    if (!text) return null
    const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(cleaned) as Partial<ClassifyResponse>

    // Anti-hallucination filters
    const tier = parsed.risk_tier
    if (tier !== 'minimal' && tier !== 'limited' && tier !== 'high' && tier !== 'unacceptable') {
      return null
    }
    const articles = (parsed.articles_cited ?? []).filter((a) => ALLOWED_ARTICLE_RE.test(a)).slice(0, 10)
    const annexes = (parsed.annex_sections_cited ?? []).filter((a) => ALLOWED_ANNEX_RE.test(a)).slice(0, 8)
    const checklist = (parsed.documentation_checklist ?? []).map((c) => String(c).slice(0, 280)).slice(0, 10)
    const rationale = String(parsed.rationale ?? '').slice(0, 1200)

    if (!rationale || checklist.length === 0) return null

    return {
      classification_id: '',
      risk_tier: tier,
      rationale,
      articles_cited: articles,
      annex_sections_cited: annexes,
      documentation_checklist: checklist,
      legal_notice:
        'Decision-support intelligence — not a legal opinion. Confirm classification with EU-qualified counsel before relying on it for compliance filings or product decisions.',
      disclaimer_version: 'v1.0.0-p4',
      generated_at: new Date().toISOString(),
    }
  } catch (err) {
    console.warn('[ai-act/classify] Sonnet call failed:', err)
    return null
  }
}

function isValid(input: unknown): input is ClassifyBody {
  if (!input || typeof input !== 'object') return false
  const o = input as Record<string, unknown>
  return (
    typeof o.email === 'string' &&
    o.email.includes('@') &&
    typeof o.system_description === 'string' &&
    o.system_description.trim().length >= 40 &&
    o.system_description.trim().length <= 4000 &&
    typeof o.eu_market_access === 'boolean'
  )
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  if (!isValid(body)) {
    return NextResponse.json(
      { error: 'email, system_description (40-4000 chars), and eu_market_access are required' },
      { status: 400 }
    )
  }

  const result = await classifyWithSonnet(body)
  if (!result) {
    return NextResponse.json(
      { error: 'classifier_unavailable; please retry shortly.' },
      { status: 503 }
    )
  }

  // Persist to ai_act_classifications. Service-role; non-fatal.
  let classificationId = ''
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('ai_act_classifications')
      .insert({
        user_email: body.email.toLowerCase(),
        system_description: body.system_description,
        risk_tier: result.risk_tier,
        articles_cited: result.articles_cited,
        annex_sections_cited: result.annex_sections_cited,
        documentation_checklist: result.documentation_checklist,
        rationale: result.rationale,
        flags: {
          uses_biometrics: Boolean(body.uses_biometrics),
          makes_critical_decisions: Boolean(body.makes_critical_decisions),
          used_in_education_or_employment: Boolean(body.used_in_education_or_employment),
          used_in_law_enforcement_or_justice: Boolean(body.used_in_law_enforcement_or_justice),
          is_general_purpose_ai: Boolean(body.is_general_purpose_ai),
          eu_market_access: Boolean(body.eu_market_access),
        },
      })
      .select('id')
      .single()
    if (!error && data) classificationId = String(data.id)
  } catch (err) {
    console.warn('[ai-act/classify] persist failed:', err)
  }

  logEventAsync({
    type: 'aiact.classified',
    source: 'hub',
    ref_id: classificationId || undefined,
    email: body.email,
    status: 'ok',
    metadata: {
      risk_tier: result.risk_tier,
      articles_cited_count: result.articles_cited.length,
      annex_count: result.annex_sections_cited.length,
      checklist_count: result.documentation_checklist.length,
      eu_market_access: Boolean(body.eu_market_access),
      is_general_purpose_ai: Boolean(body.is_general_purpose_ai),
    },
  })

  return NextResponse.json({ ...result, classification_id: classificationId })
}
