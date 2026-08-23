import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t')
  if (token !== process.env.OPS_DASHBOARD_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  return NextResponse.json({
    app: 'coguard',
    env: process.env.NEXT_PUBLIC_COGUARD_SITE_URL ?? 'https://coguard.bizlegal-ai.com',
    features: ['biff-neutralization', 'sha256-log', 'court-binder', 'attorney-portal'],
    ts: new Date().toISOString(),
  })
}
