/**
 * TRACR — Alchemy adapter.
 *
 * Uses the Alchemy Transfers API to identify recent counterparty
 * activity. Requires ALCHEMY_API_KEY. The adapter returns a single
 * aggregated ChainHit; per-transfer detail is surfaced in metadata
 * for the composite scorer.
 */

import type { ChainHit, ChainId, ProviderCitation, WalletAddress } from "./types"

const CHAIN_TO_ALCHEMY: Partial<Record<ChainId, string>> = {
  eth: "eth-mainnet",
  polygon: "polygon-mainnet",
  arbitrum: "arb-mainnet",
  optimism: "opt-mainnet",
  base: "base-mainnet",
}

interface AlchemyTransfersResponse {
  result?: {
    transfers?: Array<{
      from?: string
      to?: string
      value?: number
      asset?: string
      blockNum?: string
      hash?: string
    }>
  }
}

export interface AlchemyFetchOptions {
  address: WalletAddress
  chain: ChainId
  fetchImpl?: typeof fetch
  limit?: number
}

export async function fetchAlchemyHit(
  options: AlchemyFetchOptions,
): Promise<ChainHit> {
  const apiKey = process.env.ALCHEMY_API_KEY
  if (!apiKey) {
    throw new Error("ALCHEMY_API_KEY is required for the Alchemy fetcher.")
  }
  const chainSlug = CHAIN_TO_ALCHEMY[options.chain]
  if (!chainSlug) {
    throw new Error(`Alchemy adapter does not support chain ${options.chain}`)
  }

  const url = `https://${chainSlug}.g.alchemy.com/v2/${apiKey}`
  const body = {
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getAssetTransfers",
    params: [
      {
        fromAddress: options.address,
        category: ["external", "erc20"],
        maxCount: `0x${(options.limit ?? 25).toString(16)}`,
      },
    ],
  }
  const fetchImpl = options.fetchImpl ?? fetch
  const resp = await fetchImpl(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    throw new Error(`Alchemy fetch failed: ${resp.status} ${resp.statusText}`)
  }
  const json = (await resp.json()) as AlchemyTransfersResponse
  const transfers = json.result?.transfers ?? []
  const distinctCounterparties = new Set(
    transfers.map((t) => (t.to ?? "").toLowerCase()).filter(Boolean),
  ).size

  const citation: ProviderCitation = {
    provider: "alchemy",
    source_url: `${url}#alchemy_getAssetTransfers`,
    retrieved_at: new Date().toISOString(),
    source_ref: `transfers:${transfers.length}`,
  }

  return {
    provider: "alchemy",
    address: options.address,
    chain: options.chain,
    summary: `Alchemy transfers: ${transfers.length} outbound entries across ${distinctCounterparties} counterparties.`,
    confidence: transfers.length > 0 ? 0.75 : 0.4,
    citation,
    metadata: {
      transfers_count: transfers.length,
      distinct_counterparties: distinctCounterparties,
    },
  }
}
