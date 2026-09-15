import type { NextRequest, NextResponse } from 'next/server'
// noop to keep imports stable; real route added below if needed
export function GET() {
  return Response.json({ ok: true, demo: true })
}
