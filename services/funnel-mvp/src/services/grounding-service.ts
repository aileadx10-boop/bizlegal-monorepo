import type { EvidenceBundle, FullAnalysisOutput, OllamaExtraction, PrescanOutput, Qualification } from "../types/domain.js";
import { DisclaimerText } from "../utils/disclaimer.js";

export class GroundingService {
  buildQualificationEvidence(sessionId: string, qualification: Qualification): EvidenceBundle {
    return {
      id: `evidence-${sessionId}`,
      sessionId,
      createdAt: new Date().toISOString(),
      facts: [
        {
          id: "fact-deal-type",
          label: "deal_type",
          value: qualification.dealType,
          category: "qualification",
          sourceType: "reply",
          sourceRef: "reply"
        },
        ...(qualification.dealSize
          ? [
              {
                id: "fact-deal-size",
                label: "deal_size",
                value: qualification.dealSize,
                category: "qualification" as const,
                sourceType: "reply" as const,
                sourceRef: "reply"
              }
            ]
          : []),
        ...(qualification.jurisdiction
          ? [
              {
                id: "fact-jurisdiction",
                label: "jurisdiction",
                value: qualification.jurisdiction,
                category: "qualification" as const,
                sourceType: "reply" as const,
                sourceRef: "reply"
              }
            ]
          : []),
        {
          id: "fact-free-text",
          label: "free_text",
          value: qualification.freeText,
          category: "qualification",
          sourceType: "reply",
          sourceRef: "reply"
        }
      ]
    };
  }

  mergeDocumentEvidence(bundle: EvidenceBundle, extraction: OllamaExtraction): EvidenceBundle {
    const facts = [...bundle.facts];

    for (const insight of [
      ...extraction.clauses,
      ...extraction.anomalies,
      ...extraction.missingProtections,
      ...extraction.ambiguities
    ]) {
      facts.push({
        id: `doc-${insight.chunkId}-${facts.length + 1}`,
        label: insight.title.toLowerCase().replace(/\s+/g, "_"),
        value: insight.detail,
        category: "document",
        sourceType: "ollama",
        sourceRef: insight.chunkId
      });
    }

    return {
      ...bundle,
      facts
    };
  }

  buildPrescanPrompt(bundle: EvidenceBundle) {
    return [
      "Act as a senior legal risk analyst.",
      "Use only the supplied evidence facts.",
      "If support is weak, choose 'Insufficient Evidence' or 'Needs Human Review'.",
      "Every risk must cite evidenceRefs that exactly match the provided fact ids.",
      `Always include the disclaimer: ${DisclaimerText}`,
      "",
      "Evidence facts:",
      ...bundle.facts.map((fact) => `- ${fact.id} | ${fact.label} | ${fact.value}`),
      "",
      "Return strict JSON with keys: topRisks, hiddenRisk, riskScore, decision, teaserSummary, confidence, evidenceRefs, disclaimer."
    ].join("\n");
  }

  buildFullAnalysisPrompt(bundle: EvidenceBundle, prescan: PrescanOutput) {
    return [
      "Act as a senior legal risk analyst.",
      "Use only the supplied evidence facts and prescan findings.",
      "Do not invent clauses, jurisdictions, or facts.",
      "Every risk and final conclusion must cite evidenceRefs.",
      `Always include the disclaimer: ${DisclaimerText}`,
      "",
      "Evidence facts:",
      ...bundle.facts.map((fact) => `- ${fact.id} | ${fact.label} | ${fact.value}`),
      "",
      "Prescan findings:",
      JSON.stringify(prescan, null, 2),
      "",
      "Return strict JSON with keys: overview, riskScore, topRisks, hiddenRisk, legalVulnerabilities, negotiationPoints, actionPlan, decision, confidence, evidenceRefs, disclaimer."
    ].join("\n");
  }

  createValidationContext(bundle: EvidenceBundle) {
    return {
      availableEvidenceRefs: new Set(bundle.facts.map((fact) => fact.id)),
      allowedJurisdictions: new Set(
        bundle.facts.filter((fact) => fact.label === "jurisdiction").map((fact) => fact.value)
      ),
      allowedClauseTerms: new Set(
        bundle.facts
          .filter((fact) => fact.category === "document")
          .map((fact) => fact.label.replace(/_/g, " "))
      )
    };
  }

  decorateTeaser(prescan: PrescanOutput, checkoutUrl: string) {
    const teaserRisks = prescan.topRisks.slice(0, 2).map((risk) => `- ${risk.title}: ${risk.summary}`);
    return [
      "Pre-scan summary:",
      ...teaserRisks,
      `Hidden risk: ${prescan.hiddenRisk}`,
      `Decision: ${prescan.decision}`,
      `Checkout: ${checkoutUrl}`,
      DisclaimerText
    ].join("\n");
  }

  decorateFinalDelivery(analysis: FullAnalysisOutput, pdfUrl: string, notionUrl: string) {
    return [
      "Your report is ready.",
      `Decision: ${analysis.decision}`,
      `PDF: ${pdfUrl}`,
      `Notion: ${notionUrl}`,
      "I can personally review and negotiate this deal.",
      DisclaimerText
    ].join("\n");
  }
}
