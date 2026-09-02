'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

/* ─── Design tokens (fleet dark-professional look, matches TRACR) ───────── */
const C = {
  bg: '#07090e', surface: '#0d1118', card: '#111622', border: '#1a2035',
  text: '#e8ecf4', muted: '#5a6278', dim: '#2e3450',
  red: '#c0392b', redBg: 'rgba(192,57,43,0.09)', redBorder: 'rgba(192,57,43,0.30)',
  amber: '#d4a843', amberBg: 'rgba(212,168,67,0.08)', amberBorder: 'rgba(212,168,67,0.28)',
  green: '#27ae60', greenBg: 'rgba(39,174,96,0.08)', orange: '#e67e22',
  mono: '"DM Mono","Fira Code",ui-monospace,monospace',
  serif: '"Playfair Display",Georgia,serif',
  sans: '"DM Sans",system-ui,-apple-system,sans-serif',
}

interface EvidenceRow {
  engine: string
  prompt: string
  response: string | null
  status: 'ok' | 'unavailable' | 'error'
  sha256: string
  seq: number
  flagged: boolean
  flag_terms: string[] | null
  confidence: string | null
  narrative: string | null
  scanned_at: string
}

interface ScanMeta {
  scan_ref: string
  entity: string
  tier: string
  status: string
  score: number | null
  flags_count: number | null
  submission_sha256: string | null
  scan_sha256: string | null
  created_at: string
  completed_at: string | null
  email?: string
}

const ENGINE_NAMES: Record<string, string> = {
  chatgpt: 'ChatGPT (OpenAI)',
  claude: 'Claude (Anthropic)',
  perplexity: 'Perplexity',
  google_aio: 'Google AI Overviews',
}

function statusColor(s: string) {
  if (s === 'delivered' || s === 'free_complete') return C.green
  if (s === 'failed') return C.red
  return C.orange
}

export default function ReportPage() {
  const { scan_ref } = useParams<{ scan_ref: string }>()
  const [scan, setScan] = useState<ScanMeta | null>(null)
  const [evidence, setEvidence] = useState<EvidenceRow[] | null>(null)
  const [paid, setPaid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [payBusy, setPayBusy] = useState<'card' | 'crypto' | null>(null)
  const [payErr, setPayErr] = useState('')

  useEffect(() => {
    fetch(`/api/report/${scan_ref}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return }
        const d = await r.json()
        setScan(d.scan ?? null)
        setEvidence(d.evidence ?? null)
        setPaid(Boolean(d.paid))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [scan_ref])

  async function payCard() {
    if (!scan) return
    setPayBusy('card')
    setPayErr('')
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: scan.email ?? '', tier: 'audit', scanRef: scan.scan_ref }),
      })
      const data = await res.json()
      if (data.approvalUrl) window.location.href = data.approvalUrl
      else { setPayErr(data.error || 'Could not start card checkout.'); setPayBusy(null) }
    } catch { setPayErr('Network error starting checkout.'); setPayBusy(null) }
  }

  async function payCrypto() {
    if (!scan) return
    setPayBusy('crypto')
    setPayErr('')
    try {
      const res = await fetch('/api/payments/nowpayments/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: scan.email ?? '', tier: 'audit', scanRef: scan.scan_ref }),
      })
      const data = await res.json()
      if (data.invoice_url) window.location.href = data.invoice_url
      else { setPayErr(data.error || 'Could not start crypto checkout.'); setPayBusy(null) }
    } catch { setPayErr('Network error starting checkout.'); setPayBusy(null) }
  }

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: `1.5px solid ${C.amber}`, borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite' }} />
      <div style={{ fontFamily: C.mono, fontSize: 12, color: C.muted, letterSpacing: '0.12em' }}>Loading evidence pack…</div>
    </div>
  )

  /* ── Not found ── */
  if (notFound || !scan) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ fontSize: 28, color: C.red }}>⚠</div>
      <div style={{ fontFamily: C.mono, fontSize: 14, color: C.muted }}>Report not found.</div>
      <a href="/scan" style={{ fontFamily: C.mono, fontSize: 12, color: C.amber, textDecoration: 'none', marginTop: 8 }}>← Run a new scan</a>
    </div>
  )

  const running = scan.status === 'running' || scan.status === 'pending'
  const score = scan.score ?? 0
  const flags = scan.flags_count ?? 0

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: C.sans }}>
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
        <a href="/" style={{ textDecoration: 'none', fontFamily: C.mono, fontSize: 20, fontWeight: 500, letterSpacing: '0.14em', color: C.text }}>
          False<span style={{ color: C.amber }}>Echo</span>
        </a>
        <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.1em' }}>{scan.scan_ref}</div>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '52px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32, paddingBottom: 28, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
            FalseEcho {scan.tier === 'monitor' ? 'Monitor' : scan.tier === 'audit' ? 'Audit' : 'Free Check'} Evidence Pack
          </div>
          <h1 style={{ fontFamily: C.serif, fontSize: 30, fontWeight: 700, color: C.text, marginBottom: 10, lineHeight: 1.2 }}>
            AI-engine claims about {scan.entity}
          </h1>
          <div style={{ fontFamily: C.mono, fontSize: 12, color: statusColor(scan.status) }}>
            {scan.status.replace(/_/g, ' ')}
            {scan.completed_at && ` · completed ${new Date(scan.completed_at).toUTCString()}`}
          </div>
        </div>

        {/* Score gauge */}
        {scan.score !== null && (
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 28, padding: '24px 28px', borderRadius: 12, background: flags > 0 ? C.redBg : C.greenBg, border: `1px solid ${flags > 0 ? C.redBorder : 'rgba(39,174,96,0.25)'}` }}>
            <div style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontFamily: C.mono, fontSize: 44, fontWeight: 500, color: flags > 0 ? C.red : C.green, lineHeight: 1 }}>{score}</div>
              <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, letterSpacing: '0.12em', marginTop: 4 }}>EXPOSURE / 100</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: flags > 0 ? C.red : C.green, marginBottom: 4, fontFamily: C.serif }}>
                {flags > 0 ? `${flags} suspected falsehood${flags === 1 ? '' : 's'}` : 'No suspected falsehoods'}
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                <span style={{ color: paid ? C.green : C.orange }}>{paid ? 'Payment confirmed' : 'Awaiting payment'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Hash anchors */}
        {paid && (scan.submission_sha256 || scan.scan_sha256) && (
          <div style={{ marginBottom: 28, padding: '20px 24px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
            <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>Hash anchors</div>
            {scan.submission_sha256 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: '0.12em', marginBottom: 4 }}>SUBMISSION (entity + content + timestamp)</div>
                <div style={{ fontFamily: C.mono, fontSize: 12, color: C.text, wordBreak: 'break-all' }}>{scan.submission_sha256}</div>
              </div>
            )}
            {scan.scan_sha256 && (
              <div>
                <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: '0.12em', marginBottom: 4 }}>SCAN (all evidence rows, in sequence)</div>
                <div style={{ fontFamily: C.mono, fontSize: 12, color: C.text, wordBreak: 'break-all' }}>{scan.scan_sha256}</div>
              </div>
            )}
          </div>
        )}

        {/* Running state — poll */}
        {running && (
          <RunningNote scanRef={scan.scan_ref} />
        )}

        {/* Evidence rows — paid only */}
        {paid && !running && evidence && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Evidence — {evidence.length} captured answers
            </div>
            {evidence.map((row) => (
              <div key={row.sha256} style={{ padding: '20px 24px', background: row.flagged ? C.redBg : C.surface, border: `1px solid ${row.flagged ? C.redBorder : C.border}`, borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                  <span style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.1em' }}>
                    #{String(row.seq).padStart(3, '0')} · {ENGINE_NAMES[row.engine] ?? row.engine}
                  </span>
                  <span style={{ fontFamily: C.mono, fontSize: 10, color: row.status === 'ok' ? (row.flagged ? C.red : C.green) : C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {row.status === 'ok' ? (row.flagged ? `flagged${row.confidence ? ` · ${row.confidence} confidence` : ''}` : 'no flag') : row.status}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 8 }}>{row.prompt}</div>
                {row.response && (
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>
                    {row.response.length > 600 ? `${row.response.slice(0, 600)}…` : row.response}
                  </p>
                )}
                {row.narrative && (
                  <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: '0 0 10px', fontStyle: 'italic', borderLeft: `2px solid ${C.red}`, paddingLeft: 12 }}>
                    {row.narrative}
                  </p>
                )}
                <div style={{ fontFamily: C.mono, fontSize: 10, color: C.dim, wordBreak: 'break-all', lineHeight: 1.7 }}>
                  sha256 {row.sha256}
                  <br />
                  {new Date(row.scanned_at).toUTCString()}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              <button onClick={() => window.print()} style={{
                padding: '11px 24px', background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: C.sans,
              }}>Print / Save as PDF</button>
            </div>

            {/* Monitor upsell */}
            {scan.tier !== 'monitor' && (
              <div style={{ marginTop: 12, padding: '28px 32px', borderRadius: 12, textAlign: 'center', background: C.amberBg, border: `1px solid ${C.amberBorder}` }}>
                <h3 style={{ fontFamily: C.serif, fontSize: 18, color: C.text, marginBottom: 8 }}>This pack is a snapshot</h3>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.7 }}>
                  Engines change their answers constantly. FalseEcho Monitor re-scans {scan.entity} daily and emails you the moment a new falsehood appears — $149/mo, cancel anytime.
                </p>
                <a href="/pricing"
                  style={{ display: 'inline-block', padding: '12px 30px', background: C.amberBg, border: `1px solid ${C.amber}66`, borderRadius: 8, color: C.amber, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  Set up monitoring →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Paywall — not paid */}
        {!paid && !running && (
          <div style={{ padding: '40px 32px', background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
            <h2 style={{ fontFamily: C.serif, fontSize: 22, color: C.text, marginBottom: 10 }}>Evidence pack locked</h2>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 28, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 28px' }}>
              The quick probe captured {flags} suspected falsehood{flags === 1 ? '' : 's'}. Unlock the full
              25-prompt battery, per-answer SHA-256 anchors, and Claude-graded
              narratives with the $29 audit.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <button onClick={payCard} disabled={payBusy !== null} style={{
                padding: '13px 30px', background: C.amber, color: '#07090e', border: 'none',
                borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: payBusy ? 'wait' : 'pointer', fontFamily: C.sans,
              }}>
                {payBusy === 'card' ? 'Starting checkout…' : 'Pay $29 by card →'}
              </button>
              <button onClick={payCrypto} disabled={payBusy !== null} style={{
                padding: '13px 30px', background: C.redBg, border: `1px solid ${C.redBorder}`,
                borderRadius: 8, color: C.red, fontSize: 14, fontWeight: 700, cursor: payBusy ? 'wait' : 'pointer', fontFamily: C.sans,
              }}>
                {payBusy === 'crypto' ? 'Creating invoice…' : 'Pay with crypto →'}
              </button>
            </div>
            {payErr && <p style={{ fontSize: 12, color: C.red, fontFamily: C.mono, marginBottom: 12 }}>{payErr}</p>}
            <p style={{ fontSize: 11, color: C.dim, fontFamily: C.mono }}>Card via PayPal · Crypto via NOWPayments</p>
          </div>
        )}

        {/* Disclaimer — liability shrinker, on every pack */}
        <div style={{ marginTop: 40, padding: '18px 24px', borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 11, color: C.dim, lineHeight: 1.7, fontFamily: C.mono, margin: 0 }}>
            <strong style={{ color: C.muted }}>DISCLAIMER:</strong> We publish signals, you decide. This evidence pack records what AI answer engines returned at capture time, hash-anchored for tamper evidence. It states facts and sources — it is not legal advice and makes no defamation determination. Detection completeness is not guaranteed; engines change answers constantly. Reviewed pipeline: automated capture, human review available on request. Scan ref: {scan.scan_ref}.
          </p>
        </div>
      </div>
    </div>
  )
}

function RunningNote({ scanRef }: { scanRef: string }) {
  const [, force] = useState(0)
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 15000)
    return () => clearInterval(t)
  }, [])
  // Re-render triggers the parent's useEffect only on mount — instead, do a
  // soft reload by refetching through location after a delay.
  useEffect(() => {
    const t = setTimeout(() => { window.location.reload() }, 20000)
    return () => clearTimeout(t)
  }, [])
  return (
    <div style={{ padding: '36px 32px', background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, textAlign: 'center' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: `1.5px solid ${C.amber}`, borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite', margin: '0 auto 16px' }} />
      <div style={{ fontFamily: C.mono, fontSize: 12, color: C.muted, letterSpacing: '0.12em' }}>
        Probe battery running for {scanRef}… this page refreshes automatically.
      </div>
    </div>
  )
}
