/**
 * BRAI — sanctions-list screening with Supabase-backed cache.
 *
 * Supabase `sanctions_cache` table persists addresses across Vercel cold
 * starts, fixing the core "empty cache on every Lambda" bug.
 *
 * refreshSanctions() fetches OFAC/UN/EU XML, extracts 0x addresses,
 * writes to Supabase. screenAddress() reads from Supabase.
 * Falls back to empty hit list (not error) when Supabase is unavailable.
 */

import type { SanctionsCitation, SanctionsHit, SanctionsList, WalletAddress } from "./types"

const DEFAULT_URLS: Record<SanctionsList, string> = {
  ofac: process.env.OFAC_LIST_URL ?? "https://www.treasury.gov/ofac/downloads/sdn.xml",
  un:   process.env.UN_SANCTIONS_URL ?? "https://scsanctions.un.org/resources/xml/en/consolidated.xml",
  eu:   process.env.EU_SANCTIONS_URL ??
        "https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content",
}

const ADDRESS_RE = /0x[a-fA-F0-9]{40}/g

function supabaseHeaders(): Record<string, string> {
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  }
}

function supabaseUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return `${base}/rest/v1${path}`
}

function extractAddresses(body: string): string[] {
  const set = new Set<string>()
  const matches = body.match(ADDRESS_RE) ?? []
  for (const m of matches) set.add(m.toLowerCase())
  return Array.from(set)
}

export interface RefreshOptions {
  lists?: SanctionsList[]
  fetchImpl?: typeof fetch
}

export async function refreshSanctions(options: RefreshOptions = {}): Promise<{
  refreshed: SanctionsList[]
  counts: Record<string, number>
  failed: SanctionsList[]
}> {
  const lists: SanctionsList[] = options.lists ?? ["ofac", "un", "eu"]
  const fetchImpl = options.fetchImpl ?? fetch
  const refreshed: SanctionsList[] = []
  const failed: SanctionsList[] = []
  const counts: Record<string, number> = {}

  for (const list of lists) {
    try {
      const resp = await fetchImpl(DEFAULT_URLS[list], {
        headers: { Accept: "application/xml, text/xml, application/json" },
      })
      if (!resp.ok) { failed.push(list); continue }

      const body = await resp.text()
      const addresses = extractAddresses(body)
      const listVersion = resp.headers.get("last-modified") ?? undefined

      // Upsert into Supabase sanctions_cache
      await fetchImpl(supabaseUrl('/sanctions_cache'), {
        method: 'POST',
        headers: { ...supabaseHeaders(), Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          list,
          addresses,
          fetched_at: new Date().toISOString(),
          list_version: listVersion ?? null,
        }),
      })

      counts[list] = addresses.length
      refreshed.push(list)
    } catch (err) {
      console.error(`[sanctions] refresh ${list}:`, err)
      failed.push(list)
    }
  }
  return { refreshed, counts, failed }
}

export async function getCachedListsFromSupabase(): Promise<
  Record<SanctionsList, { fetched_at: string; size: number } | null>
> {
  const out: Record<string, { fetched_at: string; size: number } | null> = {
    ofac: null, un: null, eu: null,
  }
  try {
    const res = await fetch(
      supabaseUrl('/sanctions_cache?select=list,fetched_at,address_count'),
      { headers: supabaseHeaders() },
    )
    if (!res.ok) return out as Record<SanctionsList, { fetched_at: string; size: number } | null>
    const rows: Array<{ list: string; fetched_at: string; address_count: number }> = await res.json()
    for (const row of rows) {
      out[row.list] = { fetched_at: row.fetched_at, size: row.address_count }
    }
  } catch {}
  return out as Record<SanctionsList, { fetched_at: string; size: number } | null>
}

/**
 * Screen an address against all cached sanctions lists stored in Supabase.
 * Returns SanctionsHit[] (empty when not matched or cache unavailable).
 */
export async function screenAddress(address: WalletAddress): Promise<SanctionsHit[]> {
  const lowered = address.toLowerCase()
  const hits: SanctionsHit[] = []

  for (const list of ["ofac", "un", "eu"] as SanctionsList[]) {
    try {
      // Use Postgres containment operator to check if address is in the jsonb array
      const res = await fetch(
        supabaseUrl(
          `/sanctions_cache?select=fetched_at,list_version&list=eq.${list}&addresses=cs.["${lowered}"]`,
        ),
        { headers: supabaseHeaders() },
      )
      if (!res.ok) continue
      const rows: Array<{ fetched_at: string; list_version: string | null }> = await res.json()
      if (rows.length === 0) continue

      const citation: SanctionsCitation = {
        list,
        source_url: DEFAULT_URLS[list],
        retrieved_at: rows[0].fetched_at,
        list_version: rows[0].list_version ?? undefined,
      }
      hits.push({
        address,
        list,
        kind: "direct",
        hops: 0,
        matched_entity: `${list.toUpperCase()} list entry (address match)`,
        citation,
      })
    } catch {}
  }
  return hits
}

// Legacy sync shim — returns empty hits. Callers that need real screening
// must await screenAddress() (the async Supabase version above).
export function screenAddressSync(_address: WalletAddress): SanctionsHit[] {
  return []
}

/** Test-only helper — kept for existing unit tests. */
export function __seedSanctionsCacheForTest(
  _list: SanctionsList,
  _addresses: string[],
  _fetched_at?: string,
): void {
  // No-op in Supabase-backed mode; tests should mock fetch.
}
