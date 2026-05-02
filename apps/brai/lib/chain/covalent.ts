/**
 * TRACR — Covalent (legacy unified) adapter.
 *
 * Thin wrapper on the Covalent transactions endpoint. COVALENT_API_KEY
 * is required. Retained alongside GoldRush because the two APIs
 * disagree on certain token coverage and the composite scorer cross-
 * references them when both are available.
 */

import type { ChainHit, ChainId, ProviderCitation, WalletAddress } from "./types"

const COVALENT_BASE = "https://api.covalenthq.com/v1"

const CHAIN_TO_COVALENT: Record<ChainId, string> = {
  eth: "eth-mainnet",
  bsc: "bsc-mainnet",
  polygon: "matic-mainnet",
  arbitrum: "arbitrum-mainnet",
  optimism: "optimism-mainnet",
  base: "base-mainnet",
  avalanche: "avalanche-mainnet",
}

interface CovalentTxResponse {
  data?: {
    items?: Array<{
      tx_hash?: string
      from_address?: string
      to_address?: string
      value_quote?: number
      block_signed_at?: string
    }>
  }
  error?: boolean
}

export interface CovalentFetchOptions {
  address: WalletAddress
  chain: ChainId
  fetchImpl?: typeof fetch
}

export async function fetchCovalentHit(
  options: CovalentFetchOptions,
): Promise<ChainHit> {
  const apiKey = process.env.COVALENT_API_KEY
  if (!apiKey) {
    throw new Error("COVALENT_API_KEY is required for the Covalent fetcher.")
  }
  const chainSlug = CHAIN_TO_COVALENT[options.chain]
  const url = `${COVALENT_BASE}/${chainSlug}/address/${options.address}/transactions_v3/`
  const fetchImpl = options.fetchImpl ?? fetch
  const resp = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  })
  if (!resp.ok) {
    throw new Error(`Covalent fetch failed: ${resp.status} ${resp.statusText}`)
  }
  const body = (await resp.json()) as CovalentTxResponse
  const items = body.data?.items ?? []
  const totalQuote = items.reduce((acc, item) => acc + (item.value_quote ?? 0), 0)
  const citation: ProviderCitation = {
    provider: "covalent",
    source_url: url,
    retrieved_at: new Date().toISOString(),
    source_ref: `tx:${items.length}`,
  }
  return {
    provider: "covalent",
    address: options.address,
    chain: options.chain,
    summary: `Covalent transactions: ${items.length} entries, ~$${totalQuote.toFixed(2)} quote volume.`,
    confidence: items.length > 0 ? 0.7 : 0.4,
    citation,
    metadata: {
      tx_count: items.length,
      total_quote_usd: totalQuote,
    },
  }
}
