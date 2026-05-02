import { NextRequest, NextResponse } from "next/server";

import { createNOWPaymentsInvoice } from "@/lib/payments";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { scan_id, email } = (await request.json()) as {
      scan_id?: string;
      email?: string;
    };

    if (!scan_id || !email?.trim()) {
      return NextResponse.json({ error: "scan_id and email are required." }, { status: 400 });
    }

    const { data: scan, error: scanError } = await supabaseAdmin
      .from("contract_scans")
      .select("id")
      .eq("id", scan_id)
      .single();

    if (scanError || !scan) {
      return NextResponse.json({ error: "Scan not found." }, { status: 404 });
    }

    const invoice = await createNOWPaymentsInvoice({
      scanId: scan_id,
      email: email.trim().toLowerCase(),
      description: "DocAI contract scan report",
    });

    const { error: updateError } = await supabaseAdmin
      .from("contract_scans")
      .update({
        email: email.trim().toLowerCase(),
        nowpayments_order_id: invoice.id,
      })
      .eq("id", scan_id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({ invoice_url: invoice.invoice_url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create invoice." },
      { status: 500 },
    );
  }
}
