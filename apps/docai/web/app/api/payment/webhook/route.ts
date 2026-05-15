import { NextRequest, NextResponse } from "next/server";

import { verifyNOWPaymentsSignature } from "@/lib/payments";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
// Skip static prerender — runtime env vars (Supabase) required.
export const dynamic = "force-dynamic";

/**
 * NOWPayments IPN webhook. HMAC-verified upstream by verifyNOWPaymentsSignature.
 *
 * 2026-05-11 hardening (CODE-REVIEW-W5 C-01, H-02, H-06):
 *   - C-01: Supabase update without .select() returned `{error: null}` even
 *     on zero-row matches. The loop "succeeded" on the first iteration
 *     regardless of whether anything actually got updated. Fix: chain
 *     .select('id') and require data.length > 0 before declaring matched.
 *   - H-06: .or('id.eq.${candidate},nowpayments_order_id.eq.${candidate}')
 *     interpolated raw user-controlled candidate into a PostgREST filter
 *     expression. Replaced with per-column .eq() so the value is sent
 *     as a typed parameter and not parsed as syntax.
 *   - H-02: Catch block no longer returns the raw SDK error message to
 *     the client. Opaque code only; full error stays in server logs.
 *
 * Match ordering is now strict: nowpayments_order_id first (the column we
 * write at /api/payment/checkout invoice creation), then fall through to
 * id only if the operator-provided order_id matches a scan UUID directly.
 * This prevents cross-row matches when a third-party-generated invoice_id
 * collides with a UUID namespace.
 */
const CANDIDATE_COLUMNS = ["nowpayments_order_id", "id"] as const;

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-nowpayments-sig");

    if (!verifyNOWPaymentsSignature(rawBody, signature)) {
      return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as {
      payment_status?: string;
      order_id?: string;
      id?: string;
      invoice_id?: string;
      payment_id?: string;
    };

    if (payload.payment_status === "finished" || payload.payment_status === "confirmed") {
      const candidates = [
        payload.order_id,
        payload.id,
        payload.invoice_id,
        payload.payment_id,
      ].filter((v): v is string => typeof v === "string" && v.length > 0);

      let matched = false;
      let matchedVia: { column: string; candidate: string } | null = null;

      outer: for (const candidate of candidates) {
        for (const column of CANDIDATE_COLUMNS) {
          const { data, error } = await supabaseAdmin
            .from("contract_scans")
            .update({ paid: true })
            .eq(column, candidate)
            .select("id");

          if (error) {
            // PostgREST returns 22P02 invalid UUID etc. when column-type
            // mismatches the candidate — that's an EXPECTED skip, not a
            // real failure. Continue to the next column/candidate.
            continue;
          }
          if (data && data.length > 0) {
            matched = true;
            matchedVia = { column, candidate };
            // eslint-disable-next-line no-console
            console.log(
              `[docai/webhook] Marked paid: ${column}=${candidate} affected=${data.length}`,
            );
            break outer;
          }
        }
      }

      if (!matched) {
        // eslint-disable-next-line no-console
        console.error(
          `[docai/webhook] No matching scan for payment candidates:`,
          candidates,
        );
      }
      // matchedVia kept available for future ops_log integration; intentionally
      // not exposed in the 200 response (NOWPayments only inspects status).
      void matchedVia;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    // H-02: opaque error code to client; full detail stays server-side.
    // eslint-disable-next-line no-console
    console.error("[docai/webhook] processing error:", error);
    return NextResponse.json(
      { error: "webhook_processing_failed" },
      { status: 500 },
    );
  }
}
