import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@bizlegal/ops-log'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/tools/obligation-extractor
 *
 * W4-10 (O-012) — Compliance Obligation Extractor. Paste a regulation or
 * contract, get structured obligations (obligation / party / deadline /
 * evidence_required / source_provision) via Sonnet structured-JSON
 * extraction, with a verbatim-citation allowlist + regex post-processor.
 *
 * REVENUE+LIABILITY framing: extraction is decision-support intelligence,
 * "for discussion — verify against the source text". Every obligation cites
 * the exact provision it was extracted from, and the post-processor DROPS
 * any obligation whose source_provision is not a verbatim substring of the
 * pasted text (anti-hallucination). Output is not a legal opinion.
 *
 * Anti-hallucination: the model is constrained to quote source_provision
 * VERBATIM from the input text. The post-processor normalizes both sides
 * and filters out any obligation whose provision is not a substring of the
 * source — so a fabricated cite can never survive.
 */

interface Obligation {
  obligation: string
  party: string
  deadline: string
  evidence_required: string
  source_provision: string
}

interface ExtractResponse {
  summary: string
  obligations: Obligation[]
  legal_notice: string
  disclaimer_version: string
  generated_at: string
}

interface ExtractBody {
  email?: string
  source_text: string
  source_url?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

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

/** Normalize for substring matching: lowercase, collapse whitespace. */
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

const PROMPT = `You are a compliance obligations extractor. Given a regulation,
contract, or compliance document, extract every concrete obligation it imposes.

Output STRICT JSON (no prose):
{
  "summary": "<2-3 sentence summary of what the document requires>",
  "obligations": [
    {
      "obligation": "<the action required, imperative voice>",
      "party": "<who must do it, using the document's own terminology>",
      "deadline": "<when it must be done, verbatim from the text, or 'Not specified'>",
      "evidence_required": "<what records/evidence must be kept, or 'Not specified'>",
      "source_provision": "<the exact provision cited, VERBATIM from the source text>"
    }
  ]
}

Constraints:
- source_provision MUST be a verbatim substring of the source text. Quote it exactly.
- Extract 3-15 obligations. Be comprehensive but do NOT invent obligations.
- deadline and evidence_required: use "Not specified" when the text is silent.
- party: use the document's own terminology (e.g. "the data controller", "the CASP", "the vendor").

=== SOURCE TEXT ===
{source_text}
=== END ===
`

async function extractWithSonnet(body: ExtractBody): Promise<ExtractResponse | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  const prompt = PROMPT.replace('{source_text}', body.source_text)

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
        max_tokens: 2500,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) {
      console.warn('[obligation-extractor] Sonnet HTTP', res.status)
      return null
    }
    const blob = (await res.json()) as { content?: Array<{ type: string; text?: string }> }
    const text = (blob.content ?? []).find((c) => c.type === 'text')?.text?.trim()
    if (!text) return null
    const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(cleaned) as { summary?: unknown; obligations?: unknown }

    const summary = String(parsed.summary ?? '').slice(0, 600)
    const raw = Array.isArray(parsed.obligations) ? parsed.obligations : []
    const sourceNorm = normalize(body.source_text)

    // Anti-hallucination: keep only obligations whose source_provision is a
    // verbatim substring of the pasted text.
    const obligations: Obligation[] = []
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue
      const o = item as Record<string, unknown>
      const provision = String(o.source_provision ?? '').trim()
      if (!provision || !normalize(provision) || !sourceNorm.includes(normalize(provision))) continue
      obligations.push({
        obligation: String(o.obligation ?? '').slice(0, 500),
        party: String(o.party ?? '').slice(0, 200),
        deadline: String(o.deadline ?? 'Not specified').slice(0, 200),
        evidence_required: String(o.evidence_required ?? 'Not specified').slice(0, 500),
        source_provision: provision.slice(0, 300),
      })
      if (obligations.length >= 15) break
    }

    if (!summary || obligations.length === 0) return null

    return {
      summary,
      obligations,
      legal_notice:
        'Extraction is decision-support intelligence for discussion — verify every obligation against the source text before acting. Not a legal opinion.',
      disclaimer_version: 'v1.0.0-w4-10',
      generated_at: new Date().toISOString(),
    }
  } catch (err) {
    console.warn('[obligation-extractor] Sonnet call failed:', err)
    return null
  }
}

function isValid(input: unknown): input is ExtractBody {
  if (!input || typeof input !== 'object') return false
  const o = input as Record<string, unknown>
  if (typeof o.source_text !== 'string') return false
  const len = o.source_text.trim().length
  if (len < 40 || len > 4000) return false
  if (o.email !== undefined && o.email !== null) {
    if (typeof o.email !== 'string' || !EMAIL_RE.test(o.email.trim())) return false
  }
  if (o.source_url !== undefined && o.source_url !== null && typeof o.source_url !== 'string') return false
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
      { error: 'source_text (40-4000 chars) is required; email optional' },
      { status: 400 }
    )
  }

  const result = await extractWithSonnet(body)
  if (!result) {
    return NextResponse.json(
      { error: 'extractor_unavailable; please retry shortly.' },
      { status: 503 }
    )
  }

  // Persist to obligation_extractions. Service-role; non-fatal.
  let extractionId = ''
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('obligation_extractions')
      .insert({
        user_email: body.email ? body.email.trim().toLowerCase() : null,
        source_text: body.source_text,
        source_url: body.source_url?.trim() || null,
        summary: result.summary,
        obligations: result.obligations,
        citations: result.obligations.map((o) => o.source_provision),
      })
      .select('id')
      .single()
    if (!error && data) extractionId = String(data.id)
  } catch (err) {
    console.warn('[obligation-extractor] persist failed:', err)
  }

  // Optional lead capture — never blocks the result.
  if (body.email) {
    try {
      const supabase = getSupabase()
      await supabase.from('leads').insert({
        email: body.email.trim().toLowerCase(),
        name: null,
        company: null,
        jurisdiction: null,
        source: 'obligation-extractor',
        page: '/tools/obligation-extractor',
        product: 'casp-bundle',
      })
      logEventAsync({
        type: 'lead.inbound',
        source: 'hub',
        email: body.email.trim().toLowerCase(),
        status: 'ok',
        metadata: { tool: 'obligation-extractor', obligations_count: result.obligations.length },
      })
    } catch (err) {
      console.warn('[obligation-extractor] lead capture failed:', err)
    }
  }

  logEventAsync({
    type: 'report.generated',
    source: 'hub',
    ref_id: extractionId || undefined,
    email: body.email?.trim().toLowerCase(),
    status: 'ok',
    metadata: {
      tool: 'obligation-extractor',
      obligations_count: result.obligations.length,
      citations_count: result.obligations.length,
      source_url: body.source_url?.trim() || null,
    },
  })

  return NextResponse.json({ ...result, extraction_id: extractionId })
}
