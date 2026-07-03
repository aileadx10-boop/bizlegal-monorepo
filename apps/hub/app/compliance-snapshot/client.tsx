'use client'
/* eslint-disable react/no-unescaped-entities */
import { useState, useTransition } from 'react'

type Snapshot = {
  score: number            // 0-100 (higher = healthier)
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  flags: Array<{
    severity: 'high' | 'medium' | 'low'
    title: string
    detail: string
  }>
  recommended_fix: string
  next_step: string
  frameworks_checked: string[]
  email?: string
}

const SEVERITY_COLOR = {
  high: 'bg-red-100 text-red-800 border-red-300',
  medium: 'bg-amber-100 text-amber-800 border-amber-300',
  low: 'bg-yellow-50 text-yellow-800 border-yellow-300',
} as const

export function ComplianceSnapshotClient() {
  const [doc, setDoc] = useState('')
  const [email, setEmail] = useState('')
  const [docType, setDocType] = useState<'privacy_policy' | 'vendor_contract' | 'tos'>('privacy_policy')
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [paid, setPaid] = useState(false)

  async function runSnapshot() {
    setError(null)
    if (doc.trim().length < 200) {
      setError('Paste at least 200 characters of your document.')
      return
    }
    startTransition(async () => {
      try {
        const r = await fetch('/api/compliance-snapshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doc, doc_type: docType, email }),
        })
        if (!r.ok) {
          const t = await r.text()
          throw new Error(t || 'Snapshot failed')
        }
        const j: Snapshot = await r.json()
        setSnapshot(j)
        // Track conversion event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          ;(window as any).gtag('event', 'snapshot_generated', {
            doc_type: docType,
            score: j.score,
          })
        }
      } catch (e: any) {
        setError(e.message || 'Snapshot failed. Try again.')
      }
    })
  }

  async function unlockFull() {
    if (!email) {
      setError('Enter your email to unlock the full report.')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        const r = await fetch('/api/compliance-snapshot/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, score: snapshot?.score }),
        })
        if (!r.ok) throw new Error(await r.text())
        const j = await r.json()
        // If we have a checkout URL, redirect. Otherwise mark as paid (free tier).
        if (j.checkout_url) {
          window.location.href = j.checkout_url
        } else {
          setPaid(true)
        }
      } catch (e: any) {
        setError(e.message || 'Checkout failed.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* HERO */}
      <section className="max-w-3xl mx-auto px-4 pt-16 pb-8 text-center">
        <p className="text-sm font-medium text-emerald-700 mb-3">
          $9 ONE-TIME · 60 SECONDS · NO SIGNUP TO TRY
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
          Compliance Health Snapshot
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Paste your privacy policy, vendor contract, or terms of service.
          Get <strong>3 specific risk flags</strong> and <strong>1 fix you can ship today</strong>.
          The same engine that powers our $40K custom compliance builds — distilled to 60 seconds.
        </p>
      </section>

      {/* INPUT CARD */}
      <section className="max-w-3xl mx-auto px-4 pb-12">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8">
          <div className="flex gap-2 mb-4 flex-wrap">
            {(['privacy_policy', 'vendor_contract', 'tos'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setDocType(t)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                  docType === t
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                {t === 'privacy_policy' && 'Privacy Policy'}
                {t === 'vendor_contract' && 'Vendor Contract'}
                {t === 'tos' && 'Terms of Service'}
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium text-slate-700 mb-2">
            Paste your document (min 200 chars)
          </label>
          <textarea
            value={doc}
            onChange={(e) => setDoc(e.target.value)}
            rows={10}
            className="w-full rounded-md border-slate-300 font-mono text-sm focus:border-slate-500 focus:ring-slate-500"
            placeholder="Paste your privacy policy, MSA, DPA, or ToS here..."
          />

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com (required to unlock the report)"
              className="flex-1 rounded-md border-slate-300 text-sm focus:border-slate-500 focus:ring-slate-500"
            />
            <button
              onClick={runSnapshot}
              disabled={pending}
              className="px-6 py-2.5 rounded-md bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {pending ? 'Analyzing…' : 'Get free preview'}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </div>
      </section>

      {/* RESULT */}
      {snapshot && (
        <section className="max-w-3xl mx-auto px-4 pb-16">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* SCORE HEADER */}
            <div className="p-6 md:p-8 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Compliance Health Score</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-bold text-slate-900">{snapshot.score}</span>
                    <span className="text-2xl font-bold text-slate-500">/100</span>
                    <span
                      className={`text-2xl font-bold ${
                        snapshot.grade === 'A' || snapshot.grade === 'B'
                          ? 'text-emerald-600'
                          : snapshot.grade === 'C'
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      Grade {snapshot.grade}
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  Checked against
                  <div className="mt-1 flex flex-wrap gap-1 justify-end max-w-[200px]">
                    {snapshot.frameworks_checked.map((f) => (
                      <span key={f} className="px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* FLAGS — blurred unless paid */}
            <div className={`p-6 md:p-8 ${!paid ? 'relative' : ''}`}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">3 specific risk flags</h2>
              <ul className="space-y-3">
                {snapshot.flags.map((flag, i) => (
                  <li
                    key={i}
                    className={`rounded-md border p-4 ${SEVERITY_COLOR[flag.severity]} ${
                      !paid && i > 0 ? 'blur-sm select-none' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold uppercase tracking-wide mt-0.5">
                        {flag.severity}
                      </span>
                      <div>
                        <p className="font-semibold">{flag.title}</p>
                        <p className="text-sm mt-1 opacity-90">{flag.detail}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {!paid && (
                <div className="mt-6 bg-slate-50 border border-slate-200 rounded-md p-5 text-center">
                  <p className="text-sm text-slate-700 mb-3">
                    Unlock the <strong>full report</strong> + the recommended fix PDF
                  </p>
                  <button
                    onClick={unlockFull}
                    disabled={pending}
                    className="px-6 py-2.5 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {pending ? 'Loading…' : 'Unlock for $9'}
                  </button>
                  <p className="text-xs text-slate-500 mt-2">
                    Or get unlimited snapshots for $19/month (cancel anytime)
                  </p>
                </div>
              )}

              {paid && (
                <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-md p-5">
                  <p className="text-sm font-medium text-emerald-900">
                    Full report unlocked. Your recommended fix:
                  </p>
                  <p className="text-sm text-emerald-800 mt-2">
                    {snapshot.recommended_fix}
                  </p>
                  <p className="text-xs text-emerald-700 mt-3">
                    PDF copy sent to {email}. Next step: {snapshot.next_step}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SOCIAL PROOF */}
          <div className="mt-8 text-center text-sm text-slate-500">
            Used by founders, GCs, and compliance leads at fintechs, SaaS, and crypto companies.
            <br />
            <span className="text-xs">
              Built on the same engine as our $40K custom compliance builds.
            </span>
          </div>
        </section>
      )}

      {/* FAQ-LITE FOOTER */}
      {!snapshot && (
        <section className="max-w-3xl mx-auto px-4 pb-16 text-sm text-slate-600">
          <details className="border-b border-slate-200 py-3">
            <summary className="font-medium cursor-pointer">What frameworks do you check?</summary>
            <p className="mt-2 text-slate-500">
              GDPR, CCPA, SOC 2 Type II controls, ISO 27001, HIPAA, and standard contract risk patterns (indemnity, liability cap, data residency, termination). Mapped per document type.
            </p>
          </details>
          <details className="border-b border-slate-200 py-3">
            <summary className="font-medium cursor-pointer">Is my document stored?</summary>
            <p className="mt-2 text-slate-500">
              No. Documents are processed in-memory for the snapshot and discarded. We only persist the score and your email if you unlock the full report.
            </p>
          </details>
          <details className="border-b border-slate-200 py-3">
            <summary className="font-medium cursor-pointer">Is this legal advice?</summary>
            <p className="mt-2 text-slate-500">
              No. This is a risk-screening tool. For binding legal advice, consult a licensed attorney in your jurisdiction.
            </p>
          </details>
        </section>
      )}
    </div>
  )
}
