import { callHaikuJson } from "./anthropic";
import type { Env, FormSubmission, LeadProfile } from "./types";

const SYSTEM = `You extract structured data from lead form submissions for BizLegal-AI, a crypto and Web3 compliance intelligence service.

Output ONLY valid JSON matching the schema. No prose, no markdown fences, no explanation.

Schema (required keys must be present; use null for unknown values, [] for unknown arrays):
{
  "language": "ISO 639-1 code",
  "contact": {
    "full_name": "string",
    "email": "valid email or null",
    "phone": "string or null",
    "role": "job title if stated, else null"
  },
  "company": {
    "name": "string or null",
    "website": "URL or null",
    "industry": "string or null",
    "size_band": "one of '1-10','11-50','51-200','201-1000','1000+' or null",
    "hq_country": "ISO 3166-1 alpha-2 or null",
    "hq_region": "state/province or null"
  },
  "pain": {
    "extracted_challenge": "one sentence rephrase, max 30 words",
    "jurisdictions_mentioned": ["geo jurisdictions named"],
    "regulations_mentioned": ["regulations named, e.g. MiCA, VARA, SEC, OFAC, BitLicense, MAS, FATF, Travel Rule, GDPR"],
    "urgency_signals": ["phrases indicating time pressure"],
    "budget_signals": ["phrases indicating budget availability or constraint"]
  }
}

Rules:
1. Do NOT infer facts not present. Use null for anything not stated.
2. If email is malformed, set email to null.
3. Use the lead's own words for industry.
4. For arrays, include only items explicitly mentioned.
5. Detect language from the lead's words.
6. Never hallucinate a regulation or jurisdiction.

Return valid JSON only.`;

export interface ExtractResult {
  readonly language: string;
  readonly contact: {
    readonly full_name: string;
    readonly email: string | null;
    readonly phone: string | null;
    readonly role: string | null;
  };
  readonly company: {
    readonly name: string | null;
    readonly website: string | null;
    readonly industry: string | null;
    readonly size_band: string | null;
    readonly hq_country: string | null;
    readonly hq_region: string | null;
  };
  readonly pain: {
    readonly extracted_challenge: string | null;
    readonly jurisdictions_mentioned: readonly string[];
    readonly regulations_mentioned: readonly string[];
    readonly urgency_signals: readonly string[];
    readonly budget_signals: readonly string[];
  };
}

export async function extractLead(env: Env, submission: FormSubmission): Promise<ExtractResult> {
  const user = JSON.stringify(
    {
      full_name: submission.full_name,
      email: submission.email,
      phone: submission.phone ?? "",
      company: submission.company ?? "",
      challenge: submission.challenge
    },
    null,
    2
  );
  const result = await callHaikuJson<ExtractResult>(env, {
    model: env.HAIKU_MODEL_ID,
    system: SYSTEM,
    user: `Lead form submission (JSON):\n\n${user}`,
    prefill: "{",
    maxTokens: 1024,
    temperature: 0,
    maxRetries: 3
  });
  return result.data;
}

export function mergeExtractIntoProfile(profile: LeadProfile, extracted: ExtractResult): LeadProfile {
  return {
    ...profile,
    language: extracted.language || profile.language,
    contact: {
      ...profile.contact,
      role: extracted.contact.role ?? profile.contact.role
    },
    company: {
      name: extracted.company.name,
      website: extracted.company.website,
      industry: extracted.company.industry,
      size_band: extracted.company.size_band,
      hq_country: extracted.company.hq_country,
      hq_region: extracted.company.hq_region
    },
    pain: {
      ...profile.pain,
      extracted_challenge: extracted.pain.extracted_challenge,
      jurisdictions_mentioned: [...extracted.pain.jurisdictions_mentioned],
      regulations_mentioned: [...extracted.pain.regulations_mentioned],
      urgency_signals: [...extracted.pain.urgency_signals],
      budget_signals: [...extracted.pain.budget_signals]
    }
  };
}
