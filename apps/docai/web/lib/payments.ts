import crypto from "crypto";

// Assert at module load that NEXT_PUBLIC_SITE_URL points at the canonical
// DocAI domain in production. A mis-set value (e.g. a Vercel preview URL)
// causes the NOWPayments IPN callback to fire at the wrong host, so
// paid=true is never written and users who pay never unlock their report.
if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PUBLIC_SITE_URL?.includes("docai.bizlegal-ai.com")
) {
  console.error(
    "[docai/payments] CRITICAL: NEXT_PUBLIC_SITE_URL is not set to the canonical docai domain — IPN webhook will be misdirected. " +
      "Set NEXT_PUBLIC_SITE_URL=https://docai.bizlegal-ai.com in the Vercel project environment settings.",
  );
}

type InvoiceParams = {
  scanId: string;
  email: string;
  description: string;
  /** Price in USD. Defaults to 97 for the evidence-cited risk report flow. New 3-tier pricing matrix supplies the
   * tier-specific dollar amount. */
  priceUsd?: number;
  /** Optional success URL override. Defaults to /report?scan_id=... */
  successUrl?: string;
};

export async function createNOWPaymentsInvoice({
  scanId,
  email,
  description,
  priceUsd,
  successUrl,
}: InvoiceParams) {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  // ipnBase MUST be hardcoded to the production canonical host. Any
  // fallback to NEXT_PUBLIC_SITE_URL risks sending the IPN to a
  // Vercel preview URL where the webhook handler does not exist.
  const ipnBase = "https://docai.bizlegal-ai.com";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ipnBase;

  if (!apiKey) {
    throw new Error("Missing NOWPayments configuration.");
  }

  const response = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      price_amount: priceUsd ?? 97,
      price_currency: "usd",
      pay_currency: "usdtbsc",
      order_id: scanId,
      order_description: description,
      ipn_callback_url: `${ipnBase}/api/payment/webhook`,
      success_url: successUrl ?? `${siteUrl}/report?scan_id=${scanId}`,
      cancel_url: siteUrl,
      is_fee_paid_by_user: false,
      customer_email: email,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    if (response.status === 403 && /INVALID_API_KEY/i.test(errorText)) {
      throw new Error(
        "Crypto checkout is temporarily unavailable. Update NOWPAYMENTS_API_KEY or use the card checkout link instead.",
      );
    }

    throw new Error(`NOWPayments error ${response.status}: ${errorText}`);
  }

  return (await response.json()) as {
    id: string;
    invoice_url: string;
    order_id?: string;
    payment_status?: string;
  };
}

export function verifyNOWPaymentsSignature(rawBody: string, signature: string | null) {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;

  if (!secret || !signature) {
    return false;
  }

  // 2026-05-11 hardening (CODE-REVIEW-W5 H-03): defensive JSON parse +
  // timing-safe compare. The previous `expected === signature` is
  // timing-leaky (early-exit on first mismatched char), which lets an
  // attacker brute-force one byte at a time over the wire. Hub's
  // NOWPayments webhook already uses crypto.timingSafeEqual; this brings
  // DocAI in line.
  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return false;
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return false;
  }

  const sorted = Object.keys(payload)
    .sort()
    .reduce<Record<string, unknown>>((accumulator, key) => {
      accumulator[key] = payload[key];
      return accumulator;
    }, {});

  const expected = crypto.createHmac("sha512", secret).update(JSON.stringify(sorted)).digest("hex");
  const trimmed = signature.trim();
  if (expected.length !== trimmed.length) {
    return false;
  }
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(trimmed, "hex"));
  } catch {
    return false;
  }
}
