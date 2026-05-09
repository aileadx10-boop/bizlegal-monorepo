import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

import type { GapPage } from '@/lib/types/gap-page'
import { isFaqEntry } from '@/lib/types/gap-page'

// Force dynamic to ensure runtime env (Supabase service role) is read at
// request time, not at build time. Mirrors lead-magnet route convention.
export const dynamic = 'force-dynamic'

function slugifyJurisdiction(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function clampRiskScore(n: unknown): number {
  const v = typeof n === 'number' ? n : 50
  return Math.max(0, Math.min(100, Math.round(v)))
}

function asStringArray(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null
  const filtered = v.filter((x): x is string => typeof x === 'string' && x.length > 0)
  return filtered.length > 0 ? filtered : null
}

function asFaqArray(v: unknown): { q: string; a: string }[] | null {
  if (!Array.isArray(v)) return null
  const filtered = v.filter(isFaqEntry).map(e => ({ q: e.q, a: e.a }))
  return filtered.length > 0 ? filtered : null
}

const ALLOWED_CATEGORIES = new Set([
  'regulation',
  'enforcement',
  'guidance',
  'jurisdiction-arbitrage',
])

export async function POST(req: NextRequest) {
  const authKey = req.headers.get('x-api-key')
  if (authKey !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()

    if (!data.title || !data.slug || !data.jurisdiction || !data.regulation || !data.cta_product) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, jurisdiction, regulation, cta_product' },
        { status: 400 },
      )
    }

    const supabase = createServerClient()

    // W3.2 — accept enrichment fields (tags, faqs, primary_keyword,
    // secondary_keywords, category, E-E-A-T attribution). Each is
    // optional and validated. Pre-W3.2 callers continue to work; new
    // brain.py drafts (post-prompt-update) start populating them.
    const category =
      typeof data.category === 'string' && ALLOWED_CATEGORIES.has(data.category)
        ? data.category
        : null
    const primary_keyword =
      typeof data.primary_keyword === 'string' && data.primary_keyword.length > 0
        ? data.primary_keyword
        : null
    const secondary_keywords = asStringArray(data.secondary_keywords)
    const tags = asStringArray(data.tags)
    const faqs = asFaqArray(data.faqs)

    const row: Partial<GapPage> & { slug: string; published_at: string } = {
      slug: data.slug,
      title: data.title,
      jurisdiction: slugifyJurisdiction(data.jurisdiction),
      regulation: data.regulation,
      risk_score: clampRiskScore(data.risk_score),
      summary: data.summary || '',
      value_props: Array.isArray(data.value_props) ? data.value_props : [],
      lead_magnet_title: data.lead_magnet_title ?? null,
      lead_magnet_url: data.lead_magnet_url ?? null,
      cta_product: data.cta_product,
      meta_description: data.meta_description ?? null,
      category,
      primary_keyword,
      secondary_keywords,
      tags,
      faqs,
      author_name: typeof data.author_name === 'string' ? data.author_name : null,
      author_role: typeof data.author_role === 'string' ? data.author_role : null,
      author_bio: typeof data.author_bio === 'string' ? data.author_bio : null,
      reviewer_name: typeof data.reviewer_name === 'string' ? data.reviewer_name : null,
      reviewer_role: typeof data.reviewer_role === 'string' ? data.reviewer_role : null,
      reviewed_at: typeof data.reviewed_at === 'string' ? data.reviewed_at : null,
      published_at: new Date().toISOString(),
    }

    const { data: inserted, error } = await supabase
      .from('gap_pages')
      .upsert(row, { onConflict: 'slug' })
      .select()
      .single()

    if (error) {
      // eslint-disable-next-line no-console
      console.error('[scout] insert error:', error)
      return NextResponse.json({ error: 'gap_pages_upsert_failed' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      slug: inserted.slug,
      url: `https://forge.bizlegal-ai.com/gap/${inserted.jurisdiction}/${inserted.slug}`,
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[scout] error:', err)
    return NextResponse.json({ error: 'internal_server_error' }, { status: 500 })
  }
}
