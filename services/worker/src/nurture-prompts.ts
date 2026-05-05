// Prompt templates + per-vertical context for the lead-nurture state
// machine. The composer at runtime picks the right (step × vertical)
// combination, interpolates the row's lead_classification, and asks
// Claude Haiku 4.5 to produce {subject, body_text, body_html}.
//
// Architectural decision (Phase AA D4): ONE prompt template per step
// (4 total) parameterized on vertical context, rather than 28 separate
// prompt files. The Haiku call gets a system prompt that pins voice
// rules + format contract; the user prompt carries the vertical
// context block + row classification + step-specific guidance.
//
// This keeps the email factory honest: voice + structure stay uniform
// across products, but each vertical gets its real product name,
// regulator focus, and decision-pressure framing.

import type { NurtureStep, NurtureVertical } from "./nurture-state";

// ── Per-vertical context ────────────────────────────────────────────
// Each vertical's facts that anchor the email. Kept short so the
// Haiku prompt stays compact.

export interface VerticalContext {
  /** Product display name in subject/body. */
  readonly product_name: string;
  /** Canonical landing/checkout URL — single source of truth. */
  readonly product_url: string;
  /** What regulator(s) this product helps with. */
  readonly regulator_focus: string;
  /** One-sentence pain point this product addresses. */
  readonly pain_point: string;
  /** What concrete deliverable lands behind the paywall. */
  readonly deliverable: string;
  /** Why someone should act this week vs next month. */
  readonly decision_pressure: string;
  /** Honest comparison framing for step 3. */
  readonly comparison_alts: string;
}

export const VERTICAL_CONTEXTS: Record<NurtureVertical, VerticalContext> = {
  boi: {
    product_name: "BOI Tracker",
    product_url: "https://forge.bizlegal-ai.com/boi",
    regulator_focus: "FinCEN beneficial-ownership reporting (CTA)",
    pain_point: "missing or late BOI filings carry $591/day civil penalties + criminal exposure",
    deliverable: "ready-to-file BOI report with FinCEN-formatted entity + beneficial-owner records, citations to the relevant CTA sections",
    decision_pressure: "FinCEN deadline windows are short; late filings compound by the day",
    comparison_alts: "DIY via FinCEN portal (slow, error-prone), CPA filing ($300-800), law firm ($1500+), other vendors (template-only, no audit trail)",
  },
  brai: {
    product_name: "BRAI Sanctions Scan",
    product_url: "https://brai.bizlegal-ai.com",
    regulator_focus: "OFAC, EU sanctions, UN consolidated lists",
    pain_point: "doing business with a sanctioned entity is strict-liability; one missed match = enforcement action",
    deliverable: "name + entity screening report against current OFAC/EU/UN lists with confidence scoring and primary-source citations",
    decision_pressure: "sanctions lists update daily; a clean scan from last quarter is not a defense today",
    comparison_alts: "Manual OFAC SDN search (single jurisdiction only), enterprise tools ($25k+/yr), law firm review (slow + expensive)",
  },
  tracr: {
    product_name: "TRACR Wallet Trace",
    product_url: "https://tracr.bizlegal-ai.com",
    regulator_focus: "FinCEN MSB / Travel Rule, IRS digital-asset reporting",
    pain_point: "crypto transactions need provenance evidence for tax + AML; missing trail = audit risk",
    deliverable: "on-chain trace + counterparty risk report with hash-anchored evidence and citations to applicable guidance",
    decision_pressure: "IRS digital-asset enforcement is ramping; trace lookback gets harder the longer you wait",
    comparison_alts: "Free block explorers (no risk scoring), Chainalysis ($50k+/yr), self-trace via Etherscan (no defensible audit trail)",
  },
  lexaudit: {
    product_name: "LexAudit Compliance Monitor",
    product_url: "https://lexaudit.bizlegal-ai.com",
    regulator_focus: "multi-jurisdiction regulatory drift (FinCEN, SEC, CFPB, state AGs)",
    pain_point: "rules change quietly across agencies; first you hear is a subpoena or a fine",
    deliverable: "ongoing compliance baseline + drift alerts when regulators publish guidance affecting your scenario",
    decision_pressure: "new guidance now lands monthly across these agencies; without monitoring you discover it during enforcement",
    comparison_alts: "Manual newsletter triage (signal/noise terrible), GRC platform ($30k+/yr), outside counsel retainer ($5-15k/mo)",
  },
  docai: {
    product_name: "DocAI Privacy Scanner",
    product_url: "https://docai.bizlegal-ai.com",
    regulator_focus: "GDPR, CCPA/CPRA, PIPEDA",
    pain_point: "PII exposure in your docs (drafts, exports, contracts) silently accumulates audit risk",
    deliverable: "document-by-document PII inventory with redaction map + jurisdiction citations",
    decision_pressure: "data-subject access requests have hard deadlines; you cannot answer them without an inventory",
    comparison_alts: "Manual review (untenable past 50 docs), DLP platform ($20k+/yr), law-firm DPIA ($5-15k one-off)",
  },
  forge: {
    product_name: "BizLegal Forge",
    product_url: "https://forge.bizlegal-ai.com",
    regulator_focus: "FinCEN BOI/CTA, OFAC sanctions, GDPR/CCPA privacy",
    pain_point: "small businesses face stacked compliance asks (BOI + sanctions + privacy) without budget for separate tools",
    deliverable: "single workflow that picks the right report + citations for your specific exposure",
    decision_pressure: "regulator timing varies by module; Forge sequences them so deadlines don't collide",
    comparison_alts: "Buying point tools separately (no orchestration), full GRC platform (overkill + expensive), DIY (high error rate)",
  },
  leadforge: {
    product_name: "LeadForge",
    product_url: "https://leadforge.bizlegal-ai.com",
    regulator_focus: "TCPA, CAN-SPAM, lead-gen disclosures",
    pain_point: "outbound campaigns without consent provenance carry per-message penalties",
    deliverable: "consent + suppression-list audit + campaign-by-campaign certification trail",
    decision_pressure: "TCPA class actions move fast; one complaint = months of discovery",
    comparison_alts: "Manual consent logs (audit nightmare), full martech stack ($15k+/yr), outside counsel review (slow per campaign)",
  },
  realestate: {
    product_name: "BizLegal Realestate Compliance",
    product_url: "https://bizlegal-ai.com/realestate",
    regulator_focus: "FinCEN GTOs, OFAC, state real-estate disclosure rules",
    pain_point: "cash deals + LLC layers attract regulator scrutiny; the closing happens before you have an answer",
    deliverable: "deal-specific GTO + OFAC + state disclosure check with closing-ready certifications",
    decision_pressure: "GTOs renew quietly; a deal closing this month may be in scope without you knowing",
    comparison_alts: "Title-company default review (incomplete), specialist law firm ($3-8k per closing), DIY (per-deal risk you cannot quantify)",
  },
  generic: {
    // Note: composer should prefer fallback over Haiku for this vertical
    // unless lead_classification supplies a specific regulator/jurisdiction.
    // Rationale: a generic regulator slot lets Haiku invent a fact.
    product_name: "BizLegal-AI",
    product_url: "https://bizlegal-ai.com/agents",
    regulator_focus: "FinCEN, OFAC, SEC, FTC, GDPR, CCPA — agent picks the right one based on your inputs",
    pain_point: "compliance asks accumulate quietly until something forces a response",
    deliverable: "agent-led baseline scan with primary-source citations matched to your specific exposure",
    decision_pressure: "regulators set the deadlines; the right time to act is before one is on the calendar",
    comparison_alts: "DIY via primary sources (slow), law firm retainer ($expensive), GRC platforms ($enterprise pricing)",
  },
};

export function contextFor(vertical: NurtureVertical): VerticalContext {
  return VERTICAL_CONTEXTS[vertical];
}

// ── Voice rules + format contract (system prompt) ──────────────────
// Pinned across every step so the brand voice is consistent.

export const NURTURE_SYSTEM_PROMPT = `You are the email composer for BizLegal-AI, an autonomous compliance-as-a-service platform. You are writing one email in a 4-step nurture sequence to a lead who voluntarily handed over their email after touching a product page or scan tool.

VOICE RULES:
- Direct. No corporate hedging. No "we are excited to". No "delve into".
- Short paragraphs (1-3 sentences). Vary sentence length.
- Concrete > abstract. Cite a regulator name + a real consequence.
- Honest about limitations (we are software, not a law firm).
- Friendly but professional — written by an operator, not a marketer.
- First-person singular when the email speaks for the founder; first-person plural ("we") only for product capabilities.
- Never claim certainty about a legal outcome. We help frame and evidence; the customer decides.

HARD RULES:
- Subject line: ≤60 characters, no clickbait, no all-caps, no emoji.
- Body: 90-180 words for steps 1-3, 60-120 words for step 4 (last_call).
- Always include the product URL once — never twice.
- Never invent a discount, deadline, or feature that wasn't in the brief.
- Never imply we are a law firm or provide legal advice.
- Always include a soft opt-out cue ("if this is the wrong cadence, unsubscribe at the bottom — no hard feelings").

FORMAT CONTRACT (output ONLY valid JSON):
{
  "subject": "string ≤60 chars",
  "body_text": "plain-text body, line breaks as \\n\\n between paragraphs",
  "body_html": "HTML body, <p> per paragraph, one styled <a> CTA to product URL"
}

Do not output prose, markdown, or commentary. JSON only.`;

// ── Step-specific user prompts ─────────────────────────────────────
// Each receives a {context, classification, lead_summary} payload at
// runtime. Templates use placeholder tokens that the composer fills
// before sending to Haiku.

interface StepBrief {
  readonly intent: string;
  readonly structure: string;
  readonly cta: string;
}

const STEP_BRIEFS: Record<Exclude<NurtureStep, "done">, StepBrief> = {
  welcome: {
    intent: "Welcome the lead, set expectation for the next 7 days, point to the product. This is the first email; build trust by being concrete about what they will receive.",
    structure: "1) Thank them for trying {product_name}. 2) Tell them what {product_name} does in one sentence (use {pain_point} + {deliverable}). 3) Set the cadence: 'over the next week, I'll send 3 short emails — an explainer of {regulator_focus}, an honest comparison, and a final ping with any updates.' 4) Soft opt-out cue + invite a reply. The single CTA button at the bottom is the ONLY link to {product_url} — never repeat the URL elsewhere in the body.",
    cta: "View the full report (single button linking to {product_url}). This is the only anchor in the email.",
  },
  education: {
    intent: "Explain WHY this regulation matters for them, citing one concrete consequence. No FUD — facts only. This is the email where they decide we're a credible source.",
    structure: "1) Open with the specific risk they face: {pain_point}. 2) Cite the regulator + the concrete penalty/consequence (use {regulator_focus} + {decision_pressure}). 3) Briefly explain how {product_name} produces {deliverable}. 4) Soft opt-out cue. The single CTA button at the bottom is the ONLY anchor — do not repeat {product_url} as plain text or a second link.",
    cta: "Run the scan now (single button linking to {product_url}). This is the only anchor in the email.",
  },
  comparison: {
    intent: "Compare {product_name} honestly against alternatives. No bashing — neutral framing. Lead respects honesty here.",
    structure: "1) Open by acknowledging this is a buy-vs-build moment. 2) Compare against {comparison_alts} — give one short pro/con per alternative (DIY, law firm, enterprise tool, other vendors). 3) Position {product_name} as the speed-to-defensible-evidence option, not the cheapest or most thorough. 4) Soft opt-out cue. The single CTA button at the bottom is the ONLY anchor — do not link to {product_url} from inline text.",
    cta: "See the report shape (single button linking to {product_url}). This is the only anchor in the email.",
  },
  last_call: {
    intent: "Final email before sequence ends. Short. One last concrete reason + a soft door-closer. No discount manufacturing.",
    structure: "1) Acknowledge this is the last email in the sequence. 2) One concrete reason to act now (use {decision_pressure}). 3) Door-closer: 'if the timing isn't right, no problem — the report's available whenever you come back.' 4) Soft opt-out cue (still required). The single CTA button at the bottom is the ONLY anchor — do not link to {product_url} elsewhere.",
    cta: "Last link to the report (single button linking to {product_url}). This is the only anchor in the email.",
  },
};

// ── Compose user prompt at runtime ─────────────────────────────────
// Caller passes the row (for vertical + classification) and step.

export interface NurtureUserPromptInput {
  readonly step: Exclude<NurtureStep, "done">;
  readonly vertical: NurtureVertical;
  readonly classification: Record<string, unknown> | null;
  readonly source: string;
}

export function buildUserPrompt(input: NurtureUserPromptInput): string {
  const ctx = contextFor(input.vertical);
  const brief = STEP_BRIEFS[input.step];
  const classificationBlock = input.classification
    ? JSON.stringify(input.classification, null, 2)
    : "(no classification metadata)";

  return [
    `STEP: ${input.step}`,
    `VERTICAL: ${input.vertical}`,
    `LEAD SOURCE: ${input.source}`,
    ``,
    `PRODUCT CONTEXT:`,
    `- product_name: ${ctx.product_name}`,
    `- product_url: ${ctx.product_url}`,
    `- regulator_focus: ${ctx.regulator_focus}`,
    `- pain_point: ${ctx.pain_point}`,
    `- deliverable: ${ctx.deliverable}`,
    `- decision_pressure: ${ctx.decision_pressure}`,
    `- comparison_alts: ${ctx.comparison_alts}`,
    ``,
    `LEAD CLASSIFICATION (raw, may be empty):`,
    classificationBlock,
    ``,
    `STEP INTENT:`,
    brief.intent,
    ``,
    `STRUCTURE (use as guide, not script — write it human, not from a template):`,
    brief.structure,
    ``,
    `CTA:`,
    brief.cta,
    ``,
    `Now compose the email. Output ONLY the JSON object. The body_html must include exactly one styled CTA button (use inline style: background:#0a2540;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;) linking to ${ctx.product_url}. The body must end with a small footer line cueing one-click unsubscribe.`,
  ].join("\n");
}
