import { NextRequest, NextResponse } from "next/server";

import { verifyNOWPaymentsSignature } from "@/lib/payments";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-nowpayments-sig");

    if (!verifyNOWPaymentsSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
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
      ].filter(Boolean) as string[];

      let matched = false;
      for (const candidate of candidates) {
        const { error, count } = await supabaseAdmin
          .from("contract_scans")
          .update({ paid: true })
          .or(`id.eq.${candidate},nowpayments_order_id.eq.${candidate}`);

        if (!error) {
          matched = true;
          console.log(`[docai/webhook] Marked paid via candidate: ${candidate}`);
          break;
        }
      }

      if (!matched) {
        console.error(`[docai/webhook] No matching record found for candidates:`, candidates);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process webhook." },
      { status: 500 },
    );
  }
}
