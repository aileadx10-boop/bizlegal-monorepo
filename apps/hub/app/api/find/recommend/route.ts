import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getProduct } from '@bizlegal/payment'
import { GUIDES } from '@/lib/guides'
import { runEaTask } from '@/lib/agents/ea-runner'
import { recommend, type FinderAnswers } from '@/lib/product-finder/routing'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/find/recommend
 *
 * Body: { company, need, crypto } — the 3 product-finder quiz answers.
 * Deterministic routing picks the product/guide; ONE Haiku call writes a warm
 * "why this fits you" line. Never blocks on the LLM — a templated fallback
 * renders if runEaTask fails. No email is required or collected here.
 */
const AnswersSchema = z.object({
  company: z.enum(['saas', 'fintech', 'crypto', 'marketplace', 'other']),
  need: z.enum(['contract_review', 'compliance_proof', 'filing_deadline', 'ongoing_monitoring', 'exploring']),
  crypto: z.enum(['yes', 'no']),
})

interface RecommendResponse {
  kind: 'product' | 'guide'
  title: string
  priceLabel: string | null
  why: string
  destinationUrl: string
  ctaLabel: string
}

function priceLabelFor(amountCents: number, interval: string): string {
  const dollars = Math.round(amountCents / 100)
  if (interval === 'monthly') return `$${dollars}/mo`
  if (interval === 'yearly') return `$${dollars}/yr`
  return `$${dollars} one-time`
}

async function writeWhy(context: string, fallback: string): Promise<string> {
  const result = await runEaTask({
    task: 'product-finder-why',
    model: 'haiku',
    systemPrompt:
      'You write ONE warm, specific 2-3 sentence explanation telling a visitor why a recommended BizLegal AI resource fits their situation. Direct and concrete, no hype, no emoji, no exclamation marks. Use only the facts given — never invent features, prices, guarantees, or outcomes. Never state or imply it is legal advice; frame BizLegal as decision-support tooling. Address the reader as "you".',
    userMessage: context,
    maxTokens: 160,
  })
  const text = result.ok ? result.text.trim() : ''
  return text.length >= 20 ? text : fallback
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const json = await req.json().catch(() => null)
  const parsed = AnswersSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid answers' }, { status: 400 })
  }
  const answers: FinderAnswers = parsed.data
  const rec = recommend(answers)

  if (rec.productId) {
    const product = getProduct(rec.productId)
    const priceLabel = priceLabelFor(product.amount_cents, product.billing_interval)
    const fallback = `Based on what you told us, ${product.name} (${priceLabel}) is the most direct fit — ${product.description}`
    const why = await writeWhy(
      `Recommended product: ${product.name} (${priceLabel}). What it is: ${product.description}. Why it was chosen: ${rec.rationale}. The visitor is a ${answers.company} company. Write the "why this fits you" note.`,
      fallback,
    )
    const body: RecommendResponse = {
      kind: 'product',
      title: product.name,
      priceLabel,
      why,
      destinationUrl: product.checkout_origin,
      ctaLabel: product.billing_interval === 'one-time' ? `Start — ${priceLabel}` : `Get started — ${priceLabel}`,
    }
    return NextResponse.json(body)
  }

  // Guide branch
  const href = rec.guideHref ?? '/guides'
  const guide = GUIDES.find((g) => g.href === href)
  const title = guide?.title ?? 'Compliance guides'
  const fallback = guide
    ? `A good place to start: "${guide.title}". ${guide.description}`
    : 'Start with our compliance guides — practitioner-written and free to read.'
  const why = await writeWhy(
    `Recommended free guide: "${title}". ${guide?.description ?? ''} Why it was chosen: ${rec.rationale}. The visitor is a ${answers.company} company, early-stage and exploring. Write the "why start here" note.`,
    fallback,
  )
  const body: RecommendResponse = {
    kind: 'guide',
    title,
    priceLabel: null,
    why,
    destinationUrl: href,
    ctaLabel: 'Read the guide',
  }
  return NextResponse.json(body)
}
