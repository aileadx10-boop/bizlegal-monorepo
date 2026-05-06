/**
 * @bizlegal/rate-limit — minimal in-memory sliding-window rate limiter.
 *
 * Phase AA D10 (SECURITY-V3 C-1 mitigation). Decision-tree endpoints
 * are unauthenticated POST and Turnstile is opt-in via env. Until
 * Moses provisions the Turnstile keys, this is the bot-pump backstop.
 *
 * Design choices:
 *   - In-memory, per-instance: a Vercel function instance can rate-
 *     limit traffic it sees, but can't see traffic on sibling
 *     instances. For a backstop layer that's acceptable; an attacker
 *     fanning out across instances still hits cumulative cost ceilings
 *     much faster than they would with no limit at all.
 *   - Sliding window via timestamp array, capped per-key. No external
 *     deps (no Redis, no KV, no Upstash). Works on Vercel Edge runtime
 *     and Node serverless functions.
 *   - Ephemeral: when an instance recycles (Vercel cold-start interval),
 *     the counter resets. That's the trade-off vs Upstash and is fine
 *     for a Turnstile backstop.
 *
 * If you need durable cross-instance rate limiting, swap to Upstash via
 * `apps/forge/apps/web/lib/rate-limit.ts` shape. The interface here
 * intentionally matches `{ ok, remaining, retryAfterMs }` so a swap is
 * one-import-line.
 */

export interface RateLimitConfig {
  /** Window length in milliseconds. Default 60_000 (1 min). */
  readonly windowMs?: number
  /** Max requests per window. Default 10. */
  readonly limit?: number
  /** Max distinct keys cached. Default 10_000. LRU-evicted. */
  readonly maxKeys?: number
}

export interface RateLimitResult {
  readonly ok: boolean
  readonly remaining: number
  readonly retryAfterMs: number
  /** True when the limiter wasn't able to evaluate (key missing). */
  readonly skipped?: boolean
}

interface KeyState {
  /** Sliding window of request timestamps (ms epoch). */
  hits: number[]
  /** Last touched timestamp for LRU eviction. */
  lastSeen: number
}

const DEFAULT_WINDOW_MS = 60_000
const DEFAULT_LIMIT = 10
const DEFAULT_MAX_KEYS = 10_000

const stores = new Map<string, Map<string, KeyState>>()

function getOrCreateStore(prefix: string): Map<string, KeyState> {
  const existing = stores.get(prefix)
  if (existing) return existing
  const fresh = new Map<string, KeyState>()
  stores.set(prefix, fresh)
  return fresh
}

function evictIfFull(store: Map<string, KeyState>, maxKeys: number): void {
  if (store.size < maxKeys) return
  // Evict the oldest 10% so we don't run this every single insert.
  const toEvict = Math.max(1, Math.floor(maxKeys * 0.1))
  const sorted = Array.from(store.entries()).sort((a, b) => a[1].lastSeen - b[1].lastSeen)
  for (let i = 0; i < toEvict; i++) {
    const entry = sorted[i]
    if (entry) store.delete(entry[0])
  }
}

/**
 * Record one request against `key` in the named bucket. Returns
 * { ok: false } when the key has hit its limit; otherwise updates the
 * sliding window and returns ok with the remaining count.
 *
 * @param prefix   Logical bucket name, e.g. 'decision-tree-lead'.
 * @param key      Per-client identifier (typically client IP, or
 *                 `${ip}:${email}` for tighter scoping).
 * @param config   Window + limit overrides.
 */
export function rateLimit(
  prefix: string,
  key: string,
  config: RateLimitConfig = {},
): RateLimitResult {
  if (!key) {
    return { ok: true, remaining: 0, retryAfterMs: 0, skipped: true }
  }
  const windowMs = config.windowMs ?? DEFAULT_WINDOW_MS
  const limit = config.limit ?? DEFAULT_LIMIT
  const maxKeys = config.maxKeys ?? DEFAULT_MAX_KEYS

  const store = getOrCreateStore(prefix)
  const now = Date.now()
  const cutoff = now - windowMs

  let state = store.get(key)
  if (!state) {
    evictIfFull(store, maxKeys)
    state = { hits: [], lastSeen: now }
    store.set(key, state)
  }

  // Trim the sliding window in place.
  while (state.hits.length > 0 && state.hits[0]! < cutoff) {
    state.hits.shift()
  }
  state.lastSeen = now

  if (state.hits.length >= limit) {
    const oldest = state.hits[0]!
    return {
      ok: false,
      remaining: 0,
      retryAfterMs: Math.max(0, oldest + windowMs - now),
    }
  }

  state.hits.push(now)
  return {
    ok: true,
    remaining: Math.max(0, limit - state.hits.length),
    retryAfterMs: 0,
  }
}

/**
 * Helper to derive a likely client IP from a Next.js Request headers.
 * Mirrors @bizlegal/turnstile-verify so callers can use one shape.
 */
export function clientIpFromHeaders(
  headers: { get: (name: string) => string | null },
): string | null {
  const cf = headers.get('cf-connecting-ip')
  if (cf) return cf
  const xff = headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() ?? null
  return headers.get('x-real-ip')
}

/** TEST-ONLY: reset all stores. Not exported in production builds. */
export function _resetForTests(): void {
  stores.clear()
}
