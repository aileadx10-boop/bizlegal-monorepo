// BrainX DB access model:
// - The Next.js dashboard NEVER connects directly to Neon.
// - All reads go through the BrainX API (services/highintelligence-api, FastAPI).
// - The API owns the Neon connection string (NEON_DATABASE_URL).
// This file is the dashboard-side health/proxy helper.

export const BRAINX_API_URL =
  process.env.BRAINX_API_URL || process.env.NEXT_PUBLIC_BRAINX_API_URL || 'http://127.0.0.1:8080'

export async function apiHealth(): Promise<{ ok: boolean; service: string; error?: string }> {
  try {
    const res = await fetch(`${BRAINX_API_URL}/health`, {
      signal: AbortSignal.timeout(5000),
      headers: { 'x-internal-key': process.env.BRAINX_INTERNAL_KEY || '' },
    })
    if (!res.ok) return { ok: false, service: 'brainx-api', error: `http_${res.status}` }
    const json = (await res.json()) as { ok?: boolean; service?: string }
    return { ok: json.ok ?? true, service: json.service || 'brainx-api' }
  } catch (err) {
    return { ok: false, service: 'brainx-api', error: String(err).slice(0, 120) }
  }
}
