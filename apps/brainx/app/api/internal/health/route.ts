import { NextResponse } from 'next/server'
import { sql } from '@/lib/neon'

export async function GET() {
  try {
    const rows = await sql`select 1 as ok`
    return NextResponse.json({ ok: rows?.[0]?.ok === 1, service: 'brainx' })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err).slice(0, 120) }, { status: 500 })
  }
}
