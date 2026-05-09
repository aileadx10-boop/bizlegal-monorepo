import { callClaudeJson } from "@/lib/anthropic";
import {
  buildDocStackHref,
  findTemplateByKey,
  formatKeyTermsForPrompt,
  inferDocStackTemplateKey,
  inferPartiesFromKeyTerms,
} from "@/lib/document-catalog";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type EvidenceRef = {
  id: string;
  location: string;
  quote: string;
};

export type UnsupportedClaim = {
  claim: string;
  reason: string;
};

export type RedFlag = {
  clause: string;
  issue: string;
  severity: string;
  recommendation?: string;
  suggested_fix?: string;
  evidence_refs?: EvidenceRef[];
  confidence?: number;
};

export type AnalyzeResult = {
  risk_level: RiskLevel;
  risk_score: number;
  contract_type: string;
  red_flags: RedFlag[];
  missing_clauses: string[];
  compliance_issues: string[];
  summary: string;
  confidence?: number;
  evidence_refs?: EvidenceRef[];
  unsupported_claims?: UnsupportedClaim[];
  strengths?: string[];
  recommended_action?: string;
  action_detail?: string;
  docstack_recommendation?: {
    template_key: string;
    template_name: string;
    reason: string;
    href: string;
  };
};

export type ReviewResult = {
  issues: Array<{
    clause: string;
    severity: string;
    detail: string;
  }>;
  suggestions: string[];
  approved_clauses: string[];
  overall_rating: string;
};

export type DraftResult = {
  draft: string;
  notes: string[];
  next_steps: string[];
};

export type GenerateResult = {
  contract_text: string;
  warnings: string[];
  missing_fields: string[];
  estimated_review_time: string;
};

function normalizeRiskLevel(value: string): RiskLevel {
  const normalized = value.toLowerCase();
  if (normalized === "critical" || normalized === "high" || normalized === "medium" || normalized === "low") {
    return normalized;
  }
  return "medium";
}

function normalizeConfidence(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }
  return Math.max(0, Math.min(1, value));
}

function hasEvidence(issue: RedFlag) {
  return Array.isArray(issue.evidence_refs) && issue.evidence_refs.some((ref) => ref.quote?.trim() && ref.location?.trim());
}

function normalizeDocumentForPrompt(documentText: string) {
  return documentText
    .split(/\r?\n/)
    .map((line, index) => `L${index + 1}: ${line}`)
    .join("\n")
    .slice(0, 90_000);
}


export function enrichAnalyzeResult(result: AnalyzeResult): AnalyzeResult {
  const contractType = result.contract_type || "General Commercial Contract";
  const templateKey = inferDocStackTemplateKey(contractType);
  const template = findTemplateByKey(templateKey);

  const redFlags = Array.isArray(result.red_flags) ? result.red_flags : [];
  const supportedRedFlags = redFlags.filter(hasEvidence);
  const unsupportedFromRisks = redFlags
    .filter((risk) => !hasEvidence(risk))
    .map((risk) => ({
      claim: `${risk.clause}: ${risk.issue}`,
      reason: "No supporting clause quote or line reference was returned by the model.",
    }));

  return {
    ...result,
    contract_type: contractType,
    risk_level: normalizeRiskLevel(result.risk_level),
    red_flags: supportedRedFlags,
    missing_clauses: Array.isArray(result.missing_clauses) ? result.missing_clauses : [],
    compliance_issues: Array.isArray(result.compliance_issues) ? result.compliance_issues : [],
    evidence_refs: Array.isArray(result.evidence_refs) ? result.evidence_refs : [],
    unsupported_claims: [
      ...(Array.isArray(result.unsupported_claims) ? result.unsupported_claims : []),
      ...unsupportedFromRisks,
    ],
    confidence: normalizeConfidence(result.confidence),
    strengths: Array.isArray(result.strengths) ? result.strengths : [],
    docstack_recommendation: {
      template_key: templateKey,
      template_name: template?.label ?? "Compliant document template",
      reason:
        result.docstack_recommendation?.reason ??
        `Generate a cleaner ${template?.label ?? "agreement"} version to remediate the flagged risks faster.`,
      href: buildDocStackHref(contractType),
    },
  };
}

export async function analyzeContractDocument({
  documentText,
  contractType,
  jurisdiction,
}: {
  documentText: string;
  contractType: string;
  jurisdiction: string;
}) {
  const result = await callClaudeJson<AnalyzeResult>({
    system:
      "You are a contract risk analyst. Return JSON only. This is not legal advice. " +
      "Use only the supplied line-numbered document text. Do not invent parties, jurisdictions, clauses, dates, obligations, or legal conclusions. " +
      "Every red flag must include evidence_refs with an exact quote and line location from the document. " +
      "If support is weak, omit the item from red_flags and put it in unsupported_claims instead. " +
      "Return: { risk_level: 'low'|'medium'|'high'|'critical', risk_score: number (0-100), contract_type: string, " +
      "confidence: number (0-1), evidence_refs: [{ id: string, location: string, quote: string }], " +
      "red_flags: [{ clause: string, issue: string, severity: 'low'|'medium'|'high'|'critical', recommendation?: string, suggested_fix?: string, confidence: number (0-1), evidence_refs: [{ id: string, location: string, quote: string }] }], " +
      "missing_clauses: string[], compliance_issues: string[], unsupported_claims: [{ claim: string, reason: string }], summary: string, strengths?: string[], recommended_action?: string, action_detail?: string }. " +
      "Be commercially practical. Recommendations should be short, concrete, and tied to the cited text.",
    user: [
      `Jurisdiction: ${jurisdiction || "general"}`,
      `Declared contract type: ${contractType || "unknown"}`,
      "Analyze the following line-numbered contract text and return only JSON.",
      normalizeDocumentForPrompt(documentText),
    ].join("\n\n"),
    maxTokens: 3500,
  });


  return enrichAnalyzeResult(result);
}

export async function generateContract({
  templateKey,
  jurisdiction,
  parties,
  keyTerms,
}: {
  templateKey: string;
  jurisdiction: string;
  parties?: { party_a?: string; party_b?: string };
  keyTerms: Record<string, string>;
}) {
  const template = findTemplateByKey(templateKey);

  if (!template) {
    throw new Error("Unknown template key.");
  }

  const inferredParties = inferPartiesFromKeyTerms(keyTerms);
  const payloadParties = {
    party_a: parties?.party_a || inferredParties.party_a,
    party_b: parties?.party_b || inferredParties.party_b,
  };

  return callClaudeJson<GenerateResult>({
    system:
      "You are a commercial attorney. Generate complete legal contracts. " +
      "Return JSON: { contract_text: string, warnings: string[], missing_fields: string[], estimated_review_time: string }",
    user: [
      `Template: ${template.label}`,
      `Description: ${template.desc}`,
      `Jurisdiction: ${jurisdiction}`,
      `Party A: ${payloadParties.party_a}`,
      `Party B: ${payloadParties.party_b}`,
      "Key terms:",
      formatKeyTermsForPrompt(keyTerms),
      "Draft a complete contract that fits the template and jurisdiction. Keep it execution-ready.",
    ].join("\n"),
    maxTokens: 4000,
  });
}

export async function reviewContract({
  contractText,
  jurisdiction,
  reviewFocus,
}: {
  contractText: string;
  jurisdiction: string;
  reviewFocus?: string;
}) {
  return callClaudeJson<ReviewResult>({
    system:
      "You are a senior contract reviewer. Return JSON only with " +
      "{ issues: [{ clause: string, severity: string, detail: string }], suggestions: string[], approved_clauses: string[], overall_rating: string }.",
    user: [
      `Jurisdiction: ${jurisdiction}`,
      `Review focus: ${reviewFocus || "general commercial risk review"}`,
      "Review the following contract text and return only JSON.",
      contractText,
    ].join("\n\n"),
    maxTokens: 2500,
  });
}

export async function draftContract({
  description,
  contractType,
  jurisdiction,
  parties,
}: {
  description: string;
  contractType: string;
  jurisdiction: string;
  parties?: Record<string, string>;
}) {
  return callClaudeJson<DraftResult>({
    system:
      "You are a commercial attorney. Draft contracts from natural-language deal descriptions. " +
      "Return JSON only with { draft: string, notes: string[], next_steps: string[] }.",
    user: [
      `Contract type: ${contractType}`,
      `Jurisdiction: ${jurisdiction}`,
      `Parties: ${JSON.stringify(parties ?? {})}`,
      "Description:",
      description,
    ].join("\n\n"),
    maxTokens: 3500,
  });
}
