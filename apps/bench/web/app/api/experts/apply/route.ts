import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@bizlegal/email'
import { dbInsert } from '@/lib/db'
import { logEventAsync } from '@/lib/ops/log'
import { clientKey, isRateLimited } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * POST /api/experts/apply — talent-side intake. Writes
 * bench_expert_applications and sends one transactional acknowledgement.
 * Admission decisions are human (wf_expert_onboarding) — nothing here
 * decides anything.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const JURISDICTIONS = new Set(['EU', 'UK', 'UAE', 'Other'])

interface ApplyBody {
  full_name?: string
  email?: string
  jurisdiction?: string
  practice_areas?: string
  pqe_years?: string | number
  credentials?: string
  languages?: string
  availability_hours?: string | number
  sample_work_url?: string
}

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

function int(v: unknown, min: number, max: number): number | null {
  const n = typeof v === 'number' ? v : Number.parseInt(String(v ?? ''), 10)
  if (Number.isNaN(n) || n < min || n > max) return null
  return n
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (isRateLimited(`experts:${clientKey(req)}`)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  let body: ApplyBody
  try {
    body = (await req.json()) as ApplyBody
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const email = str(body.email, 254).toLowerCase()
  const fullName = str(body.full_name, 160)
  const jurisdiction = str(body.jurisdiction, 20)
  const practiceAreas = str(body.practice_areas, 300)
  const credentials = str(body.credentials, 1500)
  const pqe = int(body.pqe_years, 0, 60)

  if (!EMAIL_RE.test(email) || !fullName || !JURISDICTIONS.has(jurisdiction) || !practiceAreas || !credentials || pqe === null) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
  }

  const stored = await dbInsert('bench_expert_applications', {
    email,
    full_name: fullName,
    jurisdiction,
    practice_areas: practiceAreas,
    pqe_years: pqe,
    languages: str(body.languages, 200) || null,
    credentials,
    availability_hours: int(body.availability_hours, 1, 40),
    sample_work_url: str(body.sample_work_url, 500) || null,
  })

  if (!stored) {
    logEventAsync({ type: 'error', source: 'bench', email, status: 'failed', metadata: { where: 'expert_apply_insert' } })
    return NextResponse.json({ ok: false, error: 'store_failed' }, { status: 503 })
  }

  logEventAsync({
    type: 'lead.inbound',
    source: 'bench',
    email,
    status: 'ok',
    metadata: { kind: 'expert_application', jurisdiction, pqe_years: pqe },
  })

  const ack = await sendEmail({
    to: email,
    kind: 'transactional',
    subject: 'Bench — expert application received',
    text: [
      `Thank you, ${fullName.split(' ')[0]} — your application to the Bench expert network is in review.`,
      '',
      'What happens next:',
      '1. A human reviews your credentials against open bench capacity.',
      '2. If there is a match, you receive a paid test task ($100 flat, 72-hour window).',
      '3. A calibration round follows; admission is decided by a person.',
      '',
      'Everything stays asynchronous — no calls, no video, no public profile.',
      '',
      'Bench by BizLegal AI — the evaluation lab for legal AI.',
    ].join('\n'),
  })

  if (ack.ok) {
    logEventAsync({ type: 'email.sent', source: 'bench', email, status: 'ok', metadata: { template: 'expert_apply_ack' } })
  }

  return NextResponse.json({ ok: true })
}

export function GET(): NextResponse {
  return NextResponse.json({ ok: true, service: 'bench', endpoint: 'experts/apply', method: 'POST' })
}
