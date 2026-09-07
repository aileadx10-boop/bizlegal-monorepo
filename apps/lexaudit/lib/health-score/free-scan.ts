/**
 * LexAudit — Free scan check subset.
 *
 * The free scan (/free-scan) is the summary tier of the health-score
 * engine: 10 self-attestation checks (2 per framework) drawn directly
 * from the canonical SIGNALS registry in ./signals.ts. Severity and
 * control_ref are resolved from the registry at module load — if a
 * registry id is ever renamed, this module throws loudly at boot
 * instead of silently drifting.
 *
 * Free vs paid boundary: the free scan scores ONLY the ids listed
 * here and returns framework-level aggregates. The full 60-signal
 * evaluation, per-signal detail, report generation (generateReport),
 * and the reviewer-signed certificate remain paid/reviewer-gated.
 *
 * LIABILITY_JUDGMENT: these are self-reported process-attestation
 * signals. A "met" answer attests the respondent's belief, not a
 * verified control. Results are regulatory-intelligence signals,
 * not legal advice and not a compliance certification.
 */

import { SIGNALS, type FrameworkId, type Severity } from "./signals"

export interface FreeScanCheck {
  readonly signal_id: string
  readonly framework: FrameworkId
  readonly control_ref: string
  readonly severity: Severity
  readonly question: string
}

/**
 * signal_id → plain-language question. Ids MUST exist in SIGNALS.
 * Two per framework, favouring critical/high severity, phrased so a
 * non-specialist operator can answer yes / partially / no.
 */
const PICKS: ReadonlyArray<{ readonly id: string; readonly question: string }> = [
  // SOC 2
  { id: "soc2-cc6-1", question: "Is access to your production systems restricted to authorised people only, with a unique account per person?" },
  { id: "soc2-cc8-1", question: "Are changes to production systems reviewed and approved before they go live?" },
  // ISO/IEC 27001:2022
  { id: "iso-a8-5", question: "Is multi-factor authentication (or an equivalent strong login control) enforced on systems holding sensitive data?" },
  { id: "iso-a6-3", question: "Do employees receive security and data-handling awareness training at least once a year?" },
  // GDPR
  { id: "gdpr-art30", question: "Do you maintain a current record of what personal data you process, where it lives, and why?" },
  { id: "gdpr-art33", question: "Could you detect a personal-data breach and notify the regulator within 72 hours of discovering it?" },
  // HIPAA Security Rule
  { id: "hipaa-312-a1", question: "Do technical controls ensure only authorised people can open sensitive records (health, client, or financial)?" },
  { id: "hipaa-312-e1", question: "Is sensitive data encrypted in transit (TLS 1.2 or higher) on every system that sends it?" },
  // DPDP Act 2023
  { id: "dpdp-s5", question: "Do you give people a clear, itemised notice of what personal data you collect at or before the point of collection?" },
  { id: "dpdp-s8-5", question: "Are documented security safeguards in place to prevent personal data breaches?" },
]

export const FREE_SCAN_CHECKS: readonly FreeScanCheck[] = PICKS.map((pick) => {
  const signal = SIGNALS.find((s) => s.id === pick.id)
  if (!signal) {
    throw new Error(`[free-scan] pick "${pick.id}" is not in the health-score signal registry`)
  }
  return {
    signal_id: signal.id,
    framework: signal.framework,
    control_ref: signal.control_ref,
    severity: signal.severity,
    question: pick.question,
  }
})

/** Every framework the free scan touches — order drives results display. */
export const FREE_SCAN_FRAMEWORKS: readonly FrameworkId[] = [
  "soc2",
  "iso27001",
  "gdpr",
  "hipaa",
  "dpdp",
]

const FREE_SCAN_IDS = new Set(FREE_SCAN_CHECKS.map((c) => c.signal_id))

/** Server-side allowlist check — the free route must never score anything else. */
export function isFreeScanSignalId(id: string): boolean {
  return FREE_SCAN_IDS.has(id)
}
