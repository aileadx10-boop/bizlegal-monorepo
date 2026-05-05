'use client'

/**
 * ComplianceMonitorDecisionTree — LexAudit V1 lead-magnet conversion
 * machine.
 *
 * Phase AA D9 — fourth instance of the pattern (BOI → TRACR → DocAI →
 * LexAudit). Five questions screen for whether continuous compliance
 * monitoring is warranted, or a baseline audit is enough today.
 *
 * Verdict paths:
 *   - continuous_monitoring_critical   multi-jurisdiction + regulator
 *                                       attention; drift moves weekly
 *   - baseline_audit_first             single-jurisdiction or low cadence;
 *                                       audit + revisit quarterly
 *   - self_serve                       low-frequency operator; templates ok
 *
 * Liability rule: preliminary signal only, never an outcome promise.
 */

import { useState } from 'react'
import TurnstileWidget from './TurnstileWidget'

type Verdict = 'continuous_monitoring_critical' | 'baseline_audit_first' | 'self_serve'

interface VerdictPayload {
  readonly verdict: Verdict
  readonly headline: string
  readonly explainer: string
  readonly recommended_next_step: string
}

const VERDICTS: Record<Verdict, VerdictPayload> = {
  continuous_monitoring_critical: {
    verdict: 'continuous_monitoring_critical',
    headline: 'Continuous compliance monitoring is the right call.',
    explainer:
      'Your regulator footprint touches multiple agencies and jurisdictions, and the rules in your space are moving. The expensive failure mode here isn\'t missing one rule — it\'s missing a quiet update that lands between manual reviews. Drift detection has to be ongoing, not annual.',
    recommended_next_step:
      'Save your spot below — we\'ll send the LexAudit Compliance Monitor brief: which agencies we track, what semantic-diff alerts look like, and the Boutique vs Mid-Market shape.',
  },
  baseline_audit_first: {
    verdict: 'baseline_audit_first',
    headline: 'A baseline audit + quarterly review is the right starting point.',
    explainer:
      'Your regulator footprint is real but more contained — single-jurisdiction or stable rule cadence. The right move is a defensible compliance-baseline document now, then a structured re-review every quarter. Continuous monitoring is overkill until your footprint expands.',
    recommended_next_step:
      'Save your spot below — we\'ll send the LexAudit baseline-audit shape: what we cover, what citations we anchor against, and how the quarterly re-review works.',
  },
  self_serve: {
    verdict: 'self_serve',
    headline: 'Self-serve templates and an annual check are fine for now.',
    explainer:
      'Your activity is below most regulator-attention thresholds and your jurisdictional footprint is narrow. A periodic self-serve review against framework templates covers your downside without paying for monitoring you wouldn\'t use.',
    recommended_next_step:
      'Save your spot below — we\'ll send a one-page self-serve compliance-review template: what to keep, what to skip, what triggers a real audit.',
  },
}

interface Question {
  readonly id: string
  readonly prompt: string
  readonly help?: string
}

const QUESTIONS: Question[] = [
  {
    id: 'multi_jurisdiction',
    prompt:
      'Do your operations touch more than one regulatory jurisdiction (e.g. EU + US, multiple US states, or US federal + state)?',
    help: 'Multi-jurisdiction multiplies drift surface — you\'re tracking N regulators in parallel, each on their own update cadence.',
  },
  {
    id: 'regulator_attention_vertical',
    prompt:
      'Are you in a regulator-attention vertical: fintech, crypto, healthtech, AI/ML products, payments, or anything touching consumer financial data?',
    help: 'These verticals see new guidance monthly. Generic SaaS not in this list usually has annual cadence.',
  },
  {
    id: 'enforcement_in_last_24_months',
    prompt:
      'Has any regulator in your space announced enforcement action against a peer or comparable firm in the last 24 months?',
    help: 'Active enforcement is the strongest signal that the agency is paying attention to your specific business model.',
  },
  {
    id: 'no_in_house_compliance',
    prompt:
      'Do you currently lack a dedicated in-house compliance person or counsel?',
    help: 'If you have a full-time compliance lead, monitoring is what they already do — LexAudit augments rather than replaces them.',
  },
  {
    id: 'over_50m_arr_or_funded',
    prompt:
      'Are you above $5M ARR, post-Series A, or otherwise at a scale where one enforcement action would be material?',
    help: 'Materiality is the question. Smaller operators have time to react; larger ones face board/investor pressure that demands documented monitoring.',
  },
]

export function ComplianceMonitorDecisionTree(): JSX.Element {
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
          background: '#0d0d18',
          border: '1px solid #2a2418',
          borderRadius: 16,
          padding: 32,
          color: '#e2e8f0',
        }}
      >
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#7a7a7a' }}>
          <span>Step {step + 1} of {QUESTIONS.length}</span>
          <div style={{ flex: 1, height: 4, borderRadius: 999, background: '#1f1a10', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #c9a84c, #a07830)',
                transition: 'width 300ms',
              }}
            />
          </div>
        </div>
        <h2 id="dt-prompt" className="font-serif" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3, marginBottom: 12, color: '#f7f3e8' }}>
          {q.prompt}
        </h2>
        {q.help && (
          <p style={{ fontSize: 14, color: '#a8a89a', marginBottom: 24, lineHeight: 1.6 }}>{q.help}</p>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => answer(true)}
            className="gold-gradient"
            style={{
              flex: 1,
              color: '#0d0d18',
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
              color: '#a8a89a',
              fontWeight: 600,
              padding: '14px 0',
              borderRadius: 12,
              border: '1px solid #2a2418',
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
        background: '#0d0d18',
        border: '1px solid #2a2418',
        borderRadius: 16,
        padding: 32,
        color: '#e2e8f0',
      }}
    >
      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#c9a84c', fontWeight: 700, marginBottom: 8 }}>
        Preliminary signal
      </p>
      <h2 id="dt-verdict" className="font-serif" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginBottom: 16, color: '#f7f3e8' }}>
        {done.headline}
      </h2>
      <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, marginBottom: 8 }}>{done.explainer}</p>
      <p style={{ fontSize: 12, color: '#7a7a7a', lineHeight: 1.6, marginBottom: 24 }}>
        Note: this is a preliminary signal based on your answers, not legal advice. Final
        decisions should be confirmed with qualified counsel.
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
              background: '#070710',
              border: '1px solid #2a2418',
              borderRadius: 12,
              padding: '12px 16px',
              color: '#e2e8f0',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <TurnstileWidget onToken={setTurnstileToken} theme="dark" />
          <button
            type="submit"
            disabled={submitting || !email || (turnstileRequired && !turnstileToken)}
            className={(submitting || !email || (turnstileRequired && !turnstileToken)) ? '' : 'gold-gradient'}
            style={{
              width: '100%',
              background: (submitting || !email || (turnstileRequired && !turnstileToken)) ? '#2a2418' : undefined,
              color: '#0d0d18',
              fontWeight: 700,
              padding: '12px 0',
              borderRadius: 12,
              border: 'none',
              cursor: submitting || !email || (turnstileRequired && !turnstileToken) ? 'not-allowed' : 'pointer',
              fontSize: 15,
            }}
          >
            {submitting ? 'Sending…' : 'Email me the LexAudit brief'}
          </button>
          {error && <p style={{ fontSize: 13, color: '#ef4444' }}>{error}</p>}
          <p style={{ fontSize: 11, color: '#7a7a7a', lineHeight: 1.5 }}>
            One-time email + 4 follow-ups over 7 days. One-click unsubscribe in every email.
          </p>
        </form>
      ) : (
        <div style={{
          border: '1px solid rgba(201, 168, 76, 0.4)',
          background: 'rgba(201, 168, 76, 0.08)',
          borderRadius: 12,
          padding: 20,
        }}>
          <p style={{ fontSize: 14, color: '#f7f3e8', fontWeight: 700, marginBottom: 4 }}>
            Sent — check your inbox in a few minutes.
          </p>
          <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>
            We&apos;ll send the LexAudit brief shortly.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={reset}
        style={{
          marginTop: 24,
          fontSize: 12,
          color: '#7a7a7a',
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
  const monitoringSignals = [
    answers.multi_jurisdiction,
    answers.regulator_attention_vertical,
    answers.enforcement_in_last_24_months,
    answers.no_in_house_compliance,
    answers.over_50m_arr_or_funded,
  ].filter((v) => v === true).length

  // Critical: 4+ signals; the failure mode of missing a quiet update
  // costs more than the monitoring tool.
  if (monitoringSignals >= 4) return VERDICTS.continuous_monitoring_critical

  // Baseline: 2-3 signals — there's a real footprint but it's contained
  // enough that audit + quarterly review is proportionate.
  if (monitoringSignals >= 2) return VERDICTS.baseline_audit_first

  return VERDICTS.self_serve
}

export default ComplianceMonitorDecisionTree
