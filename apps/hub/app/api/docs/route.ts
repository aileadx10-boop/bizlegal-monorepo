import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/docs
 *
 * Convenience redirect to the human-readable API docs page at /docs.
 */
export function GET(req: NextRequest): NextResponse {
  const target = new URL('/docs', req.url)
  return NextResponse.redirect(target, { status: 301 })
}
