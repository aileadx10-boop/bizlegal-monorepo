import type { NextRequest } from 'next/server'

export function GET(_req: NextRequest) {
  return Response.json({ ok: true, event: 'sincefiled.log', demo: true })
}
