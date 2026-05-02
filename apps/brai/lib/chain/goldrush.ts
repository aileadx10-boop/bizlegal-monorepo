/**
 * TRACR — GoldRush (Covalent GoldRush API) adapter.
 *
 * Wraps the GoldRush balances + activity endpoints into a single
 * ChainHit producer. Requires GOLDRUSH_API_KEY. fetchImpl is
 * injectable for tests; the daily cron and scoring endpoints inject
 * the real fetch in production.
 */

import type { ChainHit, ChainId, ProviderCitation, WalletAddress } from "./types"

const GOLDRUSH_BASE = "https://api.covalenthq.com/v1"

const CHAIN_TO_GOLDRUSH: Record<ChainId, string> = {
  eth: "1",
  bsc: "56",
  polygon: "137",
  arbitrum: "42161",
  optimism: "10",
  base: "8453",
  avalanche: "43114",
}

interface GoldRushBalanceItem {
  contract_ticker_symbol?: string
  balance?: string
  quote?: number
}

interface GoldRushResponse {
  data?: {
    items?: GoldRushBalanceItem[]
    updated_at?: string
  }
  error?: boolean
  error_message?: string
}

export interface GoldRushFetchOptions {
  address: WalletAddress
  chain: ChainId
  fetchImpl?: typeof fetch
}

export async function fetchGoldRushHit(
  options: GoldRushFetchOptions,
): Promise<ChainHit> {
  const apiKey = process.env.GOLDRUSH_API_KEY
  if (!apiKey) {
    throw new Error("GOLDRUSH_API_KEY is required for the GoldRush fetcher.")
  }
  const chainNumeric = CHAIN_TO_GOLDRUSH[options.chain]
  if (!chainNumeric) {
    throw new Error(`GoldRush does not support chain ${options.chain}`)
  }
  const url = `${GOLDRUSH_BASE}/${chainNumeric}/address/${options.address}/balances_v2/`
  const fetchImpl = options.fetchImpl ?? fetch
  const resp = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  })
  if (!resp.ok) {
    throw new Error(`GoldRush fetch failed: ${resp.status} ${resp.statusText}`)
  }
  const body = (await resp.json()) as GoldRushResponse
  if (body.error) {
    throw new Error(`GoldRush returned error: ${body.error_message ?? "unknown"}`)
  }
  const items = body.data?.items ?? []
  const totalQuote = items.reduce((acc, item) => acc + (item.quote ?? 0), 0)
  const distinctAssets = items.filter((i) => (i.quote ?? 0) > 0).length

  const citation: ProviderCitation = {
    provider: "goldrush",
    source_url: url,
    retrieved_at: new Date().toISOString(),
    source_ref: body.data?.updated_at ?? undefined,
  }

  return {
    provider: "goldrush",
    address: options.address,
    chain: options.chain,
    summary: `GoldRush balances: ${distinctAssets} assets, ~$${totalQuote.toFixed(2)} total quote at retrieval.`,
    confidence: totalQuote > 0 ? 0.8 : 0.4,
    citation,
    metadata: {
      distinct_assets: distinctAssets,
      total_quote_usd: totalQuote,
    },
  }
}
