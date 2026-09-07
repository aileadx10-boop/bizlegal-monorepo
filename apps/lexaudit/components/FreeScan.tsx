'use client'

import { useState } from 'react'
import TurnstileWidget from './TurnstileWidget'
import { FREE_SCAN_CHECKS } from '@/lib/health-score/free-scan'
import { FRAMEWORK_LABELS } from '@/lib/health-score'

type Answer = 'met' | 'partial' | 'not_met'

const TOTAL = FREE_SCAN_CHECKS.length // 10

interface ScanResult {
  scan_ref: string
  overall_pct: number
  posture_summary: string
  frameworks: { id: string; label: string; pct: number }[]
  gaps: { critical_or_high_not_met: number; critical_or_high_partial: number }
  signals_evaluated: number
  signals_in_full_assessment: number
}

/** Monitor checkout — exact apex link shape used on the LexAudit pricing/landing tiers. */
const MONITOR_CHECKOUT_URL =
  'https://bizlegal-ai.com/checkout?product=lexaudit&tier=monitor&interval=monthly&amount=9900&name=LexAudit+Compliance+Monitor'

const MONITOR_FEATURES = [
  'Daily semantic-diff on tracked frameworks',
  'Email alert + impact note per change',
  'SEC + CFPB + FinCEN + state AGs',
  'One human-reviewed brief per quarter',
]

interface Band { label: string; color: string }

function bandFor(pct: number): Band {
  if (pct < 40) return { label: 'Critical Risk', color: '#ef4444' }
  if (pct < 55) return { label: 'At Risk', color: '#f97316' }
  if (pct < 70) return { label: 'Developing', color: '#eab308' }
  if (pct < 85) return { label: 'Proficient', color: '#22c55e' }
  return { label: 'Advanced', color: '#c9a84c' }
}

export function FreeScan(): JSX.Element {
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

  function pick(a: Answer): void {
    const q = FREE_SCAN_CHECKS[idx]
    const next = { ...answers, [q.signal_id]: a }
    setAnswers(next)
    if (idx < TOTAL - 1) { setIdx(idx + 1) } else { setDone(true) }
  }

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!email || !done) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/free-scan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          answers,
          turnstile_token: turnstileToken,
        }),
      })
      const data = (await res.json()) as ScanResult & { error?: string }
      if (!res.ok) throw new Error(data.error ?? `submit_${res.status}`)
      setResult(data)
    } catch {
      setError('Could not run your scan — try again or contact team@bizlegal-ai.com.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset(): void {
    setAnswers({})
    setIdx(0)
    setDone(false)
    setEmail('')
    setResult(null)
    setError(null)
    setTurnstileToken(null)
  }

  /* ── Question screen ─────────────────────────────────────────────────── */
  if (!done) {
    const q = FREE_SCAN_CHECKS[idx]
    const progress = Math.round(((idx + 1) / TOTAL) * 100)

    return (
      <section
        aria-labelledby="fs-prompt"
        style={{ background: '#0d0d18', border: '1px solid #2a2418', borderRadius: 16, padding: 32, color: '#e2e8f0' }}
      >
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#7a7a7a', marginBottom: 20 }}>
          <span>Check {idx + 1} / {TOTAL}</span>
          <div style={{ flex: 1, height: 4, borderRadius: 999, background: '#1f1a10', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#c9a84c,#a07830)', transition: 'width 300ms' }} />
          </div>
          <span>{progress}%</span>
        </div>

        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#c9a84c', fontWeight: 700, marginBottom: 8 }}>
          {FRAMEWORK_LABELS[q.framework]} · {q.control_ref}
        </p>
        <h2 id="fs-prompt" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, lineHeight: 1.35, marginBottom: 28, color: '#f7f3e8' }}>
          {q.question}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnswerBtn label="Yes" sub="Fully in place" onClick={() => pick('met')} primary />
          <AnswerBtn label="Partially" sub="In progress or incomplete" onClick={() => pick('partial')} />
          <AnswerBtn label="No" sub="Not yet addressed" onClick={() => pick('not_met')} ghost />
        </div>
      </section>
    )
  }

  /* ── Email gate (before results) ─────────────────────────────────────── */
  if (!result) {
    return (
      <section aria-labelledby="fs-gate" style={{ background: '#0d0d18', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 16, padding: 32, color: '#e2e8f0' }}>
        <p id="fs-gate" style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#f7f3e8', marginBottom: 6 }}>
          Your scan is ready — where do we send it?
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
          Enter your work email to run the scan and see your results. We store the answers against the email so you can compare against future scans.
        </p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com" aria-label="Work email address"
            style={{ width: '100%', background: '#050509', border: '1px solid #2a2418', borderRadius: 10, padding: '11px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
          <TurnstileWidget onToken={setTurnstileToken} theme="dark" />
          <button
            type="submit"
            disabled={submitting || !email || (turnstileRequired && !turnstileToken)}
            className={(submitting || !email || (turnstileRequired && !turnstileToken)) ? '' : 'gold-gradient'}
            style={{ width: '100%', background: (submitting || !email || (turnstileRequired && !turnstileToken)) ? '#2a2418' : undefined, color: '#0d0d18', fontWeight: 700, padding: '12px 0', borderRadius: 10, border: 'none', cursor: (submitting || !email || (turnstileRequired && !turnstileToken)) ? 'not-allowed' : 'pointer', fontSize: 15 }}
          >
            {submitting ? 'Running your scan…' : 'Run my free scan'}
          </button>
          {error && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>}
          <p style={{ fontSize: 11, color: '#7a7a7a', lineHeight: 1.5 }}>
            One email with your results + occasional compliance updates. One-click unsubscribe.
          </p>
        </form>
      </section>
    )
  }

  /* ── Results screen ──────────────────────────────────────────────────── */
  const band = bandFor(result.overall_pct)
  const circumference = 2 * Math.PI * 60
  const totalGaps = result.gaps.critical_or_high_not_met + result.gaps.critical_or_high_partial

  return (
    <section aria-labelledby="fs-score" style={{ background: '#0d0d18', border: '1px solid #2a2418', borderRadius: 16, padding: 32, color: '#e2e8f0' }}>
      {/* Score circle */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#c9a84c', fontWeight: 700, marginBottom: 16 }}>
          Free scan result · ref {result.scan_ref}
        </p>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="60" fill="none" stroke="#1f1a10" strokeWidth="10" />
            <circle cx="70" cy="70" r="60" fill="none" stroke={band.color} strokeWidth="10"
              strokeDasharray={String(circumference)}
              strokeDashoffset={String(circumference * (1 - result.overall_pct / 100))}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.2s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div id="fs-score" style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, color: band.color, lineHeight: 1 }}>{result.overall_pct}</div>
            <div style={{ fontSize: 12, color: '#7a7a7a' }}>/ 100</div>
          </div>
        </div>
        <div style={{ display: 'inline-block', background: `${band.color}18`, border: `1px solid ${band.color}40`, borderRadius: 999, padding: '5px 18px', marginBottom: 12 }}>
          <span style={{ color: band.color, fontWeight: 700, fontSize: 14 }}>{band.label}</span>
        </div>
        <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, maxWidth: 460, margin: '0 auto' }}>{result.posture_summary}</p>
      </div>

      {/* Framework aggregates */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7a7a7a', marginBottom: 14 }}>
          Per-framework signals ({result.signals_evaluated} of {result.signals_in_full_assessment} registry checks)
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {result.frameworks.map(f => (
            <div key={f.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                <span style={{ color: '#e2e8f0' }}>{f.label}</span>
                <span style={{ fontWeight: 600, color: f.pct >= 70 ? '#22c55e' : f.pct >= 50 ? '#eab308' : '#ef4444' }}>{f.pct}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: '#1f1a10', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 999, width: `${f.pct}%`, background: f.pct >= 70 ? '#22c55e' : f.pct >= 50 ? '#eab308' : '#ef4444', transition: 'width 0.9s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gap counts */}
      <div style={{ background: '#070710', border: '1px solid #2a2418', borderRadius: 12, padding: 16, marginBottom: 24, fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>
        {totalGaps === 0 ? (
          <span>No unmet high-severity checks in this 10-point scan. The full 60-signal assessment goes deeper.</span>
        ) : (
          <span>
            <strong style={{ color: '#ef4444' }}>{result.gaps.critical_or_high_not_met} unmet</strong>
            {result.gaps.critical_or_high_partial > 0 && <> and <strong style={{ color: '#eab308' }}>{result.gaps.critical_or_high_partial} partial</strong></>}
            {' '}high-severity signal{totalGaps === 1 ? '' : 's'} in this scan. Your emailed copy lists the affected frameworks; the per-signal detail is part of the full assessment.
          </span>
        )}
      </div>

      {/* Conversion block — $99/mo Compliance Monitor */}
      <div style={{ border: '1px solid rgba(201,168,76,0.4)', background: 'rgba(201,168,76,0.06)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#c9a84c', fontWeight: 700, marginBottom: 8 }}>
          LexAudit Compliance Monitor · $99/mo
        </p>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#f7f3e8', marginBottom: 12, lineHeight: 1.3 }}>
          This scan is a snapshot. The Monitor watches what changes next.
        </p>
        <ul style={{ margin: '0 0 18px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MONITOR_FEATURES.map(f => (
            <li key={f} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
              <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <a
          href={MONITOR_CHECKOUT_URL}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#c9a84c,#a07830)', color: '#0a0a0f', borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
        >
          Start monitoring — $99/mo <span aria-hidden="true">→</span>
        </a>
        <p style={{ fontSize: 11, color: '#7a7a7a', marginTop: 10, marginBottom: 0 }}>
          Cancel anytime. Checkout is handled on bizlegal-ai.com.
        </p>
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
        Want depth instead of cadence?{' '}
        <a href="/compliance-health-score" style={{ color: '#c9a84c', textDecoration: 'none' }}>Take the full 40-question assessment</a>
        {' '}or{' '}
        <a href="/pricing" style={{ color: '#c9a84c', textDecoration: 'none' }}>see all plans</a>.
      </div>

      <p style={{ marginTop: 20, fontSize: 11, color: '#7a7a7a', lineHeight: 1.6 }}>
        Results are self-reported signals across a 10-check subset — regulatory intelligence, not legal advice, an audit, or a compliance certification. Confirm your specific situation with qualified counsel.
      </p>

      <button type="button" onClick={reset} style={{ marginTop: 8, fontSize: 12, color: '#7a7a7a', background: 'transparent', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
        Run the scan again
      </button>
    </section>
  )
}

function AnswerBtn({ label, sub, onClick, primary, ghost }: { label: string; sub: string; onClick: () => void; primary?: boolean; ghost?: boolean }) {
  const bg = primary ? 'linear-gradient(135deg,#c9a84c,#a07830)' : ghost ? 'transparent' : '#111124'
  const color = primary ? '#0d0d18' : ghost ? '#a8a89a' : '#e2e8f0'
  const border = primary ? 'none' : ghost ? '1px solid #2a2418' : '1px solid #3a3428'
  return (
    <button
      type="button" onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 600, textAlign: 'left', width: '100%', background: bg, color, border }}
    >
      <span>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.75 }}>{sub}</span>
    </button>
  )
}

export default FreeScan
