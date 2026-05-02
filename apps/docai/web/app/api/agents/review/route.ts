import { NextRequest, NextResponse } from "next/server";

import { reviewContract } from "@/lib/contract-analysis";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { contract_text, jurisdiction, review_focus } = (await request.json()) as {
      contract_text?: string;
      jurisdiction?: string;
      review_focus?: string;
    };

    if (!contract_text?.trim()) {
      return NextResponse.json({ error: "Missing contract_text." }, { status: 400 });
    }

    const result = await reviewContract({
      contractText: contract_text,
      jurisdiction: jurisdiction || "New York",
      reviewFocus: review_focus,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 },
    );
  }
}
