import { callHaikuJson } from "./anthropic";
import type { Env, LeadProfile } from "./types";

const SYSTEM = `You are a senior crypto compliance sales qualification analyst for BizLegal-AI, a $10K+/mo regulatory intelligence service for crypto, Web3, DeFi, token, and digital-asset companies.

Positioning: "Operate Where It's Allowed. Scale Where Others Won't."

Ideal customer profile (ICP):
- Crypto/Web3 entity: DeFi protocol, CEX/DEX, L1/L2, custodian, token issuer, NFT platform, stablecoin issuer, crypto fund, market maker, payment processor, on/off-ramp, Web3 gaming, RWA tokenization
- Also ICP: compliance officers, GCs, external legal counsel advising crypto clients
- Operates across multiple jurisdictions OR planning jurisdiction expansion
- Active compliance pain: licensing (MiCA, VARA, BitLicense, MAS), enforcement risk (SEC, DOJ, OFAC), Travel Rule/FATF, audit/certification, jurisdiction restructuring
- Decision authority: CCO, GC, Head of Legal, Founder/CEO at smaller protocols, external crypto-lawyer

NOT ICP (disqualify):
- Individual retail investors asking about personal tax/wallet
- Traditional SaaS with only GDPR/CCPA concerns (not our vertical)
- Law students, researchers without clients
- Airdrop-seekers, get-rich-quick
- Investment-advice seekers

Output ONLY valid JSON:
{
  "vertical": "compliance | regulatory_risk | jurisdiction_arbitrage | business_intelligence | other",
  "scores": {"fit":0-10,"urgency":0-10,"budget":0-10,"vertical_match":0-10,"decision_authority":0-10,"pain_clarity":0-10},
  "overall_score": 0-10,
  "recommended_action": "respond_immediately | qualify_further | disqualify",
  "rationale": "2-3 sentence justification naming specific signals"
}

Rubrics 0-10 for each of: fit, urgency, budget, vertical_match, decision_authority, pain_clarity. See detailed rubric in prompts/lead-score.md.

overall = round_to_1dp(0.20*fit + 0.20*urgency + 0.15*budget + 0.20*vertical_match + 0.10*decision_authority + 0.15*pain_clarity)

Action bands: overall>=8.0 respond_immediately; 5.5-7.9 qualify_further; <5.5 disqualify.

Return valid JSON only.`;

export interface ScoreResult {
  readonly vertical: "compliance" | "regulatory_risk" | "jurisdiction_arbitrage" | "business_intelligence" | "other";
  readonly scores: {
    readonly fit: number;
    readonly urgency: number;
    readonly budget: number;
    readonly vertical_match: number;
    readonly decision_authority: number;
    readonly pain_clarity: number;
  };
  readonly overall_score: number;
  readonly recommended_action: "respond_immediately" | "qualify_further" | "disqualify";
  readonly rationale: string;
}

export async function scoreLead(env: Env, profile: LeadProfile): Promise<ScoreResult> {
  const scoreInput = {
    contact: profile.contact,
    company: profile.company,
    pain: profile.pain,
    language: profile.language
  };
  const user = `=== LEAD PROFILE ===\n${JSON.stringify(scoreInput, null, 2)}`;
  const result = await callHaikuJson<ScoreResult>(env, {
    model: env.HAIKU_MODEL_ID,
    system: SYSTEM,
    user,
    prefill: "{",
    maxTokens: 768,
    temperature: 0,
    maxRetries: 3
  });
  return result.data;
}

export function mergeScoreIntoProfile(profile: LeadProfile, score: ScoreResult): LeadProfile {
  return {
    ...profile,
    qualification: {
      vertical: score.vertical,
      scores: { ...score.scores },
      overall_score: score.overall_score,
      recommended_action: score.recommended_action,
      rationale: score.rationale
    },
    pipeline_meta: {
      ...profile.pipeline_meta,
      scoring_model: profile.pipeline_meta.extraction_model,
      status: "scored"
    }
  };
}
