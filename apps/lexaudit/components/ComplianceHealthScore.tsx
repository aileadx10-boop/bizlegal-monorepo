'use client'

import { useState } from 'react'
import TurnstileWidget from './TurnstileWidget'

type Answer = 'yes' | 'partial' | 'no'
const SCORE_MAP: Record<Answer, number> = { yes: 2, partial: 1, no: 0 }

interface Question {
  readonly id: string
  readonly prompt: string
}

interface Category {
  readonly id: string
  readonly label: string
  readonly questions: Question[]
}

const CATEGORIES: Category[] = [
  {
    id: 'data_inventory',
    label: 'Data Inventory & Minimization',
    questions: [
      { id: 'di_1', prompt: 'Do you maintain a current inventory of all personal data you collect?' },
      { id: 'di_2', prompt: 'Are data minimization principles applied — do you collect only what each use case strictly requires?' },
      { id: 'di_3', prompt: 'Do you document what personal data is processed, where it is stored, and who can access it?' },
      { id: 'di_4', prompt: 'Do you have a documented data retention schedule with enforced deletion?' },
      { id: 'di_5', prompt: 'Can you produce a record of processing activities on request (equivalent to GDPR Article 30)?' },
    ],
  },
  {
    id: 'consent',
    label: 'Consent & Disclosure',
    questions: [
      { id: 'co_1', prompt: 'Does your cookie banner block non-essential cookies until consent is actively given?' },
      { id: 'co_2', prompt: 'Is your privacy policy updated within the last 12 months and accurate to current practices?' },
      { id: 'co_3', prompt: 'Do you provide just-in-time notice at the point of collection — not only in the footer policy?' },
      { id: 'co_4', prompt: 'Is your disclosure of third-party data sharing accurate and current?' },
      { id: 'co_5', prompt: 'Is consent withdrawal as easy to exercise as consent was to give?' },
    ],
  },
  {
    id: 'dsr',
    label: 'Data Subject Rights',
    questions: [
      { id: 'dsr_1', prompt: 'Can you respond to data access requests within regulatory deadlines (30–45 days depending on law)?' },
      { id: 'dsr_2', prompt: 'Do you verify identity before fulfilling requests to prevent fraudulent disclosures?' },
      { id: 'dsr_3', prompt: 'Can you delete a specific individual\'s data across all systems on a verified request?' },
      { id: 'dsr_4', prompt: 'Do you have a documented process for CCPA opt-out of sale or sharing (if applicable)?' },
      { id: 'dsr_5', prompt: 'Are all data subject requests tracked with submission date, resolution date, and outcome?' },
    ],
  },
  {
    id: 'vendors',
    label: 'Vendor & Third-Party Management',
    questions: [
      { id: 'vd_1', prompt: 'Do you have signed DPAs or BAAs with all vendors who access or process personal data?' },
      { id: 'vd_2', prompt: 'Is there a current list of all vendors with access to personal or sensitive data?' },
      { id: 'vd_3', prompt: 'Are vendors assessed for security posture before onboarding?' },
      { id: 'vd_4', prompt: 'Do you audit vendor compliance at least annually or upon a material change?' },
      { id: 'vd_5', prompt: 'Is vendor data access terminated within 24 hours of a contract ending?' },
    ],
  },
  {
    id: 'security',
    label: 'Data Security Controls',
    questions: [
      { id: 'sc_1', prompt: 'Is personal data encrypted at rest using current standards (AES-256 or equivalent)?' },
      { id: 'sc_2', prompt: 'Is all data transmission encrypted using TLS 1.2 or higher?' },
      { id: 'sc_3', prompt: 'Is multi-factor authentication enforced for all systems containing personal data?' },
      { id: 'sc_4', prompt: 'Are access privileges scoped to least-privilege — each role accessing only what it requires?' },
      { id: 'sc_5', prompt: 'Do you conduct vulnerability assessments or penetration testing at least annually?' },
    ],
  },
  {
    id: 'incident',
    label: 'Incident Response',
    questions: [
      { id: 'ir_1', prompt: 'Do you have a documented breach response plan with named roles and escalation contacts?' },
      { id: 'ir_2', prompt: 'Can you detect a breach and notify regulators within 72 hours of discovery (GDPR standard)?' },
      { id: 'ir_3', prompt: 'Has your incident response plan been tested within the last 12 months?' },
      { id: 'ir_4', prompt: 'Is there a designated privacy officer, security lead, or outside-counsel equivalent?' },
      { id: 'ir_5', prompt: 'Do you maintain an internal breach log — even for incidents below the notification threshold?' },
    ],
  },
  {
    id: 'regulatory',
    label: 'Regulatory Awareness',
    questions: [
      { id: 'rg_1', prompt: 'Do you have a documented view of which privacy and data protection laws apply to your business today?' },
      { id: 'rg_2', prompt: 'Is someone actively monitoring regulatory developments in your space — not just at annual renewal?' },
      { id: 'rg_3', prompt: 'Have you conducted a Privacy Impact Assessment for new products or significant features?' },
      { id: 'rg_4', prompt: 'Do you have a process to review new regulatory guidance before it takes effect?' },
      { id: 'rg_5', prompt: 'Are compliance obligations tracked in a living document with owners and review dates?' },
    ],
  },
  {
    id: 'governance',
    label: 'Governance & Documentation',
    questions: [
      { id: 'gv_1', prompt: 'Are compliance policies version-controlled, accessible, and reviewed at least annually?' },
      { id: 'gv_2', prompt: 'Do employees with data access receive compliance training at least annually?' },
      { id: 'gv_3', prompt: 'Is senior leadership or the board informed of the company\'s key compliance obligations?' },
      { id: 'gv_4', prompt: 'Is there a documented escalation path for compliance concerns to reach leadership?' },
      { id: 'gv_5', prompt: 'Are compliance decisions and their rationale logged so auditors can reconstruct them?' },
    ],
  },
]

const ALL_QUESTIONS = CATEGORIES.flatMap((cat, catIdx) =>
  cat.questions.map((q, qIdx) => ({ ...q, catIdx, qIdx, catId: cat.id, catLabel: cat.label }))
)
const TOTAL = ALL_QUESTIONS.length   // 40
const MAX_PTS = TOTAL * 2            // 80

type ScoreLabel = 'Critical Risk' | 'At Risk' | 'Developing' | 'Proficient' | 'Advanced'

interface ScoreInfo { label: ScoreLabel; color: string; description: string }

function scoreInfo(pct: number): ScoreInfo {
  if (pct < 40) return { label: 'Critical Risk', color: '#ef4444', description: 'Significant regulatory exposure across multiple domains. Immediate remediation needed.' }
  if (pct < 55) return { label: 'At Risk', color: '#f97316', description: 'Key compliance gaps that create real enforcement risk. Priority action warranted.' }
  if (pct < 70) return { label: 'Developing', color: '#eab308', description: 'Basic framework in place but priority gaps remain. A structured plan closes most of the distance.' }
  if (pct < 85) return { label: 'Proficient', color: '#22c55e', description: 'Strong compliance posture. Focused improvements in specific categories would round it out.' }
  return { label: 'Advanced', color: '#c9a84c', description: 'Comprehensive compliance program. Maintain momentum and keep tracking regulatory drift.' }
}

export function ComplianceHealthScore(): JSX.Element {
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

  function pick(a: Answer): void {
    const q = ALL_QUESTIONS[idx]
    const next = { ...answers, [q.id]: a }
    setAnswers(next)
    if (idx < TOTAL - 1) { setIdx(idx + 1) } else { setDone(true) }
  }

  const totalPts = Object.values(answers).reduce((s, a) => s + SCORE_MAP[a], 0)
  const pct = done ? Math.round((totalPts / MAX_PTS) * 100) : 0
  const info = done ? scoreInfo(pct) : null

  const catScores = CATEGORIES.map(cat => {
    const pts = cat.questions.reduce((s, q) => s + SCORE_MAP[answers[q.id] ?? 'no'], 0)
    return { id: cat.id, label: cat.label, pct: Math.round((pts / (cat.questions.length * 2)) * 100) }
  })

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!email || !done) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/health-score/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          total_score: totalPts,
          score_pct: pct,
          score_label: info?.label,
          category_scores: catScores,
          turnstile_token: turnstileToken,
        }),
      })
      if (!res.ok) throw new Error(`submit_${res.status}`)
      setSubmitted(true)
    } catch {
      setError('Could not save your email — try again or contact team@bizlegal-ai.com.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset(): void {
    setAnswers({})
    setIdx(0)
    setDone(false)
    setEmail('')
    setSubmitted(false)
    setError(null)
    setTurnstileToken(null)
  }

  /* ── Question screen ─────────────────────────────────────────────────── */
  if (!done) {
    const q = ALL_QUESTIONS[idx]
    const progress = Math.round(((idx + 1) / TOTAL) * 100)

    return (
      <section
        aria-labelledby="hs-prompt"
        style={{ background: '#0d0d18', border: '1px solid #2a2418', borderRadius: 16, padding: 32, color: '#e2e8f0' }}
      >
        {/* Category progress chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {CATEGORIES.map((c, i) => {
            const active = i === q.catIdx
            const past = i < q.catIdx
            return (
              <span key={c.id} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: active ? 700 : 400, background: past ? '#1a2818' : active ? 'rgba(201,168,76,0.15)' : '#0f0f1a', color: past ? '#22c55e' : active ? '#c9a84c' : '#475569', border: `1px solid ${past ? '#16a34a' : active ? '#c9a84c' : '#1e293b'}` }}>
                {past ? '✓' : String(i + 1)}
              </span>
            )
          })}
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#7a7a7a', marginBottom: 20 }}>
          <span>Q {idx + 1} / {TOTAL}</span>
          <div style={{ flex: 1, height: 4, borderRadius: 999, background: '#1f1a10', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#c9a84c,#a07830)', transition: 'width 300ms' }} />
          </div>
          <span>{progress}%</span>
        </div>

        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#c9a84c', fontWeight: 700, marginBottom: 8 }}>
          {CATEGORIES[q.catIdx].label} · {q.qIdx + 1} of 5
        </p>
        <h2 id="hs-prompt" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, lineHeight: 1.35, marginBottom: 28, color: '#f7f3e8' }}>
          {q.prompt}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnswerBtn label="Yes" sub="Fully in place" onClick={() => pick('yes')} primary />
          <AnswerBtn label="Partially" sub="In progress or incomplete" onClick={() => pick('partial')} />
          <AnswerBtn label="No" sub="Not yet addressed" onClick={() => pick('no')} ghost />
        </div>
      </section>
    )
  }

  /* ── Results screen ──────────────────────────────────────────────────── */
  const circumference = 2 * Math.PI * 60

  return (
    <section aria-labelledby="hs-score" style={{ background: '#0d0d18', border: '1px solid #2a2418', borderRadius: 16, padding: 32, color: '#e2e8f0' }}>
      {/* Score circle */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#c9a84c', fontWeight: 700, marginBottom: 16 }}>Your Compliance Health Score</p>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="60" fill="none" stroke="#1f1a10" strokeWidth="10" />
            <circle cx="70" cy="70" r="60" fill="none" stroke={info!.color} strokeWidth="10"
              strokeDasharray={String(circumference)}
              strokeDashoffset={String(circumference * (1 - pct / 100))}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1.2s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div id="hs-score" style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, color: info!.color, lineHeight: 1 }}>{pct}</div>
            <div style={{ fontSize: 12, color: '#7a7a7a' }}>/ 100</div>
          </div>
        </div>
        <div style={{ display: 'inline-block', background: `${info!.color}18`, border: `1px solid ${info!.color}40`, borderRadius: 999, padding: '5px 18px', marginBottom: 12 }}>
          <span style={{ color: info!.color, fontWeight: 700, fontSize: 14 }}>{info!.label}</span>
        </div>
        <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>{info!.description}</p>
      </div>

      {/* Category breakdown — revealed after email submit */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7a7a7a', marginBottom: 14 }}>Category Breakdown</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {catScores.map(c => (
            <div key={c.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                <span style={{ color: submitted ? '#e2e8f0' : '#475569' }}>{c.label}</span>
                <span style={{ fontWeight: 600, color: submitted ? (c.pct >= 70 ? '#22c55e' : c.pct >= 50 ? '#eab308' : '#ef4444') : '#2d2d3a' }}>
                  {submitted ? `${c.pct}%` : '—'}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: '#1f1a10', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 999, width: submitted ? `${c.pct}%` : '4px', background: submitted ? (c.pct >= 70 ? '#22c55e' : c.pct >= 50 ? '#eab308' : '#ef4444') : '#2d2d3a', transition: 'width 0.9s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email gate → reveal */}
      {!submitted ? (
        <div style={{ background: '#070710', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 12, padding: 24 }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#f7f3e8', marginBottom: 6 }}>
            See your full breakdown + top 3 priority gaps
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16 }}>
            Enter your work email — we will send you the category scores, your 3 highest-risk gaps, and a prioritized remediation checklist.
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
              {submitting ? 'Sending…' : 'Reveal my full breakdown'}
            </button>
            {error && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>}
            <p style={{ fontSize: 11, color: '#7a7a7a', lineHeight: 1.5 }}>
              One email with your results + occasional compliance updates. One-click unsubscribe.
            </p>
          </form>
        </div>
      ) : (
        <div>
          <div style={{ border: '1px solid rgba(201,168,76,0.4)', background: 'rgba(201,168,76,0.08)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#f7f3e8', marginBottom: 4 }}>Sent — check your inbox in a few minutes.</p>
            <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>Your category breakdown and prioritized gap list are on their way.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 14, lineHeight: 1.6 }}>
              LexAudit Monitor tracks regulatory drift across GDPR, SOC2, HIPAA, FinCEN, and 3 additional frameworks — alerting you before guidance takes effect.
            </p>
            <a
              href="/pricing"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#c9a84c,#a07830)', color: '#0a0a0f', borderRadius: 10, padding: '12px 24px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
            >
              See LexAudit Monitor plans <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      )}

      <button type="button" onClick={reset} style={{ marginTop: 24, fontSize: 12, color: '#7a7a7a', background: 'transparent', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
        Retake the assessment
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

export default ComplianceHealthScore
