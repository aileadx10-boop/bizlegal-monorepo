import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

// POST /api/brai/invoice
// STOP-SOLD 2026-09-02 (fleet finding F4/brai): BRAI has no report-generation
// or fulfillment code — a paid invoice produced only an email. The
// /blockchain-report gate now captures a waitlist instead of selling, and
// this route refuses to create new invoices so no money can be taken
// through it. The matching /api/brai/webhook stays live to log/handle any
// already-issued invoice that still completes.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { email?: string } | null
  logEventAsync({
    type: 'payment.intent',
    source: 'brai',
    email: body?.email ?? undefined,
    status: 'failed',
    metadata: { product: 'brai_report', note: 'invoice_refused_stop_sell' },
  })
  return NextResponse.json(
    { error: 'brai_checkout_paused', message: 'BRAI paid reports are paused — join the waitlist on the report page.' },
    { status: 410 },
  )
}
