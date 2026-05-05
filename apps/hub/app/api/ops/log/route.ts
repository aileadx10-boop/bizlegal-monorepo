import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { logEvent } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * POST /api/ops/log
 *
 * HMAC-signed remote logger so subdomain services can write to the
 * shared ops_events table without each carrying the Supabase service-
 * role key. Signature header: x-bizlegal-signature (sha256 over body).
 *
 * Body shape mirrors LogEventInput from lib/ops/log.ts.
 */

interface LogBody {
  type: string
  source: string
  ref_id?: string
  email?: string
  amount_cents?: number
  status?: string
  metadata?: Record<string, unknown>
}

function verifyHmac(body: string, sig: string | null, secret: string): boolean {
  if (!sig || !secret) return false
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  if (expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  }
  return diff === 0
}

const ALLOWED_TYPES = new Set([
  'payment.intent', 'payment.confirmed', 'payment.failed', 'payment.refunded',
  'subscription.created', 'subscription.renewed', 'subscription.cancelled',
  'lead.inbound', 'lead.qualified',
  'email.sent', 'email.failed',
  'cron.fired', 'cron.completed',
  'sqa.draft', 'dpa.negotiation', 'psp.audit', 'risk.analysis', 'risk.assessment',
  'jurisdiction.compare', 'snapshot.generated', 'cert.released',
  'kb.uploaded', 'framework.changed',
  'boi.subscribed', 'boi.alert.sent',
  // Referrals (OCI deal router — asymmetric pillar)
  'referral.received', 'referral.routed', 'referral.responded', 'referral.closed', 'referral.paid',
  'referral.alert', 'referral.contract_email',
  // Nurture machine (Phase AA V3)
  'nurture.email.sent', 'nurture.opt_out',
  // Connection / monitoring (Phase V0)
  'routing.attempted', 'curation.action', 'heartbeat',
  // V2 agents (Phase V1-V6)
  'aiact.classified', 'policy.refreshed', 'legal.cite_audit', 'connect.threshold_crossed',
  'mica.audit.generated', 'sdn.match_detected', 'dao.recommendation',
  'download.report', 'report.generated', 'agent.checkout', 'webhook.received', 'error',
])

const ALLOWED_SOURCES = new Set(['hub', 'docai', 'lexaudit', 'tracr', 'brai', 'forge', 'leadforge', 'oci', 'worker'])

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text()
    const sig = req.headers.get('x-bizlegal-signature')
    const secret = process.env.BIZLEGAL_INBOUND_SECRET ?? ''
    if (!verifyHmac(raw, sig, secret)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = JSON.parse(raw) as LogBody
    if (!ALLOWED_TYPES.has(body.type)) {
      return NextResponse.json({ error: `unknown type: ${body.type}` }, { status: 400 })
    }
    if (!ALLOWED_SOURCES.has(body.source)) {
      return NextResponse.json({ error: `unknown source: ${body.source}` }, { status: 400 })
    }

    await logEvent({
      type: body.type as Parameters<typeof logEvent>[0]['type'],
      source: body.source as Parameters<typeof logEvent>[0]['source'],
      ref_id: body.ref_id,
      email: body.email,
      amount_cents: body.amount_cents,
      status: body.status as Parameters<typeof logEvent>[0]['status'],
      metadata: body.metadata,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
