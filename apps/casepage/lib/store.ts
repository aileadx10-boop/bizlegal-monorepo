/**
 * CasePage matter page store (local + live). Carries entitlement flag.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { canUseLive, getSupabase } from '../supabase'

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

export async function readPages(): Promise<MatterPage[]> {
  if (canUseLive()) {
    const s = getSupabase()
    const { data } = await s.from('cp_pages').select('*').limit(100)
    if (data && data.length) return data as MatterPage[]
  }
  return readLocalState().pages
}

export async function createPage(input: Omit<MatterPage, 'id' | 'status'>): Promise<{ ok: boolean; id?: string; error?: string }> {
  const page: MatterPage = { ...input, id: `p${Date.now()}`, status: 'draft' }
  if (canUseLive()) {
    const { data, error } = await getSupabase().from('cp_pages').insert(page).select('id').single()
    if (error) return { ok: false, error: error.message }
    return { ok: true, id: data?.id }
  }
  const state = readLocalState()
  writeLocalState({ ...state, pages: [...state.pages, page] })
  return { ok: true, id: page.id }
}

export async function updatePage(id: string, patch: Partial<MatterPage>): Promise<{ ok: boolean; error?: string }> {
  if (canUseLive()) {
    const { error } = await getSupabase().from('cp_pages').update(patch).eq('id', id)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }
  const state = readLocalState()
  writeLocalState({ ...state, pages: state.pages.map((p) => p.id === id ? { ...p, ...patch } : p) })
  return { ok: true }
}

export async function isEntitled(): Promise<boolean> {
  if (canUseLive()) {
    const s = getSupabase()
    const { data } = await s.from('cp_subscriptions').select('id').eq('status', 'active').limit(1).maybeSingle()
    return Boolean(data)
  }
  return readLocalState().entitled
}

export async function grantEntitlement(): Promise<{ ok: boolean; error?: string }> {
  if (canUseLive()) {
    const { error } = await getSupabase().from('cp_subscriptions').insert({ status: 'active', product_id: 'cp_firm_149', entitlement: {} })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  }
  const state = readLocalState()
  writeLocalState({ ...state, entitled: true })
  return { ok: true }
}
