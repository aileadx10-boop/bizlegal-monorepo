import { z } from "zod";
import { callHaikuJson } from "./anthropic";
import type { Env } from "./types";

// ------------------------------------------------------------------
// Input schema (POST body for /report/snapshot)
// ------------------------------------------------------------------

export const SnapshotRequestSchema = z.object({
  full_name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  company: z.string().trim().max(200).optional().nullable(),
  jurisdiction_codes: z.array(z.string().trim().min(2).max(10)).length(2),
  activity: z.string().trim().min(10).max(500),
  urgency_window: z
    .enum(["within_30_days", "within_90_days", "within_6_months", "exploratory"])
    .optional()
    .nullable()
});

export type SnapshotRequest = z.infer<typeof SnapshotRequestSchema>;

// ------------------------------------------------------------------
// JurisdictionSnapshot types (matches /schemas/jurisdiction-snapshot.json)
// ------------------------------------------------------------------

export interface JurisdictionSnapshot {
  snapshot_id: string;
  requested_at: string;
  request: SnapshotRequest;
  jurisdictions: readonly JurisdictionEntry[];
  side_by_side?: {
    verdict: string;
    winner_code: string | null;
    key_tradeoffs: readonly string[];
  };
  citations?: readonly { label: string; url: string }[];
  critique?: {
    factual_confidence: number;
    hallucination_risks: readonly string[];
    missing_data_flags: readonly string[];
    escalate_to_sonnet: boolean;
  };
  hero_image?: {
    path: string;         // GitHub repo path, e.g., reports/snapshots/{id}.png
    mime_type: string;
    generator: string;    // e.g., "gemini-2.5-flash-image"
  };
  pipeline_meta: {
    draft_model: string;
    critique_model: string | null;
    retries: number;
    status:
      | "received"
      | "drafted"
      | "critiqued"
      | "stored"
      | "delivered"
      | "failed"
      | "dlq";
    error_class: string | null;
    error_detail: string | null;
    processed_at: string | null;
    duration_ms: number | null;
  };
}

export interface JurisdictionEntry {
  code: string;
  display_name: string;
  posture: { label: "supportive" | "neutral" | "hostile" | "mixed"; rationale: string };
  licensing: {
    required_licenses: readonly string[];
    typical_timeline: string;
    typical_cost_usd: string;
    regulator: string;
  };
  tax_summary: { corporate_rate: string; vat_gst: string; crypto_specific_treatment: string };
  banking_accessibility: {
    rating: "excellent" | "good" | "moderate" | "challenging" | "restricted";
    notes: string;
  };
  recent_enforcement: ReadonlyArray<{
    date: string;
    actor: string;
    summary: string;
    penalty: string | null;
    source_url: string | null;
  }>;
  upcoming_deadlines: ReadonlyArray<{
    date: string;
    requirement: string;
    source_url: string | null;
  }>;
}

// ------------------------------------------------------------------
// Sonnet draft + Haiku critique helpers
// ------------------------------------------------------------------

const DRAFT_SYSTEM = `You are a senior crypto and digital-asset compliance analyst for BizLegal-AI. Produce a JurisdictionSnapshot JSON comparing 2 jurisdictions for the user's regulated activity.

CRITICAL RULES:
1. Never invent licenses, regulators, cases, or penalty amounts. Omit rather than fabricate.
2. Use 2024-2026 regulatory landscape. Name real regulators and licenses (VARA MVP, ADGM FSPR, DFSA CT, MAS DPT, FCA cryptoasset registration, MiCA CASP/EMT/ART, BitLicense, etc.).
3. For urgency_window, weight recommendations: short timelines favor faster-granting regimes.

Output ONLY valid JSON matching this shape (no prose):
{
  "jurisdictions": [
    {
      "code": "jurisdiction code",
      "display_name": "human name",
      "posture": { "label": "supportive|neutral|hostile|mixed", "rationale": "one sentence" },
      "licensing": { "required_licenses": [], "typical_timeline": "", "typical_cost_usd": "", "regulator": "" },
      "tax_summary": { "corporate_rate": "", "vat_gst": "", "crypto_specific_treatment": "" },
      "banking_accessibility": { "rating": "excellent|good|moderate|challenging|restricted", "notes": "" },
      "recent_enforcement": [{ "date": "", "actor": "", "summary": "", "penalty": null, "source_url": null }],
      "upcoming_deadlines": [{ "date": "", "requirement": "", "source_url": null }]
    },
    { ...second jurisdiction, same shape... }
  ],
  "side_by_side": { "verdict": "one sentence", "winner_code": "code or null", "key_tradeoffs": ["3-5 items"] },
  "citations": [{ "label": "", "url": "" }]
}

Exactly 2 jurisdictions. Exactly 3-5 key_tradeoffs. source_url: null unless you know it. Return valid JSON only.`;

const CRITIQUE_SYSTEM = `You are a fact-checker for BizLegal-AI's Jurisdiction Risk Snapshot. Given a user request and a draft JSON, flag hallucination risks and decide on escalation.

Skeptical of: specific company names in enforcement actions, specific dollar penalties, specific timelines, URL suggestions, license-to-activity mapping errors (e.g., stablecoin should map to MiCA EMT/ART not CASP).

Output ONLY valid JSON:
{
  "factual_confidence": 0.0-1.0,
  "hallucination_risks": ["short description of each flag"],
  "missing_data_flags": ["short description of each under-supported claim"],
  "escalate_to_sonnet": boolean
}

escalate_to_sonnet=true if factual_confidence<0.80 OR any fabricated case/URL OR license-activity mismatch. Return valid JSON only.`;

type DraftOutput = Pick<JurisdictionSnapshot, "jurisdictions" | "side_by_side" | "citations">;
type CritiqueOutput = NonNullable<JurisdictionSnapshot["critique"]>;

export interface DraftSnapshotOpts {
  readonly critiqueFeedback?: {
    readonly hallucination_risks: readonly string[];
    readonly missing_data_flags: readonly string[];
  };
}

export async function draftSnapshot(
  env: Env,
  request: SnapshotRequest,
  opts: DraftSnapshotOpts = {}
): Promise<DraftOutput> {
  const feedbackBlock = opts.critiqueFeedback
    ? `\n\nPREVIOUS DRAFT FACT-CHECK FEEDBACK — address each before re-drafting:
Hallucination risks:
${opts.critiqueFeedback.hallucination_risks.map((r) => `- ${r}`).join("\n")}
Missing-data flags:
${opts.critiqueFeedback.missing_data_flags.map((r) => `- ${r}`).join("\n")}

Address each flag. Prefer omitting a claim to fabricating a specific. Ship fewer but defensible items per jurisdiction.`
    : "";

  const user = `=== SNAPSHOT REQUEST ===
Jurisdictions to compare: ${request.jurisdiction_codes.join(", ")}
Activity: ${request.activity}
Urgency window: ${request.urgency_window ?? "unspecified"}
Requester: ${request.full_name}${request.company ? ` at ${request.company}` : ""}${feedbackBlock}

Produce the JurisdictionSnapshot JSON. Output JSON only.`;

  // NOTE: Haiku 4.5 for the draft, not Sonnet 4.6.
  // Reason: CF Workers free-tier wall-time is 30s; Sonnet 4.6 on 2048-token
  // JSON output consistently runs 20-30s and times out. Haiku completes
  // the same call in ~3-5s. Quality is acceptable for the free lead magnet.
  // Sonnet-tier drafts will move to a Queue-based async consumer in Day 2b.
  const result = await callHaikuJson<DraftOutput>(env, {
    model: env.HAIKU_MODEL_ID,
    system: DRAFT_SYSTEM,
    user,
    prefill: "{",
    maxTokens: 2048,
    temperature: 0,
    maxRetries: 1
  });

  validateDraft(result.data);
  return result.data;
}

export async function critiqueSnapshot(
  env: Env,
  request: SnapshotRequest,
  draft: DraftOutput
): Promise<CritiqueOutput> {
  const user = `=== REQUEST ===
${JSON.stringify(request, null, 2)}

=== SONNET DRAFT TO FACT-CHECK ===
${JSON.stringify(draft, null, 2)}`;

  const result = await callHaikuJson<CritiqueOutput>(env, {
    model: env.HAIKU_MODEL_ID,
    system: CRITIQUE_SYSTEM,
    user,
    prefill: "{",
    maxTokens: 768,
    temperature: 0,
    maxRetries: 2
  });
  return result.data;
}

function validateDraft(d: DraftOutput): void {
  if (!Array.isArray(d.jurisdictions) || d.jurisdictions.length !== 2) {
    throw new Error(`validateDraft: expected 2 jurisdictions, got ${d.jurisdictions?.length ?? 0}`);
  }
  for (const j of d.jurisdictions) {
    if (!j.code || !j.display_name || !j.posture?.label) {
      throw new Error(`validateDraft: jurisdiction missing required fields (code=${j.code})`);
    }
  }
  if (d.side_by_side) {
    const tradeoffs = d.side_by_side.key_tradeoffs ?? [];
    if (tradeoffs.length < 3 || tradeoffs.length > 5) {
      throw new Error(`validateDraft: expected 3-5 tradeoffs, got ${tradeoffs.length}`);
    }
  }
}

// ------------------------------------------------------------------
// Render markdown for GitHub commit
// ------------------------------------------------------------------

function isValidUrl(u: unknown): u is string {
  if (typeof u !== "string") return false;
  const s = u.trim();
  if (!s || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return false;
  return /^https?:\/\//i.test(s);
}

function renderCitations(citations: readonly { label: string; url: string }[]): string {
  const clean = citations.filter((c) => isValidUrl(c.url) && c.label?.trim());
  if (clean.length === 0) return "";
  return `\n## Sources\n\n${clean.map((c) => `- [${c.label}](${c.url})`).join("\n")}`;
}

export function renderSnapshotMarkdown(snap: JurisdictionSnapshot): string {
  const r = snap.request;
  const [a, b] = snap.jurisdictions;
  if (!a || !b) return "Snapshot incomplete.";

  const citations = snap.citations ?? [];
  const trades = snap.side_by_side?.key_tradeoffs ?? [];
  const heroBlock = snap.hero_image
    ? `\n![Jurisdiction comparison hero](../../${snap.hero_image.path})\n`
    : "";

  return `---
snapshot_id: ${snap.snapshot_id}
requested_at: ${snap.requested_at}
requester_name: ${r.full_name}
requester_email: ${r.email}
company: ${r.company ?? "-"}
activity: ${r.activity}
urgency_window: ${r.urgency_window ?? "-"}
jurisdictions: ${r.jurisdiction_codes.join(" vs ")}
verdict: ${snap.side_by_side?.verdict ?? "-"}
winner_code: ${snap.side_by_side?.winner_code ?? "-"}
factual_confidence: ${snap.critique?.factual_confidence ?? "-"}
escalated: ${snap.critique?.escalate_to_sonnet ?? false}
---

# Jurisdiction Risk Snapshot — ${a.display_name} vs ${b.display_name}
${heroBlock}
**Activity:** ${r.activity}
**Urgency:** ${r.urgency_window ?? "unspecified"}
**Requested by:** ${r.full_name}${r.company ? ` (${r.company})` : ""} — ${r.email}

## Verdict

${snap.side_by_side?.verdict ?? "No verdict generated."}

### Key tradeoffs

${trades.map((t) => `- ${t}`).join("\n")}

## ${a.display_name} (${a.code})

| Dimension | Finding |
|---|---|
| **Posture** | ${a.posture.label} — ${a.posture.rationale} |
| **Licensing** | ${a.licensing.required_licenses.join(", ")} \\| ${a.licensing.regulator} \\| timeline: ${a.licensing.typical_timeline} \\| cost: ${a.licensing.typical_cost_usd} |
| **Tax** | Corp ${a.tax_summary.corporate_rate} \\| VAT/GST ${a.tax_summary.vat_gst} \\| Crypto: ${a.tax_summary.crypto_specific_treatment} |
| **Banking** | ${a.banking_accessibility.rating} — ${a.banking_accessibility.notes} |

**Recent enforcement:**
${a.recent_enforcement.length === 0 ? "- (none identified)" : a.recent_enforcement.map((e) => `- **${e.date}** — ${e.actor}: ${e.summary}${e.penalty ? ` (penalty: ${e.penalty})` : ""}`).join("\n")}

**Upcoming deadlines:**
${a.upcoming_deadlines.length === 0 ? "- (none identified)" : a.upcoming_deadlines.map((d) => `- **${d.date}** — ${d.requirement}`).join("\n")}

## ${b.display_name} (${b.code})

| Dimension | Finding |
|---|---|
| **Posture** | ${b.posture.label} — ${b.posture.rationale} |
| **Licensing** | ${b.licensing.required_licenses.join(", ")} \\| ${b.licensing.regulator} \\| timeline: ${b.licensing.typical_timeline} \\| cost: ${b.licensing.typical_cost_usd} |
| **Tax** | Corp ${b.tax_summary.corporate_rate} \\| VAT/GST ${b.tax_summary.vat_gst} \\| Crypto: ${b.tax_summary.crypto_specific_treatment} |
| **Banking** | ${b.banking_accessibility.rating} — ${b.banking_accessibility.notes} |

**Recent enforcement:**
${b.recent_enforcement.length === 0 ? "- (none identified)" : b.recent_enforcement.map((e) => `- **${e.date}** — ${e.actor}: ${e.summary}${e.penalty ? ` (penalty: ${e.penalty})` : ""}`).join("\n")}

**Upcoming deadlines:**
${b.upcoming_deadlines.length === 0 ? "- (none identified)" : b.upcoming_deadlines.map((d) => `- **${d.date}** — ${d.requirement}`).join("\n")}

${renderCitations(citations)}

${snap.critique && snap.critique.hallucination_risks.length > 0 ? `\n## Internal critique flags (not shown to client)\n\n${snap.critique.hallucination_risks.map((h) => `- ${h}`).join("\n")}` : ""}

---

**Want the full Intelligence Report for these jurisdictions?** 40 pages, licensed-regulator-by-regulator, court-grade citations, white-glove. [Talk to the BizLegal-AI team →](https://app.bizlegal-ai.com/enterprise)

**Disclaimer:** This snapshot is general guidance produced by BizLegal-AI's intelligence pipeline. It is not legal, financial, or tax advice. Consult qualified counsel for specific situations.
`;
}
