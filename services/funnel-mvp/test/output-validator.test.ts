import { describe, expect, test } from "vitest";

import { OutputValidatorService } from "../src/ai/output-validator-service.js";
import { DisclaimerText } from "../src/utils/disclaimer.js";

describe("OutputValidatorService", () => {
  test("rejects top risks that do not cite evidence", () => {
    const validator = new OutputValidatorService({
      minimumConfidence: 0.65
    });

    expect(() =>
      validator.validatePrescan(
        {
          topRisks: [
            {
              title: "Hidden tax exposure",
              summary: "Tax liabilities may be understated.",
              evidenceRefs: []
            }
          ],
          hiddenRisk: "No hidden risk",
          riskScore: 7,
          decision: "Renegotiate",
          teaserSummary: "Tax exposure detected.",
          confidence: 0.82,
          evidenceRefs: ["fact-1"],
          disclaimer: DisclaimerText
        },
        {
          availableEvidenceRefs: new Set(["fact-1"])
        }
      )
    ).toThrow(/evidence/i);
  });

  test("downgrades the decision when the output confidence is too low", () => {
    const validator = new OutputValidatorService({
      minimumConfidence: 0.65
    });

    const validated = validator.validateFullAnalysis(
      {
        overview: "Sparse evidence suggests unresolved liability allocation.",
        riskScore: 5,
        topRisks: [
          {
            title: "Liability cap ambiguity",
            summary: "Cap language is weak.",
            evidenceRefs: ["fact-1"]
          }
        ],
        hiddenRisk: "Potential cap carve-outs are undefined.",
        legalVulnerabilities: ["Weak cap language"],
        negotiationPoints: ["Tighten indemnity cap wording"],
        actionPlan: ["Request updated draft"],
        decision: "Proceed",
        confidence: 0.4,
        evidenceRefs: ["fact-1"],
        disclaimer: DisclaimerText
      },
      {
        availableEvidenceRefs: new Set(["fact-1"])
      }
    );

    expect(validated.decision).toBe("Needs Human Review");
    expect(validated.confidence).toBe(0.4);
  });
});
