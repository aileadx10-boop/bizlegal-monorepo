import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

// Cache instances to avoid recreating them
const ratelimitInstances = new Map<string, Ratelimit>();

/**
 * Creates or retrieves an Upstash rate limiter instance.
 * @param prefix A unique identifier for the endpoint (e.g., "scan-api", "boi-report")
 * @param requests Number of requests allowed
 * @param window Time window (e.g., "10 s", "1 m", "1 h")
 */
export function getRateLimiter(
  prefix: string,
  requests: number = 5,
  window: `${number} ${"s" | "m" | "h" | "d"}` = "10 s"
) {
  const cacheKey = `${prefix}-${requests}-${window}`;

  if (!ratelimitInstances.has(cacheKey)) {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      console.warn(
        `[Rate Limiting]: Missing UPSTASH_REDIS_REST_URL or TOKEN. Rate limit bypassed for ${prefix}.`
      );
      return null;
    }

    const redis = Redis.fromEnv();

    ratelimitInstances.set(
      cacheKey,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, window),
        analytics: true,
        prefix: `@forge-ratelimit/${prefix}`,
      })
    );
  }

  return ratelimitInstances.get(cacheKey);
}

/**
 * Helper to get the client IP from the Next.js request.
 */
export function getIpFromRequest(request: NextRequest): string {
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  // Sometimes x-forwarded-for returns a comma-separated list of IPs.
  return ip.split(",")[0].trim();
}
