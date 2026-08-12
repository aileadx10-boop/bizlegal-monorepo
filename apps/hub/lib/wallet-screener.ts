/**
 * wallet-screener.ts — sanctions & wallet screening for the free hub tool
 * `/tools/wallet-screener`.
 *
 * Screens an EVM address against the OFAC / UN / EU sanctions lists stored in
 * the shared `sanctions_cache` table (populated by the BRAI daily refresh
 * cron). This is a deliberate hub-local replica of
 * `apps/brai/lib/chain/sanctions.ts` `screenAddress()` — the hub app cannot
 * import across app boundaries, and both hit the same Supabase table.
 *
 * Output is a three-way status — hit / clean / list-not-found — plus citations
 * so callers can show *which* list and *when* it was checked. `list-not-found`
 * means at least one list is not loaded in the cache, so "clean" cannot be
 * honestly claimed (a liability shrinker: never over-claim a clean bill).
 */

import { supabaseAdmin } from "./supabase"

export type ScreenList = "ofac" | "un" | "eu"

export type ScreenStatus = "hit" | "clean" | "list-not-found" | "unsupported"

export interface WalletScreenCitation {
  list: ScreenList
  listName: string
  sourceUrl: string
  retrievedAt: string | null
  listVersion: string | null
}

export interface WalletScreenResult {
  address: string
  status: ScreenStatus
  hits: WalletScreenCitation[]
  listsLoaded: ScreenList[]
  listsMissing: ScreenList[]
  checkedAt: string
  reason: string
}

export const LIST_NAMES: Record<ScreenList, string> = {
  ofac: "OFAC SDN (Specially Designated Nationals)",
  un: "UN Consolidated Sanctions List",
  eu: "EU Consolidated Financial Sanctions List",
}

export const LIST_SOURCES: Record<ScreenList, string> = {
  ofac:
    process.env.OFAC_LIST_URL ??
    "https://www.treasury.gov/ofac/downloads/sdn.xml",
  un:
    process.env.UN_SANCTIONS_URL ??
    "https://scsanctions.un.org/resources/xml/en/consolidated.xml",
  eu:
    process.env.EU_SANCTIONS_URL ??
    "https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content",
}

export const SCREEN_LISTS: ScreenList[] = ["ofac", "un", "eu"]

/** Accept 0x + 40 hex chars (EVM). Returns the normalized lowercase form or null. */
export function normalizeEvmAddress(raw: string): string | null {
  const trimmed = raw.trim()
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return null
  return trimmed.toLowerCase()
}

/**
 * Screen an EVM address against every loaded sanctions list.
 * Non-EVM / invalid addresses are never screened — `unsupported`.
 */
export async function screenWallet(rawAddress: string): Promise<WalletScreenResult> {
  const address = normalizeEvmAddress(rawAddress)
  const checkedAt = new Date().toISOString()

  if (!address) {
    return {
      address: rawAddress.trim(),
      status: "unsupported",
      hits: [],
      listsLoaded: [],
      listsMissing: [],
      checkedAt,
      reason:
        "Only Ethereum-compatible addresses (0x + 40 hex) are screened by this free tool. For non-EVM screening, see the TRACR full report.",
    }
  }

  const hits: WalletScreenCitation[] = []
  const listsLoaded: ScreenList[] = []
  const listsMissing: ScreenList[] = []

  for (const list of SCREEN_LISTS) {
    let row: { fetched_at: string | null; list_version: string | null } | null = null
    try {
      // 1) Is the list loaded in the cache at all?
      const loaded = await supabaseAdmin
        .from("sanctions_cache")
        .select("fetched_at, list_version")
        .eq("list", list)
        .order("fetched_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (loaded.data) {
        row = {
          fetched_at: loaded.data.fetched_at,
          list_version: loaded.data.list_version,
        }
        listsLoaded.push(list)
      } else {
        listsMissing.push(list)
      }

      // 2) If loaded, does the jsonb addresses array contain this address?
      if (row) {
        const hit = await supabaseAdmin
          .from("sanctions_cache")
          .select("list")
          .eq("list", list)
          .contains("addresses", [address])
          .limit(1)
          .maybeSingle()

        if (hit.data) {
          hits.push({
            list,
            listName: LIST_NAMES[list],
            sourceUrl: LIST_SOURCES[list],
            retrievedAt: row.fetched_at,
            listVersion: row.list_version,
          })
        }
      }
    } catch (err) {
      // Cache/network unavailable → treat as not loaded, never as clean.
      console.error(`[wallet-screener] list ${list} check failed:`, err)
      listsMissing.push(list)
    }
  }

  let status: ScreenStatus
  let reason: string

  if (hits.length > 0) {
    status = "hit"
    reason = `Address matched on ${hits.length} sanctions list${hits.length > 1 ? "s" : ""}.`
  } else if (listsMissing.length === 0) {
    status = "clean"
    reason = "No match found on any loaded sanctions list."
  } else {
    status = "list-not-found"
    reason = `Could not verify ${listsMissing.length} list(s) (${listsMissing
      .map((l) => l.toUpperCase())
      .join(", ")}). A clear result is not claimed until every list is checked.`
  }

  return { address, status, hits, listsLoaded, listsMissing, checkedAt, reason }
}
