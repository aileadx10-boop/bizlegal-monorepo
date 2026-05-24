import { NextRequest, NextResponse } from "next/server";

import { createPayPalScanOrder } from "@/lib/paypal-scan";
import { logEventAsync } from "@/lib/ops/log";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://docai.bizlegal-ai.com";
}

function buildReportUrl(scanId: string, params?: Record<string, string>) {
  const url = new URL("/report", siteUrl());
  if (scanId) url.searchParams.set("scan_id", scanId);
  for (const [key, value] of Object.entries(params || {})) {
    if (value) url.searchParams.set(key, value);
  }
  return url;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const scanId = formData.get("scan_id")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const reportUrl = buildReportUrl(scanId || "unknown", email ? { email } : undefined);

  if (!scanId || !email) {
    reportUrl.searchParams.set("paypal_error", "missing_input");
    return NextResponse.redirect(reportUrl, 303);
  }

  try {
    const { data: scan, error: scanError } = await supabaseAdmin
      .from("contract_scans")
      .select("id, paid")
      .eq("id", scanId)
      .single();

    if (scanError || !scan) {
      reportUrl.searchParams.set("paypal_error", "scan_not_found");
      return NextResponse.redirect(reportUrl, 303);
    }

    if (scan.paid) {
      reportUrl.searchParams.set("payment_status", "already_paid");
      return NextResponse.redirect(reportUrl, 303);
    }

    const order = await createPayPalScanOrder({ scanId, email });

    const { error: updateError } = await supabaseAdmin
      .from("contract_scans")
      .update({
        email,
        payment_provider: "paypal",
        nowpayments_order_id: `paypal_${order.orderId}`,
      })
      .eq("id", scanId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    logEventAsync({
      type: "payment.intent",
      source: "docai",
      ref_id: scanId,
      email,
      amount_cents: 9700,
      status: "pending",
      metadata: { gateway: "paypal", paypal_order_id: order.orderId, product: "docai_scan_report" },
    });

    return NextResponse.redirect(order.approvalUrl, 303);
  } catch (error) {
    console.error("[docai/paypal/checkout]", error);
    logEventAsync({
      type: "payment.failed",
      source: "docai",
      ref_id: scanId,
      email,
      amount_cents: 9700,
      status: "failed",
      metadata: { gateway: "paypal", stage: "checkout", error: error instanceof Error ? error.message : String(error) },
    });
    reportUrl.searchParams.set("paypal_error", "checkout_failed");
    return NextResponse.redirect(reportUrl, 303);
  }
}
