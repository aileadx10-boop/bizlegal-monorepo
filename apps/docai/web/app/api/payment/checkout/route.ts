import { NextRequest, NextResponse } from "next/server";

import { createNOWPaymentsInvoice } from "@/lib/payments";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function buildReportUrl(request: NextRequest, scanId: string) {
  const url = new URL("/report", request.url);
  if (scanId) {
    url.searchParams.set("scan_id", scanId);
  }
  return url;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const scanId = formData.get("scan_id")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";

  const reportUrl = buildReportUrl(request, scanId || "unknown");

  if (!scanId || !email) {
    reportUrl.searchParams.set("invoice_error", "Scan ID and email are required.");
    if (email) {
      reportUrl.searchParams.set("email", email);
    }
    return NextResponse.redirect(reportUrl, 303);
  }

  try {
    const { data: scan, error: scanError } = await supabaseAdmin
      .from("contract_scans")
      .select("id")
      .eq("id", scanId)
      .single();

    if (scanError || !scan) {
      reportUrl.searchParams.set("invoice_error", "Scan not found.");
      reportUrl.searchParams.set("email", email);
      return NextResponse.redirect(reportUrl, 303);
    }

    const invoice = await createNOWPaymentsInvoice({
      scanId,
      email,
      description: "DocAI contract scan report",
    });

    const { error: updateError } = await supabaseAdmin
      .from("contract_scans")
      .update({
        email,
        nowpayments_order_id: invoice.id,
      })
      .eq("id", scanId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.redirect(invoice.invoice_url, 303);
  } catch (error) {
    reportUrl.searchParams.set(
      "invoice_error",
      error instanceof Error ? error.message : "Invoice creation failed.",
    );
    reportUrl.searchParams.set("email", email);
    return NextResponse.redirect(reportUrl, 303);
  }
}
