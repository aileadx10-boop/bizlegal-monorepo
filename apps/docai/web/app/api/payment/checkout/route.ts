import { NextRequest, NextResponse } from "next/server";

import { createNOWPaymentsInvoice } from "@/lib/payments";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
// Skip static prerender — `supabaseAdmin` requires env vars only available at request time.
export const dynamic = "force-dynamic";

/**
 * DocAI NOWPayments checkout intake.
 *
 * 2026-05-11 hardening (CODE-REVIEW-W5 H-02, H-04):
 *   - H-04: Internal redirect URLs are now built from `NEXT_PUBLIC_SITE_URL`
 *     instead of `request.url`. Vercel edge proxies can carry attacker-
 *     controlled Host headers in some configurations; the previous
 *     `new URL("/report", request.url)` opened a host-spoof surface.
 *   - H-04: NOWPayments invoice URL is now allow-listed to its origin
 *     before redirecting. NOWPayments invoices live at
 *     https://nowpayments.io/payment/?iid=... only; anything else
 *     coming back from the SDK is treated as tampered.
 *   - H-02: Catch block no longer leaks raw error messages to the
 *     redirect URL as `invoice_error`. Opaque codes only.
 */
const NOWPAYMENTS_INVOICE_ORIGIN = "https://nowpayments.io";

function siteUrl(): string {
  // Use the verified site URL the rest of the lib already requires.
  // Fall back to the canonical DocAI host so an env-drift edge doesn't
  // 500 the route (the user still gets a redirect to a real domain
  // they can recover from).
  return process.env.NEXT_PUBLIC_SITE_URL || "https://docai.bizlegal-ai.com";
}

function buildReportUrl(scanId: string): URL {
  const url = new URL("/report", siteUrl());
  if (scanId) {
    url.searchParams.set("scan_id", scanId);
  }
  return url;
}

function isValidInvoiceUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.origin === NOWPAYMENTS_INVOICE_ORIGIN;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const scanId = formData.get("scan_id")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";

  const reportUrl = buildReportUrl(scanId || "unknown");

  if (!scanId || !email) {
    reportUrl.searchParams.set("invoice_error", "missing_input");
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
      reportUrl.searchParams.set("invoice_error", "scan_not_found");
      reportUrl.searchParams.set("email", email);
      return NextResponse.redirect(reportUrl, 303);
    }

    const invoice = await createNOWPaymentsInvoice({
      scanId,
      email,
      description: "DocAI evidence-cited contract risk report",
      priceUsd: 97,
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

    // H-04 fix: only redirect to the canonical NOWPayments invoice
    // origin. Anything else (SDK regression, MitM, future-tense supply-
    // chain compromise on the SDK response) routes the user back to
    // the on-domain report URL with an opaque error instead.
    if (!isValidInvoiceUrl(invoice.invoice_url)) {
      // eslint-disable-next-line no-console
      console.error(
        "[docai/checkout] Refused redirect to non-NOWPayments invoice URL:",
        invoice.invoice_url,
      );
      reportUrl.searchParams.set("invoice_error", "invoice_origin_invalid");
      reportUrl.searchParams.set("email", email);
      return NextResponse.redirect(reportUrl, 303);
    }

    return NextResponse.redirect(invoice.invoice_url, 303);
  } catch (error) {
    // H-02 fix: opaque error code to client URL, full details to server logs.
    // eslint-disable-next-line no-console
    console.error("[docai/checkout] invoice creation failed:", error);
    reportUrl.searchParams.set("invoice_error", "invoice_creation_failed");
    reportUrl.searchParams.set("email", email);
    return NextResponse.redirect(reportUrl, 303);
  }
}
