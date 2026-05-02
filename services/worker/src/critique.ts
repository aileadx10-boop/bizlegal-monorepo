import { callHaikuJson } from "./anthropic";
import type { Env, LeadProfile } from "./types";
import type { ExtractResult } from "./extract";

const SYSTEM = `You are an accuracy auditor for BizLegal-AI's lead extraction pipeline.

Given (a) a raw lead form submission and (b) a JSON extraction produced from it, rate confidence that each extracted field correctly reflects the source.

Output ONLY valid JSON matching this schema:
{
  "per_field": {
    "contact.full_name": 0.0-1.0,
    "contact.email": 0.0-1.0,
    "contact.role": 0.0-1.0,
    "company.name": 0.0-1.0,
    "company.industry": 0.0-1.0,
    "company.size_band": 0.0-1.0,
    "pain.extracted_challenge": 0.0-1.0,
    "pain.jurisdictions_mentioned": 0.0-1.0,
    "pain.regulations_mentioned": 0.0-1.0
  },
  "min_confidence": 0.0-1.0,
  "critical_fields_missing": ["field.path"],
  "concerns": ["short plain-english concern strings"],
  "escalate_to_cloud": boolean
}

Rules:
- 1.0 explicit in source; 0.8-0.99 minor rephrasing; 0.5-0.79 inferred; 0.2-0.49 guess; 0.0-0.19 fabricated.
- Use null for fields the extraction set to null - do NOT include null fields in per_field.
- Critical fields: contact.full_name, contact.email, pain.extracted_challenge. If any is null or <0.7 confidence, add to critical_fields_missing.
- Set escalate_to_cloud=true if min_confidence<0.80 OR any critical missing OR structural concerns.
- min_confidence = lowest score across ALL non-null per_field entries.

Return valid JSON only.`;

export interface CritiqueResult {
  readonly per_field: Record<string, number>;
  readonly min_confidence: number;
  readonly critical_fields_missing: readonly string[];
  readonly concerns: readonly string[];
  readonly escalate_to_cloud: boolean;
}

export async function critiqueExtraction(
  env: Env,
  rawSubmission: unknown,
  extracted: ExtractResult
): Promise<CritiqueResult> {
  const user = `=== RAW SUBMISSION ===\n${JSON.stringify(rawSubmission, null, 2)}\n\n=== EXTRACTION TO AUDIT ===\n${JSON.stringify(extracted, null, 2)}`;
  const result = await callHaikuJson<CritiqueResult>(env, {
    model: env.HAIKU_MODEL_ID,
    system: SYSTEM,
    user,
    prefill: "{",
    maxTokens: 512,
    temperature: 0,
    maxRetries: 3
  });
  return result.data;
}

export function mergeCritiqueIntoProfile(profile: LeadProfile, critique: CritiqueResult): LeadProfile {
  const threshold = Number(profile.pipeline_meta.extraction_model ? 0.8 : 0.8);
  const shouldEscalate =
    critique.escalate_to_cloud ||
    critique.min_confidence < threshold ||
    critique.critical_fields_missing.length > 0;
  return {
    ...profile,
    confidence: {
      per_field: { ...critique.per_field },
      min_confidence: critique.min_confidence,
      critical_fields_missing: [...critique.critical_fields_missing],
      concerns: [...critique.concerns],
      escalate_to_cloud: shouldEscalate
    },
    pipeline_meta: {
      ...profile.pipeline_meta,
      critique_model: profile.pipeline_meta.extraction_model
    }
  };
}
