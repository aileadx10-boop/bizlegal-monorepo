import { NextRequest, NextResponse } from "next/server";

import { generateContract } from "@/lib/contract-analysis";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { template_key, jurisdiction, parties, key_terms } = (await request.json()) as {
      template_key?: string;
      jurisdiction?: string;
      parties?: { party_a?: string; party_b?: string };
      key_terms?: Record<string, string>;
    };

    if (!template_key || !key_terms || Object.keys(key_terms).length === 0) {
      return NextResponse.json({ error: "Missing template_key or key_terms." }, { status: 400 });
    }

    const result = await generateContract({
      templateKey: template_key,
      jurisdiction: jurisdiction || "New York",
      parties,
      keyTerms: key_terms,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 },
    );
  }
}
