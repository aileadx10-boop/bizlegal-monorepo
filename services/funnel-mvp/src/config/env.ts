import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  WEBHOOK_HMAC_SECRET: z.string().min(1),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_STORAGE_BUCKET: z.string().optional(),
  MINIMAX_API_KEY: z.string().optional(),
  MINIMAX_MODEL: z.string().default("MiniMax-Text-01"),
  MINIMAX_BASE_URL: z.string().url().default("https://api.minimax.io/anthropic"),
  OLLAMA_BASE_URL: z.string().url().default("http://localhost:11434"),
  OLLAMA_MODEL: z.string().default("llama3.1"),
  LEMON_API_KEY: z.string().optional(),
  LEMON_STORE_ID: z.string().optional(),
  LEMON_VARIANT_ID: z.string().optional(),
  LEMON_WEBHOOK_SECRET: z.string().optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_API_BASE_URL: z.string().url().default("https://api-m.paypal.com"),
  PAYPAL_WEBHOOK_ID: z.string().optional(),
  NOTION_API_KEY: z.string().optional(),
  NOTION_DATABASE_ID: z.string().optional()
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(raw: NodeJS.ProcessEnv = process.env): AppConfig {
  const normalized = {
    ...raw,
    APP_BASE_URL: raw.APP_BASE_URL ?? raw.APP_URL ?? "http://localhost:3000",
    WEBHOOK_HMAC_SECRET:
      raw.WEBHOOK_HMAC_SECRET ?? raw.BIZLEGAL_INBOUND_SECRET ?? raw.WEBHOOK_SECRET,
    PAYPAL_API_BASE_URL: raw.PAYPAL_API_BASE_URL ?? raw.PAYPAL_API_URL,
    LEMON_API_KEY: raw.LEMON_API_KEY ?? raw.LEMONSQUEEZY_API_KEY,
    LEMON_STORE_ID: raw.LEMON_STORE_ID ?? raw.LEMONSQUEEZY_STORE_ID,
    LEMON_WEBHOOK_SECRET: raw.LEMON_WEBHOOK_SECRET ?? raw.LEMONSQUEEZY_WEBHOOK_SECRET
  };

  return envSchema.parse(normalized);
}
