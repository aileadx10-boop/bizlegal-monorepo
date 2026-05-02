import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const dealId = searchParams.get('deal_id')
  let query = supabase.from('trcr_activities').select('*').order('created_at', { ascending: false })
  if (dealId) query = query.eq('deal_id', dealId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { data, error } = await supabase
    .from('trcr_activities')
    .insert({
      deal_id: body.deal_id,
      type: body.type || 'note',
      title: body.title,
      body: body.body || null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
