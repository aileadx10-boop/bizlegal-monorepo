'use client'

/**
 * LeadGenDecisionTree — LeadForge V1 lead-magnet conversion machine.
 *
 * Phase AA D10 — sixth instance of the pattern (BOI → TRACR → DocAI →
 * LexAudit → BRAI → LeadForge). Five questions screen for whether the
 * visitor's outbound campaigns carry meaningful TCPA / CAN-SPAM /
 * lead-gen-disclosure exposure.
 *
 * Verdict paths:
 *   - tcpa_active_risk        high volume + no consent provenance =
 *                             class-action exposure within months
 *   - consent_audit_now       real volume, partial trail, suppression-
 *                             list gap; audit before next campaign
 *   - light_friction          low volume + clean trail; templates fine
 *
 * Liability rule: preliminary signal only, no certainty about TCPA
 * outcome (TCPA case law moves; consent-record adequacy is fact-
 * specific).
 */

import { useState } from 'react'
import TurnstileWidget from './TurnstileWidget'

type Verdict = 'tcpa_active_risk' | 'consent_audit_now' | 'light_friction'

interface VerdictPayload {
  readonly verdict: Verdict
  readonly headline: string
  readonly explainer: string
  readonly recommended_next_step: string
}

const VERDICTS: Record<Verdict, VerdictPayload> = {
  tcpa_active_risk: {
    verdict: 'tcpa_active_risk',
    headline: 'You have meaningful TCPA / lead-gen exposure right now.',
    explainer:
      'Your campaign volume + missing consent provenance is the exact pattern TCPA class-action firms target. Per-message statutory damages run $500-$1,500; class certifications happen on weeks-not-months timelines once a complaint lands. The audit trail is your defense — without it, settlement leverage is poor.',
    recommended_next_step:
      'Save your spot below — we\'ll send the LeadForge audit shape: per-campaign consent + suppression-list certification + a redline of common consent-language gaps.',
  },
  consent_audit_now: {
    verdict: 'consent_audit_now',
    headline: 'Audit your consent records before the next campaign.',
    explainer:
      'Your activity is in the typical mid-bracket: meaningful enough that a TCPA complaint could plausibly cite your records, but not at the scale that makes you a class-action target today. The right move is a baseline audit + a documented suppression-list refresh now, not after the first complaint.',
    recommended_next_step:
      'Save your spot below — we\'ll send the LeadForge audit checklist + the suppression-list refresh shape so you can run the audit yourself or hand it to counsel.',
  },
  light_friction: {
    verdict: 'light_friction',
    headline: 'Light TCPA exposure — periodic review suffices.',
    explainer:
      'Your campaign volume and consent practices are below most regulator-attention thresholds. TCPA still attaches to autodialer-grade sends, but the practical risk for your profile is limited if your existing trail is documented.',
    recommended_next_step:
      'Save your spot below — we\'ll send a one-page TCPA / CAN-SPAM self-check template: what to keep, what to skip, what triggers a real audit.',
  },
}

interface Question {
  readonly id: string
  readonly prompt: string
  readonly help?: string
}

const QUESTIONS: Question[] = [
  {
    id: 'sends_outbound_messages',
    prompt:
      'Do you send outbound SMS, calls, or marketing emails to consumers (not opted-in subscribers, but cold or partially-warm contacts)?',
    help: 'Cold outreach is where most TCPA / CAN-SPAM enforcement lands. Pure warm-list email to existing customers is generally lower risk.',
  },
  {
    id: 'over_5k_messages_monthly',
    prompt:
      'Do your monthly outbound volumes exceed 5,000 messages across SMS, voice, or email channels combined?',
    help: 'Class-action firms favor higher-volume defendants because per-message damages compound; under 5k/mo is statistically less attractive to plaintiffs.',
  },
  {
    id: 'no_per_lead_consent_record',
    prompt:
      'Do you lack a per-lead, timestamped, source-identified consent record (or are records inconsistent across acquisition channels)?',
    help: 'TCPA defense hinges on producing the consent record for the specific number/email at the time of the message. A spreadsheet of "yeses" without source + IP + timestamp does not qualify.',
  },
  {
    id: 'no_dnc_suppression_refresh',
    prompt:
      'Do you lack a documented process for refreshing your suppression list against the National DNC and internal opt-outs (e.g. monthly cron + audit log)?',
    help: 'Plaintiffs often allege that opt-outs were ignored. A logged refresh process is concrete evidence of compliance.',
  },
  {
    id: 'autodialer_or_prerecorded',
    prompt:
      'Do you use autodialer technology (predictive / power dialers) or prerecorded voice messages?',
    help: 'TCPA places the highest restrictions on autodialer + prerecorded calls — even one call to a wrong number can attach $1,500 statutory damages without consent.',
  },
]

export function LeadGenDecisionTree(): JSX.Element {
  const [step, setStep] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [done, setDone] = useState<VerdictPayload | null>(null)
  const [email, setEmail] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

  function answer(value: boolean): void {
    const q = QUESTIONS[step]
    const next = { ...answers, [q.id]: value }
    setAnswers(next)

    // Short-circuit: no outbound = no TCPA exposure to speak of.
    if (q.id === 'sends_outbound_messages' && value === false) {
      setDone(VERDICTS.light_friction)
      return
    }

    const isLast = step === QUESTIONS.length - 1
    if (!isLast) {
      setStep(step + 1)
      return
    }
    setDone(computeVerdict(next))
  }

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!email || !done) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/decision-tree/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          verdict: done.verdict,
          answers,
          turnstile_token: turnstileToken,
        }),
      })
      if (!res.ok) throw new Error(`signup_${res.status}`)
      setSubmitted(true)
    } catch {
      setError('Could not save your email — please try again or contact team@bizlegal-ai.com.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset(): void {
    setStep(0)
    setAnswers({})
    setDone(null)
    setEmail('')
    setSubmitted(false)
    setError(null)
  }

  if (!done) {
    const q = QUESTIONS[step]
    const progress = Math.round(((step + 1) / QUESTIONS.length) * 100)
    return (
      <section
        aria-labelledby="dt-prompt"
        style={{
          background: 'var(--lead-panel, #0f1a2c)',
          border: '1px solid rgba(247, 244, 236, 0.08)',
          borderRadius: 16,
          padding: 32,
          color: 'var(--lead-sand, #f7f4ec)',
        }}
      >
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#8a98ad' }}>
          <span>Step {step + 1} of {QUESTIONS.length}</span>
          <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'rgba(247, 244, 236, 0.08)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--lead-accent, #19c37d), var(--lead-accent-soft, #82e7bf))',
                transition: 'width 300ms',
              }}
            />
          </div>
        </div>
        <h2 id="dt-prompt" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginBottom: 12, color: 'var(--lead-sand, #f7f4ec)' }}>
          {q.prompt}
        </h2>
        {q.help && (
          <p style={{ fontSize: 14, color: '#a9b5c7', marginBottom: 24, lineHeight: 1.6 }}>{q.help}</p>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => answer(true)}
            style={{
              flex: 1,
              background: 'var(--lead-accent, #19c37d)',
              color: 'var(--lead-ink, #07111f)',
              fontWeight: 700,
              padding: '14px 0',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontSize: 15,
            }}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => answer(false)}
            style={{
              flex: 1,
              background: 'transparent',
              color: '#a9b5c7',
              fontWeight: 600,
              padding: '14px 0',
              borderRadius: 12,
              border: '1px solid rgba(247, 244, 236, 0.12)',
              cursor: 'pointer',
              fontSize: 15,
            }}
          >
            No
          </button>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="dt-verdict"
      style={{
        background: 'var(--lead-panel, #0f1a2c)',
        border: '1px solid rgba(247, 244, 236, 0.08)',
        borderRadius: 16,
        padding: 32,
        color: 'var(--lead-sand, #f7f4ec)',
      }}
    >
      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--lead-accent-soft, #82e7bf)', fontWeight: 700, marginBottom: 8 }}>
        Preliminary signal
      </p>
      <h2 id="dt-verdict" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, color: 'var(--lead-sand, #f7f4ec)' }}>
        {done.headline}
      </h2>
      <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 8 }}>{done.explainer}</p>
      <p style={{ fontSize: 12, color: '#8a98ad', lineHeight: 1.6, marginBottom: 24 }}>
        Note: this is a preliminary signal based on your answers, not legal advice. TCPA case law
        is fact-specific; final decisions should be confirmed with qualified counsel.
      </p>
      <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 24 }}>
        {done.recommended_next_step}
      </p>

      {!submitted ? (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            aria-label="Email address"
            style={{
              width: '100%',
              background: 'var(--lead-ink, #07111f)',
              border: '1px solid rgba(247, 244, 236, 0.12)',
              borderRadius: 12,
              padding: '12px 16px',
              color: 'var(--lead-sand, #f7f4ec)',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <TurnstileWidget onToken={setTurnstileToken} theme="dark" />
          <button
            type="submit"
            disabled={submitting || !email || (turnstileRequired && !turnstileToken)}
            style={{
              width: '100%',
              background: submitting || !email || (turnstileRequired && !turnstileToken)
                ? 'rgba(25, 195, 125, 0.2)'
                : 'var(--lead-accent, #19c37d)',
              color: 'var(--lead-ink, #07111f)',
              fontWeight: 700,
              padding: '12px 0',
              borderRadius: 12,
              border: 'none',
              cursor: submitting || !email || (turnstileRequired && !turnstileToken) ? 'not-allowed' : 'pointer',
              fontSize: 15,
            }}
          >
            {submitting ? 'Sending…' : 'Email me the LeadForge audit shape'}
          </button>
          {error && <p style={{ fontSize: 13, color: '#ef4444' }}>{error}</p>}
          <p style={{ fontSize: 11, color: '#8a98ad', lineHeight: 1.5 }}>
            One-time email + 4 follow-ups over 7 days. One-click unsubscribe in every email.
          </p>
        </form>
      ) : (
        <div style={{
          border: '1px solid rgba(25, 195, 125, 0.4)',
          background: 'rgba(25, 195, 125, 0.06)',
          borderRadius: 12,
          padding: 20,
        }}>
          <p style={{ fontSize: 14, color: 'var(--lead-sand, #f7f4ec)', fontWeight: 700, marginBottom: 4 }}>
            Sent — check your inbox in a few minutes.
          </p>
          <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>
            We&apos;ll send the LeadForge audit shape shortly.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={reset}
        style={{
          marginTop: 24,
          fontSize: 12,
          color: '#8a98ad',
          background: 'transparent',
          border: 'none',
          textDecoration: 'underline',
          cursor: 'pointer',
        }}
      >
        Start over
      </button>
    </section>
  )
}

function computeVerdict(answers: Record<string, boolean>): VerdictPayload {
  // Short-circuit was already handled, but keep a guard.
  if (answers.sends_outbound_messages === false) return VERDICTS.light_friction

  // Active risk: high volume + (missing consent OR autodialer) is the
  // exact class-action target profile.
  if (
    answers.over_5k_messages_monthly === true &&
    (answers.no_per_lead_consent_record === true || answers.autodialer_or_prerecorded === true)
  ) {
    return VERDICTS.tcpa_active_risk
  }

  // Audit now: 2+ procedural gaps (consent, DNC, autodialer use), or
  // high volume regardless of other answers.
  const gapCount = [
    answers.no_per_lead_consent_record,
    answers.no_dnc_suppression_refresh,
    answers.autodialer_or_prerecorded,
  ].filter((v) => v === true).length
  if (gapCount >= 2 || answers.over_5k_messages_monthly === true) {
    return VERDICTS.consent_audit_now
  }

  return VERDICTS.light_friction
}

export default LeadGenDecisionTree
