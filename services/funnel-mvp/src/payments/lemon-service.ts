import { createHmac } from "node:crypto";

export interface LemonCheckout {
  checkoutUrl: string;
  checkoutId: string;
}

export interface LemonPaymentService {
  createCheckout(input: { sessionId: string; email?: string }): Promise<LemonCheckout>;
  verifyWebhook(rawBody: string, signature: string | undefined): boolean;
}

export class LemonApiService implements LemonPaymentService {
  constructor(
    private readonly options: {
      apiKey: string;
      storeId: string;
      variantId: string;
      webhookSecret: string;
    }
  ) {}

  async createCheckout(input: { sessionId: string; email?: string }): Promise<LemonCheckout> {
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        "content-type": "application/json",
        Accept: "application/vnd.api+json"
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: input.email,
              custom: {
                sessionId: input.sessionId
              }
            }
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: this.options.storeId
              }
            },
            variant: {
              data: {
                type: "variants",
                id: this.options.variantId
              }
            }
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Lemon checkout creation failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      data: {
        id: string;
        attributes: {
          url: string;
        };
      };
    };

    return {
      checkoutId: payload.data.id,
      checkoutUrl: payload.data.attributes.url
    };
  }

  verifyWebhook(rawBody: string, signature: string | undefined) {
    if (!signature) {
      return false;
    }

    const digest = createHmac("sha256", this.options.webhookSecret).update(rawBody).digest("hex");
    return digest === signature;
  }
}
