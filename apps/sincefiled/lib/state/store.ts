/**
 * SinceFiled state provider.
 *
 * Local demo mode: JSON file under .sincefiled-state/ (no API keys needed).
 * Live mode: reads/writes Supabase sf_firms / sf_obligations when env present.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { canUseLive, getSupabase } from '../supabase'

export interface FirmState {
  entitled: boolean
  firmName: string
  email: string
  obligations: Array<{
    id: string
    obligationType: string
    intervalDays: number
    jurisdiction: string
    lastEventAt: string
  }>
}

const DEFAULT_FIRM: FirmState = {
  entitled: false,
  firmName: 'Demo Firm LLP',
  email: 'demo@firm.com',
  obligations: [
    { id: 'o1', obligationType: 'Trust recon', intervalDays: 90, jurisdiction: 'US', lastEventAt: new Date().toISOString() },
    { id: 'o2', obligationType: 'CLE renewal', intervalDays: 365, jurisdiction: 'US', lastEventAt: new Date().toISOString() },
    { id: 'o3', obligationType: 'Oqood renewal', intervalDays: 180, jurisdiction: 'Dubai', lastEventAt: new Date().toISOString() },
  ],
}

const STATE_DIR = '.sincefiled-state'
const STATE_FILE = path.join(STATE_DIR, 'firm.json')

export async function readFirmState(ownerEmail?: string): Promise<FirmState> {
  if (canUseLive()) {
    if (!ownerEmail) throw new Error('owner email required')
    const s = getSupabase()
    const email = ownerEmail.toLowerCase()
    const { data: firm, error: firmError } = await s
      .from('sf_firms')
      .upsert({ owner_email: email, name: email.split('@')[0] || 'Firm' }, { onConflict: 'owner_email' })
      .select('id,name')
      .single()
    if (firmError || !firm) throw new Error(firmError?.message ?? 'firm unavailable')
    const [{ data: obligations, error: obligationsError }, { data: subscription, error: subscriptionError }] = await Promise.all([
      s.from('sf_obligations').select('id,obligation_type,interval_days,jurisdiction,last_event_at').eq('firm_id', firm.id).order('created_at'),
      s.from('sf_subscriptions').select('id').eq('firm_id', firm.id).eq('status', 'active').limit(1).maybeSingle(),
    ])
    if (obligationsError) throw new Error(obligationsError.message)
    if (subscriptionError) throw new Error(subscriptionError.message)
    return {
      firmName: firm.name,
      email,
      entitled: Boolean(subscription),
      obligations: (obligations ?? []).map((row) => ({
        id: String(row.id),
        obligationType: row.obligation_type,
        intervalDays: row.interval_days,
        jurisdiction: row.jurisdiction,
        lastEventAt: row.last_event_at ?? new Date().toISOString(),
      })),
    }
  }
  if (existsSync(STATE_FILE)) {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8')) as FirmState
  }
  writeFirmState(DEFAULT_FIRM)
  return DEFAULT_FIRM
}

export function writeFirmState(state: FirmState): void {
  mkdirSync(STATE_DIR, { recursive: true })
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8')
}

export async function logEvent(firm: FirmState, obligationId: string): Promise<FirmState> {
  const next = { ...firm, obligations: firm.obligations.map((o) => o.id === obligationId ? { ...o, lastEventAt: new Date().toISOString() } : o) }
  writeFirmState(next)
  return next
}

export async function addObligation(firm: FirmState, o: { obligationType: string; intervalDays: number; jurisdiction: string }): Promise<FirmState> {
  const next = { ...firm, obligations: [...firm.obligations, { id: `o${firm.obligations.length + 1}`, ...o, lastEventAt: new Date().toISOString() }] }
  writeFirmState(next)
  return next
}

