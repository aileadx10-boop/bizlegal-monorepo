/**
 * Browser-side pseudonymisation. Pure and isomorphic (unit-tested with tsx,
 * executed in the buyer's browser).
 *
 * Before upload, every client, matter and invoice identifier is replaced by
 * a code — "Client 01", "Matter 01-02", "INV-0001" — and the reverse key
 * stays in the browser (localStorage plus a downloadable CSV). The report
 * page relabels codes back to names in the DOM only. The analyze request has
 * no field for the key; nothing on the server can hold a client's name.
 *
 * Keys are normalised (trim, collapse spaces, case-fold) so "Acme LLC" and
 * "acme llc" merge; entity suffixes are NOT stripped — "Smith" and "Smith LLC"
 * may be two clients — and every merge is reported so the buyer can see it.
 */
import { normaliseKey } from './normalise'

export interface PseudonymKey {
  /** code → real text */
  readonly clients: Readonly<Record<string, string>>
  readonly matters: Readonly<Record<string, string>>
  readonly invoices: Readonly<Record<string, string>>
}

export interface PseudonymState {
  readonly clients: Map<string, string>
  readonly matters: Map<string, string>
  readonly invoices: Map<string, string>
  readonly matterCountByClient: Map<string, number>
  readonly reverse: { clients: Record<string, string>; matters: Record<string, string>; invoices: Record<string, string> }
  readonly merged: Map<string, Set<string>>
}

export function createPseudonymState(): PseudonymState {
  return {
    clients: new Map(),
    matters: new Map(),
    invoices: new Map(),
    matterCountByClient: new Map(),
    reverse: { clients: {}, matters: {}, invoices: {} },
    merged: new Map(),
  }
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0')
}

function noteRaw(state: PseudonymState, key: string, raw: string): void {
  const set = state.merged.get(key) ?? new Set<string>()
  set.add(raw.trim())
  state.merged.set(key, set)
}

export function pseudonymiseClient(raw: string, state: PseudonymState): string {
  const key = normaliseKey(raw)
  if (!key) return ''
  noteRaw(state, `client:${key}`, raw)
  const existing = state.clients.get(key)
  if (existing) return existing
  const code = `Client ${pad(state.clients.size + 1, 2)}`
  state.clients.set(key, code)
  state.reverse.clients[code] = raw.trim()
  return code
}

export function pseudonymiseMatter(raw: string, clientCode: string, state: PseudonymState): string {
  if (!normaliseKey(raw)) return ''
  const key = `${normaliseKey(clientCode)}|${normaliseKey(raw)}`
  noteRaw(state, `matter:${key}`, raw)
  const existing = state.matters.get(key)
  if (existing) return existing
  const clientNo = clientCode.replace(/\D/g, '') || '00'
  const n = (state.matterCountByClient.get(clientCode) ?? 0) + 1
  state.matterCountByClient.set(clientCode, n)
  const code = `Matter ${clientNo}-${pad(n, 2)}`
  state.matters.set(key, code)
  state.reverse.matters[code] = raw.trim()
  return code
}

export function pseudonymiseInvoice(raw: string, state: PseudonymState): string {
  const key = normaliseKey(raw)
  if (!key) return ''
  noteRaw(state, `invoice:${key}`, raw)
  const existing = state.invoices.get(key)
  if (existing) return existing
  const code = `INV-${pad(state.invoices.size + 1, 4)}`
  state.invoices.set(key, code)
  state.reverse.invoices[code] = raw.trim()
  return code
}

export interface GridColumns {
  readonly client?: number
  readonly matter?: number
  readonly invoice?: number
  readonly drop?: readonly number[]
}

/** Returns the grid that is actually uploaded: codes in place of names, dropped columns removed. */
export function pseudonymiseGrid(grid: readonly (readonly string[])[], cols: GridColumns, state: PseudonymState): string[][] {
  const drop = new Set(cols.drop ?? [])
  const out: string[][] = []
  grid.forEach((row, r) => {
    const next = row.slice()
    if (r > 0) {
      let clientCode = ''
      if (cols.client !== undefined) {
        clientCode = pseudonymiseClient(next[cols.client] ?? '', state)
        next[cols.client] = clientCode
      }
      if (cols.matter !== undefined) next[cols.matter] = pseudonymiseMatter(next[cols.matter] ?? '', clientCode, state)
      if (cols.invoice !== undefined) next[cols.invoice] = pseudonymiseInvoice(next[cols.invoice] ?? '', state)
    }
    out.push(next.filter((_, c) => !drop.has(c)))
  })
  return out
}

export function reverseKey(state: PseudonymState): PseudonymKey {
  return { clients: { ...state.reverse.clients }, matters: { ...state.reverse.matters }, invoices: { ...state.reverse.invoices } }
}

/** Raw spellings that merged into one code, for the pre-upload preview. */
export function mergedSpellings(state: PseudonymState): ReadonlyArray<{ readonly key: string; readonly spellings: readonly string[] }> {
  const out: Array<{ key: string; spellings: string[] }> = []
  state.merged.forEach((set, key) => {
    if (set.size > 1) out.push({ key, spellings: Array.from(set) })
  })
  return out
}

function csvCell(s: string): string {
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function keyToCsv(key: PseudonymKey): string {
  const lines = ['kind,code,name']
  for (const [code, name] of Object.entries(key.clients)) lines.push(`client,${csvCell(code)},${csvCell(name)}`)
  for (const [code, name] of Object.entries(key.matters)) lines.push(`matter,${csvCell(code)},${csvCell(name)}`)
  for (const [code, name] of Object.entries(key.invoices)) lines.push(`invoice,${csvCell(code)},${csvCell(name)}`)
  return lines.join('\n')
}

export function keyFromCsv(text: string): PseudonymKey {
  const clients: Record<string, string> = {}
  const matters: Record<string, string> = {}
  const invoices: Record<string, string> = {}
  const lines = text.split(/\r?\n/)
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const m = line.match(/^(client|matter|invoice),("(?:[^"]|"")*"|[^,]*),(.*)$/)
    if (!m) continue
    const unq = (s: string) => (s.startsWith('"') ? s.slice(1, -1).replace(/""/g, '"') : s)
    const code = unq(m[2])
    const name = unq(m[3])
    if (m[1] === 'client') clients[code] = name
    else if (m[1] === 'matter') matters[code] = name
    else invoices[code] = name
  }
  return { clients, matters, invoices }
}

/** Code → real name when the key has it; otherwise the code itself. */
export function relabel(code: string | null, key: PseudonymKey | null): string {
  if (!code) return ''
  if (!key) return code
  return key.clients[code] ?? key.matters[code] ?? key.invoices[code] ?? code
}
