import type { FullAnalysisOutput, PrescanOutput, RiskItem } from "../types/domain.js";

export interface OutputValidatorOptions {
  minimumConfidence: number;
}

export interface ValidationContext {
  availableEvidenceRefs: Set<string>;
  allowedJurisdictions?: Set<string>;
  allowedClauseTerms?: Set<string>;
}

export class OutputValidatorService {
  constructor(private readonly options: OutputValidatorOptions) {}

  validatePrescan(output: PrescanOutput, context: ValidationContext): PrescanOutput {
    this.assertEvidenceRefs(output.topRisks, context);
    this.assertEvidenceRefList(output.evidenceRefs, context, "prescan");
    this.assertAllowedTerms(output.topRisks, context);
    return {
      ...output,
      decision:
        output.confidence < this.options.minimumConfidence ? "Needs Human Review" : output.decision
    };
  }

  validateFullAnalysis(output: FullAnalysisOutput, context: ValidationContext): FullAnalysisOutput {
    this.assertEvidenceRefs(output.topRisks, context);
    this.assertEvidenceRefList(output.evidenceRefs, context, "full analysis");
    this.assertAllowedTerms(output.topRisks, context);
    return {
      ...output,
      decision:
        output.confidence < this.options.minimumConfidence ? "Needs Human Review" : output.decision
    };
  }

  private assertEvidenceRefs(risks: RiskItem[], context: ValidationContext) {
    for (const risk of risks) {
      if (risk.evidenceRefs.length === 0) {
        throw new Error(`Risk "${risk.title}" is missing evidence references.`);
      }
      this.assertEvidenceRefList(risk.evidenceRefs, context, risk.title);
    }
  }

  private assertEvidenceRefList(refs: string[], context: ValidationContext, label: string) {
    for (const ref of refs) {
      if (!context.availableEvidenceRefs.has(ref)) {
        throw new Error(`Output section "${label}" cited unsupported evidence ref: ${ref}`);
      }
    }
  }

  private assertAllowedTerms(risks: RiskItem[], context: ValidationContext) {
    for (const risk of risks) {
      const haystack = `${risk.title} ${risk.summary}`.toLowerCase();

      if (context.allowedJurisdictions && context.allowedJurisdictions.size > 0) {
        const knownJurisdictions = ["delaware", "california", "new york", "texas", "florida"];
        for (const jurisdiction of knownJurisdictions) {
          if (
            haystack.includes(jurisdiction) &&
            ![...context.allowedJurisdictions].some((allowed) => jurisdiction.includes(allowed.toLowerCase()))
          ) {
            throw new Error(`Risk "${risk.title}" referenced unsupported jurisdiction "${jurisdiction}".`);
          }
        }
      }

      if (context.allowedClauseTerms && context.allowedClauseTerms.size > 0) {
        const clauseMentions = haystack.match(/[a-z- ]+clause/g) ?? [];
        for (const mention of clauseMentions) {
          if (
            ![...context.allowedClauseTerms].some((allowed) =>
              mention.includes(allowed.toLowerCase()) || allowed.toLowerCase().includes(mention.trim())
            )
          ) {
            throw new Error(`Risk "${risk.title}" referenced unsupported clause "${mention.trim()}".`);
          }
        }
      }
    }
  }
}
