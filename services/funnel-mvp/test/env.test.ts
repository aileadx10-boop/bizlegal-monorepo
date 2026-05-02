import { describe, expect, test } from "vitest";

import { loadConfig } from "../src/config/env.js";

describe("loadConfig", () => {
  test("maps hub-style environment variable names into app config", () => {
    const config = loadConfig({
      NODE_ENV: "production",
      APP_URL: "https://bizlegal-ai.com",
      BIZLEGAL_INBOUND_SECRET: "hub-secret",
      MINIMAX_API_KEY: "minimax-key",
      PAYPAL_CLIENT_ID: "paypal-client",
      PAYPAL_CLIENT_SECRET: "paypal-secret",
      PAYPAL_API_URL: "https://api-m.sandbox.paypal.com",
      LEMONSQUEEZY_API_KEY: "lemon-key",
      LEMONSQUEEZY_STORE_ID: "store-id",
      LEMONSQUEEZY_WEBHOOK_SECRET: "lemon-webhook"
    });

    expect(config.APP_BASE_URL).toBe("https://bizlegal-ai.com");
    expect(config.WEBHOOK_HMAC_SECRET).toBe("hub-secret");
    expect(config.PAYPAL_API_BASE_URL).toBe("https://api-m.sandbox.paypal.com");
    expect(config.LEMON_API_KEY).toBe("lemon-key");
    expect(config.LEMON_STORE_ID).toBe("store-id");
    expect(config.LEMON_WEBHOOK_SECRET).toBe("lemon-webhook");
  });
});
