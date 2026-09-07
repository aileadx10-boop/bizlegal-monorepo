/**
 * Creating a room, and resolving a party from a link.
 *
 * One code path, used by the Phase-0 admin route today and by the broker
 * dashboard in Phase 1, so the two can never drift into different rules about
 * what a valid room is.
 */

import { getServiceClient, type DealRow, type PartyRow, type TaskRow } from '@/lib/db'
import { encryptToken, hashToken, isExpired, mintToken, tokenExpiryFor } from './tokens'
import { logEventAsync } from '@/lib/ops/log'
import {
  IL_WORKING_WEEK,
  MON_FRI,
  getTemplate,
  materialiseTasks,
  templateAccepts,
  type TaskTemplate,
} from '@bizlegal/closing-engine'
import type { CreateRoomInput } from './schemas'

export interface CreatedParty {
  readonly id: string
  readonly role: string
  readonly display_name: string
  readonly email: string
  readonly locale: string
  /** The raw token. Returned exactly once, at creation. Never stored. */
  readonly token: string
}

export interface CreateRoomResult {
  readonly deal: DealRow
  readonly parties: readonly CreatedParty[]
  readonly warnings: readonly string[]
}

export class RoomError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    detail?: string,
  ) {
    super(detail ?? code)
  }
}

/**
 * The working week for a jurisdiction.
 *
 * Israel and the Gulf run Sun–Thu; the US, UK and most of Europe run Mon–Fri.
 * Getting this wrong is not a rounding error — it shifts every business-day
 * deadline in the room, in both directions.
 *
 * Holidays are not attached to either: an empty table is reported as
 * "not configured" and shown to the user, which is honest, whereas a stale
 * hardcoded list is confidently wrong. See packages/closing-engine/src/holidays.
 */
export function calendarFor(jurisdiction: string) {
  const sunToThu = new Set(['IL', 'AE', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO'])
  return sunToThu.has(jurisdiction.toUpperCase()) ? IL_WORKING_WEEK : MON_FRI
}

function resolveTemplate(templateId: string | null): TaskTemplate | null {
  if (!templateId) return null
  const template = getTemplate(templateId)
  if (!template) throw new RoomError('unknown_template', 400, templateId)
  return template
}

export async function createRoom(input: CreateRoomInput): Promise<CreateRoomResult> {
  const db = getServiceClient()
  const template = resolveTemplate(input.template_id ?? null)

  // An unreviewed template no longer blocks room creation (founder decision,
  // 2026-09-07). It is surfaced instead: the engine emits a
  // `template_not_reviewed` warning, `buildRoomPayload` passes it through, and
  // every party sees a banner saying these dates are a working list rather than
  // confirmed deadlines.
  //
  // The honesty stays where it matters — on the screen the parties actually
  // read — instead of in an error the broker cannot get past.

  const roles = [input.broker.role ?? 'broker', ...input.parties.map((p) => p.role)]
  if (template) {
    for (const role of roles) {
      if (!templateAccepts(template, 'roles', role)) {
        throw new RoomError('unknown_role', 400, role)
      }
    }
  }

  const { data: dealData, error: dealErr } = await db
    .from('deals')
    .insert({
      title: input.title,
      locale: input.locale,
      currency: input.currency,
      jurisdiction: template?.jurisdiction ?? input.jurisdiction ?? 'IL',
      deal_type: input.deal_type ?? 'residential_purchase',
      template_id: input.template_id ?? null,
      anchors: input.anchors,
      email: input.broker.email,
      status: 'open',
      created_by: 'moses',
    })
    .select('*')
    .single()

  if (dealErr || !dealData) {
    throw new RoomError('deal_insert_failed', 500, dealErr?.message)
  }
  const deal = dealData as DealRow

  // ── Parties, each with a freshly minted token ─────────────────────────────
  const expiresAt = tokenExpiryFor(input.anchors.closing ?? null)
  // The party who opens the room manages it. Flagged explicitly rather than
  // inferred from the role name, which is template vocabulary — the US set
  // calls this person 'agent', not 'broker'.
  const people = [
    { ...input.broker, role: input.broker.role ?? 'broker', can_manage: true },
    ...input.parties.map((p) => ({ ...p, can_manage: false })),
  ]
  const minted = people.map((person) => ({ person, token: mintToken() }))

  const { data: partyData, error: partyErr } = await db
    .from('deal_parties')
    .insert(
      minted.map(({ person, token }) => ({
        deal_id: deal.id,
        role: person.role,
        display_name: person.name,
        email: person.email,
        locale: person.locale ?? input.locale,
        token_hash: hashToken(token),
        token_cipher: encryptToken(token),
        token_expires_at: expiresAt,
        can_manage: person.can_manage,
      })),
    )
    .select('*')

  if (partyErr || !partyData) {
    throw new RoomError('party_insert_failed', 500, partyErr?.message)
  }

  const parties: CreatedParty[] = (partyData as PartyRow[]).map((row) => {
    const match = minted.find((m) => hashToken(m.token) === row.token_hash)
    return {
      id: row.id,
      role: row.role,
      display_name: row.display_name,
      email: row.email,
      locale: row.locale,
      token: match?.token ?? '',
    }
  })

  // ── Tasks ────────────────────────────────────────────────────────────────
  const warnings: string[] = []
  if (template) {
    const { tasks, warnings: engineWarnings } = materialiseTasks(
      template,
      input.anchors,
      calendarFor(deal.jurisdiction),
    )
    warnings.push(...engineWarnings)

    if (tasks.length > 0) {
      const { error: taskErr } = await db.from('deal_tasks').insert(
        tasks.map((task, index) => ({
          deal_id: deal.id,
          key: task.key,
          // Exactly one of these, enforced by a CHECK on the table. A template
          // written in the deal's own language (the US set) carries its text;
          // one the app translates (Israel) carries a key.
          label_key: task.labelKey,
          label_text: task.labelKey ? null : task.labelText,
          phase: task.phase,
          assignee_role: task.assigneeRole,
          anchor: task.anchor,
          offset_days: task.offset,
          day_type: task.dayType,
          due_date: task.dueDate,
          statutory: task.statutory,
          source: task.source,
          // The chain, not just the answer. A date with no provenance cannot be
          // challenged, which is how a computed guess passes for a legal fact.
          provenance: task.provenance,
          no_date_reason: task.noDateReason,
          legal_review: task.legalReview,
          origin: 'template' as const,
          status: 'open' as const,
          sort_order: index,
        })),
      )
      if (taskErr) throw new RoomError('task_insert_failed', 500, taskErr.message)
    }
  }

  await recordEvent(deal.id, null, 'moses', 'room.created', {
    template_id: input.template_id ?? null,
    party_count: parties.length,
    warnings,
  })

  logEventAsync({
    type: 'agent.checkout',
    source: 'deal44',
    ref_id: deal.id,
    email: input.broker.email,
    status: 'ok',
    metadata: { step: 'room_created', template_id: input.template_id ?? null },
  })

  return { deal, parties, warnings }
}

// ── Reading a room through a link ───────────────────────────────────────────

export interface ResolvedRoom {
  readonly deal: DealRow
  readonly party: PartyRow
  readonly parties: readonly PartyRow[]
  readonly tasks: readonly TaskRow[]
}

/**
 * Resolve a raw link token to its party and room.
 *
 * Returns null for unknown and expired tokens alike — the caller renders the
 * same not-found page for both, so a probe cannot distinguish "wrong token"
 * from "expired token".
 */
export async function resolveRoomByToken(token: string): Promise<ResolvedRoom | null> {
  if (!token || token.length < 16) return null
  const db = getServiceClient()

  const { data: partyData, error: partyErr } = await db
    .from('deal_parties')
    .select('*')
    .eq('token_hash', hashToken(token))
    .maybeSingle()

  if (partyErr || !partyData) return null
  const party = partyData as PartyRow
  if (isExpired(party.token_expires_at)) return null

  const [dealRes, partiesRes, tasksRes] = await Promise.all([
    db.from('deals').select('*').eq('id', party.deal_id).maybeSingle(),
    db.from('deal_parties').select('*').eq('deal_id', party.deal_id).order('created_at'),
    db.from('deal_tasks').select('*').eq('deal_id', party.deal_id).order('sort_order'),
  ])

  if (dealRes.error || !dealRes.data) return null

  return {
    deal: dealRes.data as DealRow,
    party,
    parties: (partiesRes.data ?? []) as PartyRow[],
    tasks: (tasksRes.data ?? []) as TaskRow[],
  }
}

/** Append to the audit tape. Best-effort: a room must not fail because logging did. */
export async function recordEvent(
  dealId: string,
  actorPartyId: string | null,
  actor: string,
  type: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  try {
    const db = getServiceClient()
    await db.from('deal_events').insert({
      deal_id: dealId,
      actor_party_id: actorPartyId,
      actor,
      type,
      payload,
    })
  } catch {
    // deliberate: the tape is evidence, not a gate
  }
}

/** Bump last_seen_at without blocking the render. */
export function touchParty(partyId: string): void {
  void (async () => {
    try {
      const db = getServiceClient()
      await db
        .from('deal_parties')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', partyId)
    } catch {
      /* best-effort */
    }
  })()
}
