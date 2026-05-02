import type { LeadProfile } from "./types";

/**
 * Deterministic vertical classifier — maps a fully-scored LeadProfile
 * to the BizLegal product whose customer-base best fits the lead.
 *
 * Pure rules over qualification.vertical + pain.regulations_mentioned +
 * pain.jurisdictions_mentioned. No LLM call (fast + cheap + reproducible).
 *
 * If accuracy in production turns out below 80%, swap in a Haiku
 * classifier as a fallback (run only when this returns "none").
 */

export type ProductId =
  | "realestate"
  | "brai"
  | "tracr"
  | "lexaudit"
  | "docai"
  | "leadforge"
  | "forge"
  | "none";

export interface ClassificationResult {
  readonly product: ProductId;
  readonly confidence: number; // 0-1, how strong the signal was
  readonly reason: string;
}

interface RuleHit {
  readonly product: Exclude<ProductId, "none">;
  readonly weight: number;
  readonly reason: string;
}

const REGULATION_RULES: ReadonlyArray<{
  pattern: RegExp;
  product: Exclude<ProductId, "none">;
  weight: number;
}> = [
  // RealEstate — UAE/SG/US/EU high-ticket cross-border deals.
  // HIGHEST priority on purpose: the OCI Deal Router earns referral
  // fees on these (asymmetric upside), so we want to catch them
  // BEFORE the generic compliance/forge keywords below.
  { pattern: /\bdifc\b|\brera\b|\bdmcc\b|\bdafza\b|\bjafza\b|\badgm\b|\brak\b/i, product: "realestate", weight: 1.0 },
  { pattern: /reg ?d (?:506\(?[bc]\)?|filing|syndication)|form d filing|blue.?sky filing/i, product: "realestate", weight: 1.0 },
  { pattern: /\bmas\b (?:ffr|vcc|family office)|13o|13u|single.family office|\bsfo\b|family office consortium/i, product: "realestate", weight: 1.0 },
  { pattern: /cyprus ic|eu aif|aifmd|lux feeder|firpta/i, product: "realestate", weight: 1.0 },
  { pattern: /tokenized real.?estate|jreit|capital call|capital.call agreement/i, product: "realestate", weight: 0.85 },
  { pattern: /real.?estate (?:fund|jv|joint venture|syndication|fund manager)|property (?:fund|jv|syndication|holding vehicle)/i, product: "realestate", weight: 0.9 },

  // BRAI — counterparty / wallet / sanctions
  { pattern: /\bofac\b|sanctions list|wallet risk|counterparty|aml screening/i, product: "brai", weight: 0.9 },
  { pattern: /\bchain analysis\b|on-chain risk/i, product: "brai", weight: 0.7 },

  // TRACR — tracing / disputes / forensics / asset recovery
  { pattern: /tracing|asset recovery|chargeback dispute|forensic|law enforcement/i, product: "tracr", weight: 0.9 },

  // LexAudit — controls posture / health score / SOC2/ISO/GDPR
  { pattern: /soc 2|iso 27001|hipaa|dpdp|controls? matrix|audit posture|compliance score/i, product: "lexaudit", weight: 0.9 },
  { pattern: /\bgdpr\b/i, product: "lexaudit", weight: 0.5 },

  // DocAI — contracts / questionnaires / templates
  { pattern: /\bnda\b|saft|operating agreement|service agreement|contract template/i, product: "docai", weight: 0.9 },
  { pattern: /security questionnaire|caiq|sig-lite|sig core|vendor risk questionnaire/i, product: "docai", weight: 0.9 },

  // LeadForge — buyer intent / lead-gen
  { pattern: /buyer intent|lead generation|sales pipeline|inbound leads/i, product: "leadforge", weight: 0.9 },

  // Forge — multi-framework gap scan / BOI Kit / 15-framework
  { pattern: /\bboi\b|gap scan|gap analysis|multi-framework|compliance scan/i, product: "forge", weight: 0.85 },
  { pattern: /\bmica\b|\bvara\b|\bsec\b/i, product: "forge", weight: 0.4 },
];

const VERTICAL_DEFAULTS: Record<NonNullable<LeadProfile["qualification"]>["vertical"], Exclude<ProductId, "none">> = {
  compliance: "lexaudit",
  regulatory_risk: "forge",
  jurisdiction_arbitrage: "forge",
  business_intelligence: "leadforge",
  other: "forge",
};

export function classifyVertical(profile: LeadProfile): ClassificationResult {
  // Build a haystack from the lead's pain + extracted fields.
  const haystack = [
    profile.pain.raw_text,
    profile.pain.extracted_challenge ?? "",
    ...(profile.pain.regulations_mentioned ?? []),
    ...(profile.pain.jurisdictions_mentioned ?? []),
  ].join(" \n ");

  const hits: RuleHit[] = [];
  for (const rule of REGULATION_RULES) {
    if (rule.pattern.test(haystack)) {
      hits.push({
        product: rule.product,
        weight: rule.weight,
        reason: `match:${rule.pattern.source}`,
      });
    }
  }

  if (hits.length > 0) {
    // Aggregate weights per product
    const totals: Partial<Record<Exclude<ProductId, "none">, { weight: number; reasons: string[] }>> = {};
    for (const hit of hits) {
      const cur = totals[hit.product] ?? { weight: 0, reasons: [] };
      cur.weight += hit.weight;
      cur.reasons.push(hit.reason);
      totals[hit.product] = cur;
    }
    const ranked = Object.entries(totals).sort(([, a], [, b]) => b!.weight - a!.weight);
    const [winnerId, winner] = ranked[0]!;
    return {
      product: winnerId as Exclude<ProductId, "none">,
      confidence: Math.min(winner!.weight, 1),
      reason: `regex:${winner!.reasons.join(",")}`,
    };
  }

  // No keyword hit — fall back to qualification.vertical default.
  if (profile.qualification?.vertical) {
    const fallback = VERTICAL_DEFAULTS[profile.qualification.vertical];
    return {
      product: fallback,
      confidence: 0.4,
      reason: `vertical-default:${profile.qualification.vertical}`,
    };
  }

  return { product: "none", confidence: 0, reason: "no-signal" };
}
