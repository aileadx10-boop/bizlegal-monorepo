import { NextRequest, NextResponse } from "next/server";

import { capturePayPalScanOrder, getPayPalCaptureId, getPayPalScanReference } from "@/lib/paypal-scan";
import { logEventAsync } from "@/lib/ops/log";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /payment/paypal/return — PayPal return target for the payment_orders
 * checkout flow (web/app/api/payments/paypal/start/route.ts). Mirrors the
 * scan-flow return handler at /api/payment/paypal/return, but updates
 * payment_orders and lands the buyer on /payment/success.
 *
 * One-time orders return ?order=<payment_orders.id>&token=<paypal order id>
 * and must be captured here. Subscription approvals return
 * ?order=<id>&subscription_id=<id> instead — no capture, the PayPal webhook
 * activates the subscription.
 */
function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://docai.bizlegal-ai.com";
}

function redirectUrl(orderId: string, params?: Record<string, string>) {
  const url = new URL("/payment/success", siteUrl());
  if (orderId) url.searchParams.set("order", orderId);
  for (const [key, value] of Object.entries(params || {})) {
    if (value) url.searchParams.set(key, value);
  }
  return url;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("order")?.trim() || "";
  const token = url.searchParams.get("token")?.trim() || "";
  const subscriptionId = url.searchParams.get("subscription_id")?.trim() || "";

  if (!orderId) {
    return NextResponse.redirect(redirectUrl("", { paypal_error: "missing_order" }), 303);
  }

  // Subscription approval — activation arrives via the PayPal webhook.
  if (!token) {
    if (subscriptionId) {
      return NextResponse.redirect(redirectUrl(orderId), 303);
    }
    return NextResponse.redirect(redirectUrl(orderId, { paypal_error: "missing_return_token" }), 303);
  }

  try {
    const capture = await capturePayPalScanOrder(token);
    const referencedOrderId = getPayPalScanReference(capture);

    if (referencedOrderId && referencedOrderId !== orderId) {
      return NextResponse.redirect(redirectUrl(orderId, { paypal_error: "order_mismatch" }), 303);
    }

    if (capture.status !== "COMPLETED") {
      return NextResponse.redirect(redirectUrl(orderId, { paypal_error: "not_completed" }), 303);
    }

    const captureId = getPayPalCaptureId(capture);
    const { data, error } = await supabaseAdmin
      .from("payment_orders")
      .update({
        status: "active",
        activated_at: new Date().toISOString(),
        metadata: { paypal_order_id: token, paypal_capture_id: captureId },
      })
      .eq("id", orderId)
      .select("id, user_email, amount_cents, product, tier, billing_interval, source");

    if (error || !data?.length) {
      throw new Error(error?.message || "No payment_orders row updated after PayPal capture.");
    }

    const order = data[0] as {
      id: string; user_email: string | null; amount_cents: number;
      product: string; tier: string; billing_interval: string; source: string | null;
    };

    logEventAsync({
      type: "payment.confirmed",
      source: "docai",
      ref_id: orderId,
      email: order.user_email ?? undefined,
      amount_cents: order.amount_cents,
      status: "ok",
      metadata: {
        gateway: "paypal",
        paypal_order_id: token,
        paypal_capture_id: captureId,
        product: order.product,
        tier: order.tier,
        interval: order.billing_interval,
        order_source: order.source,
      },
    });

    return NextResponse.redirect(redirectUrl(orderId), 303);
  } catch (error) {
    console.error("[docai/payment/paypal/return]", error);
    logEventAsync({
      type: "payment.failed",
      source: "docai",
      ref_id: orderId,
      status: "failed",
      metadata: { gateway: "paypal", stage: "capture", error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.redirect(redirectUrl(orderId, { paypal_error: "capture_failed" }), 303);
  }
}
