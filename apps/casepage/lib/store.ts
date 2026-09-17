/**
 * CasePage matter page store (local + live). Carries entitlement flag.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { canUseLive, getSupabase } from './supabase'

export interface MatterPage {
  id: string
  title: string
  template: string
  jurisdiction: string
  milestones: Array<{ title: string; doneAt: string | null }>
  status: 'draft' | 'live' | 'archived'
}

export interface CasePageState {
  entitled: boolean
  pages: MatterPage[]
}

const DEFAULT_PAGES: MatterPage[] = [
  { id: 'p1', title: 'Demo closing (Dubai)', template: 'residential-closing-dubai', jurisdiction: 'dubai', milestones: [{ title: 'SPA signed', doneAt: new Date().toISOString() }, { title: 'DLD registration', doneAt: null }], status: 'draft' },
  { id: 'p2', title: 'Demo divorce', template: 'divorce-matter', jurisdiction: 'us', milestones: [{ title: 'Filed', doneAt: new Date().toISOString() }, { title: 'Discovery', doneAt: null }], status: 'draft' },
]

const STATE_DIR = '.casepage-state'
const STATE_FILE = path.join(STATE_DIR, 'state.json')

export function readLocalState(): CasePageState {
  if (existsSync(STATE_FILE)) return JSON.parse(readFileSync(STATE_FILE, 'utf8')) as CasePageState
  const init: CasePageState = { entitled: false, pages: DEFAULT_PAGES }
  writeLocalState(init)
  return init
}

export function writeLocalState(state: CasePageState): void {
  mkdirSync(STATE_DIR, { recursive: true })
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8')
}

export async function readPages(ownerEmail?: string): Promise<MatterPage[]> {
  if (canUseLive()) {
    if (!ownerEmail) return []
    const s = getSupabase()
    const { data, error } = await s.from('cp_pages').select('id,title,template,jurisdiction,milestones,status').eq('owner_email', ownerEmail.toLowerCase()).limit(100)
    if (error) throw new Error(error.message)
    return (data ?? []) as MatterPage[]
  }
  return readLocalState().pages
}

export async function readPublicPage(id: string): Promise<MatterPage | null> {
  if (canUseLive()) {
    const { data, error } = await getSupabase()
      .from('cp_pages')
      .select('id,title,template,jurisdiction,milestones,status')
      .eq('id', id)
      .eq('status', 'live')
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data as MatterPage | null
  }
  return readLocalState().pages.find((page) => page.id === id && page.status === 'live') ?? null
}

export async function createPage(input: Omit<MatterPage, 'id' | 'status'>, ownerEmail?: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const page: MatterPage = { ...input, id: `p${Date.now()}`, status: 'draft' }
  if (canUseLive()) {
    if (!ownerEmail) return { ok: false, error: 'unauthorized' }
    const email = ownerEmail.toLowerCase()
    const supabase = getSupabase()
    const { error: accountError } = await supabase.from('cp_accounts').upsert({ email, updated_at: new Date().toISOString() }, { onConflict: 'email' })
    if (accountError) return { ok: false, error: accountError.message }
    const { data, error } = await supabase.from('cp_pages').insert({ ...page, owner_email: email }).select('id').single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, id: data?.id }
  }
  const state = readLocalState()
  writeLocalState({ ...state, pages: [...state.pages, page] })
  return { ok: true, id: page.id }
}

export async function updatePage(id: string, patch: Partial<MatterPage>, ownerEmail?: string): Promise<{ ok: boolean; error?: string }> {
  if (canUseLive()) {
    if (!ownerEmail) return { ok: false, error: 'unauthorized' }
    const safePatch = {
      ...(typeof patch.title === 'string' ? { title: patch.title } : {}),
      ...(typeof patch.template === 'string' ? { template: patch.template } : {}),
      ...(typeof patch.jurisdiction === 'string' ? { jurisdiction: patch.jurisdiction } : {}),
      ...(Array.isArray(patch.milestones) ? { milestones: patch.milestones } : {}),
      ...(patch.status && ['draft', 'live', 'archived'].includes(patch.status) ? { status: patch.status } : {}),
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await getSupabase().from('cp_pages').update(safePatch).eq('id', id).eq('owner_email', ownerEmail.toLowerCase()).select('id').maybeSingle()
    if (error) return { ok: false, error: error.message }
    return data ? { ok: true } : { ok: false, error: 'not_found' }
  }
  const state = readLocalState()
  writeLocalState({ ...state, pages: state.pages.map((p) => p.id === id ? { ...p, ...patch } : p) })
  return { ok: true }
}

export async function isEntitled(ownerEmail?: string): Promise<boolean> {
  if (canUseLive()) {
    if (!ownerEmail) return false
    const s = getSupabase()
    const { data } = await s.from('cp_subscriptions').select('id').eq('owner_email', ownerEmail.toLowerCase()).eq('status', 'active').limit(1).maybeSingle()
    return Boolean(data)
  }
  return readLocalState().entitled
}

export async function pageLimitFor(ownerEmail?: string): Promise<number> {
  if (canUseLive()) {
    if (!ownerEmail) return 0
    const { data, error } = await getSupabase()
      .from('cp_subscriptions')
      .select('entitlement')
      .eq('owner_email', ownerEmail.toLowerCase())
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return 1
    const maxPages = (data.entitlement as { max_pages?: number | null } | null)?.max_pages
    return maxPages == null ? Number.POSITIVE_INFINITY : maxPages
  }
  return readLocalState().entitled ? Number.POSITIVE_INFINITY : 1
}

export async function grantEntitlement(ownerEmail?: string): Promise<{ ok: boolean; error?: string }> {
  if (canUseLive()) {
    return { ok: false, error: ownerEmail ? 'payment_webhook_required' : 'unauthorized' }
  }
  const state = readLocalState()
  writeLocalState({ ...state, entitled: true })
  return { ok: true }
}
