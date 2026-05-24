type PayPalLink = { rel: string; href: string };

type PayPalOrderResponse = {
  id: string;
  status?: string;
  links?: PayPalLink[];
};

export type PayPalCaptureResponse = {
  id?: string;
  status?: string;
  purchase_units?: Array<{
    reference_id?: string;
    custom_id?: string;
    payments?: {
      captures?: Array<{ id?: string; status?: string }>;
    };
  }>;
};

function paypalBase() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://docai.bizlegal-ai.com";
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing PayPal configuration.");
  }

  const response = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${response.status}`);
  }

  const json = (await response.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("PayPal auth returned no access token.");
  }
  return json.access_token;
}

function reportUrl(scanId: string, params?: Record<string, string>) {
  const url = new URL("/report", siteUrl());
  url.searchParams.set("scan_id", scanId);
  for (const [key, value] of Object.entries(params || {})) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

export async function createPayPalScanOrder({
  scanId,
  email,
}: {
  scanId: string;
  email: string;
}) {
  const token = await getAccessToken();
  const returnUrl = new URL("/api/payment/paypal/return", siteUrl());
  returnUrl.searchParams.set("scan_id", scanId);
  returnUrl.searchParams.set("email", email);

  const response = await fetch(`${paypalBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: scanId,
          custom_id: scanId,
          description: "DocAI evidence-cited contract risk report",
          amount: { currency_code: "USD", value: "97.00" },
        },
      ],
      application_context: {
        brand_name: "DocAI by BizLegal AI",
        user_action: "PAY_NOW",
        return_url: returnUrl.toString(),
        cancel_url: reportUrl(scanId, { email, paypal_error: "cancelled" }),
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`PayPal order creation failed: ${response.status} ${errorText}`);
  }

  const order = (await response.json()) as PayPalOrderResponse;
  const approvalUrl = order.links?.find((link) => link.rel === "approve")?.href;

  if (!order.id || !approvalUrl) {
    throw new Error("PayPal order response did not include an approval URL.");
  }

  return { orderId: order.id, approvalUrl };
}

export async function capturePayPalScanOrder(orderId: string): Promise<PayPalCaptureResponse> {
  const token = await getAccessToken();

  const response = await fetch(`${paypalBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`PayPal capture failed: ${response.status} ${errorText}`);
  }

  return (await response.json()) as PayPalCaptureResponse;
}

export function getPayPalCaptureId(capture: PayPalCaptureResponse) {
  return capture.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;
}

export function getPayPalScanReference(capture: PayPalCaptureResponse) {
  const unit = capture.purchase_units?.[0];
  return unit?.reference_id || unit?.custom_id || null;
}
