import type { Env } from "./types";
import { commitFileToGithub } from "./github";

/**
 * Daily product-digest aggregator.
 *
 * Fetches `/api/digest` from each of the 6 BizLegal products, validates
 * the shape, packages into a single canonical JSON document, persists
 * to:
 *   1. Cloudflare KV    — `hub:digest:latest` (TTL 25h)
 *   2. GitHub bizlegal-ea — `digests/{YYYY-MM-DD}.json` (immutable
 *                            audit trail)
 *
 * Triggered by the `0 6 * * *` cron in wrangler.toml AND callable
 * via authenticated POST /digest/aggregate (for manual rerun).
 *
 * Designed for graceful degradation: a single product 5xx must not
 * block the aggregate. Products that fail emit an `offline` record
 * with the last error; the hub homepage renders an honest "Quiet day"
 * placeholder for offline products rather than fabricating data.
 */

// Product origin map. MUST stay in sync with hub's lib/product-urls.ts.
// If a product changes domain, update both files in the same commit.
const PRODUCT_ORIGINS = {
  brai: "https://brai.bizlegal-ai.com",
  tracr: "https://tracr.bizlegal-ai.com",
  lexaudit: "https://lexaudit.bizlegal-ai.com",
  docai: "https://docai.bizlegal-ai.com",
  leadforge: "https://leadforge.bizlegal-ai.com",
  forge: "https://forge.bizlegal-ai.com",
} as const;

export type ProductId = keyof typeof PRODUCT_ORIGINS;

// Canonical digest shape each product MUST emit at /api/digest.
// Strict — extra fields are dropped, missing fields fail validation.
export interface ProductDigest {
  readonly product: ProductId;
  readonly date: string; // YYYY-MM-DD
  readonly headline: string;
  readonly bullets: ReadonlyArray<string>;
  readonly score: number; // 0-100, product-defined semantics
  readonly links: ReadonlyArray<{ label: string; href: string }>;
}

export interface OfflineEntry {
  readonly product: ProductId;
  readonly status: "offline";
  readonly error: string;
  readonly fetched_at: string;
}

export type DigestEntry = (ProductDigest & { status: "ok" }) | OfflineEntry;

export interface AggregateDigest {
  readonly aggregated_at: string;
  readonly date: string;
  readonly version: string;
  readonly products: Record<ProductId, DigestEntry>;
  readonly healthy_count: number;
  readonly offline_count: number;
}

const KV_KEY_LATEST = "hub:digest:latest";
const KV_TTL_SECONDS = 25 * 60 * 60; // 25h — survives a missed daily cron
const FETCH_TIMEOUT_MS = 5000;

function isProductDigest(value: unknown): value is ProductDigest {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.product !== "string") return false;
  if (!(v.product in PRODUCT_ORIGINS)) return false;
  if (typeof v.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v.date)) return false;
  if (typeof v.headline !== "string" || v.headline.length === 0) return false;
  if (!Array.isArray(v.bullets) || !v.bullets.every((b) => typeof b === "string")) return false;
  if (typeof v.score !== "number" || v.score < 0 || v.score > 100) return false;
  if (
    !Array.isArray(v.links) ||
    !v.links.every(
      (l) =>
        l &&
        typeof l === "object" &&
        typeof (l as Record<string, unknown>).label === "string" &&
        typeof (l as Record<string, unknown>).href === "string"
    )
  )
    return false;
  return true;
}

async function fetchProductDigest(product: ProductId, origin: string): Promise<DigestEntry> {
  const fetchedAt = new Date().toISOString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${origin}/api/digest`, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      return { product, status: "offline", error: `HTTP ${res.status}`, fetched_at: fetchedAt };
    }
    const body = await res.json();
    if (!isProductDigest(body)) {
      return { product, status: "offline", error: "schema_mismatch", fetched_at: fetchedAt };
    }
    if (body.product !== product) {
      return {
        product,
        status: "offline",
        error: `product_mismatch:${body.product}`,
        fetched_at: fetchedAt,
      };
    }
    return { ...body, status: "ok" };
  } catch (err) {
    clearTimeout(timer);
    const reason = err instanceof Error ? err.name : "unknown";
    return { product, status: "offline", error: reason, fetched_at: fetchedAt };
  }
}

export async function aggregateDigest(env: Env): Promise<AggregateDigest> {
  const aggregatedAt = new Date().toISOString();
  const date = aggregatedAt.slice(0, 10);

  const ids = Object.keys(PRODUCT_ORIGINS) as ProductId[];
  const settled = await Promise.all(
    ids.map((id) => fetchProductDigest(id, PRODUCT_ORIGINS[id]))
  );

  const products = {} as Record<ProductId, DigestEntry>;
  let healthy = 0;
  let offline = 0;
  for (const entry of settled) {
    products[entry.product] = entry;
    if (entry.status === "ok") healthy += 1;
    else offline += 1;
  }

  const aggregate: AggregateDigest = {
    aggregated_at: aggregatedAt,
    date,
    version: env.PIPELINE_VERSION,
    products,
    healthy_count: healthy,
    offline_count: offline,
  };

  await persistDigest(env, aggregate);
  return aggregate;
}

async function persistDigest(env: Env, aggregate: AggregateDigest): Promise<void> {
  const json = JSON.stringify(aggregate, null, 2);

  // 1. KV write (hot path the hub reads on every homepage render).
  if (env.DIGEST_KV) {
    try {
      await env.DIGEST_KV.put(KV_KEY_LATEST, json, { expirationTtl: KV_TTL_SECONDS });
    } catch (err) {
      console.error("[digest] KV write failed", err);
    }
  } else {
    console.warn("[digest] DIGEST_KV binding not configured — skipping KV write");
  }

  // 2. GitHub commit (immutable audit trail).
  if (env.GITHUB_TOKEN) {
    try {
      await commitFileToGithub(
        env,
        `digests/${aggregate.date}.json`,
        json,
        `chore(digest): aggregate ${aggregate.date} (${aggregate.healthy_count}/${aggregate.healthy_count + aggregate.offline_count} healthy)`
      );
    } catch (err) {
      console.error("[digest] GitHub commit failed", err);
    }
  } else {
    console.warn("[digest] GITHUB_TOKEN missing — skipping audit-trail commit");
  }
}

export async function readLatestDigest(env: Env): Promise<AggregateDigest | null> {
  if (!env.DIGEST_KV) return null;
  const raw = await env.DIGEST_KV.get(KV_KEY_LATEST);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AggregateDigest;
  } catch {
    return null;
  }
}
