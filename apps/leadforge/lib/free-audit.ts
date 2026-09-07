/**
 * LeadForge Free Audit — deterministic 10-check consent & suppression
 * self-assessment.
 *
 * Single source of truth shared by the /free-audit client component
 * (renders the questions) and the /api/free-audit route (validates +
 * scores the answers server-side). Pure functions only — no I/O, no
 * env access, safe to import from both bundles.
 *
 * Scoring: each check answered met / partial / not_met scores
 * 1 / 0.5 / 0, weighted by severity (critical=3, high=2, medium=1).
 * The overall score is the weighted ratio normalised to 0–100.
 * Unanswered checks are excluded from the denominator, never silently
 * zeroed.
 *
 * Liability rule: this is a self-reported preliminary signal. It is
 * not legal advice, not an audit in the assurance sense, and makes no
 * claim about the outcome of any TCPA / CAN-SPAM matter.
 */

export type AuditAnswer = 'met' | 'partial' | 'not_met'

export type AuditArea = 'consent' | 'suppression' | 'sending' | 'records'

export const AUDIT_AREA_LABELS: Record<AuditArea, string> = {
  consent: 'Consent capture',
  suppression: 'Suppression & opt-outs',
  sending: 'Sending practices',
  records: 'Recordkeeping',
}

export interface AuditCheck {
  readonly check_id: string
  readonly area: AuditArea
  readonly severity: 'critical' | 'high' | 'medium'
  readonly question: string
  /** Deterministic recommendation shown when the check is not fully met. */
  readonly recommendation: string
}

export const FREE_AUDIT_CHECKS: readonly AuditCheck[] = [
  {
    check_id: 'per_lead_consent_record',
    area: 'consent',
    severity: 'critical',
    question:
      'Can you produce a per-lead consent record — source page, timestamp, IP, and the exact consent language shown — for any number you contacted in the last 90 days?',
    recommendation:
      'Implement per-lead consent capture that stores the source URL, timestamp, IP, and a versioned copy of the consent language. A spreadsheet of "yeses" without source and timestamp is not a TCPA defense.',
  },
  {
    check_id: 'written_consent_elements',
    area: 'consent',
    severity: 'critical',
    question:
      'Is consent captured in writing with the specific phone number, the seller\u2019s identity, the purpose — and not bundled as a condition of purchase?',
    recommendation:
      'Redline your consent language against the FCC\u2019s prior-express-written-consent elements: signed writing, specific number, identified seller, disclosed purpose, and no purchase condition.',
  },
  {
    check_id: 'revocation_honored',
    area: 'consent',
    severity: 'high',
    question:
      'Do you honor consent revocation through any reasonable means (reply STOP, email, phone call) and log each revocation with a timestamp?',
    recommendation:
      'Per the FCC\u2019s 2024 revocation rules, consent can be revoked by any reasonable means. Wire every inbound channel into one revocation log with timestamps, and suppress within 10 business days.',
  },
  {
    check_id: 'dnc_scrub_31_days',
    area: 'suppression',
    severity: 'critical',
    question:
      'Do you scrub outbound call lists against the National Do Not Call Registry at least every 31 days, with a logged run you can produce later?',
    recommendation:
      'Schedule a documented DNC scrub at least every 31 days (FCC telemarketing rules) and keep the run log — the logged process itself is evidence of a good-faith compliance program.',
  },
  {
    check_id: 'internal_dnc_suppression',
    area: 'suppression',
    severity: 'high',
    question:
      'Do you maintain an internal do-not-contact list that suppresses opt-outs across all campaigns and channels, not just the one where the opt-out arrived?',
    recommendation:
      'Centralize opt-outs into one internal suppression list applied to every campaign and channel before send. An opt-out honored in one tool but ignored in another is a common plaintiff allegation.',
  },
  {
    check_id: 'purchased_leads_consent_scope',
    area: 'suppression',
    severity: 'high',
    question:
      'Before first contact, do you verify that purchased or partner leads consented to be contacted by you or your vertical specifically?',
    recommendation:
      'The FCC\u2019s one-to-one consent direction means a lead\u2019s generic "marketing partners" consent may not cover you. Re-verify consent scope for purchased leads before first contact and keep the verification record.',
  },
  {
    check_id: 'autodialer_disclosures_quiet_hours',
    area: 'sending',
    severity: 'high',
    question:
      'If you use autodialer, prerecorded, or AI-voice technology, do your calls carry the required disclosures and honor quiet hours (8am–9pm in the recipient\u2019s local time)?',
    recommendation:
      'Autodialer and prerecorded/AI-voice calls carry the strictest TCPA restrictions. Audit dialer configuration for disclosure language and time-zone-aware quiet-hours enforcement.',
  },
  {
    check_id: 'canspam_email_basics',
    area: 'sending',
    severity: 'medium',
    question:
      'Do your marketing emails include accurate header and subject lines plus a working unsubscribe mechanism honored within 10 business days (CAN-SPAM)?',
    recommendation:
      'Check every campaign template for accurate From/subject lines, a physical postal address, and a functioning unsubscribe link. Test the unsubscribe monthly and log the honoring timestamp.',
  },
  {
    check_id: 'evidence_retention_window',
    area: 'records',
    severity: 'high',
    question:
      'Do you retain consent and suppression evidence for at least four years — the TCPA statute-of-limitations horizon?',
    recommendation:
      'Set a retention floor of at least four years (TCPA\u2019s statute of limitations) for consent records, revocation logs, and suppression-run logs. Deleting earlier than that removes your defense.',
  },
  {
    check_id: 'named_compliance_owner',
    area: 'records',
    severity: 'medium',
    question:
      'Is there a named owner for lead-gen compliance who reviews each campaign before launch?',
    recommendation:
      'Assign a named compliance owner with pre-launch review authority over outbound campaigns. Documented review is a concrete mitigating factor when regulators assess good faith.',
  },
] as const

const SEVERITY_WEIGHTS: Record<AuditCheck['severity'], number> = {
  critical: 3,
  high: 2,
  medium: 1,
}

const ANSWER_SCORES: Record<AuditAnswer, number> = {
  met: 1,
  partial: 0.5,
  not_met: 0,
}

export interface AuditEvaluation {
  readonly check_id: string
  readonly status: AuditAnswer
}

export interface AreaScore {
  readonly area: AuditArea
  readonly label: string
  readonly pct: number
  readonly checks_scored: number
}

export interface AuditRecommendation {
  readonly check_id: string
  readonly area: AuditArea
  readonly severity: AuditCheck['severity']
  readonly status: AuditAnswer
  readonly question: string
  readonly recommendation: string
}

export interface AuditScore {
  readonly overall_pct: number
  readonly areas: readonly AreaScore[]
  /** Checks not fully met, ordered critical → high → medium, met last excluded. */
  readonly recommendations: readonly AuditRecommendation[]
  readonly gaps_not_met: number
  readonly gaps_partial: number
  readonly checks_evaluated: number
}

/** Validate a raw client answer map against the allowlisted checks. */
export function evaluationsFromRaw(raw: Record<string, unknown>): AuditEvaluation[] {
  const valid = new Set<AuditAnswer>(['met', 'partial', 'not_met'])
  const out: AuditEvaluation[] = []
  for (const check of FREE_AUDIT_CHECKS) {
    const v = raw[check.check_id]
    if (typeof v === 'string' && valid.has(v as AuditAnswer)) {
      out.push({ check_id: check.check_id, status: v as AuditAnswer })
    }
  }
  return out
}

/** Deterministic score over validated evaluations. */
export function scoreAudit(evaluations: readonly AuditEvaluation[]): AuditScore {
  const statusById = new Map(evaluations.map((e) => [e.check_id, e.status]))

  let scoredWeight = 0
  let earnedWeight = 0
  let gapsNotMet = 0
  let gapsPartial = 0
  const recommendations: AuditRecommendation[] = []

  for (const check of FREE_AUDIT_CHECKS) {
    const status = statusById.get(check.check_id)
    if (!status) continue
    const w = SEVERITY_WEIGHTS[check.severity]
    scoredWeight += w
    earnedWeight += w * ANSWER_SCORES[status]
    if (status === 'not_met') gapsNotMet += 1
    else if (status === 'partial') gapsPartial += 1
    if (status !== 'met') {
      recommendations.push({
        check_id: check.check_id,
        area: check.area,
        severity: check.severity,
        status,
        question: check.question,
        recommendation: check.recommendation,
      })
    }
  }

  const areas: AreaScore[] = (Object.keys(AUDIT_AREA_LABELS) as AuditArea[]).map((area) => {
    let w = 0
    let earned = 0
    let n = 0
    for (const check of FREE_AUDIT_CHECKS) {
      if (check.area !== area) continue
      const status = statusById.get(check.check_id)
      if (!status) continue
      const weight = SEVERITY_WEIGHTS[check.severity]
      w += weight
      earned += weight * ANSWER_SCORES[status]
      n += 1
    }
    return {
      area,
      label: AUDIT_AREA_LABELS[area],
      pct: w > 0 ? Math.round((earned / w) * 100) : 0,
      checks_scored: n,
    }
  })

  const sevRank = { critical: 0, high: 1, medium: 2 } as const
  recommendations.sort((a, b) => sevRank[a.severity] - sevRank[b.severity])

  return {
    overall_pct: scoredWeight > 0 ? Math.round((earnedWeight / scoredWeight) * 100) : 0,
    areas,
    recommendations,
    gaps_not_met: gapsNotMet,
    gaps_partial: gapsPartial,
    checks_evaluated: evaluations.length,
  }
}

export interface PostureBand {
  readonly label: string
  readonly summary: string
}

export function postureFor(pct: number): PostureBand {
  if (pct < 40) {
    return {
      label: 'Critical exposure',
      summary:
        'Multiple foundational consent or suppression controls are missing. This is the profile TCPA class-action screening tools are built to find — treat the recommendations below as this week\u2019s work, not this quarter\u2019s.',
    }
  }
  if (pct < 60) {
    return {
      label: 'Elevated exposure',
      summary:
        'Some controls exist but the audit trail has real gaps. A complaint would be hard to defend on today\u2019s records. Close the critical-severity items first.',
    }
  }
  if (pct < 75) {
    return {
      label: 'Developing posture',
      summary:
        'Core practices are in place but inconsistently documented. The gap is mostly evidence quality — make each control provable, not just practiced.',
    }
  }
  if (pct < 90) {
    return {
      label: 'Solid foundation',
      summary:
        'Most consent and suppression controls are in place. The remaining items below are the difference between a policy and a defensible record.',
    }
  }
  return {
    label: 'Strong posture',
    summary:
      'Your self-reported practices cover the core consent, suppression, and recordkeeping controls. Re-run this quarterly — rules and campaign volume change faster than policies do.',
  }
}
