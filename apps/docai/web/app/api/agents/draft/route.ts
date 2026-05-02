import { NextRequest, NextResponse } from "next/server";

import { draftContract } from "@/lib/contract-analysis";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { description, contract_type, jurisdiction, parties } = (await request.json()) as {
      description?: string;
      contract_type?: string;
      jurisdiction?: string;
      parties?: Record<string, string>;
    };

    if (!description?.trim()) {
      return NextResponse.json({ error: "Missing description." }, { status: 400 });
    }

    const result = await draftContract({
      description,
      contractType: contract_type || "Commercial Contract",
      jurisdiction: jurisdiction || "New York",
      parties,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 },
    );
  }
}
