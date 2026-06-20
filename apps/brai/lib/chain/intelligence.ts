/**
 * TRACR — chain intelligence orchestrator.
 *
 * Pulls hits from the 3 providers (GoldRush, Alchemy, Covalent) +
 * sanctions lists, composes them into an IntelligenceSnapshot, and
 * stamps the disclosure version + issued_at + reviewer signoff on
 * every emitted snapshot. No snapshot ships without a reviewer.
 *
 * Each provider fetcher is independently failable — the orchestrator
 * returns what it got and annotates the snapshot with which providers
 * contributed. The daily cron keeps the sanctions cache warm.
 */

import { DISCLAIMER_VERSION, disclaimerStamp } from "@/lib/legal/disclaimer"
import { fetchAlchemyHit } from "./alchemy"
import { fetchCovalentHit } from "./covalent"
import {
  type CompositeScore,
  type CompositeWeights,
  DEFAULT_COMPOSITE_WEIGHTS,
  scoreAddress,
} from "./composite-score"
import { fetchGoldRushHit } from "./goldrush"
import { screenAddress } from "./sanctions"
// screenAddress is now async (Supabase-backed). buildSnapshot awaits it.
import type {
  ChainHit,
  ChainId,
  CounterpartyExposureHit,
  IntelligenceSnapshot,
  JurisdictionHit,
  MixerExposureHit,
  SanctionsHit,
  WalletAddress,
} from "./types"

export interface BuildSnapshotInputs {
  address: WalletAddress
  chain: ChainId
  reviewer: { reviewer_id: string; signed_at?: string; note?: string }
  /** Optional: inject pre-fetched hits (used by tests and the cron). */
  pre?: {
    chain_hits?: ChainHit[]
    sanctions_hits?: SanctionsHit[]
    mixer_hits?: MixerExposureHit[]
    counterparty_hits?: CounterpartyExposureHit[]
    jurisdiction_hits?: JurisdictionHit[]
  }
  fetchImpl?: typeof fetch
  weights?: CompositeWeights
}

export async function buildSnapshot(
  inputs: BuildSnapshotInputs,
): Promise<IntelligenceSnapshot> {
  if (!inputs.reviewer?.reviewer_id) {
    throw new Error("buildSnapshot requires a reviewer_id.")
  }

  const stamp = disclaimerStamp()

  const chain_hits: ChainHit[] = inputs.pre?.chain_hits ?? []
  if (!inputs.pre?.chain_hits) {
    // Try each provider; failures are annotated rather than thrown.
    for (const fetcher of [fetchGoldRushHit, fetchAlchemyHit, fetchCovalentHit]) {
      try {
        const hit = await fetcher({
          address: inputs.address,
          chain: inputs.chain,
          fetchImpl: inputs.fetchImpl,
        })
        chain_hits.push(hit)
      } catch {
        // Provider not configured or transient failure; continue.
      }
    }
  }

  const direct_sanctions: SanctionsHit[] =
    inputs.pre?.sanctions_hits ?? (await screenAddress(inputs.address))
  const mixer_hits: MixerExposureHit[] = inputs.pre?.mixer_hits ?? []
  const counterparty_hits: CounterpartyExposureHit[] = inputs.pre?.counterparty_hits ?? []
  const jurisdiction_hits: JurisdictionHit[] = inputs.pre?.jurisdiction_hits ?? []

  const composite: CompositeScore = scoreAddress({
    sanctions_hits: direct_sanctions,
    mixer_hits,
    counterparty_hits,
    jurisdiction_hits,
    weights: inputs.weights ?? DEFAULT_COMPOSITE_WEIGHTS,
    reviewer_id: inputs.reviewer.reviewer_id,
  })

  return {
    snapshot_id: `snap:${inputs.address}:${stamp.issued_at}`,
    address: inputs.address,
    chain: inputs.chain,
    chain_hits,
    sanctions_hits: direct_sanctions,
    mixer_hits,
    counterparty_hits,
    jurisdiction_hits,
    composite,
    disclaimer_version: stamp.disclaimer_version,
    issued_at: stamp.issued_at,
    reviewer: {
      reviewer_id: inputs.reviewer.reviewer_id,
      signed_at: inputs.reviewer.signed_at ?? stamp.issued_at,
      note: inputs.reviewer.note,
    },
  }
}

/** Serialise a snapshot to disclosure-stamped JSON. */
export function serializeSnapshot(snap: IntelligenceSnapshot): string {
  return JSON.stringify(
    {
      ...snap,
      _stamp: {
        disclaimer_version: DISCLAIMER_VERSION,
        schema: "tracr.intelligence-snapshot.v1",
      },
    },
    null,
    2,
  )
}
