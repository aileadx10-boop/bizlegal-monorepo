import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient, type DealRow, type PartyRow, type TaskRow } from '@/lib/db'
import { applySendCap, computeDigests, alertKey, digestIdempotencyKey } from '@/lib/alerts/compute'
import { buildDigest } from '@/lib/email/messages'
import { roomLink, sendRoomEmail } from '@/lib/email/send'
import { logEventAsync } from '@/lib/ops/log'
import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n/types'
import { decryptToken } from '@/lib/rooms/tokens'

/**
 * GET /api/cron/alerts — the daily deadline digest. 05:00 UTC (08:00 Israel).
 *
 * This is the product. A checklist nobody looks at is a spreadsheet; the thing
 * a broker pays for is a deadline arriving before it passes.
 *
 * Deliberately a plain Vercel cron and not an AI agent: a missed statutory date
 * on a lawyer-run product is malpractice-adjacent, and the root operating book
 * is explicit that deterministic execution belongs in code. Every date here
 * comes from the engine; no model is involved.
 *
 * `?dry=1` returns exactly what would be sent, and touches nothing.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/** Resend's free tier is 100/day across the whole fleet. Leave room for receipts. */
const DAILY_SEND_CAP = 90

function authorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET ?? ''
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!authorised(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const dry = req.nextUrl.searchParams.get('dry') === '1'
  const today = new Date()
  logEventAsync({ type: 'cron.fired', source: 'deal44', ref_id: 'alerts', status: 'ok' })

  const db = getServiceClient()

  // Only rooms that are open and paid for. An unactivated room is a draft.
  const { data: dealsData, error: dealsErr } = await db
    .from('deals')
    .select('*')
    .eq('status', 'open')
    .not('activated_at', 'is', null)

  if (dealsErr) {
    logEventAsync({
      type: 'cron.completed',
      source: 'deal44',
      ref_id: 'alerts',
      status: 'failed',
      metadata: { reason: dealsErr.message },
    })
    return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 })
  }

  const deals = (dealsData ?? []) as DealRow[]
  if (deals.length === 0) {
    logEventAsync({ type: 'cron.completed', source: 'deal44', ref_id: 'alerts', status: 'ok', metadata: { rooms: 0 } })
    return NextResponse.json({ ok: true, rooms: 0, sent: 0, dry })
  }

  const dealIds = deals.map((d) => d.id)
  const [partiesRes, tasksRes, alertsRes] = await Promise.all([
    db.from('deal_parties').select('*').in('deal_id', dealIds),
    db.from('deal_tasks').select('*').in('deal_id', dealIds).eq('status', 'open'),
    db.from('deal_alerts').select('task_id, party_id, tier').in('deal_id', dealIds).eq('kind', 'tier'),
  ])

  // Fail closed: if the sent-log cannot be read we do NOT know what has already
  // gone out, and re-announcing every deadline is how a reminder becomes spam.
  if (alertsRes.error) {
    logEventAsync({
      type: 'cron.completed',
      source: 'deal44',
      ref_id: 'alerts',
      status: 'failed',
      metadata: { reason: 'alert_ledger_unreadable' },
    })
    return NextResponse.json({ ok: false, error: 'alert_ledger_unreadable' }, { status: 503 })
  }

  const allParties = (partiesRes.data ?? []) as PartyRow[]
  const allTasks = (tasksRes.data ?? []) as TaskRow[]
  const alreadySent = new Set(
    (alertsRes.data ?? [])
      .filter((row) => row.task_id)
      .map((row) => alertKey(String(row.task_id), String(row.party_id), Number(row.tier))),
  )

  // Today's budget, minus what has already gone out today.
  const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const { count: sentToday } = await db
    .from('deal_alerts')
    .select('id', { count: 'exact', head: true })
    .gte('sent_at', startOfDay.toISOString())
    .in('kind', ['digest', 'invite'])
  let budget = Math.max(0, DAILY_SEND_CAP - (sentToday ?? 0))

  const plan: Array<{ deal: DealRow; digest: ReturnType<typeof computeDigests>[number] }> = []
  for (const deal of deals) {
    const parties = allParties.filter((p) => p.deal_id === deal.id)
    const tasks = allTasks.filter((t) => t.deal_id === deal.id)
    for (const digest of computeDigests(tasks, parties, alreadySent, today)) {
      plan.push({ deal, digest })
    }
  }

  const capped = applySendCap(
    plan.map((p) => p.digest),
    budget,
  )
  const cappedIds = new Set(capped.map((d) => d.party.id))
  const toSend = plan.filter((p) => cappedIds.has(p.digest.party.id))

  if (dry) {
    return NextResponse.json({
      ok: true,
      dry: true,
      rooms: deals.length,
      budget,
      would_send: toSend.map((p) => ({
        deal_id: p.deal.id,
        party: p.digest.party.display_name,
        role: p.digest.party.role,
        email: p.digest.party.email,
        crossings: p.digest.crossings.map((c) => ({
          task: c.taskKey,
          due: c.dueDate,
          days: c.daysUntil,
          tier: c.tier,
        })),
      })),
      skipped_for_cap: plan.length - toSend.length,
    })
  }

  let sent = 0
  let failed = 0
  for (const { deal, digest } of toSend) {
    if (budget <= 0) break
    const locale = isLocale(digest.party.locale) ? digest.party.locale : DEFAULT_LOCALE

    // The digest must link to the recipient's OWN room link. token_hash cannot
    // be reversed, so this comes from token_cipher — and when no key is
    // configured, or the row predates one, we send the digest with no button
    // rather than a link that goes somewhere wrong.
    const rawToken = decryptToken(digest.party.token_cipher)
    const built = buildDigest({
      locale,
      roomTitle: deal.title ?? '',
      party: digest.party,
      crossings: digest.crossings,
      openTasks: digest.openTasks,
      link: rawToken ? roomLink(rawToken) : null,
    })

    const key = digestIdempotencyKey(digest.party.id, today)
    const result = await sendRoomEmail({
      to: digest.party.email,
      built,
      idempotencyKey: key,
      dealId: deal.id,
    })

    if (!result.ok) {
      failed += 1
      continue
    }

    sent += 1
    budget -= 1

    // The ledger is written only after a successful send. Anything cut by the
    // cap keeps no tier row, so tomorrow's run picks it up rather than losing it.
    await db.from('deal_alerts').insert([
      { deal_id: deal.id, party_id: digest.party.id, kind: 'digest', idempotency_key: key, provider_id: result.id },
      ...digest.crossings.map((c) => ({
        deal_id: deal.id,
        party_id: digest.party.id,
        task_id: c.taskId,
        kind: 'tier' as const,
        tier: c.tier,
        idempotency_key: `deal44:tier:${c.taskId}:${digest.party.id}:${c.tier}`,
      })),
    ])
  }

  logEventAsync({
    type: 'cron.completed',
    source: 'deal44',
    ref_id: 'alerts',
    status: 'ok',
    metadata: { rooms: deals.length, planned: plan.length, sent, failed },
  })

  return NextResponse.json({ ok: true, rooms: deals.length, planned: plan.length, sent, failed })
}
