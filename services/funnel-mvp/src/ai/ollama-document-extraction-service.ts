import { z } from "zod";

import type { OllamaExtraction } from "../types/domain.js";

const extractionSchema = z.object({
  clauses: z.array(z.object({ title: z.string(), detail: z.string(), chunkId: z.string() })),
  anomalies: z.array(z.object({ title: z.string(), detail: z.string(), chunkId: z.string() })),
  missingProtections: z.array(z.object({ title: z.string(), detail: z.string(), chunkId: z.string() })),
  ambiguities: z.array(z.object({ title: z.string(), detail: z.string(), chunkId: z.string() }))
});

export interface DocumentExtractionService {
  extract(documentText: string): Promise<OllamaExtraction>;
}

export class OllamaDocumentExtractionService implements DocumentExtractionService {
  constructor(
    private readonly options: {
      baseUrl: string;
      model: string;
    }
  ) {}

  async extract(documentText: string): Promise<OllamaExtraction> {
    const response = await fetch(`${this.options.baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: this.options.model,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "Extract clause titles, anomalies, missing protections, and ambiguities from the contract text. Return JSON only."
          },
          {
            role: "user",
            content: documentText
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama extraction failed with status ${response.status}`);
    }

    const data = (await response.json()) as {
      message?: { content?: string };
    };
    const payload = data.message?.content;

    if (!payload) {
      throw new Error("Ollama response was empty.");
    }

    return extractionSchema.parse(JSON.parse(payload));
  }
}
