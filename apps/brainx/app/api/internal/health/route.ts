import { NextResponse } from 'next/server'
import { dbHealth } from '@/lib/neon'

export async function GET() {
  const db = await dbHealth()
  return NextResponse.json({
    ok: db.ok,
    service: 'brainx',
    db: db.db || null,
    error: db.error || null,
  }, { status: db.ok ? 200 : 502 })
}
