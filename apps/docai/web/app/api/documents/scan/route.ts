import { NextRequest, NextResponse } from "next/server";

import { analyzeContractDocument } from "@/lib/contract-analysis";
import { logEventAsync } from "@/lib/ops/log";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
// Skip static prerender — runtime env vars (Supabase) required.
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, filename, document_text, contract_type } = (await request.json()) as {
      email?: string;
      filename?: string;
      document_text?: string;
      contract_type?: string;
    };

    if (!email?.trim() || !filename?.trim() || !document_text?.trim()) {
      return NextResponse.json(
        { error: "email, filename, and document_text are required." },
        { status: 400 },
      );
    }

    const result = await analyzeContractDocument({
      documentText: document_text,
      contractType: contract_type || "Commercial Contract",
      jurisdiction: "general",
    });

    const scanId = crypto.randomUUID();

    const { error } = await supabaseAdmin.from("contract_scans").insert({
      id: scanId,
      email: email.trim().toLowerCase(),
      filename,
      contract_type: result.contract_type || contract_type || "Commercial Contract",
      score: result.risk_score,
      red_flags: result.red_flags.length,
      total_risks: result.red_flags.length + result.missing_clauses.length,
      ai_content: result,
      paid: false,
      payment_provider: "nowpayments",
    });

    if (error) {
      throw new Error(error.message);
    }

    // C-2 fix: Treat lead capture as best-effort; surface failures via ops_log
    // so we notice when nurture pipeline silently loses an email. Don't throw —
    // the contract scan itself succeeded and the user has a valid scan_id.
    const { error: leadInsertErr } = await supabaseAdmin.from("leads").insert({
      email: email.trim().toLowerCase(),
      source: "docai-scan",
      page: "report",
      product: result.contract_type || contract_type || "Commercial Contract",
    });
    if (leadInsertErr) {
      logEventAsync({
        type: "error",
        source: "docai",
        email: email.trim().toLowerCase(),
        status: "failed",
        metadata: {
          stage: "lead_insert",
          err: leadInsertErr.message,
          scan_id: scanId,
          page: "documents/scan",
        },
      });
    }

    return NextResponse.json({
      scan_id: scanId,
      risk_level: result.risk_level,
      risk_score: result.risk_score,
      preview_issues: result.red_flags.slice(0, 2),
      total_issues: result.red_flags.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create scan." },
      { status: 500 },
    );
  }
}
