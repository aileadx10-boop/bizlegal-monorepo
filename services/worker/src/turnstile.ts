import type { Env } from "./types";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface TurnstileVerifyResult {
  readonly ok: boolean;
  readonly skipped?: boolean;      // true if Turnstile not configured
  readonly errorCodes?: readonly string[];
}

/**
 * Validates a Cloudflare Turnstile token against the verify endpoint.
 * If TURNSTILE_SECRET_KEY is not configured, validation is skipped (ok=true).
 * This lets the Worker run without Turnstile during dev / early launch.
 */
export async function verifyTurnstile(
  env: Env,
  token: string | null | undefined,
  clientIp?: string | null
): Promise<TurnstileVerifyResult> {
  if (!env.TURNSTILE_SECRET_KEY) {
    return { ok: true, skipped: true };
  }
  if (!token || typeof token !== "string" || token.length < 10) {
    return { ok: false, errorCodes: ["missing-input-response"] };
  }

  const form = new URLSearchParams();
  form.set("secret", env.TURNSTILE_SECRET_KEY);
  form.set("response", token);
  if (clientIp) form.set("remoteip", clientIp);

  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString()
  });
  if (!res.ok) {
    return { ok: false, errorCodes: [`http-${res.status}`] };
  }
  const payload = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    "error-codes"?: readonly string[];
  };
  if (payload.success) return { ok: true };
  return { ok: false, errorCodes: payload["error-codes"] ?? ["unknown"] };
}
