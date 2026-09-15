import { NextResponse } from 'next/server'
import { apiHealth } from '@/lib/neon'

export async function GET() {
  const health = await apiHealth()
  return NextResponse.json(health, { status: health.ok ? 200 : 502 })
}
