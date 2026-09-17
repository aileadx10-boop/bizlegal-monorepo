/**
 * SinceFiled data operations.
 * Live: writes to Supabase sf_obligations / sf_events / sf_firms.
 * Local: writes to local JSON store via ./state/store.
 */
import { canUseLive, getSupabase } from './supabase'
import { readFirmState, writeFirmState } from './state/store'

async function liveFirmId(ownerEmail: string): Promise<string | null> {
  const email = ownerEmail.toLowerCase()
  const { data, error } = await getSupabase()
    .from('sf_firms')
    .upsert({ owner_email: email, name: email.split('@')[0] || 'Firm' }, { onConflict: 'owner_email' })
    .select('id')
    .single()
  return error || !data ? null : String(data.id)
}

export async function createObligation(input: { ownerEmail?: string; obligationType: string; intervalDays: number; jurisdiction: string }): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (canUseLive()) {
    if (!input.ownerEmail) return { ok: false, error: 'unauthorized' }
    const firmId = await liveFirmId(input.ownerEmail)
    if (!firmId) return { ok: false, error: 'firm_unavailable' }
    const s = getSupabase()
    const { data, error } = await s.from('sf_obligations').insert({
      firm_id: firmId,
      obligation_type: input.obligationType,
      interval_days: input.intervalDays,
      jurisdiction: input.jurisdiction,
      last_event_at: new Date().toISOString(),
    }).select('id').single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, id: data?.id }
  }
  const firm = await readFirmState()
  const next = { ...firm, obligations: [...firm.obligations, { id: `o${firm.obligations.length + 1}`, obligationType: input.obligationType, intervalDays: input.intervalDays, jurisdiction: input.jurisdiction, lastEventAt: new Date().toISOString() }] }
  writeFirmState(next)
  return { ok: true, id: next.obligations.at(-1)?.id }
}


/** Opaque email-log token for future "reply to log" flow. Live inserts into sf_events.token; local returns deterministic token. */
export async function createEmailLogToken(input: { obligationId: string; ownerEmail?: string }): Promise<{ ok: boolean; token?: string; error?: string }> {
  const token = `sf-log-${input.obligationId}-${Date.now()}`
  if (canUseLive()) {
    if (!input.ownerEmail) return { ok: false, error: 'unauthorized' }
    const firmId = await liveFirmId(input.ownerEmail)
    if (!firmId) return { ok: false, error: 'firm_unavailable' }
    const { data: owned } = await getSupabase().from('sf_obligations').select('id').eq('id', input.obligationId).eq('firm_id', firmId).maybeSingle()
    if (!owned) return { ok: false, error: 'not_found' }
    const { error } = await getSupabase().from('sf_events').insert({ obligation_id: input.obligationId, event_at: new Date().toISOString(), source: 'email-token', token })
    if (error) return { ok: false, error: error.message }
    return { ok: true, token }
  }
  await logObligationEvent(input)
  return { ok: true, token }
}
export async function logObligationEvent(input: { obligationId: string; ownerEmail?: string }): Promise<{ ok: boolean; error?: string }> {
  if (canUseLive()) {
    if (!input.ownerEmail) return { ok: false, error: 'unauthorized' }
    const firmId = await liveFirmId(input.ownerEmail)
    if (!firmId) return { ok: false, error: 'firm_unavailable' }
    const s = getSupabase()
    const now = new Date().toISOString()
    const { data: updated, error: e2 } = await s.from('sf_obligations').update({ last_event_at: now }).eq('id', input.obligationId).eq('firm_id', firmId).select('id').maybeSingle()
    if (e2) return { ok: false, error: e2.message }
    if (!updated) return { ok: false, error: 'not_found' }
    const { error: e1 } = await s.from('sf_events').insert({ obligation_id: input.obligationId, event_at: now, source: 'api', token: `sf-${Math.random().toString(36).slice(2)}` })
    if (e1) return { ok: false, error: e1.message }
    return { ok: true }
  }
  const firm = await readFirmState()
  const next = { ...firm, obligations: firm.obligations.map((o) => o.id === input.obligationId ? { ...o, lastEventAt: new Date().toISOString() } : o) }
  writeFirmState(next)
  return { ok: true }
}

