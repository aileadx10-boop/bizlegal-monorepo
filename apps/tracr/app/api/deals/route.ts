import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('trcr_deals')
    .select('*, trcr_clients(name, company)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { data, error } = await supabase
    .from('trcr_deals')
    .insert({
      title: body.title,
      client_id: body.client_id || null,
      stage: body.stage || 'lead',
      value: body.value || 0,
      currency: body.currency || 'USD',
      doc_type: body.doc_type || null,
      priority: body.priority || 'medium',
      deadline: body.deadline || null,
      description: body.description || null,
      source: body.source || null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
