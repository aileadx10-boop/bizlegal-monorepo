/**
 * POST /api/closings
 *
 * Creates a closing transaction: generates the dated checklist and derives
 * deadline milestones from the closing date, then persists to dd_transactions.
 *
 * This is CloseFlow's core — the LLM is not involved. Every result is
 * deterministic: same closing date + type always produces the same checklist.
 *
 * Body: { email, property_id?, transaction_type, closing_date, state? }
 * Returns: { transaction } with embedded checklist + deadlines
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db/client'
import { generateChecklist } from '@/lib/closing/checklist-templates'
import { deriveDeadlines, isTransactionType } from '@/lib/closing/date-calculator'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

interface ChecklistRow {
  key: string
  label: string
  phase: string
  due_date: string
  assignee: string
  completed_at: string | null
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { email, property_id, transaction_type, closing_date, state } =
    body as Record<string, unknown>

  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'email_required' }, { status: 400 })
  }
  if (!isTransactionType(transaction_type)) {
    return NextResponse.json(
      {
        error: 'invalid_transaction_type',
        valid: ['residential_purchase', 'residential_refi', 'commercial', 'exchange_1031'],
      },
      { status: 400 }
    )
  }
  if (typeof closing_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(closing_date)) {
    return NextResponse.json({ error: 'closing_date_required_iso' }, { status: 400 })
  }

  const closingDateObj = new Date(`${closing_date}T00:00:00.000Z`)
  if (Number.isNaN(closingDateObj.getTime())) {
    return NextResponse.json({ error: 'closing_date_invalid' }, { status: 400 })
  }
  if (closingDateObj < new Date()) {
    return NextResponse.json({ error: 'closing_date_must_be_future' }, { status: 400 })
  }

  const stateStr = typeof state === 'string' ? state : undefined

  // Generate checklist + deadlines deterministically
  const tasks = generateChecklist(transaction_type, closingDateObj, stateStr)
  const deadlines = deriveDeadlines(closingDateObj, transaction_type)

  const checklistRows: ChecklistRow[] = tasks.map((t) => ({
    key: t.key,
    label: t.label,
    phase: t.phase,
    due_date: t.dueDate.toISOString().slice(0, 10),
    assignee: t.assignee,
    completed_at: null,
  }))

  const db = getServiceClient()
  const { data, error } = await db
    .from('closeflow_transactions')
    .insert({
      email: email.toLowerCase(),
      property_id: typeof property_id === 'string' ? property_id : null,
      transaction_type,
      closing_date,
      status: 'active',
      checklist: checklistRows,
      documents_required: [],
      documents_uploaded: [],
    })
    .select()
    .single()

  if (error || !data) {
    console.error('[closings] insert failed', error?.message)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  logEventAsync({
    type: 'agent.checkout',
    source: 'leaseparse',
    ref_id: data.id,
    email: email.toLowerCase(),
    status: 'ok',
    metadata: {
      step: 'closing_created',
      transaction_type,
      closing_date,
      task_count: checklistRows.length,
      deadline_count: deadlines.length,
    },
  })

  return NextResponse.json(
    {
      ok: true,
      transaction: {
        ...data,
        deadlines: deadlines.map((d) => ({
          key: d.key,
          label: d.label,
          due_date: d.dueDate.toISOString().slice(0, 10),
          offset_business_days: d.offsetBusinessDays,
        })),
      },
    },
    { status: 201 }
  )
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const email = req.nextUrl.searchParams.get('email')
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'email_query_required' }, { status: 400 })
  }

  const db = getServiceClient()
  const { data, error } = await db
    .from('closeflow_transactions')
    .select('id, transaction_type, closing_date, status, created_at, property_id')
    .eq('email', email.toLowerCase())
    .order('closing_date', { ascending: true })
    .limit(50)

  if (error) {
    console.error('[closings] select failed', error.message)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, transactions: data ?? [] })
}
