'use client'

/**
 * DecisionTree — interactive State Transparency Duty Screen.
 *
 * V1 conversion-machine: take a visitor through 4-5 yes/no questions,
 * give them a real preliminary answer, and gate the full PDF guide
 * behind an email capture that fires the nurture sequence (vertical=boi).
 *
 * This is the V1 lead-magnet pattern; once it converts, the same
 * shape is replicated to other verticals (TRACR / DocAI / LexAudit).
 *
 * Liability rule: never claim certainty about a disclosure duty.
 * Output is "preliminary signal" + recommendation to verify with a
 * named partner. See /agents/ea/templates/referral-contract-template.md
 * for the same disclosure shape.
 */

import { useState } from 'react'
import TurnstileWidget from './TurnstileWidget'

type Verdict = 'must_file' | 'likely_exempt' | 'edge_case'

interface VerdictPayload {
  readonly verdict: Verdict
  readonly headline: string
  readonly explainer: string
  readonly recommended_next_step: string
}

const VERDICTS: Record<Verdict, VerdictPayload> = {
  must_file: {
    verdict: 'must_file',
    headline: 'State transparency duties likely apply to you.',
    explainer:
      'Federal BOI filing for US domestic companies ended under FinCEN\'s 2025 rule — but states are filling the gap. Based on your answers, your entity profile matches the scope of enacted or proposed state transparency acts (New York\'s LLC Transparency Act is enacted; more are pending).',
    recommended_next_step:
      'The full Forge State Transparency Kit maps your entity to each applicable state duty with statute citations and the exact disclosure steps. Save your spot below — we\'ll email you the breakdown.',
  },
  likely_exempt: {
    verdict: 'likely_exempt',
    headline: 'You\'re likely outside current state transparency duties.',
    explainer:
      'Your answers suggest your entity profile falls outside the enacted state disclosure regimes — larger operating companies and non-LLC structures are treated differently under the state acts now in force. Rules are moving quickly; the safe move is to document the basis.',
    recommended_next_step:
      'Save your spot below for a one-page duty-mapping checklist — the doc you keep on file in case a state regulator asks how you assessed your position.',
  },
  edge_case: {
    verdict: 'edge_case',
    headline: 'Edge case — your situation needs a closer look.',
    explainer:
      'A couple of your answers point to a fact pattern that doesn\'t cleanly fit the standard state transparency rules — most often a recent formation date, mixed-class ownership, or a multi-state footprint.',
    recommended_next_step:
      'Save your spot below — we\'ll send you a checklist of the specific state statutes that apply to your facts, plus a partner contact who handles edge-case transparency matters.',
  },
}

interface Question {
  readonly id: string
  readonly prompt: string
  readonly help?: string
}

const QUESTIONS: Question[] = [
  {
    id: 'is_reporting_entity',
    prompt:
      'Is your business a US LLC, corporation, or limited partnership (or formed in the US by a similar filing with a state)?',
    help: 'State transparency acts apply to entities created by filing a document with a US state. Sole proprietorships and general partnerships are usually outside scope.',
  },
  {
    id: 'has_us_office',
    prompt: 'Does the entity have a physical office in the United States?',
  },
  {
    id: 'over_20_ftes',
    prompt: 'Do you have more than 20 US-based full-time employees?',
    help: 'FTE = ≥30 hours/week. Counts US-based only.',
  },
  {
    id: 'over_5m_receipts',
    prompt: 'Did the entity have more than $5,000,000 in US-source gross receipts on its prior-year tax return?',
  },
  {
    id: 'recently_formed',
    prompt: 'Was the entity formed on or after January 1, 2024?',
    help: 'Formation date matters: enacted state acts phase in differently for new vs existing entities (NY LLCTA: Jan 1, 2026 for new LLCs, Jan 1, 2027 for existing).',
  },
]

export function DecisionTree(): JSX.Element {
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

    // Short-circuit at any step where the answer is decisive.
    if (q.id === 'is_reporting_entity' && value === false) {
      setDone(VERDICTS.likely_exempt)
      return
    }

    const isLast = step === QUESTIONS.length - 1
    if (!isLast) {
      setStep(step + 1)
      return
    }

    // Compute verdict from full answer set.
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
    } catch (err) {
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

  // ── Question view ──
  if (!done) {
    const q = QUESTIONS[step]
    const progress = Math.round(((step + 1) / QUESTIONS.length) * 100)
    return (
      <section
        aria-labelledby="dt-prompt"
        className="border border-forge-border rounded-2xl p-8 md:p-10 bg-forge-dark/50"
      >
        <div className="mb-6 flex items-center gap-3 text-xs text-forge-muted">
          <span>Step {step + 1} of {QUESTIONS.length}</span>
          <div className="flex-1 h-1 rounded-full bg-forge-border/50 overflow-hidden">
            <div
              className="h-full bg-forge-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <h2 id="dt-prompt" className="text-xl md:text-2xl font-bold text-white leading-snug mb-3">
          {q.prompt}
        </h2>
        {q.help && (
          <p className="text-sm text-forge-text-secondary mb-6 leading-relaxed">{q.help}</p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => answer(true)}
            className="flex-1 bg-forge-accent hover:bg-forge-accent-hover text-white font-semibold py-4 rounded-xl transition-colors"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => answer(false)}
            className="flex-1 border border-forge-border hover:border-forge-accent hover:text-forge-accent text-forge-text-secondary font-semibold py-4 rounded-xl transition-colors"
          >
            No
          </button>
        </div>
      </section>
    )
  }

  // ── Verdict view (with email gate) ──
  return (
    <section
      aria-labelledby="dt-verdict"
      className="border border-forge-border rounded-2xl p-8 md:p-10 bg-forge-dark/50"
    >
      <p className="text-xs uppercase tracking-widest text-forge-accent font-semibold mb-2">
        Preliminary signal
      </p>
      <h2 id="dt-verdict" className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4">
        {done.headline}
      </h2>
      <p className="text-sm text-forge-text-secondary leading-relaxed mb-2">{done.explainer}</p>
      <p className="text-xs text-forge-muted leading-relaxed mb-6">
        Note: this is a preliminary signal based on your answers, not legal advice. Final filing
        decisions should be confirmed with a qualified professional. We can introduce you to one.
      </p>
      <p className="text-sm text-forge-text-secondary leading-relaxed mb-6">
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
              className="w-full bg-forge-dark border border-forge-border focus:border-forge-accent rounded-xl px-4 py-3 text-white placeholder:text-forge-muted outline-none transition-colors"
            />
          </label>
          <TurnstileWidget onToken={setTurnstileToken} theme="dark" />
          <button
            type="submit"
            disabled={submitting || !email || (turnstileRequired && !turnstileToken)}
            className="w-full bg-forge-accent hover:bg-forge-accent-hover disabled:bg-forge-border disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {submitting ? 'Sending…' : 'Email me the duty breakdown'}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <p className="text-[11px] text-forge-muted leading-relaxed">
            One-time email + 4 follow-ups over 7 days. One-click unsubscribe in every email.
          </p>
        </form>
      ) : (
        <div className="border border-forge-accent/30 bg-forge-accent/10 rounded-xl p-5">
          <p className="text-sm text-white font-semibold mb-1">
            Sent — check your inbox in a few minutes.
          </p>
          <p className="text-xs text-forge-text-secondary leading-relaxed">
            We\'ll send the {done.verdict === 'likely_exempt' ? 'duty-mapping checklist' : 'state transparency breakdown'} shortly.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={reset}
        className="mt-6 text-xs text-forge-muted hover:text-forge-accent underline"
      >
        Start over
      </button>
    </section>
  )
}

function computeVerdict(answers: Record<string, boolean>): VerdictPayload {
  // Not a reporting entity → exempt path (already short-circuited, but keep for safety).
  if (answers.is_reporting_entity === false) return VERDICTS.likely_exempt

  // Large operating company exemption: needs all 3 (US office + >20 FTEs + >$5M receipts).
  if (
    answers.has_us_office === true &&
    answers.over_20_ftes === true &&
    answers.over_5m_receipts === true
  ) {
    return VERDICTS.likely_exempt
  }

  // Partial fits — recent formation + missing US office is an edge case
  // (entity may exist but fact pattern unclear without more diligence).
  if (answers.recently_formed === true && answers.has_us_office === false) {
    return VERDICTS.edge_case
  }

  // Default: standard reporting entity, not exempt → must file.
  return VERDICTS.must_file
}

export default DecisionTree
