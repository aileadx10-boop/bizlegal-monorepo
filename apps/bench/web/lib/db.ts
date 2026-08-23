/**
 * Minimal PostgREST helpers — raw fetch, no supabase-js (same reasoning as
 * @bizlegal/email: runs anywhere, zero client-init state, smaller bundle).
 * Service-role only; every bench table is RLS'd with no anon policies, so
 * these helpers must never be imported from a client component.
 */

interface DbConfig {
  readonly url: string
  readonly key: string
}

function readConfig(): DbConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return { url, key }
}

function headers(cfg: DbConfig, extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: cfg.key,
    Authorization: `Bearer ${cfg.key}`,
    'Content-Type': 'application/json',
    // Cloudflare blocks the default fetch UA for this account (see memory:
    // UA Cloudflare 1010) — every server-side fetch carries an explicit UA.
    'user-agent': 'bizlegal-agent/1.0',
    ...extra,
  }
}

/** INSERT one row. Returns true on success; false (never throws) otherwise. */
export async function dbInsert(
  table: string,
  row: Record<string, unknown>,
): Promise<boolean> {
  const cfg = readConfig()
  if (!cfg) return false
  try {
    const res = await fetch(`${cfg.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: headers(cfg, { Prefer: 'return=minimal' }),
      body: JSON.stringify(row),
    })
    return res.ok
  } catch {
    return false
  }
}

/** SELECT via a PostgREST query string. Returns rows, or null when unreachable. */
export async function dbSelect<T>(pathWithQuery: string): Promise<readonly T[] | null> {
  const cfg = readConfig()
  if (!cfg) return null
  try {
    const res = await fetch(`${cfg.url}/rest/v1/${pathWithQuery}`, {
      headers: headers(cfg),
    })
    if (!res.ok) return null
    return (await res.json()) as readonly T[]
  } catch {
    return null
  }
}
