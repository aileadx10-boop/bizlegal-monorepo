import type { Env, LeadProfile } from "./types";
import type { ClassificationResult, ProductId } from "./vertical-classifier";

/**
 * Outbound lead routing. After the EA pipeline finishes scoring a
 * lead, we POST a signed copy of the LeadProfile to the matching
 * product's `/api/inbound-lead` endpoint. The product owns the
 * subsequent CRM/follow-up flow.
 *
 * Signature: hex HMAC-SHA256 of the JSON body, using
 * env.WEBHOOK_SHARED_SECRET as the key. Header name:
 * `x-bizlegal-signature`. Each product reads the same shared secret
 * from its own env (`BIZLEGAL_INBOUND_SECRET`) and verifies before
 * processing.
 *
 * Non-blocking: the routing fire-and-forget runs in waitUntil from the
 * pipeline. A POST failure logs but does NOT fail the lead pipeline —
 * the lead is already in GitHub + Telegram.
 */

const PRODUCT_ENDPOINTS: Record<Exclude<ProductId, "none">, string> = {
  // OCI Deal Router (Stream B) — high-ticket real-estate referral funnel.
  // Same x-bizlegal-signature HMAC contract as the rest of the fleet.
  realestate: "https://router.bizlegal-ai.com/lead",
  brai: "https://brai.bizlegal-ai.com/api/inbound-lead",
  tracr: "https://tracr.bizlegal-ai.com/api/inbound-lead",
  lexaudit: "https://lexaudit.bizlegal-ai.com/api/inbound-lead",
  docai: "https://docai.bizlegal-ai.com/api/inbound-lead",
  leadforge: "https://leadforge.bizlegal-ai.com/api/inbound-lead",
  forge: "https://forge.bizlegal-ai.com/api/inbound-lead",
};

export interface RoutingResult {
  readonly routed: boolean;
  readonly product: ProductId;
  readonly classification: ClassificationResult;
  readonly status?: number;
  readonly error?: string;
}

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function routeLeadToProduct(
  env: Env,
  profile: LeadProfile,
  classification: ClassificationResult
): Promise<RoutingResult> {
  if (classification.product === "none") {
    return { routed: false, product: "none", classification };
  }

  const endpoint = PRODUCT_ENDPOINTS[classification.product];
  const payload = {
    schema_version: "v1",
    classification,
    lead: profile,
  };
  const body = JSON.stringify(payload);

  let signature = "";
  try {
    signature = await hmacHex(env.WEBHOOK_SHARED_SECRET, body);
  } catch (err) {
    return {
      routed: false,
      product: classification.product,
      classification,
      error: `hmac_sign_failed:${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // Per-product timeout — products that 5xx must not slow the pipeline.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-bizlegal-signature": signature,
        "user-agent": "bizlegal-lead-intake-worker",
      },
      body,
    });
    clearTimeout(timer);
    return {
      routed: res.ok,
      product: classification.product,
      classification,
      status: res.status,
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      routed: false,
      product: classification.product,
      classification,
      error: err instanceof Error ? err.name : String(err),
    };
  }
}
