/**
 * TRACR — composite chain-intelligence score.
 *
 * Combines 5 signal families into a single risk score in [0, 1]:
 *   1. Direct sanctions exposure       — 0.35
 *   2. Indirect sanctions exposure     — 0.20
 *   3. Mixer / tumbler exposure        — 0.20
 *   4. High-risk counterparty exposure — 0.15
 *   5. Jurisdiction-of-flow risk       — 0.10
 *
 * A "met" signal pushes the score up; the composite is clamped to
 * [0, 1]. Weights change = disclosure version bump = prior snapshots
 * remain reproducible.
 *
 * scoreAddress() requires a reviewer_id. No composite score is emitted
 * without a named human analyst signing off — liability firewall at
 * the engine layer.
 */

import type {
  CounterpartyExposureHit,
  JurisdictionHit,
  MixerExposureHit,
  SanctionsHit,
} from "./types"

export interface CompositeWeights {
  direct_sanctions: number
  indirect_sanctions: number
  mixer: number
  counterparty: number
  jurisdiction: number
}

export const DEFAULT_COMPOSITE_WEIGHTS: CompositeWeights = {
  direct_sanctions: 0.35,
  indirect_sanctions: 0.2,
  mixer: 0.2,
  counterparty: 0.15,
  jurisdiction: 0.1,
}

export interface CompositeComponents {
  direct_sanctions: number
  indirect_sanctions: number
  mixer: number
  counterparty: number
  jurisdiction: number
}

export interface CompositeScore {
  score: number
  tier: "critical" | "high" | "medium" | "low" | "minimal"
  components: CompositeComponents
  rationale: string
}

export interface ScoreInputs {
  sanctions_hits: SanctionsHit[]
  mixer_hits: MixerExposureHit[]
  counterparty_hits: CounterpartyExposureHit[]
  jurisdiction_hits: JurisdictionHit[]
  weights?: CompositeWeights
  reviewer_id: string
}

function directSanctionsSignal(hits: SanctionsHit[]): number {
  return hits.some((h) => h.kind === "direct") ? 1 : 0
}

function indirectSanctionsSignal(hits: SanctionsHit[]): number {
  const indirects = hits.filter((h) => h.kind === "indirect")
  if (indirects.length === 0) return 0
  const minHops = Math.min(...indirects.map((h) => h.hops))
  // 1 hop out = 0.75; 2 hops = 0.5; 3 hops = 0.25; 4+ = 0.1.
  if (minHops <= 1) return 0.75
  if (minHops === 2) return 0.5
  if (minHops === 3) return 0.25
  return 0.1
}

function mixerSignal(hits: MixerExposureHit[]): number {
  if (hits.length === 0) return 0
  const max = Math.max(...hits.map((h) => h.exposure_fraction))
  return Math.min(1, max)
}

function counterpartySignal(hits: CounterpartyExposureHit[]): number {
  if (hits.length === 0) return 0
  let s = 0
  for (const hit of hits) {
    const tierWeight =
      hit.counterparty_risk_tier === "critical"
        ? 1
        : hit.counterparty_risk_tier === "high"
          ? 0.7
          : hit.counterparty_risk_tier === "medium"
            ? 0.4
            : 0.15
    s = Math.max(s, tierWeight * Math.min(1, hit.exposure_fraction * 2))
  }
  return Math.min(1, s)
}

function jurisdictionSignal(hits: JurisdictionHit[]): number {
  if (hits.length === 0) return 0
  let s = 0
  for (const hit of hits) {
    const tierWeight = hit.risk_tier === "high" ? 1 : hit.risk_tier === "medium" ? 0.5 : 0.15
    s = Math.max(s, tierWeight * Math.min(1, hit.fraction_of_flow * 2))
  }
  return Math.min(1, s)
}

export function scoreAddress(inputs: ScoreInputs): CompositeScore {
  if (!inputs.reviewer_id || inputs.reviewer_id.trim().length === 0) {
    throw new Error(
      "scoreAddress requires a reviewer_id. No composite score can be emitted without a named human analyst.",
    )
  }
  const weights = inputs.weights ?? DEFAULT_COMPOSITE_WEIGHTS

  const components: CompositeComponents = {
    direct_sanctions: directSanctionsSignal(inputs.sanctions_hits),
    indirect_sanctions: indirectSanctionsSignal(inputs.sanctions_hits),
    mixer: mixerSignal(inputs.mixer_hits),
    counterparty: counterpartySignal(inputs.counterparty_hits),
    jurisdiction: jurisdictionSignal(inputs.jurisdiction_hits),
  }

  const raw =
    components.direct_sanctions * weights.direct_sanctions +
    components.indirect_sanctions * weights.indirect_sanctions +
    components.mixer * weights.mixer +
    components.counterparty * weights.counterparty +
    components.jurisdiction * weights.jurisdiction

  const score = Math.min(1, Math.max(0, raw))

  const tier: CompositeScore["tier"] =
    components.direct_sanctions === 1
      ? "critical"
      : score >= 0.7
        ? "high"
        : score >= 0.4
          ? "medium"
          : score >= 0.15
            ? "low"
            : "minimal"

  const rationale = buildRationale(components, score, tier)

  return { score, tier, components, rationale }
}

function buildRationale(
  c: CompositeComponents,
  score: number,
  tier: CompositeScore["tier"],
): string {
  const bits: string[] = []
  if (c.direct_sanctions === 1) {
    bits.push("Direct sanctions-list match — tier forced to critical independent of other signals.")
  }
  if (c.indirect_sanctions > 0) {
    bits.push(`Indirect sanctions exposure signal at ${c.indirect_sanctions.toFixed(2)}.`)
  }
  if (c.mixer > 0) {
    bits.push(`Mixer / tumbler exposure at ${(c.mixer * 100).toFixed(0)}%.`)
  }
  if (c.counterparty > 0) {
    bits.push(`Counterparty exposure signal at ${c.counterparty.toFixed(2)}.`)
  }
  if (c.jurisdiction > 0) {
    bits.push(`Jurisdictional risk signal at ${c.jurisdiction.toFixed(2)}.`)
  }
  if (bits.length === 0) {
    bits.push("No risk signals fired; composite reflects baseline posture.")
  }
  bits.push(`Composite ${(score * 100).toFixed(0)}% — tier ${tier}.`)
  return bits.join(" ")
}
