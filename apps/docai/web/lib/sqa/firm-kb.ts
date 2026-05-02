import { createClient } from "@supabase/supabase-js"
import type { KnowledgeBaseItem, Jurisdiction } from "@/lib/sqa"

/**
 * Firm-tier KB store helpers — paywall-checked email-keyed clauses
 * uploaded by paying Firm subscribers.
 *
 * REVENUE+LIABILITY framing: this is a CUSTOMER-uploaded library.
 * BizLegal does not vet the content. The Sonnet prompt is updated
 * downstream to make clear that firm-uploaded items are first-party
 * material, not bizlegal-curated regulatory text.
 */

export const VALID_JURISDICTIONS: ReadonlyArray<Jurisdiction> = [
  "US",
  "EU",
  "UK",
  "IN",
  "CA",
  "AU",
  "SG",
  "OTHER",
]

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase env not configured")
  return createClient(url, key)
}

/**
 * Verify the email belongs to an active Firm-tier subscription.
 * Returns the matching payment_orders row id on success, or null.
 */
export async function isFirmTierActive(email: string): Promise<{ ok: boolean; orderId?: number }> {
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return { ok: false }
  try {
    const supabase = getSupabase()
    const { data } = await supabase
      .from("payment_orders")
      .select("id, status, tier, billing_interval, product")
      .eq("user_email", email.toLowerCase())
      .eq("status", "active")
      .ilike("tier", "%firm%")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (data) return { ok: true, orderId: data.id }
    return { ok: false }
  } catch {
    return { ok: false }
  }
}

export interface FirmKbItem extends KnowledgeBaseItem {
  firm_email: string
}

/**
 * Fetch all firm-uploaded KB items for a given firm email.
 * Caller is responsible for paywall check.
 */
export async function listFirmKb(firmEmail: string): Promise<KnowledgeBaseItem[]> {
  if (!firmEmail) return []
  const supabase = getSupabase()
  const { data } = await supabase
    .from("sqa_firm_kb_items")
    .select("id, source_name, source_url, jurisdiction, topics, text, last_updated")
    .eq("firm_email", firmEmail.toLowerCase())
    .order("created_at", { ascending: false })
    .limit(500)
  return (data ?? []).map((row) => ({
    id: row.id,
    source_name: row.source_name,
    source_url: row.source_url,
    jurisdiction: row.jurisdiction as Jurisdiction,
    topics: Array.isArray(row.topics) ? row.topics : [],
    text: row.text,
    last_updated: row.last_updated,
  }))
}

export interface UpsertResult {
  inserted: number
  errors: Array<{ id: string; error: string }>
}

/**
 * Bulk upsert firm KB items. Each item gets validated against the
 * KnowledgeBaseItem shape. Items that fail validation are returned in
 * `errors` and the rest are inserted.
 */
export async function upsertFirmKb(
  firmEmail: string,
  items: ReadonlyArray<unknown>,
): Promise<UpsertResult> {
  const supabase = getSupabase()
  const result: UpsertResult = { inserted: 0, errors: [] }

  // Normalise + validate
  const valid: Array<Record<string, unknown>> = []
  for (const raw of items) {
    if (typeof raw !== "object" || raw === null) {
      result.errors.push({ id: "(unknown)", error: "not an object" })
      continue
    }
    const r = raw as Record<string, unknown>
    const id = typeof r.id === "string" ? r.id.trim().slice(0, 80) : ""
    const sourceName = typeof r.source_name === "string" ? r.source_name.trim().slice(0, 200) : ""
    const sourceUrl = typeof r.source_url === "string" ? r.source_url.trim().slice(0, 500) : ""
    const jurisdiction = typeof r.jurisdiction === "string" ? r.jurisdiction.toUpperCase() : ""
    const topics = Array.isArray(r.topics)
      ? r.topics.filter((t): t is string => typeof t === "string").slice(0, 32)
      : []
    const text = typeof r.text === "string" ? r.text.trim().slice(0, 12000) : ""

    if (!id || !/^[a-zA-Z0-9_.-]+$/.test(id)) {
      result.errors.push({ id: id || "(missing)", error: "id must be alphanumeric/underscore/dot/hyphen, max 80 chars" })
      continue
    }
    if (!sourceName) {
      result.errors.push({ id, error: "source_name required" })
      continue
    }
    if (!sourceUrl || !/^https?:\/\//.test(sourceUrl)) {
      result.errors.push({ id, error: "source_url must start with http(s)://" })
      continue
    }
    if (!VALID_JURISDICTIONS.includes(jurisdiction as Jurisdiction)) {
      result.errors.push({ id, error: `jurisdiction must be one of ${VALID_JURISDICTIONS.join(", ")}` })
      continue
    }
    if (!text || text.length < 20) {
      result.errors.push({ id, error: "text required (≥20 chars)" })
      continue
    }

    valid.push({
      firm_email: firmEmail.toLowerCase(),
      id,
      source_name: sourceName,
      source_url: sourceUrl,
      jurisdiction,
      topics,
      text,
      last_updated: new Date().toISOString(),
    })
  }

  if (valid.length === 0) return result

  const { error } = await supabase
    .from("sqa_firm_kb_items")
    .upsert(valid, { onConflict: "firm_email,id" })

  if (error) {
    result.errors.push({ id: "(batch)", error: error.message })
  } else {
    result.inserted = valid.length
  }

  return result
}

export async function deleteFirmKbItem(firmEmail: string, id: string): Promise<boolean> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from("sqa_firm_kb_items")
    .delete()
    .eq("firm_email", firmEmail.toLowerCase())
    .eq("id", id)
  return !error
}
