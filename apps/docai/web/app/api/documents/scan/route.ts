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
      // SF-C1 fix: previously the scan-insert error was re-thrown into a
      // generic outer catch with no ops_log emission. Failed paid-scan
      // creations vanished from /ops entirely — the only DocAI revenue
      // surface had no telemetry on its primary failure mode. Log the
      // structured error to ops_log BEFORE the throw bubbles up so the
      // event shows in the dashboard even when the user-facing flow 500s.
      logEventAsync({
        type: "error",
        source: "docai",
        email: email.trim().toLowerCase(),
        status: "failed",
        metadata: {
          stage: "scan_insert",
          err: error.message,
          scan_id: scanId,
          contract_type: result.contract_type || contract_type || "Commercial Contract",
          page: "documents/scan",
        },
      });
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
    // H-02 cleanup: log full detail server-side; return opaque code to client.
    // SF-C1 sibling: ensure outer-catch path also emits ops_log so any
    // earlier-thrown error (network, analyzeContractDocument failure) is
    // visible in /ops without leaking the raw message to the caller.
    // eslint-disable-next-line no-console
    console.error("[docai/scan]", error instanceof Error ? error.message : error);
    logEventAsync({
      type: "error",
      source: "docai",
      status: "failed",
      metadata: {
        stage: "scan_handler",
        err: error instanceof Error ? error.message : String(error),
        page: "documents/scan",
      },
    });
    return NextResponse.json({ error: "scan_failed" }, { status: 500 });
  }
}
