import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'
import { resolveRoomByToken, recordEvent } from '@/lib/rooms/create'
import { buildRoomPayload } from '@/lib/rooms/payload'
import { toggleTaskSchema } from '@/lib/rooms/schemas'
import { canToggleTask } from '@/lib/rooms/access'
import { getServiceClient } from '@/lib/db'
import { logEventAsync } from '@/lib/ops/log'

/**
 * GET  — the room as the holder of this link may see it
 * PATCH — tick or untick one task
 *
 * The link token is the credential. It is rate-limited per IP because it is the
 * only thing standing between a probe and a room, and every mutation is checked
 * against the party's role rather than trusted from the client.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 15

interface Ctx {
  params: { token: string }
}

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const limit = rateLimit('deal44-room', clientIpFromHeaders(req.headers) ?? 'unknown', { limit: 60, windowMs: 60_000 })
  if (!limit.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  const resolved = await resolveRoomByToken(params.token)
  if (!resolved) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  return NextResponse.json({ ok: true, room: buildRoomPayload(resolved) })
}

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const limit = rateLimit('deal44-room-write', clientIpFromHeaders(req.headers) ?? 'unknown', {
    limit: 40,
    windowMs: 60_000,
  })
  if (!limit.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  const resolved = await resolveRoomByToken(params.token)
  if (!resolved) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = toggleTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 })
  }
  const { task_id, completed } = parsed.data

  const task = resolved.tasks.find((x) => x.id === task_id)
  if (!task) return NextResponse.json({ error: 'task_not_found' }, { status: 404 })

  // Authorisation is on the server, from the role the token resolved to — the
  // client's disabled checkbox is a courtesy, not a control.
  if (!canToggleTask(resolved.party.role, task.assignee_role)) {
    return NextResponse.json({ error: 'not_your_task' }, { status: 403 })
  }

  const db = getServiceClient()
  const { error } = await db
    .from('deal_tasks')
    .update({
      status: completed ? 'done' : 'open',
      completed_at: completed ? new Date().toISOString() : null,
      completed_by: completed ? resolved.party.id : null,
    })
    .eq('id', task_id)
    .eq('deal_id', resolved.deal.id)

  if (error) {
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  await recordEvent(resolved.deal.id, resolved.party.id, resolved.party.role, 'task.toggled', {
    task_key: task.key,
    completed,
  })

  logEventAsync({
    type: 'cron.completed',
    source: 'deal44',
    ref_id: resolved.deal.id,
    status: 'ok',
    metadata: { step: 'task_toggled', task_key: task.key, completed },
  })

  return NextResponse.json({ ok: true, task_id, completed })
}
