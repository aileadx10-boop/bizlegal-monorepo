'use client'

/**
 * PrivacyScanDecisionTree — DocAI V1 lead-magnet conversion machine.
 *
 * Phase AA D8 — third instance of the Forge BOI / TRACR wallet-trace
 * pattern. Five questions screen for GDPR / CCPA / privacy exposure;
 * delivers a real preliminary signal before email gating.
 *
 * Verdict paths:
 *   - high_risk          DSAR + DPIA likely required
 *   - moderate_review    Inventory + privacy notice review needed
 *   - light_touch        Light-touch obligations, low immediate risk
 *
 * Liability rule (consistent with prior trees): preliminary signal
 * only, no certainty about a regulatory outcome.
 */

import { useState } from 'react'
import TurnstileWidget from './TurnstileWidget'

type Verdict = 'high_risk' | 'moderate_review' | 'light_touch'

interface VerdictPayload {
  readonly verdict: Verdict
  readonly headline: string
  readonly explainer: string
  readonly recommended_next_step: string
}

const VERDICTS: Record<Verdict, VerdictPayload> = {
  high_risk: {
    verdict: 'high_risk',
    headline: 'You have meaningful privacy exposure that needs documentation.',
    explainer:
      'Your answers point to processing of personal data at a scale and sensitivity that triggers GDPR / CCPA-CPRA obligations: data-subject access requests, privacy-notice currency, and (for some patterns) a DPIA. Without an inventory, you cannot answer a regulator on a 30-day clock.',
    recommended_next_step:
      'Save your spot below — we\'ll send the DocAI scanner shape: document-by-document PII inventory + redaction map + jurisdiction citations. Suitable for showing counsel or a regulator.',
  },
  moderate_review: {
    verdict: 'moderate_review',
    headline: 'Standard inventory + privacy-notice review.',
    explainer:
      'Your activity is in the typical mid-bracket: meaningful enough that a privacy regulator could open a request, but not at the scale that flags you for active enforcement. The right move is a baseline scan now, not when a DSAR lands.',
    recommended_next_step:
      'Save your spot below — we\'ll send the DocAI scanner shape so you can see what your defensible inventory + redaction trail looks like before the next DSAR or audit.',
  },
  light_touch: {
    verdict: 'light_touch',
    headline: 'Light-touch privacy obligations apply.',
    explainer:
      'Your activity is below most regulator-attention thresholds. CCPA still attaches when California consumers are involved; GDPR still attaches if any EU resident hits your site. The risk is low but not zero.',
    recommended_next_step:
      'Save your spot below — we\'ll send a one-page checklist for light-touch operators: what to keep, what to skip, what triggers escalation.',
  },
}

interface Question {
  readonly id: string
  readonly prompt: string
  readonly help?: string
}

const QUESTIONS: Question[] = [
  {
    id: 'processes_personal_data',
    prompt:
      'Does your business collect, store, or process personal data (names, emails, IPs, identifiers, location, behaviour, etc.) of customers, employees, or website visitors?',
    help: 'Almost every B2C / B2B SaaS does. Answer no only if you operate purely on anonymised aggregates with no identifiers anywhere.',
  },
  {
    id: 'eu_or_ca_subjects',
    prompt:
      'Do any of your data subjects live in the EU/EEA, UK, or California?',
    help: 'GDPR + UK GDPR cover EU/EEA + UK residents. CCPA-CPRA covers California residents. One subject is enough to attach the regulation.',
  },
  {
    id: 'sensitive_categories',
    prompt:
      'Do you process sensitive categories — health, biometric, kids under 13, government IDs, financial account data, or location at street-level granularity?',
    help: 'Sensitive categories trigger heightened obligations (consent, DPIA likely required, sometimes a DPO).',
  },
  {
    id: 'over_50k_subjects',
    prompt:
      'Do you have data on more than 50,000 distinct people across all systems (CRM + product + support + marketing)?',
    help: 'Volume matters: many state laws (Colorado, Connecticut, Virginia) attach reduced thresholds; 50k is a useful regulator-attention proxy.',
  },
  {
    id: 'has_dsar_process',
    prompt:
      'If a regulator or consumer sent you a Data Subject Access Request today, could you produce a complete, redacted-where-needed inventory within the legal deadline (30 days under GDPR, 45 days under CCPA)?',
    help: 'If "no" is honest here, the rest of the screen matters less — you have a procedural gap regardless of volume.',
  },
]

export function PrivacyScanDecisionTree(): JSX.Element {
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

    // Short-circuit: if no personal data is processed, no privacy regs apply.
    if (q.id === 'processes_personal_data' && value === false) {
      setDone(VERDICTS.light_touch)
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
          background: 'var(--surface, rgba(6, 14, 30, 0.72))',
          border: '1px solid var(--border-strong, rgba(0, 200, 255, 0.22))',
          borderRadius: 16,
          padding: 32,
          color: 'var(--ink, #e8f4ff)',
        }}
      >
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--muted, #6f86a5)' }}>
          <span>Step {step + 1} of {QUESTIONS.length}</span>
          <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'rgba(0,200,255,0.12)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--cyan, #00c8ff), var(--cyan-2, #00e5ff))',
                transition: 'width 300ms',
              }}
            />
          </div>
        </div>
        <h2 id="dt-prompt" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginBottom: 12, color: 'var(--ink, #e8f4ff)' }}>
          {q.prompt}
        </h2>
        {q.help && (
          <p style={{ fontSize: 14, color: 'var(--ink-soft, #c7d8eb)', marginBottom: 24, lineHeight: 1.6 }}>{q.help}</p>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => answer(true)}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, var(--cyan, #00c8ff), var(--cyan-2, #00e5ff))',
              color: '#001020',
              fontWeight: 700,
              padding: '14px 0',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
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
              color: 'var(--ink-soft, #c7d8eb)',
              fontWeight: 600,
              padding: '14px 0',
              borderRadius: 12,
              border: '1px solid var(--border-strong, rgba(0, 200, 255, 0.22))',
              cursor: 'pointer',
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
        background: 'var(--surface, rgba(6, 14, 30, 0.72))',
        border: '1px solid var(--border-strong, rgba(0, 200, 255, 0.22))',
        borderRadius: 16,
        padding: 32,
        color: 'var(--ink, #e8f4ff)',
      }}
    >
      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--cyan, #00c8ff)', fontWeight: 700, marginBottom: 8 }}>
        Preliminary signal
      </p>
      <h2 id="dt-verdict" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, color: 'var(--ink, #e8f4ff)' }}>
        {done.headline}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--ink-soft, #c7d8eb)', lineHeight: 1.6, marginBottom: 8 }}>{done.explainer}</p>
      <p style={{ fontSize: 12, color: 'var(--muted, #6f86a5)', lineHeight: 1.6, marginBottom: 24 }}>
        Note: this is a preliminary signal based on your answers, not legal advice. Final
        decisions should be confirmed with qualified counsel — we can introduce you to one.
      </p>
      <p style={{ fontSize: 14, color: 'var(--ink-soft, #c7d8eb)', lineHeight: 1.6, marginBottom: 24 }}>
        {done.recommended_next_step}
      </p>

      {!submitted ? (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'block' }}>
            <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
              Email address
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{
                width: '100%',
                background: 'rgba(2, 8, 20, 0.6)',
                border: '1px solid var(--border-strong, rgba(0, 200, 255, 0.22))',
                borderRadius: 12,
                padding: '12px 16px',
                color: 'var(--ink, #e8f4ff)',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </label>
          <TurnstileWidget onToken={setTurnstileToken} theme="dark" />
          <button
            type="submit"
            disabled={submitting || !email || (turnstileRequired && !turnstileToken)}
            style={{
              width: '100%',
              background: submitting || !email || (turnstileRequired && !turnstileToken)
                ? 'rgba(0,200,255,0.2)'
                : 'linear-gradient(135deg, var(--cyan, #00c8ff), var(--cyan-2, #00e5ff))',
              color: '#001020',
              fontWeight: 700,
              padding: '12px 0',
              borderRadius: 12,
              border: 'none',
              cursor: submitting || !email || (turnstileRequired && !turnstileToken) ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Sending…' : 'Email me the DocAI scan shape'}
          </button>
          {error && <p style={{ fontSize: 13, color: 'var(--red, #ff4466)' }}>{error}</p>}
          <p style={{ fontSize: 11, color: 'var(--muted, #6f86a5)', lineHeight: 1.5 }}>
            One-time email + 4 follow-ups over 7 days. One-click unsubscribe in every email.
          </p>
        </form>
      ) : (
        <div style={{
          border: '1px solid rgba(0, 229, 153, 0.3)',
          background: 'rgba(0, 229, 153, 0.06)',
          borderRadius: 12,
          padding: 20,
        }}>
          <p style={{ fontSize: 14, color: 'var(--ink, #e8f4ff)', fontWeight: 700, marginBottom: 4 }}>
            Sent — check your inbox in a few minutes.
          </p>
          <p style={{ fontSize: 12, color: 'var(--ink-soft, #c7d8eb)', lineHeight: 1.6 }}>
            We&apos;ll send the DocAI scan shape shortly.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={reset}
        style={{
          marginTop: 24,
          fontSize: 12,
          color: 'var(--muted, #6f86a5)',
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
  // Short-circuit was already handled in the question handler, but
  // guard here for safety.
  if (answers.processes_personal_data === false) return VERDICTS.light_touch

  // High-risk: sensitive categories OR (high volume + DSAR gap).
  // (The third "EU/CA + sensitive" branch was redundant — already
  // covered by the first sensitive-categories clause; tsc flagged it.)
  if (
    answers.sensitive_categories === true ||
    (answers.over_50k_subjects === true && answers.has_dsar_process === false)
  ) {
    return VERDICTS.high_risk
  }

  // Moderate review: EU/CA subjects, OR high volume, OR DSAR gap.
  if (
    answers.eu_or_ca_subjects === true ||
    answers.over_50k_subjects === true ||
    answers.has_dsar_process === false
  ) {
    return VERDICTS.moderate_review
  }

  return VERDICTS.light_touch
}

export default PrivacyScanDecisionTree
