import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

function slugifyJurisdiction(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export async function POST(req: NextRequest) {
  const authKey = req.headers.get('x-api-key')
  if (authKey !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()

    if (!data.title || !data.slug || !data.jurisdiction || !data.regulation || !data.cta_product) {
      return NextResponse.json({ error: 'Missing required fields: title, slug, jurisdiction, regulation, cta_product' }, { status: 400 })
    }

    const supabase = createServerClient()

    const row = {
      slug: data.slug,
      title: data.title,
      jurisdiction: slugifyJurisdiction(data.jurisdiction),
      regulation: data.regulation,
      risk_score: Math.max(0, Math.min(100, data.risk_score ?? 50)),
      summary: data.summary || '',
      value_props: data.value_props || [],
      lead_magnet_title: data.lead_magnet_title || null,
      lead_magnet_url: data.lead_magnet_url || null,
      cta_product: data.cta_product,
      meta_description: data.meta_description || null,
      published_at: new Date().toISOString(),
    }

    const { data: inserted, error } = await supabase
      .from('gap_pages')
      .upsert(row, { onConflict: 'slug' })
      .select()
      .single()

    if (error) {
      console.error('[scout] insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      slug: inserted.slug,
      url: `https://forge.bizlegal-ai.com/gap/${inserted.jurisdiction}/${inserted.slug}`,
    })
  } catch (err) {
    console.error('[scout] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
