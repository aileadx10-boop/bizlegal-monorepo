'use client'

/**
 * LeadForge Free Audit — client flow for /free-audit.
 *
 * Three screens: the 10-check self-assessment (from lib/free-audit),
 * an email gate (Turnstile + rate-limited on the server), and the
 * deterministic on-page result — score, posture band, per-area
 * aggregates, and a prioritized fix list. Because LeadForge has no
 * paid tier of its own, the conversion block after the result is fleet
 * cross-sell via crossSellFor('leadforge'), not a LeadForge checkout.
 *
 * Liability rule: renders only self-reported preliminary signals; the
 * disclaimer sits under the result, not behind it.
 */

import { useState } from 'react'
import TurnstileWidget from './TurnstileWidget'
import { crossSellFor } from '@bizlegal/nurture-enqueue/cross-sell'
import { AUDIT_AREA_LABELS, FREE_AUDIT_CHECKS } from '@/lib/free-audit'

type Answer = 'met' | 'partial' | 'not_met'

const TOTAL = FREE_AUDIT_CHECKS.length // 10

interface AuditResult {
  audit_ref: string
  overall_pct: number
  posture_label: string
  posture_summary: string
  areas: { area: string; label: string; pct: number; checks_scored: number }[]
  recommendations: {
    check_id: string
    area: string
    severity: 'critical' | 'high' | 'medium'
    status: Answer
    question: string
    recommendation: string
  }[]
  gaps: { not_met: number; partial: number }
  checks_evaluated: number
  legal_notice: string
}

const C = {
  ink: 'var(--lead-ink, #07111f)',
  panel: 'var(--lead-panel, #0f1a2c)',
  sand: 'var(--lead-sand, #f7f4ec)',
  accent: 'var(--lead-accent, #19c37d)',
  accentSoft: 'var(--lead-accent-soft, #82e7bf)',
  muted: '#8a98ad',
  body: '#cbd5e1',
  line: 'rgba(247, 244, 236, 0.08)',
  lineStrong: 'rgba(247, 244, 236, 0.12)',
}

function bandColorFor(pct: number): string {
  if (pct < 40) return '#ef4444'
  if (pct < 60) return '#f97316'
  if (pct < 75) return '#eab308'
  if (pct < 90) return '#22c55e'
  return C.accentSoft
}

const SEVERITY_BADGE: Record<'critical' | 'high' | 'medium', { label: string; color: string }> = {
  critical: { label: 'Critical', color: '#ef4444' },
  high: { label: 'High', color: '#eab308' },
  medium: { label: 'Medium', color: '#8a98ad' },
}

export function FreeAudit(): JSX.Element {
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

  function pick(a: Answer): void {
    const q = FREE_AUDIT_CHECKS[idx]
    const next = { ...answers, [q.check_id]: a }
    setAnswers(next)
    if (idx < TOTAL - 1) {
      setIdx(idx + 1)
    } else {
      setDone(true)
    }
  }

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!email || !done) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/free-audit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          answers,
          turnstile_token: turnstileToken,
        }),
      })
      const data = (await res.json()) as AuditResult & { error?: string }
      if (!res.ok) throw new Error(data.error ?? `submit_${res.status}`)
      setResult(data)
    } catch {
      setError('Could not run your audit — try again or contact team@bizlegal-ai.com.')
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

  /* ── Question screen ─────────────────────────────────────────────── */
  if (!done) {
    const q = FREE_AUDIT_CHECKS[idx]
    const progress = Math.round(((idx + 1) / TOTAL) * 100)

    return (
      <section
        aria-labelledby="fa-prompt"
        style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 32, color: C.sand }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: C.muted, marginBottom: 20 }}>
          <span>Check {idx + 1} / {TOTAL}</span>
          <div style={{ flex: 1, height: 4, borderRadius: 999, background: C.line, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${C.accent}, ${C.accentSoft})`,
                transition: 'width 300ms',
              }}
            />
          </div>
          <span>{progress}%</span>
        </div>

        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: C.accentSoft, fontWeight: 700, marginBottom: 8 }}>
          {AUDIT_AREA_LABELS[q.area]} · {q.severity} severity
        </p>
        <h2 id="fa-prompt" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.35, marginBottom: 28, color: C.sand }}>
          {q.question}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnswerBtn label="Yes" sub="Fully in place and documented" onClick={() => pick('met')} primary />
          <AnswerBtn label="Partially" sub="In progress or incomplete" onClick={() => pick('partial')} />
          <AnswerBtn label="No" sub="Not yet addressed" onClick={() => pick('not_met')} ghost />
        </div>
      </section>
    )
  }

  /* ── Email gate (before results) ─────────────────────────────────── */
  if (!result) {
    return (
      <section
        aria-labelledby="fa-gate"
        style={{ background: C.panel, border: `1px solid rgba(25, 195, 125, 0.3)`, borderRadius: 16, padding: 32, color: C.sand }}
      >
        <p id="fa-gate" style={{ fontSize: 20, fontWeight: 700, color: C.sand, marginBottom: 6 }}>
          Your audit is ready — where do we send the copy?
        </p>
        <p style={{ fontSize: 13, color: C.body, lineHeight: 1.6, marginBottom: 20 }}>
          Enter your work email to run the audit and see your score. We store the answers against
          the email so you can compare against future runs.
        </p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            aria-label="Work email address"
            style={{
              width: '100%',
              background: C.ink,
              border: `1px solid ${C.lineStrong}`,
              borderRadius: 10,
              padding: '11px 14px',
              color: C.sand,
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
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
                : C.accent,
              color: C.ink,
              fontWeight: 700,
              padding: '12px 0',
              borderRadius: 10,
              border: 'none',
              cursor: submitting || !email || (turnstileRequired && !turnstileToken) ? 'not-allowed' : 'pointer',
              fontSize: 15,
            }}
          >
            {submitting ? 'Running your audit…' : 'Run my free audit'}
          </button>
          {error && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>}
          <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
            One email with your audit + 4 short follow-ups over 7 days. One-click unsubscribe in
            every email.
          </p>
        </form>
      </section>
    )
  }

  /* ── Results screen ──────────────────────────────────────────────── */
  const bandColor = bandColorFor(result.overall_pct)
  const circumference = 2 * Math.PI * 60

  return (
    <section
      aria-labelledby="fa-score"
      style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 32, color: C.sand }}
    >
      {/* Score circle */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: C.accentSoft, fontWeight: 700, marginBottom: 16 }}>
          Free audit result · ref {result.audit_ref}
        </p>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="60" fill="none" stroke={C.line} strokeWidth="10" />
            <circle
              cx="70" cy="70" r="60" fill="none" stroke={bandColor} strokeWidth="10"
              strokeDasharray={String(circumference)}
              strokeDashoffset={String(circumference * (1 - result.overall_pct / 100))}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.2s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div id="fa-score" style={{ fontSize: 42, fontWeight: 900, color: bandColor, lineHeight: 1 }}>
              {result.overall_pct}
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>/ 100</div>
          </div>
        </div>
        <div style={{ display: 'inline-block', background: `${bandColor}18`, border: `1px solid ${bandColor}40`, borderRadius: 999, padding: '5px 18px', marginBottom: 12 }}>
          <span style={{ color: bandColor, fontWeight: 700, fontSize: 14 }}>{result.posture_label}</span>
        </div>
        <p style={{ fontSize: 14, color: C.body, lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
          {result.posture_summary}
        </p>
      </div>

      {/* Per-area aggregates */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 14 }}>
          Per-area scores ({result.checks_evaluated} of {TOTAL} checks answered)
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {result.areas.map((a) => (
            <div key={a.area}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                <span style={{ color: C.sand }}>{a.label}</span>
                <span style={{ fontWeight: 600, color: a.pct >= 70 ? '#22c55e' : a.pct >= 50 ? '#eab308' : '#ef4444' }}>
                  {a.checks_scored > 0 ? `${a.pct}%` : 'not answered'}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: C.line, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: 999,
                    width: `${a.checks_scored > 0 ? a.pct : 0}%`,
                    background: a.pct >= 70 ? '#22c55e' : a.pct >= 50 ? '#eab308' : '#ef4444',
                    transition: 'width 0.9s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gap counts */}
      <div style={{ background: C.ink, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16, marginBottom: 24, fontSize: 13, color: C.body, lineHeight: 1.6 }}>
        {result.gaps.not_met + result.gaps.partial === 0 ? (
          <span>No unmet checks in this audit. Re-run quarterly — rules and campaign volume change faster than policies do.</span>
        ) : (
          <span>
            <strong style={{ color: '#ef4444' }}>{result.gaps.not_met} unmet</strong>
            {result.gaps.partial > 0 && (
              <> and <strong style={{ color: '#eab308' }}>{result.gaps.partial} partial</strong></>
            )}{' '}
            control{result.gaps.not_met + result.gaps.partial === 1 ? '' : 's'} in this audit. The
            prioritized fix list below is your copy to keep — it was also sent to your inbox.
          </span>
        )}
      </div>

      {/* Prioritized recommendations — the free deliverable */}
      {result.recommendations.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 14 }}>
            Your fix list, prioritized by severity
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.recommendations.map((rec) => {
              const badge = SEVERITY_BADGE[rec.severity]
              return (
                <div key={rec.check_id} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: badge.color, background: `${badge.color}18`, border: `1px solid ${badge.color}40`, borderRadius: 999, padding: '3px 10px' }}>
                      {badge.label}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted }}>
                      {AUDIT_AREA_LABELS[rec.area as keyof typeof AUDIT_AREA_LABELS] ?? rec.area}
                      {' · '}
                      {rec.status === 'not_met' ? 'not met' : 'partial'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: C.body, lineHeight: 1.6, margin: 0 }}>{rec.recommendation}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Conversion block — fleet cross-sell (LeadForge has no paid tier of its own) */}
      <div style={{ border: '1px solid rgba(25, 195, 125, 0.4)', background: 'rgba(25, 195, 125, 0.06)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: C.accentSoft, fontWeight: 700, marginBottom: 8 }}>
          Go deeper with the BizLegal fleet
        </p>
        <p style={{ fontSize: 18, fontWeight: 700, color: C.sand, marginBottom: 6, lineHeight: 1.3 }}>
          This audit is self-reported. These tools produce evidence.
        </p>
        <p style={{ fontSize: 13, color: C.body, lineHeight: 1.6, marginBottom: 18 }}>
          Paid products from the same fleet that pairs naturally with consent and campaign hygiene —
          checkout is handled on each product&apos;s own surface.
        </p>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {crossSellFor('leadforge').map((offer) => (
            <a
              key={offer.url}
              href={offer.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', padding: '18px 20px', background: C.ink, border: `1px solid ${C.line}`, borderRadius: 12, textDecoration: 'none' }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: C.sand, marginBottom: 4 }}>{offer.headline}</div>
              <div style={{ fontSize: 12, color: C.body, lineHeight: 1.55, marginBottom: 10 }}>{offer.blurb}</div>
              <div style={{ fontSize: 11, color: C.accentSoft, fontWeight: 700 }}>{offer.product} · {offer.price} →</div>
            </a>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.6, marginBottom: 0 }}>{result.legal_notice}</p>

      <button
        type="button"
        onClick={reset}
        style={{ marginTop: 8, fontSize: 12, color: C.muted, background: 'transparent', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
      >
        Run the audit again
      </button>
    </section>
  )
}

function AnswerBtn({ label, sub, onClick, primary, ghost }: { label: string; sub: string; onClick: () => void; primary?: boolean; ghost?: boolean }) {
  const bg = primary ? C.accent : ghost ? 'transparent' : 'rgba(247, 244, 236, 0.04)'
  const color = primary ? C.ink : ghost ? C.muted : C.sand
  const border = primary ? 'none' : ghost ? `1px solid ${C.line}` : `1px solid ${C.lineStrong}`
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 600, textAlign: 'left', width: '100%', background: bg, color, border }}
    >
      <span>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.75 }}>{sub}</span>
    </button>
  )
}

export default FreeAudit
