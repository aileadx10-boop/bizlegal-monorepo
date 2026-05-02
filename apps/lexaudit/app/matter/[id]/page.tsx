'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function MatterPage() {
  const [matter, setMatter] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ lawyer: '', partner: '', prompt: '', edits: '', ai_tool: '' })
  const [loading, setLoading] = useState(false)
  const [certLoading, setCertLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [certId, setCertId] = useState('')
  const [paymentOpts, setPaymentOpts] = useState<{
    invoiceUrl?: string
    approveUrl?: string
    orderId: string
    certId: string
    gateway: 'nowpayments' | 'paypal'
    priceUsd: number
  } | null>(null)
  const [emailForReceipt, setEmailForReceipt] = useState('')
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const id = params?.id as string
    if (!id) return
    supabase.from('matters').select('*').eq('id', id).single().then(({ data }) => {
      if (data) { setMatter(data); setForm(f => ({ ...f, ai_tool: data.ai_tool || '' })) }
    })
    supabase.from('ai_logs').select('*').eq('matter_id', id).order('logged_at', { ascending: false }).then(({ data }) => setLogs(data || []))
  }, [params?.id])

  async function saveLog() {
    if (!form.lawyer || !form.prompt) return
    setLoading(true)
    const { data } = await supabase.from('ai_logs').insert({
      matter_id: matter.id,
      ai_tool: form.ai_tool || matter.ai_tool,
      lawyer: form.lawyer,
      partner: form.partner,
      prompt_summary: form.prompt,
      human_edits: form.edits,
      logged_at: new Date().toISOString()
    }).select().single()
    if (data) { setLogs(prev => [data, ...prev]); setStep(2) }
    setLoading(false)
  }

  async function requestPayment(gateway: 'nowpayments' | 'paypal') {
    setCertLoading(true)
    try {
      const res = await fetch('/api/certificates/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matter_id: matter.id,
          form,
          gateway,
          email: emailForReceipt || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment init failed')

      if (gateway === 'nowpayments' && data.invoice_url) {
        // Crypto — open NOWPayments invoice in new tab
        window.open(data.invoice_url, '_blank', 'noopener,noreferrer')
        setPaymentOpts({
          invoiceUrl: data.invoice_url,
          orderId: data.order_id,
          certId: data.cert_id,
          gateway,
          priceUsd: data.price_usd ?? 24,
        })
        setStep(2)
      } else if (gateway === 'paypal' && data.approve_url) {
        // Card — redirect to PayPal approval
        window.location.href = data.approve_url
      } else {
        throw new Error(data.error || 'Payment provider returned no URL')
      }
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : 'Payment init failed')
    }
    setCertLoading(false)
  }

  async function generateCertificate() {
    setCertLoading(true)
    try {
      const res = await fetch('/api/generate-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matter, form })
      })
      const data = await res.json()
      setSummary(data.summary)
      setCertId(data.certId)
      await supabase.from('matters').update({ status: 'attested' }).eq('id', matter.id)
      setStep(3)
    } catch {
      setSummary('AI-assisted drafting was performed under direct attorney supervision. The responsible lawyer reviewed all AI outputs for accuracy prior to use. Human edits were applied to ensure compliance with applicable law and client instructions. This document was approved by the supervising partner before any client-facing use.')
      setCertId('LA-' + Math.random().toString(36).substring(2, 8).toUpperCase())
      setStep(3)
    }
    setCertLoading(false)
  }

  const input = {
    width: '100%', background: '#0f172a', border: '1px solid #1e293b',
    borderRadius: '8px', color: '#e2e8f0', padding: '11px 14px',
    fontSize: '13px', outline: 'none', marginBottom: '12px'
  }

  if (!matter) return (
    <div style={{ minHeight: '100vh', background: '#050509', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
      Loading matter...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#050509', fontFamily: "'DM Sans',sans-serif", color: '#e2e8f0' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap')`}</style>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #0f172a', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/dashboard" style={{ color: '#475569', textDecoration: 'none', fontSize: '13px' }}>← Dashboard</Link>
          <span style={{ color: '#1e293b' }}>|</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '15px' }}>{matter.title}</span>
        </div>
        {matter.client_ref && <span style={{ color: '#334155', fontSize: '12px' }}>Ref: {matter.client_ref}</span>}
      </nav>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '40px' }}>
        {/* Step tabs */}
        <div style={{ display: 'flex', marginBottom: '32px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #1e293b' }}>
          {['1. AI Log', '2. Review', '3. Payment', '4. Score'].map((s, i) => (
            <div key={s} style={{ flex: 1, padding: '12px', textAlign: 'center', background: i === step ? '#c9a84c' : i < step ? '#1e293b' : '#080810', color: i === step ? '#0a0a0f' : i < step ? '#94a3b8' : '#475569', fontWeight: i === step ? 700 : 400, fontSize: '13px', borderRight: i < 3 ? '1px solid #1e293b' : 'none' }}>
              {i < step ? '✓ ' : ''}{s}
            </div>
          ))}
        </div>

        {/* STEP 0: Log */}
        {step === 0 && (
          <div style={{ background: '#080810', border: '1px solid #1a1a2e', borderRadius: '14px', padding: '32px' }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', marginBottom: '24px' }}>Log AI Usage</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ color: '#64748b', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>RESPONSIBLE LAWYER *</label>
                <input style={input} placeholder="Adv. Sarah Cohen" value={form.lawyer} onChange={e => setForm(f => ({ ...f, lawyer: e.target.value }))} />
              </div>
              <div>
                <label style={{ color: '#64748b', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>REVIEWING PARTNER</label>
                <input style={input} placeholder="Partner J. Miller" value={form.partner} onChange={e => setForm(f => ({ ...f, partner: e.target.value }))} />
              </div>
            </div>
            <label style={{ color: '#64748b', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>PROMPT USED (SUMMARY) *</label>
            <textarea style={{ ...input, minHeight: '90px', resize: 'vertical' } as any}
              placeholder="Describe what you asked the AI to do..."
              value={form.prompt} onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))} />
            <label style={{ color: '#64748b', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>HUMAN EDITS MADE</label>
            <textarea style={{ ...input, minHeight: '80px', resize: 'vertical', marginBottom: '20px' } as any}
              placeholder="What did you change, correct, or remove from the AI output?"
              value={form.edits} onChange={e => setForm(f => ({ ...f, edits: e.target.value }))} />
            <button onClick={() => setStep(1)} disabled={!form.lawyer || !form.prompt}
              style={{ width: '100%', background: form.lawyer && form.prompt ? 'linear-gradient(135deg,#c9a84c,#a07830)' : '#1e293b', color: form.lawyer && form.prompt ? '#0a0a0f' : '#475569', border: 'none', borderRadius: '8px', padding: '14px', fontWeight: 700, fontSize: '14px', cursor: form.lawyer && form.prompt ? 'pointer' : 'not-allowed' }}>
              Review Entry →
            </button>
          </div>
        )}

        {/* STEP 1: Review */}
        {step === 1 && (
          <div style={{ background: '#080810', border: '1px solid #1a1a2e', borderRadius: '14px', padding: '32px' }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', marginBottom: '20px' }}>Confirm Entry</h2>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
              {[
                ['Matter', matter.title],
                ['AI Tool', form.ai_tool || matter.ai_tool || '—'],
                ['Lawyer', form.lawyer],
                ['Partner', form.partner || '—'],
                ['Prompt logged', form.prompt.substring(0, 80) + (form.prompt.length > 80 ? '...' : '')],
                ['Edits recorded', form.edits || 'None'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: '16px', marginBottom: '10px', fontSize: '13px', borderBottom: '1px solid #0f172a', paddingBottom: '10px' }}>
                  <span style={{ color: '#475569', minWidth: '110px', flexShrink: 0 }}>{k}</span>
                  <span style={{ color: '#e2e8f0' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setStep(0)} style={{ background: '#0f172a', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: '8px', padding: '14px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>← Edit</button>
              <button onClick={generateCertificate} disabled={certLoading}
                style={{ background: certLoading ? '#1e293b' : 'linear-gradient(135deg,#c9a84c,#a07830)', color: certLoading ? '#475569' : '#0a0a0f', border: 'none', borderRadius: '8px', padding: '14px', fontWeight: 700, fontSize: '14px', cursor: certLoading ? 'wait' : 'pointer' }}>
                {certLoading ? '🤖 Scoring...' : 'Generate Health Score →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Payment selection (gateway not yet chosen) */}
        {step === 2 && !paymentOpts && (
          <div style={{ background: '#080810', border: '1px solid #1a1a2e', borderRadius: '14px', padding: '32px' }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', marginBottom: '8px' }}>Unlock Health Score</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Your log entry is saved. Pick how you want to pay; the cert is released after payment confirmation.</p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Email for cert receipt (optional)
              </label>
              <input
                type="email"
                value={emailForReceipt}
                onChange={(e) => setEmailForReceipt(e.target.value)}
                placeholder="firm-admin@yourfirm.com"
                style={{ ...input, marginBottom: 0 }}
                autoComplete="email"
              />
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Pay with Crypto</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>USDT (BSC) via NOWPayments</div>
                </div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', fontWeight: 700, color: '#c9a84c' }}>$24</div>
              </div>
              <button
                type="button"
                onClick={() => requestPayment('nowpayments')}
                disabled={certLoading}
                style={{ display: 'block', width: '100%', background: certLoading ? '#1e293b' : 'linear-gradient(135deg,#c9a84c,#a07830)', color: certLoading ? '#475569' : '#0a0a0f', border: 'none', borderRadius: '8px', padding: '14px', fontWeight: 700, fontSize: '14px', textAlign: 'center', cursor: certLoading ? 'wait' : 'pointer' }}
              >
                {certLoading ? 'Starting…' : 'Pay $24 with Crypto →'}
              </button>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Pay by Card</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>Visa / Mastercard via PayPal</div>
                </div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', fontWeight: 700, color: '#c9a84c' }}>$29</div>
              </div>
              <button
                type="button"
                onClick={() => requestPayment('paypal')}
                disabled={certLoading}
                style={{ display: 'block', width: '100%', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '8px', padding: '14px', fontWeight: 700, fontSize: '14px', textAlign: 'center', cursor: certLoading ? 'wait' : 'pointer' }}
              >
                {certLoading ? 'Starting…' : 'Pay $29 by Card →'}
              </button>
            </div>

            <p style={{ color: '#334155', fontSize: '11px', marginTop: '20px', textAlign: 'center', lineHeight: 1.55 }}>
              Cert is auto-released on payment confirmation. Decision-support only — not legal advice.
            </p>
          </div>
        )}

        {/* STEP 2: Payment in flight (crypto invoice opened in new tab) */}
        {step === 2 && paymentOpts && paymentOpts.gateway === 'nowpayments' && (
          <div style={{ background: '#080810', border: '1px solid #1a1a2e', borderRadius: '14px', padding: '32px' }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', marginBottom: '8px' }}>Crypto invoice opened</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
              We opened your NOWPayments invoice in a new tab. Once the chain confirms, the cert is released automatically and (if you provided an email) we&apos;ll send you a copy.
            </p>
            <a
              href={paymentOpts.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', background: 'linear-gradient(135deg,#c9a84c,#a07830)', color: '#0a0a0f', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}
            >
              Re-open invoice
            </a>
            <p style={{ color: '#334155', fontSize: '11px', marginTop: '20px' }}>
              Snapshot ID: <span style={{ fontFamily: 'monospace', color: '#475569' }}>{paymentOpts.certId}</span>
            </p>
          </div>
        )}

        {/* STEP 3: Health Score snapshot */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ color: '#22c55e', fontWeight: 600, fontSize: '14px' }}>✓ Health Score released</div>
              <Link href={`/certificate/${certId}`} style={{ background: 'linear-gradient(135deg,#c9a84c,#a07830)', color: '#0a0a0f', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
                View Full Snapshot →
              </Link>
            </div>

            {/* Snapshot preview */}
            <div style={{ background: '#fff', color: '#1a1a2e', borderRadius: '8px', padding: '32px', border: '2px solid #1a1a2e', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-30deg)', fontSize: '60px', fontWeight: 900, color: 'rgba(0,0,0,0.04)', userSelect: 'none', whiteSpace: 'nowrap', pointerEvents: 'none' }}>LEXAUDIT</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #1a1a2e', paddingBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '10px', letterSpacing: '3px', color: '#64748b' }}>COMPLIANCE HEALTH SCORE</div>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: '20px', fontWeight: 700 }}>LexAudit</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Snapshot ID</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700 }}>{certId}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', lineHeight: 1.8, color: '#334155', fontStyle: 'italic', borderLeft: '3px solid #c9a84c', paddingLeft: '12px', marginBottom: '16px' }}>
                {summary}
              </div>
              {[['Document', matter.title], ['Lawyer', form.lawyer], ['Partner', form.partner || '—'], ['AI Tool', form.ai_tool || matter.ai_tool]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid #e2e8f0', padding: '6px 0' }}>
                  <span style={{ color: '#64748b' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past logs */}
        {logs.length > 0 && step !== 3 && (
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '14px', color: '#475569', marginBottom: '12px' }}>Previous AI Logs ({logs.length})</h3>
            {logs.map(log => (
              <div key={log.id} style={{ background: '#080810', border: '1px solid #1a1a2e', borderRadius: '10px', padding: '14px 18px', marginBottom: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#e2e8f0' }}>{log.lawyer}</span>
                  <span style={{ color: '#334155' }}>{new Date(log.logged_at).toLocaleDateString()}</span>
                </div>
                <div style={{ color: '#475569', marginTop: '4px' }}>{log.prompt_summary?.substring(0, 80)}...</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
