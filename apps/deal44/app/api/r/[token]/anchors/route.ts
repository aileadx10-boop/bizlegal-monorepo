import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'
import { resolveRoomByToken, recordEvent, calendarFor } from '@/lib/rooms/create'
import { setAnchorsSchema } from '@/lib/rooms/schemas'
import { canManageRoom } from '@/lib/rooms/access'
import { getServiceClient } from '@/lib/db'
import { getTemplate, materialiseTasks } from '@bizlegal/closing-engine'

/**
 * POST /api/r/[token]/anchors — the broker moves the signing or delivery date.
 *
 * Closings slip. That is not an edge case, it is the normal life of a
 * transaction, and every template deadline is an offset from one of these two
 * dates — so moving a date has to re-date the whole checklist or the room
 * immediately starts lying.
 *
 * Two rules on the re-date:
 *  - Only tasks that came from the template move. A task the broker typed in by
 *    hand carries a date from the contract, and silently rewriting that would
 *    destroy the one thing they entered deliberately.
 *  - Completed tasks keep their due date. It is a record of what happened, and
 *    the date it was due when it was done does not change retroactively.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface Ctx {
  params: { token: string }
}

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const limit = rateLimit('deal44-anchors', clientIpFromHeaders(req.headers) ?? 'unknown', {
    limit: 20,
    windowMs: 60_000,
  })
  if (!limit.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  const resolved = await resolveRoomByToken(params.token)
  if (!resolved) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (!canManageRoom(resolved.party)) {
    return NextResponse.json({ error: 'not_permitted' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = setAnchorsSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_input' }, { status: 400 })

  const db = getServiceClient()
  const anchors = { ...resolved.deal.anchors, ...parsed.data.anchors }

  const { error: dealErr } = await db.from('deals').update({ anchors }).eq('id', resolved.deal.id)
  if (dealErr) return NextResponse.json({ error: 'db_error', detail: dealErr.message }, { status: 500 })

  let rescheduled = 0
  const warnings: string[] = []
  const template = resolved.deal.template_id ? getTemplate(resolved.deal.template_id) : undefined

  if (template) {
    const result = materialiseTasks(template, anchors, calendarFor(resolved.deal.jurisdiction))
    warnings.push(...result.warnings)
    const byKey = new Map(result.tasks.map((task) => [task.key, task]))

    for (const existing of resolved.tasks) {
      if (existing.origin !== 'template') continue
      if (existing.status === 'done') continue
      const fresh = byKey.get(existing.key)
      if (!fresh || fresh.dueDate === existing.due_date) continue
      const { error } = await db
        .from('deal_tasks')
        .update({ due_date: fresh.dueDate })
        .eq('id', existing.id)
      if (!error) rescheduled += 1
    }
  }

  await recordEvent(resolved.deal.id, resolved.party.id, resolved.party.role, 'anchor.changed', {
    anchors,
    rescheduled,
  })

  return NextResponse.json({ ok: true, anchors, rescheduled, warnings })
}
