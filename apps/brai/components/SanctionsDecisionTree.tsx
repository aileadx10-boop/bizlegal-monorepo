'use client'

/**
 * SanctionsDecisionTree — BRAI V1 lead-magnet conversion machine.
 *
 * Phase AA D9 — fifth instance of the pattern (BOI → TRACR → DocAI →
 * LexAudit → BRAI). Five questions screen for whether a sanctions /
 * blockchain risk scan is warranted.
 *
 * Verdict paths:
 *   - critical_screen   strict-liability exposure now; scan immediately
 *   - periodic_screen   real but bounded; cadence-based screening
 *   - low_priority      light-touch operator; templates fine for now
 *
 * Liability rule: preliminary signal only, no certainty about a
 * sanctions outcome (OFAC strict-liability rules don't care about
 * intent — but our preliminary screen also doesn't decide your case).
 */

import { useState } from 'react'
import TurnstileWidget from './TurnstileWidget'

type Verdict = 'critical_screen' | 'periodic_screen' | 'low_priority'

interface VerdictPayload {
  readonly verdict: Verdict
  readonly headline: string
  readonly explainer: string
  readonly recommended_next_step: string
}

const VERDICTS: Record<Verdict, VerdictPayload> = {
  critical_screen: {
    verdict: 'critical_screen',
    headline: 'Run a sanctions scan now — you have strict-liability exposure.',
    explainer:
      'Your activity pattern (counterparty geography, transaction profile, on-chain interactions) puts you in a cohort where one missed OFAC / EU / UK match can trigger up to $381,000 per transaction in penalties under strict-liability rules — intent does not matter. The scan window is short.',
    recommended_next_step:
      'Save your spot below — we\'ll send the BRAI Full Report shape: name + entity + on-chain screening across OFAC SDN, EU consolidated lists, UN sanctions, and UK OFSI, with confidence scoring and primary-source citations.',
  },
  periodic_screen: {
    verdict: 'periodic_screen',
    headline: 'Periodic screening is the right cadence for your profile.',
    explainer:
      'Your sanctions exposure is real but bounded. The right move is a baseline scan against current lists, then re-screen on a defensible cadence (typically monthly for active counterparties, quarterly for archival).',
    recommended_next_step:
      'Save your spot below — we\'ll send the BRAI scan shape so you can see what your defensible screening trail looks like before your next counterparty review or audit.',
  },
  low_priority: {
    verdict: 'low_priority',
    headline: 'Sanctions exposure is low; templates and yearly scans suffice.',
    explainer:
      'Your activity is below most regulator-attention thresholds for sanctions screening. OFAC still attaches whenever you transact with a US person or US-domiciled entity, but the practical risk for your profile is limited. A periodic self-serve check covers your downside.',
    recommended_next_step:
      'Save your spot below — we\'ll send a one-page sanctions self-check template: what to keep, what to skip, what triggers a real scan.',
  },
}

interface Question {
  readonly id: string
  readonly prompt: string
  readonly help?: string
}

const QUESTIONS: Question[] = [
  {
    id: 'crypto_or_high_risk_geo',
    prompt:
      'Do your transactions or counterparties touch crypto on-chain activity, high-risk jurisdictions (Russia, Iran, North Korea, Venezuela, Cuba, Syria), or jurisdictions with material capital flows from sanctioned entities?',
    help: 'On-chain interactions are the highest-leverage sanctions-screening surface today; one address match against OFAC SDN is strict-liability.',
  },
  {
    id: 'us_or_eu_subject_to_sanctions',
    prompt:
      'Are you a US person, EU/UK person, or operating an entity domiciled in or doing business with US/EU/UK persons?',
    help: 'OFAC applies extraterritorially when US persons are involved at any point in the transaction chain. EU/UK have parallel regimes.',
  },
  {
    id: 'b2b_with_unverified_counterparties',
    prompt:
      'Do you onboard, pay, or receive payment from B2B counterparties whose ultimate beneficial owners you cannot independently verify?',
    help: 'Layered ownership structures are where most sanctions failures live — the front-name on a contract is rarely the actual UBO.',
  },
  {
    id: 'over_50_counterparties',
    prompt:
      'Do you have more than 50 active business counterparties (suppliers, customers, payment recipients, on-chain wallets) at any given time?',
    help: 'Volume matters for screening cadence — 50+ active counterparties means manual screening becomes untenable; 5 means yearly is fine.',
  },
  {
    id: 'no_existing_screen',
    prompt: 'Do you currently lack a documented sanctions-screening process or audit trail?',
    help: 'Even a template-based monthly check counts as a "process" if you can produce evidence. A regulator wants to see records, not just policy.',
  },
]

export function SanctionsDecisionTree(): JSX.Element {
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
          background: 'var(--card, #131f35)',
          border: '1px solid var(--outline-var, #1a2d4a)',
          borderRadius: 16,
          padding: 32,
          color: 'var(--text, #ddeeff)',
        }}
      >
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--muted, #4a6a88)' }}>
          <span>Step {step + 1} of {QUESTIONS.length}</span>
          <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'rgba(74,106,136,0.2)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--accent, #00e5a0), var(--accent-mid, #00c083))',
                transition: 'width 300ms',
              }}
            />
          </div>
        </div>
        <h2 id="dt-prompt" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginBottom: 12, color: 'var(--on-surface, #ddeeff)', fontFamily: 'var(--font-display)' }}>
          {q.prompt}
        </h2>
        {q.help && (
          <p style={{ fontSize: 14, color: 'var(--on-surface-var, #9fb6cc)', marginBottom: 24, lineHeight: 1.6 }}>{q.help}</p>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => answer(true)}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, var(--accent, #00e5a0), var(--accent-mid, #00c083))',
              color: '#0d1626',
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
              color: 'var(--on-surface-var, #9fb6cc)',
              fontWeight: 600,
              padding: '14px 0',
              borderRadius: 12,
              border: '1px solid var(--outline-var, #1a2d4a)',
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
        background: 'var(--card, #131f35)',
        border: '1px solid var(--outline-var, #1a2d4a)',
        borderRadius: 16,
        padding: 32,
        color: 'var(--text, #ddeeff)',
      }}
    >
      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--accent, #00e5a0)', fontWeight: 700, marginBottom: 8 }}>
        Preliminary signal
      </p>
      <h2 id="dt-verdict" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, color: 'var(--on-surface, #ddeeff)', fontFamily: 'var(--font-display)' }}>
        {done.headline}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--on-surface-var, #9fb6cc)', lineHeight: 1.7, marginBottom: 8 }}>{done.explainer}</p>
      <p style={{ fontSize: 12, color: 'var(--muted, #4a6a88)', lineHeight: 1.6, marginBottom: 24 }}>
        Note: this is a preliminary signal based on your answers, not legal advice. Final
        decisions should be confirmed with qualified counsel.
      </p>
      <p style={{ fontSize: 14, color: 'var(--on-surface-var, #9fb6cc)', lineHeight: 1.7, marginBottom: 24 }}>
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
              background: 'var(--bg, #0d1626)',
              border: '1px solid var(--outline-var, #1a2d4a)',
              borderRadius: 12,
              padding: '12px 16px',
              color: 'var(--text, #ddeeff)',
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
                ? 'rgba(0,229,160,0.2)'
                : 'linear-gradient(135deg, var(--accent, #00e5a0), var(--accent-mid, #00c083))',
              color: '#0d1626',
              fontWeight: 700,
              padding: '12px 0',
              borderRadius: 12,
              border: 'none',
              cursor: submitting || !email || (turnstileRequired && !turnstileToken) ? 'not-allowed' : 'pointer',
              fontSize: 15,
            }}
          >
            {submitting ? 'Sending…' : 'Email me the BRAI scan shape'}
          </button>
          {error && <p style={{ fontSize: 13, color: 'var(--red, #ff4d4d)' }}>{error}</p>}
          <p style={{ fontSize: 11, color: 'var(--muted, #4a6a88)', lineHeight: 1.5 }}>
            One-time email + 4 follow-ups over 7 days. One-click unsubscribe in every email.
          </p>
        </form>
      ) : (
        <div style={{
          border: '1px solid rgba(0, 229, 160, 0.4)',
          background: 'rgba(0, 229, 160, 0.06)',
          borderRadius: 12,
          padding: 20,
        }}>
          <p style={{ fontSize: 14, color: 'var(--on-surface, #ddeeff)', fontWeight: 700, marginBottom: 4 }}>
            Sent — check your inbox in a few minutes.
          </p>
          <p style={{ fontSize: 12, color: 'var(--on-surface-var, #9fb6cc)', lineHeight: 1.6 }}>
            We&apos;ll send the BRAI scan shape shortly.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={reset}
        style={{
          marginTop: 24,
          fontSize: 12,
          color: 'var(--muted, #4a6a88)',
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
  // Critical: high-risk geography/crypto + US/EU subject + (any other strong
  // signal). Strict-liability rules mean even one direction-of-travel that
  // matches sanctions geography combined with a US/EU person-nexus is enough
  // to take seriously.
  if (
    answers.crypto_or_high_risk_geo === true &&
    answers.us_or_eu_subject_to_sanctions === true
  ) {
    return VERDICTS.critical_screen
  }

  // Periodic: at least 2 of (US/EU nexus, unverified counterparties, volume,
  // missing process). Real exposure but not strict-liability-imminent.
  const periodicSignals = [
    answers.us_or_eu_subject_to_sanctions,
    answers.b2b_with_unverified_counterparties,
    answers.over_50_counterparties,
    answers.no_existing_screen,
  ].filter((v) => v === true).length
  if (periodicSignals >= 2) return VERDICTS.periodic_screen

  return VERDICTS.low_priority
}

export default SanctionsDecisionTree
