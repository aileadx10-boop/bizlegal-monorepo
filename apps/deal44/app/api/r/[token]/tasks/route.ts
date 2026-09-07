import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'
import { resolveRoomByToken, recordEvent } from '@/lib/rooms/create'
import { addTaskSchema } from '@/lib/rooms/schemas'
import { canManageRoom } from '@/lib/rooms/access'
import { getServiceClient } from '@/lib/db'

/**
 * POST /api/r/[token]/tasks — the broker adds one task by hand.
 *
 * This is the Phase-0 critical path, not a convenience. The Israeli template
 * ships `reviewed: false`, so `createRoom` refuses to date anything from it and
 * every real room starts empty. Without this route a paid room is a blank page.
 *
 * A manual task carries `label_text` (the broker's own words) rather than an
 * i18n key, and its date is whatever the broker types off the contract — no
 * engine, no template, nothing inferred. That is the honest shape while the
 * template is under review: the dates are the broker's, and they are labelled
 * as coming from the contract rather than from us.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 15

interface Ctx {
  params: { token: string }
}

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const limit = rateLimit('deal44-task-add', clientIpFromHeaders(req.headers) ?? 'unknown', {
    limit: 60,
    windowMs: 60_000,
  })
  if (!limit.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  const resolved = await resolveRoomByToken(params.token)
  if (!resolved) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // Only the broker shapes the checklist. A buyer adding tasks for a seller is
  // how a shared checklist turns into an argument.
  if (!canManageRoom(resolved.party.role)) {
    return NextResponse.json({ error: 'not_permitted' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = addTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', detail: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) },
      { status: 400 },
    )
  }
  const input = parsed.data

  const db = getServiceClient()

  // `key` is unique per deal. Derive a stable slug from the label and
  // disambiguate with a counter rather than a timestamp, so a re-submitted form
  // does not quietly create a second identical row.
  const base =
    input.label_text
      .toLowerCase()
      .replace(/[^a-z0-9֐-׿]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'task'

  const { data: existing } = await db
    .from('deal_tasks')
    .select('key')
    .eq('deal_id', resolved.deal.id)
    .like('key', `${base}%`)

  const taken = new Set((existing ?? []).map((r) => String(r.key)))
  let key = base
  let n = 2
  while (taken.has(key)) key = `${base}_${n++}`

  const { data, error } = await db
    .from('deal_tasks')
    .insert({
      deal_id: resolved.deal.id,
      key,
      label_key: null,
      label_text: input.label_text,
      phase: input.phase,
      assignee_role: input.assignee_role,
      day_type: 'calendar',
      due_date: input.due_date,
      statutory: input.statutory,
      origin: 'manual',
      status: 'open',
      sort_order: resolved.tasks.length,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: 'db_error', detail: error.message }, { status: 500 })
  }

  await recordEvent(resolved.deal.id, resolved.party.id, resolved.party.role, 'task.added', {
    key,
    assignee_role: input.assignee_role,
    due_date: input.due_date,
  })

  return NextResponse.json({ ok: true, task: data })
}
