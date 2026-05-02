import { z } from "zod";

import { DisclaimerText } from "../utils/disclaimer.js";
import type { FullAnalysisOutput, PrescanOutput } from "../types/domain.js";

const riskItemSchema = z.object({
  title: z.string(),
  summary: z.string(),
  evidenceRefs: z.array(z.string()).min(1)
});

const prescanSchema = z.object({
  topRisks: z.array(riskItemSchema).min(1).max(5),
  hiddenRisk: z.string(),
  riskScore: z.number().min(1).max(10),
  decision: z.enum(["Proceed", "Kill", "Renegotiate", "Needs Human Review", "Insufficient Evidence"]),
  teaserSummary: z.string(),
  confidence: z.number().min(0).max(1),
  evidenceRefs: z.array(z.string()).min(1),
  disclaimer: z.string().default(DisclaimerText)
});

const fullAnalysisSchema = z.object({
  overview: z.string(),
  riskScore: z.number().min(1).max(10),
  topRisks: z.array(riskItemSchema).min(1).max(5),
  hiddenRisk: z.string(),
  legalVulnerabilities: z.array(z.string()).min(1),
  negotiationPoints: z.array(z.string()).min(1),
  actionPlan: z.array(z.string()).min(1),
  decision: z.enum(["Proceed", "Kill", "Renegotiate", "Needs Human Review", "Insufficient Evidence"]),
  confidence: z.number().min(0).max(1),
  evidenceRefs: z.array(z.string()).min(1),
  disclaimer: z.string().default(DisclaimerText)
});

export interface MiniMaxClient {
  runPrescan(prompt: string): Promise<PrescanOutput>;
  runFullAnalysis(prompt: string): Promise<FullAnalysisOutput>;
}

export class AnthropicCompatibleMiniMaxClient implements MiniMaxClient {
  constructor(
    private readonly options: {
      apiKey: string;
      baseUrl: string;
      model: string;
    }
  ) {}

  async runPrescan(prompt: string): Promise<PrescanOutput> {
    const payload = await this.send(prompt);
    return prescanSchema.parse(payload);
  }

  async runFullAnalysis(prompt: string): Promise<FullAnalysisOutput> {
    const payload = await this.send(prompt);
    return fullAnalysisSchema.parse(payload);
  }

  private async send(prompt: string) {
    const response = await fetch(`${this.options.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.options.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.options.model,
        max_tokens: 1800,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`MiniMax request failed with status ${response.status}`);
    }

    const data = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const text = data.content?.find((item) => item.type === "text")?.text;

    if (!text) {
      throw new Error("MiniMax response did not include a text payload.");
    }

    return JSON.parse(text) as unknown;
  }
}
