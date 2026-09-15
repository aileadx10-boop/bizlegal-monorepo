import { test } from "node:test";
import assert from "node:assert/strict";
import { getRateLimiter, parseWindowMs, type RateLimitWindow } from "./rate-limit";

test("parseWindowMs converts s/m/h/d windows to milliseconds", () => {
  assert.equal(parseWindowMs("10 s"), 10_000);
  assert.equal(parseWindowMs("3 m"), 180_000);
  assert.equal(parseWindowMs("1 h"), 3_600_000);
  assert.equal(parseWindowMs("1 d"), 86_400_000);
});

test("parseWindowMs throws on a non-numeric amount", () => {
  assert.throws(() => parseWindowMs("x m" as RateLimitWindow));
});

test("getRateLimiter falls back to a fail-closed in-memory limiter without Upstash env", async () => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  const limiter = getRateLimiter(`t-${Date.now()}`, 2, "1 m");

  const first = await limiter.limit("1.2.3.4");
  const second = await limiter.limit("1.2.3.4");
  const third = await limiter.limit("1.2.3.4");
  assert.equal(first.success, true);
  assert.equal(second.success, true);
  assert.equal(third.success, false);
  assert.equal(third.remaining, 0);
  assert.ok(third.reset > Date.now());

  const other = await limiter.limit("5.6.7.8");
  assert.equal(other.success, true);
});
