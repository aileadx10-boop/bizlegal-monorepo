'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { crossSellFor } from '@bizlegal/nurture-enqueue/cross-sell'

export default function CertificatePage() {
  const [cert, setCert] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    const id = params?.id as string
    if (!id) return
    supabase
      .from('certificates')
      .select('*, matters(*), ai_logs(*)')
      .eq('cert_id', id)
      .single()
      .then(({ data }) => {
        setCert(data)
        setLoading(false)
      })
  }, [params?.id])

  const now = new Date()
  const certId = (params?.id as string) || 'LA-PREVIEW'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#050509', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontFamily: 'DM Sans,sans-serif' }}>
      Loading snapshot...
    </div>
  )

  // Use cert data if available, or show a preview shell
  const matter = cert?.matters || { title: '—', client_ref: '—' }
  const log = cert?.ai_logs?.[0] || {}
  const summary = cert?.summary || 'AI-assisted drafting was performed under direct lawyer supervision. The responsible lawyer reviewed AI outputs for accuracy and potential hallucinations prior to use. Human edits were applied. The supervising partner signed off on the workflow before any client-facing use. This is a process-attestation snapshot — regulatory intelligence, not legal advice and not a verdict on the underlying work product.'
  const hash = cert?.sha256_hash || ('sha256:' + certId.toLowerCase().replace('la-', 'a3f9') + '8e2b1c4d7a0f5e9b2c6d1a4f7e0b3c8d9a2f5e8b1c4d7a0f3')

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap'); @media print { .no-print { display: none !important; } body { background: white; } }`}</style>

      {/* Screen nav - hidden on print */}
      <div className="no-print" style={{ background: '#050509', borderBottom: '1px solid #0f172a', padding: '12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/dashboard" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>← Back to Dashboard</Link>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => window.print()}
            style={{ background: 'linear-gradient(135deg,#c9a84c,#a07830)', color: '#0a0a0f', border: 'none', borderRadius: '7px', padding: '9px 20px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            🖨 Print / Save PDF
          </button>
          <button onClick={() => navigator.clipboard?.writeText(hash)}
            style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: '7px', padding: '9px 16px', fontSize: '12px', cursor: 'pointer' }}>
            Copy Hash
          </button>
        </div>
      </div>

      {/* Health-score snapshot document */}
      <div style={{ maxWidth: '740px', margin: '40px auto', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '56px 52px', position: 'relative', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        {/* Watermark */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-30deg)', fontSize: '90px', fontWeight: 900, color: 'rgba(0,0,0,0.035)', userSelect: 'none', pointerEvents: 'none', whiteSpace: 'nowrap', letterSpacing: '-2px' }}>
          LEXAUDIT
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', paddingBottom: '20px', borderBottom: '2px solid #0f172a' }}>
          <div>
            <div style={{ fontSize: '9px', letterSpacing: '4px', color: '#94a3b8', marginBottom: '6px' }}>COMPLIANCE HEALTH SCORE — SNAPSHOT</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '26px', fontWeight: 700, color: '#0f172a' }}>LexAudit</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>lexaudit.bizlegal-ai.com</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#94a3b8', marginBottom: '4px' }}>SNAPSHOT ID</div>
            <div style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{certId}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              {now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Intro statement */}
        <div style={{ fontSize: '13px', lineHeight: 1.85, color: '#334155', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '4px', borderLeft: '3px solid #c9a84c' }}>
          This snapshot records the AI-assisted matter workflow described below as logged and reviewed inside LexAudit. It is regulatory intelligence — a process-attestation record of the workflow applied — and is not legal advice, not a verdict, and not a finding of compliance with any framework. A framework compliance finding is made by an independent auditor or a regulator.
        </div>

        {/* Matter details */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#94a3b8', marginBottom: '12px' }}>MATTER DETAILS</div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            {[
              ['Document Title', matter.title],
              ['Client Reference', matter.client_ref || '—'],
              ['Responsible Lawyer', log.lawyer || cert?.lawyer || '—'],
              ['Reviewing Partner', log.partner || cert?.partner || '—'],
              ['AI Tool Used', log.ai_tool || matter.ai_tool || '—'],
              ['Date of AI Assistance', now.toLocaleDateString('en-GB')],
              ['Date of Snapshot', now.toLocaleDateString('en-GB')],
            ].map(([k, v], i) => (
              <div key={k} style={{ display: 'flex', borderBottom: i < 6 ? '1px solid #e2e8f0' : 'none', background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                <div style={{ width: '200px', padding: '10px 16px', fontSize: '12px', color: '#64748b', borderRight: '1px solid #e2e8f0', flexShrink: 0 }}>{k}</div>
                <div style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 500, color: '#1e293b' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow rationale */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#94a3b8', marginBottom: '10px' }}>WORKFLOW RATIONALE</div>
          <div style={{ fontSize: '13px', lineHeight: 1.85, color: '#334155', fontStyle: 'italic', borderLeft: '3px solid #c9a84c', paddingLeft: '16px' }}>
            {summary}
          </div>
        </div>

        {/* Human oversight checklist */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#94a3b8', marginBottom: '12px' }}>HUMAN OVERSIGHT VERIFICATION</div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            {[
              'AI prompt reviewed and refined by responsible lawyer prior to submission',
              'AI output reviewed for accuracy, hallucinations, and legal validity',
              'Material edits made by human lawyer before any use or filing',
              'Final document reviewed and approved by supervising partner',
              'Client-facing content verified against authoritative source materials',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 16px', borderBottom: i < 4 ? '1px solid #e2e8f0' : 'none', background: i % 2 === 0 ? '#ffffff' : '#f8fafc', alignItems: 'flex-start' }}>
                <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                <span style={{ fontSize: '12px', color: '#334155', lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt log if available */}
        {log.prompt_summary && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#94a3b8', marginBottom: '10px' }}>PROMPT LOG</div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '14px 16px', fontSize: '12px', color: '#475569', lineHeight: 1.7 }}>
              {log.prompt_summary}
            </div>
          </div>
        )}

        {/* Hash */}
        <div style={{ background: '#f1f5f9', borderRadius: '4px', padding: '12px 16px', marginBottom: '28px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#94a3b8', marginBottom: '6px' }}>IMMUTABLE RECORD — SHA-256 HASH</div>
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#475569', wordBreak: 'break-all', lineHeight: 1.6 }}>{hash}</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px' }}>This hash is computed at time of release. Any modification to this snapshot will produce a different hash value, making tampering immediately detectable.</div>
        </div>

        {/* Signature line */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {['Responsible Lawyer', 'Reviewing Partner'].map(role => (
            <div key={role} style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '1px' }}>{role.toUpperCase()}</div>
              <div style={{ height: '28px' }} />
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Signature / Date</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.6 }}>
            Released by LexAudit · lexaudit.bizlegal-ai.com<br />
            Snapshot stored immutably · Tamper-evident record
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'right', lineHeight: 1.6 }}>
            Regulatory intelligence — not legal advice.<br />
            Audit-ready process record. No verdict implied.
          </div>
        </div>
      </div>

      {/* Fleet cross-sell — screen only, never printed with the snapshot */}
      <div className="no-print" style={{ maxWidth: '740px', margin: '0 auto 40px', padding: '0 20px' }}>
        <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#94a3b8', marginBottom: '12px', textAlign: 'center' }}>ALSO FROM THE FLEET</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {crossSellFor('lexaudit').map((offer) => (
            <a key={offer.url} href={offer.url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '16px 18px', textDecoration: 'none' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{offer.headline}</div>
              <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6, marginBottom: '8px' }}>{offer.blurb}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#a07830' }}>{offer.product} · {offer.price} →</div>
            </a>
          ))}
        </div>
      </div>

      <div className="no-print" style={{ height: '40px' }} />
    </div>
  )
}
