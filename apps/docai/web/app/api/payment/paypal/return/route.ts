import { NextRequest, NextResponse } from "next/server";

import { capturePayPalScanOrder, getPayPalCaptureId, getPayPalScanReference } from "@/lib/paypal-scan";
import { logEventAsync } from "@/lib/ops/log";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://docai.bizlegal-ai.com";
}

function reportUrl(scanId: string, params?: Record<string, string>) {
  const url = new URL("/report", siteUrl());
  if (scanId) url.searchParams.set("scan_id", scanId);
  for (const [key, value] of Object.entries(params || {})) {
    if (value) url.searchParams.set(key, value);
  }
  return url;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const scanId = url.searchParams.get("scan_id")?.trim() || "";
  const email = url.searchParams.get("email")?.trim().toLowerCase() || "";
  const token = url.searchParams.get("token")?.trim() || "";
  const redirectUrl = reportUrl(scanId || "unknown", email ? { email } : undefined);

  if (!scanId || !token) {
    redirectUrl.searchParams.set("paypal_error", "missing_return_token");
    return NextResponse.redirect(redirectUrl, 303);
  }

  try {
    const capture = await capturePayPalScanOrder(token);
    const referencedScanId = getPayPalScanReference(capture);

    if (referencedScanId && referencedScanId !== scanId) {
      redirectUrl.searchParams.set("paypal_error", "scan_mismatch");
      return NextResponse.redirect(redirectUrl, 303);
    }

    if (capture.status !== "COMPLETED") {
      redirectUrl.searchParams.set("paypal_error", "not_completed");
      return NextResponse.redirect(redirectUrl, 303);
    }

    const captureId = getPayPalCaptureId(capture);
    const { data, error } = await supabaseAdmin
      .from("contract_scans")
      .update({
        paid: true,
        payment_provider: "paypal",
        nowpayments_order_id: `paypal_${token}`,
      })
      .eq("id", scanId)
      .select("id");

    if (error || !data?.length) {
      throw new Error(error?.message || "No scan row updated after PayPal capture.");
    }

    logEventAsync({
      type: "payment.confirmed",
      source: "docai",
      ref_id: scanId,
      email,
      amount_cents: 9700,
      status: "ok",
      metadata: { gateway: "paypal", paypal_order_id: token, paypal_capture_id: captureId, product: "docai_scan_report" },
    });

    redirectUrl.searchParams.set("payment_status", "paid");
    return NextResponse.redirect(redirectUrl, 303);
  } catch (error) {
    console.error("[docai/paypal/return]", error);
    logEventAsync({
      type: "payment.failed",
      source: "docai",
      ref_id: scanId,
      email,
      amount_cents: 9700,
      status: "failed",
      metadata: { gateway: "paypal", stage: "capture", error: error instanceof Error ? error.message : String(error) },
    });
    redirectUrl.searchParams.set("paypal_error", "capture_failed");
    return NextResponse.redirect(redirectUrl, 303);
  }
}
