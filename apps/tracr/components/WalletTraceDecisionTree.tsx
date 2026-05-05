'use client'

/**
 * WalletTraceDecisionTree — TRACR's V1 lead-magnet conversion machine.
 *
 * Same shape as Forge BOI decision tree (Phase AA D6): question flow
 * → real preliminary signal → email gate AFTER verdict.
 *
 * Verticals this screens for: AML/Travel-Rule exposure (FinCEN MSB),
 * tax-reporting trail (IRS digital-asset reporting), counterparty risk
 * (OFAC sanctions). Tells the visitor whether their crypto activity is
 * casual, compliance-relevant, or audit-imminent.
 *
 * Liability rule: never claim certainty about a reporting requirement.
 * Emit "preliminary signal" + recommend a TRACR scan or partner intro.
 */

import { useState } from 'react'

type Verdict = 'high_priority' | 'standard_review' | 'casual_use'

interface VerdictPayload {
  readonly verdict: Verdict
  readonly headline: string
  readonly explainer: string
  readonly recommended_next_step: string
}

const VERDICTS: Record<Verdict, VerdictPayload> = {
  high_priority: {
    verdict: 'high_priority',
    headline: 'You have meaningful audit + AML exposure.',
    explainer:
      'Your activity pattern (size, counterparty risk, cross-border movement) puts you in the cohort regulators actively trace. Travel-Rule + FinCEN MSB rules likely apply; IRS digital-asset disclosure rules definitely do. Counterparty matches against OFAC are non-negotiable.',
    recommended_next_step:
      'Save your spot below — we\'ll send the TRACR Bronze report shape (wallet trace + counterparty risk + 1-year history with hash-anchored evidence). If you need court-grade prose, the Silver tier upgrades on the next page.',
  },
  standard_review: {
    verdict: 'standard_review',
    headline: 'Standard tax-trail + sanctions-screen exposure.',
    explainer:
      'Your activity is in the typical mid-bracket: meaningful enough that the IRS expects a clean disclosure trail, but not at a scale that flags you for active enforcement attention. The right move is a baseline scan now (not when you\'re asked for one).',
    recommended_next_step:
      'Save your spot below — we\'ll send the TRACR scan shape so you can see what your defensible audit trail looks like before tax season.',
  },
  casual_use: {
    verdict: 'casual_use',
    headline: 'Casual user — light reporting still applies.',
    explainer:
      'Your activity is likely in the de-minimis or hobbyist range. IRS Form 1040 still asks the digital-asset question; OFAC still applies if you bought from sanctioned addresses. The risk is low but not zero.',
    recommended_next_step:
      'Save your spot below — we\'ll send a one-page checklist for casual-use disclosure: what to keep, what to skip, what triggers escalation.',
  },
}

interface Question {
  readonly id: string
  readonly prompt: string
  readonly help?: string
}

const QUESTIONS: Question[] = [
  {
    id: 'has_meaningful_volume',
    prompt:
      'In any single tax year, has the cumulative value of your crypto trades, swaps, or transfers exceeded $20,000?',
    help: 'Counts swaps + transfers + sales — not just sales for fiat. The IRS uses gross transaction value, not net gain.',
  },
  {
    id: 'has_counterparty_risk',
    prompt:
      'Have any of your transactions involved exchanges or wallets in sanctioned jurisdictions, mixers, or counterparties you can\'t identify?',
    help: 'Includes interactions with mixers (Tornado Cash, etc.), DEXes routing through privacy pools, or transfers to addresses with unclear provenance.',
  },
  {
    id: 'is_us_taxpayer',
    prompt: 'Are you a US person for tax purposes (US citizen, green card, or resident alien)?',
  },
  {
    id: 'cross_border_movement',
    prompt:
      'Have you moved crypto across borders (sent/received from a non-US-domiciled exchange or wallet)?',
    help: 'Foreign exchange holdings can trigger FBAR + Form 8938 reporting at thresholds far below the $20K trade level above.',
  },
  {
    id: 'business_or_dao_use',
    prompt: 'Are you using crypto for business income, DAO contributions, or as a payment medium (not just personal investment)?',
    help: 'Business / professional use shifts you into MSB territory if volume is high enough.',
  },
]

export function WalletTraceDecisionTree(): JSX.Element {
  const [step, setStep] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [done, setDone] = useState<VerdictPayload | null>(null)
  const [email, setEmail] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

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
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8"
      >
        <div className="mb-6 flex items-center gap-3 text-xs text-slate-500">
          <span>Step {step + 1} of {QUESTIONS.length}</span>
          <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <h2 id="dt-prompt" className="text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-3">
          {q.prompt}
        </h2>
        {q.help && (
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">{q.help}</p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => answer(true)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-colors"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => answer(false)}
            className="flex-1 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 text-slate-700 font-semibold py-4 rounded-xl transition-colors"
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
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8"
    >
      <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-2">
        Preliminary signal
      </p>
      <h2 id="dt-verdict" className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-4">
        {done.headline}
      </h2>
      <p className="text-sm text-slate-700 leading-relaxed mb-2">{done.explainer}</p>
      <p className="text-xs text-slate-500 leading-relaxed mb-6">
        Note: this is a preliminary signal based on your answers, not legal or tax advice. Final
        reporting decisions should be confirmed with a qualified professional. We can introduce you
        to one.
      </p>
      <p className="text-sm text-slate-700 leading-relaxed mb-6">
        {done.recommended_next_step}
      </p>

      {!submitted ? (
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="sr-only">Email address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full border border-slate-300 focus:border-indigo-600 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
            />
          </label>
          <button
            type="submit"
            disabled={submitting || !email}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {submitting ? 'Sending…' : 'Email me the TRACR scan shape'}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-[11px] text-slate-500 leading-relaxed">
            One-time email + 4 follow-ups over 7 days. One-click unsubscribe in every email.
          </p>
        </form>
      ) : (
        <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-5">
          <p className="text-sm text-slate-900 font-semibold mb-1">
            Sent — check your inbox in a few minutes.
          </p>
          <p className="text-xs text-slate-700 leading-relaxed">
            We&apos;ll send the TRACR scan shape shortly.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={reset}
        className="mt-6 text-xs text-slate-500 hover:text-indigo-600 underline"
      >
        Start over
      </button>
    </section>
  )
}

function computeVerdict(answers: Record<string, boolean>): VerdictPayload {
  // High-priority: meaningful volume + (counterparty risk OR cross-border OR business use).
  if (
    answers.has_meaningful_volume === true &&
    (answers.has_counterparty_risk === true ||
      answers.cross_border_movement === true ||
      answers.business_or_dao_use === true)
  ) {
    return VERDICTS.high_priority
  }
  // Standard review: meaningful volume only, or US taxpayer with cross-border moves.
  if (
    answers.has_meaningful_volume === true ||
    (answers.is_us_taxpayer === true && answers.cross_border_movement === true)
  ) {
    return VERDICTS.standard_review
  }
  // Counterparty risk alone (any volume) is enough to bump to standard.
  if (answers.has_counterparty_risk === true) {
    return VERDICTS.standard_review
  }
  return VERDICTS.casual_use
}

export default WalletTraceDecisionTree
