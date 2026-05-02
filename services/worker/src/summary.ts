import { callHaikuJson } from "./anthropic";
import type { Env, LeadProfile } from "./types";

const SYSTEM = `You write punchy lead briefings for Moses, founder of BizLegal-AI.

Given a scored lead profile, output exactly 5 bullet points Moses can scan in 30 seconds.

Output ONLY valid JSON:
{
  "summary_bullets": ["b1", "b2", "b3", "b4", "b5"]
}

Bullet order:
1. WHO - full name, role, company, size band, location
2. WHAT - specific compliance/risk pain in one sentence, using their own terms
3. WHY NOW - urgency signal OR "no specific urgency"
4. SIGNAL - strongest qualification signal (highest-scoring rubric dimension, named)
5. RED FLAG / ACTION - weakest dimension OR recommended action OR notable concern

Writing rules:
- 15-30 words per bullet, no more.
- No adverbs.
- No hype ("exciting opportunity", "hot lead", "perfect fit").
- Use specific numbers + proper nouns when available.
- Direct, almost terse tone.
- Never restate the overall score as a number.

Return valid JSON only.`;

export interface SummaryResult {
  readonly summary_bullets: readonly [string, string, string, string, string];
}

export async function summarizeLead(env: Env, profile: LeadProfile): Promise<SummaryResult> {
  const user = `=== SCORED LEAD PROFILE ===\n${JSON.stringify(
    {
      contact: profile.contact,
      company: profile.company,
      pain: profile.pain,
      qualification: profile.qualification,
      confidence: profile.confidence
    },
    null,
    2
  )}`;
  const result = await callHaikuJson<{ summary_bullets: string[] }>(env, {
    model: env.HAIKU_MODEL_ID,
    system: SYSTEM,
    user,
    prefill: `{"summary_bullets":["`,
    maxTokens: 1024,
    temperature: 0.2,
    // No stop_sequences: model closes the JSON on its own; bare "]" would trigger
    // on any literal bracket inside a bullet (brittle).
    maxRetries: 3
  });
  const bullets = result.data.summary_bullets;
  if (!Array.isArray(bullets) || bullets.length !== 5) {
    throw new Error(`summary_bullets invalid shape: ${JSON.stringify(bullets).slice(0, 200)}`);
  }
  return { summary_bullets: bullets as unknown as SummaryResult["summary_bullets"] };
}

export function mergeSummaryIntoProfile(profile: LeadProfile, summary: SummaryResult): LeadProfile {
  return {
    ...profile,
    summary_bullets: summary.summary_bullets,
    pipeline_meta: {
      ...profile.pipeline_meta,
      summary_model: profile.pipeline_meta.extraction_model
    }
  };
}
