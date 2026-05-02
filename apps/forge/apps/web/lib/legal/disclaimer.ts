/**
 * BizLegal AI — Disclaimer version stamp helper.
 *
 * The disclaimer version is set via NEXT_PUBLIC_DISCLAIMER_VERSION and
 * stamped into every user-facing output (rendered page, JSON export, PDF).
 * This lets us pin exactly which disclosure was in force at the moment an
 * output was produced — critical for the Liability_Incident_Response SOP
 * and for discovery if a prior assertion is ever challenged.
 *
 * Hardcoded fallback: "v1.0.0-p1". P1 is the canonical first published
 * disclosure; later liability reviews bump the version.
 */

export const DISCLAIMER_VERSION: string = process.env.NEXT_PUBLIC_DISCLAIMER_VERSION ?? "v1.0.0-p1"

/** For embedding inside JSON payloads or schemas. */
export function disclaimerStamp(): { disclaimer_version: string; issued_at: string } {
  return {
    disclaimer_version: DISCLAIMER_VERSION,
    issued_at: new Date().toISOString(),
  }
}
