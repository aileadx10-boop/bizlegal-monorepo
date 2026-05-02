/**
 * TRACR — sanctions-list screening.
 *
 * Fetches OFAC SDN, UN consolidated, and EU financial-sanctions lists,
 * caches the parsed addresses in memory with a freshness stamp, and
 * returns SanctionsHit records for a queried address.
 *
 * The parser is intentionally lightweight at P2: it extracts 0x-
 * prefixed addresses appearing anywhere in each list document. A
 * richer schema-aware parser arrives in a later P2 commit; until
 * then, every hit is marked confidence by hop count (direct hits
 * are confident; indirect hits are derived by the composite scorer).
 *
 * The daily cron at /api/sanctions/refresh refreshes the cache.
 */

import type { SanctionsCitation, SanctionsHit, SanctionsList, WalletAddress } from "./types"

const DEFAULT_URLS: Record<SanctionsList, string> = {
  ofac: process.env.OFAC_LIST_URL ?? "https://www.treasury.gov/ofac/downloads/sdn.xml",
  un: process.env.UN_SANCTIONS_URL ?? "https://scsanctions.un.org/resources/xml/en/consolidated.xml",
  eu:
    process.env.EU_SANCTIONS_URL ??
    "https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content",
}

interface CachedList {
  addresses: Set<string>
  fetched_at: string
  list_version?: string
}

const cache = new Map<SanctionsList, CachedList>()

const ADDRESS_RE = /0x[a-fA-F0-9]{40}/g

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
      if (!resp.ok) {
        failed.push(list)
        continue
      }
      const body = await resp.text()
      const addresses = extractAddresses(body)
      cache.set(list, {
        addresses: new Set(addresses),
        fetched_at: new Date().toISOString(),
        list_version: resp.headers.get("last-modified") ?? undefined,
      })
      counts[list] = addresses.length
      refreshed.push(list)
    } catch {
      failed.push(list)
    }
  }
  return { refreshed, counts, failed }
}

export function getCachedLists(): Record<SanctionsList, { fetched_at: string; size: number } | null> {
  const out: Record<string, { fetched_at: string; size: number } | null> = {
    ofac: null,
    un: null,
    eu: null,
  }
  for (const list of ["ofac", "un", "eu"] as SanctionsList[]) {
    const c = cache.get(list)
    out[list] = c ? { fetched_at: c.fetched_at, size: c.addresses.size } : null
  }
  return out as Record<SanctionsList, { fetched_at: string; size: number } | null>
}

export function screenAddress(address: WalletAddress): SanctionsHit[] {
  const lowered = address.toLowerCase()
  const hits: SanctionsHit[] = []
  for (const list of ["ofac", "un", "eu"] as SanctionsList[]) {
    const entry = cache.get(list)
    if (!entry) continue
    if (!entry.addresses.has(lowered)) continue
    const citation: SanctionsCitation = {
      list,
      source_url: DEFAULT_URLS[list],
      retrieved_at: entry.fetched_at,
      list_version: entry.list_version,
    }
    hits.push({
      address,
      list,
      kind: "direct",
      hops: 0,
      matched_entity: `${list.toUpperCase()} list entry (address match)`,
      citation,
    })
  }
  return hits
}

/** Test-only helper — seed cached lists without hitting the network. */
export function __seedSanctionsCacheForTest(
  list: SanctionsList,
  addresses: string[],
  fetched_at: string = new Date().toISOString(),
): void {
  cache.set(list, {
    addresses: new Set(addresses.map((a) => a.toLowerCase())),
    fetched_at,
  })
}
