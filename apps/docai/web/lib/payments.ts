import crypto from "crypto";

type InvoiceParams = {
  scanId: string;
  email: string;
  description: string;
  /** Price in USD. Defaults to 24 for backwards compatibility with the
   * pre-tier scan/report flow. New 3-tier pricing matrix supplies the
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!apiKey || !siteUrl) {
    throw new Error("Missing NOWPayments configuration.");
  }

  const response = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      price_amount: priceUsd ?? 24,
      price_currency: "usd",
      pay_currency: "usdtbsc",
      order_id: scanId,
      order_description: description,
      ipn_callback_url: `${siteUrl}/api/payment/webhook`,
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

  const payload = JSON.parse(rawBody) as Record<string, unknown>;
  const sorted = Object.keys(payload)
    .sort()
    .reduce<Record<string, unknown>>((accumulator, key) => {
      accumulator[key] = payload[key];
      return accumulator;
    }, {});

  const expected = crypto.createHmac("sha512", secret).update(JSON.stringify(sorted)).digest("hex");
  return expected === signature;
}
