/**
 * /api/closings/[id]
 *
 * GET   — return full transaction with checklist + recomputed deadlines
 * PATCH — mark a checklist task complete/incomplete
 *         Body: { task_key: string, completed: boolean }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db/client'
import { deriveDeadlines, isTransactionType } from '@/lib/closing/date-calculator'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

interface RouteContext {
  params: { id: string }
}

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 })

  const db = getServiceClient()
  const { data, error } = await db
    .from('closeflow_transactions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  // Recompute live deadlines from the stored closing_date
  let deadlines: ReturnType<typeof deriveDeadlines> = []
  if (isTransactionType(data.transaction_type)) {
    const closingDateObj = new Date(`${data.closing_date}T00:00:00.000Z`)
    if (!Number.isNaN(closingDateObj.getTime())) {
      deadlines = deriveDeadlines(closingDateObj, data.transaction_type)
    }
  }

  return NextResponse.json({
    ok: true,
    transaction: {
      ...data,
      deadlines: deadlines.map((d) => ({
        key: d.key,
        label: d.label,
        due_date: d.dueDate.toISOString().slice(0, 10),
        days_until: Math.round(
          (d.dueDate.getTime() - Date.now()) / 86_400_000
        ),
        offset_business_days: d.offsetBusinessDays,
      })),
    },
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { task_key, completed } = body as Record<string, unknown>
  if (typeof task_key !== 'string' || !task_key) {
    return NextResponse.json({ error: 'task_key_required' }, { status: 400 })
  }
  if (typeof completed !== 'boolean') {
    return NextResponse.json({ error: 'completed_must_be_boolean' }, { status: 400 })
  }

  const db = getServiceClient()

  // Fetch current checklist
  const { data, error: fetchErr } = await db
    .from('closeflow_transactions')
    .select('checklist, email')
    .eq('id', id)
    .single()

  if (fetchErr || !data) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const checklist = Array.isArray(data.checklist) ? data.checklist : []
  const now = new Date().toISOString()

  const updated = checklist.map((task: Record<string, unknown>) => {
    if (task.key !== task_key) return task
    return {
      ...task,
      completed_at: completed ? now : null,
    }
  })

  if (!updated.some((t: Record<string, unknown>) => t.key === task_key)) {
    return NextResponse.json({ error: 'task_key_not_found' }, { status: 404 })
  }

  const { error: updateErr } = await db
    .from('closeflow_transactions')
    .update({ checklist: updated })
    .eq('id', id)

  if (updateErr) {
    console.error('[closings/[id]] update failed', updateErr.message)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  logEventAsync({
    type: 'cron.completed',
    source: 'leaseparse',
    ref_id: id,
    email: typeof data.email === 'string' ? data.email : undefined,
    status: 'ok',
    metadata: { step: 'task_toggled', task_key, completed },
  })

  return NextResponse.json({ ok: true, task_key, completed, updated_at: now })
}
