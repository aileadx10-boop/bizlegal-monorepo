import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { rateLimit } from "@bizlegal/rate-limit";

export type RateLimitWindow = `${number} ${"s" | "m" | "h" | "d"}`;

/**
 * Structural subset of Upstash `Ratelimit` that callers use. Both the
 * Upstash instance and the in-memory fallback satisfy it, so callers never
 * see `null` and never skip limiting.
 */
export interface RateLimiterLike {
  limit(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }>;
}

const WINDOW_UNIT_MS = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;

// Cache instances to avoid recreating them
const ratelimitInstances = new Map<string, RateLimiterLike>();
let warnedMissingUpstash = false;

/**
 * Converts an Upstash-style window ("10 s", "1 m", "1 h", "1 d") to ms.
 * Throws on a non-numeric amount or unknown unit so a typo fails at boot,
 * not silently at request time.
 */
export function parseWindowMs(window: RateLimitWindow): number {
  const [amountRaw, unit] = window.split(" ");
  const amount = Number(amountRaw);
  const multiplier = WINDOW_UNIT_MS[unit as keyof typeof WINDOW_UNIT_MS];
  if (!Number.isFinite(amount) || multiplier === undefined) {
    throw new Error(
      `[Rate Limiting]: Invalid window "${window}" — expected "<number> <s|m|h|d>".`
    );
  }
  return amount * multiplier;
}

/**
 * Per-instance in-memory fallback (@bizlegal/rate-limit sliding window).
 * Fail-closed: without Upstash we still limit what this instance sees.
 */
function memoryLimiter(
  prefix: string,
  requests: number,
  windowMs: number
): RateLimiterLike {
  return {
    async limit(identifier: string) {
      const r = rateLimit(`forge:${prefix}`, identifier, {
        windowMs,
        limit: requests,
      });
      return {
        success: r.ok,
        limit: requests,
        remaining: r.remaining,
        reset: Date.now() + (r.ok ? windowMs : r.retryAfterMs),
      };
    },
  };
}

/**
 * Creates or retrieves a rate limiter instance. Upstash when
 * UPSTASH_REDIS_REST_URL + TOKEN are set; otherwise an in-memory limiter.
 * Never returns null.
 * @param prefix A unique identifier for the endpoint (e.g., "scan-api", "boi-report")
 * @param requests Number of requests allowed
 * @param window Time window (e.g., "10 s", "1 m", "1 h")
 */
export function getRateLimiter(
  prefix: string,
  requests: number = 5,
  window: RateLimitWindow = "10 s"
): RateLimiterLike {
  const cacheKey = `${prefix}-${requests}-${window}`;
  const cached = ratelimitInstances.get(cacheKey);
  if (cached) return cached;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    if (!warnedMissingUpstash) {
      warnedMissingUpstash = true;
      console.warn(
        "[Rate Limiting]: Missing UPSTASH_REDIS_REST_URL or TOKEN — falling back to in-memory limiter (per-instance, fail-closed)."
      );
    }
    const fallback = memoryLimiter(prefix, requests, parseWindowMs(window));
    ratelimitInstances.set(cacheKey, fallback);
    return fallback;
  }

  const redis = Redis.fromEnv();

  const upstash = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: `@forge-ratelimit/${prefix}`,
  });
  ratelimitInstances.set(cacheKey, upstash);
  return upstash;
}

/**
 * Helper to get the client IP from the Next.js request.
 */
export function getIpFromRequest(request: NextRequest): string {
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  // Sometimes x-forwarded-for returns a comma-separated list of IPs.
  return ip.split(",")[0].trim();
}
