import { NextRequest, NextResponse } from "next/server";

import { analyzeContractDocument } from "@/lib/contract-analysis";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { document_text, contract_type, jurisdiction } = (await request.json()) as {
      document_text?: string;
      contract_type?: string;
      jurisdiction?: string;
    };

    if (!document_text?.trim()) {
      return NextResponse.json({ error: "Missing document_text." }, { status: 400 });
    }

    const result = await analyzeContractDocument({
      documentText: document_text,
      contractType: contract_type || "Commercial Contract",
      jurisdiction: jurisdiction || "general",
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 },
    );
  }
}
