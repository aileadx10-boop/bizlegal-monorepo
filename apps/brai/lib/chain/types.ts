/**
 * TRACR — chain intelligence shared types.
 *
 * Every emitted record is citation-complete: the originating provider,
 * retrieval timestamp, and (where applicable) the on-chain accession
 * identifier are preserved. Consumers downstream (composite scorer,
 * IntelligenceSnapshot builder) depend on this contract.
 *
 * A hit without a source_url or retrieved_at is a bug, not a hit.
 */

export type ChainId = "eth" | "bsc" | "polygon" | "arbitrum" | "optimism" | "base" | "avalanche"

export type Provider = "goldrush" | "alchemy" | "covalent"

export type SanctionsList = "ofac" | "un" | "eu"

/** A hex-encoded address with 0x prefix. Validated by isAddress(). */
export type WalletAddress = `0x${string}`

export interface ProviderCitation {
  provider: Provider
  /** Endpoint URL or human-readable reference to the call. */
  source_url: string
  retrieved_at: string
  /** Provider-specific identifier (request id, block range, etc.). */
  source_ref?: string
}

export interface SanctionsCitation {
  list: SanctionsList
  /** Canonical regulator-published URL for this list. */
  source_url: string
  retrieved_at: string
  /** Checksum or published update timestamp for the list version used. */
  list_version?: string
}

export interface ChainHit {
  provider: Provider
  address: WalletAddress
  chain: ChainId
  /** Human-readable summary of what the provider returned. */
  summary: string
  /** Normalised confidence in [0, 1]. */
  confidence: number
  citation: ProviderCitation
  metadata?: Record<string, string | number | boolean | null>
}

export type SanctionsMatchKind = "direct" | "indirect"

export interface SanctionsHit {
  address: WalletAddress
  list: SanctionsList
  kind: SanctionsMatchKind
  /** Depth at which the match was found (0 = direct, 1 = one hop, ...). */
  hops: number
  matched_entity: string
  citation: SanctionsCitation
}

export interface MixerExposureHit {
  address: WalletAddress
  mixer_name: string
  exposure_fraction: number
  citation: ProviderCitation
}

export interface CounterpartyExposureHit {
  address: WalletAddress
  counterparty: WalletAddress
  counterparty_risk_tier: "critical" | "high" | "medium" | "low"
  exposure_fraction: number
  citation: ProviderCitation
}

export interface JurisdictionHit {
  address: WalletAddress
  jurisdiction_code: string
  risk_tier: "high" | "medium" | "low"
  fraction_of_flow: number
  citation: ProviderCitation
}

export interface IntelligenceSnapshot {
  snapshot_id: string
  address: WalletAddress
  chain: ChainId
  chain_hits: ChainHit[]
  sanctions_hits: SanctionsHit[]
  mixer_hits: MixerExposureHit[]
  counterparty_hits: CounterpartyExposureHit[]
  jurisdiction_hits: JurisdictionHit[]
  /** Composite score and components, populated by composite-score.ts. */
  composite?: import("./composite-score").CompositeScore
  /** Pinned at build time; every downstream artefact shares this stamp. */
  disclaimer_version: string
  issued_at: string
  reviewer: {
    reviewer_id: string
    signed_at: string
    note?: string
  }
}

export function isAddress(x: unknown): x is WalletAddress {
  return typeof x === "string" && /^0x[a-fA-F0-9]{40}$/.test(x)
}

export function requireAddress(x: unknown): WalletAddress {
  if (!isAddress(x)) {
    throw new Error(`Invalid wallet address: ${String(x)}`)
  }
  return x
}
