export interface PayPalCheckout {
  checkoutUrl: string;
  checkoutId: string;
}

export interface PayPalPaymentService {
  createCheckout(input: { sessionId: string }): Promise<PayPalCheckout>;
  verifyWebhook(headers: Record<string, string | undefined>, rawBody: string): Promise<boolean>;
}

export class PayPalApiService implements PayPalPaymentService {
  constructor(
    private readonly options: {
      clientId: string;
      clientSecret: string;
      apiBaseUrl: string;
      webhookId: string;
      appBaseUrl: string;
    }
  ) {}

  async createCheckout(input: { sessionId: string }): Promise<PayPalCheckout> {
    const token = await this.fetchAccessToken();
    const response = await fetch(`${this.options.apiBaseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: input.sessionId,
            amount: {
              currency_code: "USD",
              value: "995.00"
            }
          }
        ],
        application_context: {
          return_url: `${this.options.appBaseUrl}/payments/paypal/return`,
          cancel_url: `${this.options.appBaseUrl}/payments/paypal/cancel`
        }
      })
    });

    if (!response.ok) {
      throw new Error(`PayPal checkout creation failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      id: string;
      links: Array<{ rel: string; href: string }>;
    };
    const approval = payload.links.find((link) => link.rel === "approve");

    if (!approval) {
      throw new Error("PayPal checkout response did not include an approval URL.");
    }

    return {
      checkoutId: payload.id,
      checkoutUrl: approval.href
    };
  }

  async verifyWebhook(headers: Record<string, string | undefined>, rawBody: string): Promise<boolean> {
    const token = await this.fetchAccessToken();
    const response = await fetch(
      `${this.options.apiBaseUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          auth_algo: headers["paypal-auth-algo"],
          cert_url: headers["paypal-cert-url"],
          transmission_id: headers["paypal-transmission-id"],
          transmission_sig: headers["paypal-transmission-sig"],
          transmission_time: headers["paypal-transmission-time"],
          webhook_id: this.options.webhookId,
          webhook_event: JSON.parse(rawBody) as unknown
        })
      }
    );

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as { verification_status?: string };
    return payload.verification_status === "SUCCESS";
  }

  private async fetchAccessToken() {
    const auth = Buffer.from(`${this.options.clientId}:${this.options.clientSecret}`).toString("base64");
    const response = await fetch(`${this.options.apiBaseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "content-type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    if (!response.ok) {
      throw new Error(`PayPal token fetch failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { access_token: string };
    return payload.access_token;
  }
}
