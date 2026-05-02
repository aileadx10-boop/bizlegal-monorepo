'use client'

import { useState } from 'react'

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const C = {
  bg: '#07090e',
  surface: '#0d1118',
  card: '#111622',
  border: '#1a2035',
  borderActive: '#2d3d6b',
  text: '#e8ecf4',
  muted: '#5a6278',
  dim: '#2e3450',
  red: '#c0392b',
  redLight: '#e74c3c',
  redBg: 'rgba(192,57,43,0.09)',
  redBorder: 'rgba(192,57,43,0.30)',
  amber: '#d4a843',
  amberBg: 'rgba(212,168,67,0.08)',
  amberBorder: 'rgba(212,168,67,0.28)',
  green: '#27ae60',
  greenBg: 'rgba(39,174,96,0.08)',
  orange: '#e67e22',
  mono: '"DM Mono", "Fira Code", ui-monospace, monospace',
  serif: '"Playfair Display", Georgia, serif',
  sans: '"DM Sans", system-ui, -apple-system, sans-serif',
}

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Phase = 'hero' | 'form' | 'scanning' | 'email' | 'results'
type BizType = 'crypto' | 'saas' | 'fintech' | 'ecom'

interface FormState {
  bizType: BizType | null
  jurisdictions: string[]
  revenue: string | null
  hasCustody: boolean | null
  collectsData: boolean | null
}

interface RiskResult {
  score: number
  level: 'Low' | 'Moderate' | 'High' | 'Critical'
  exposureLow: string
  exposureHigh: string
  frameworks: string[]
  nonCompliant: number
  aml: string
  licensing: string
  dataProtection: string
  conduct: string
  consequences: string[]
}

/* ─── Risk Engine ────────────────────────────────────────────────────────── */
function assessRisk(d: FormState): RiskResult {
  let s = 0
  const fw: string[] = []

  // Business type
  const btMap: Record<string, number> = { crypto: 38, fintech: 28, saas: 14, ecom: 10 }
  s += btMap[d.bizType ?? ''] ?? 12

  let nonCompliant = 0
  if (d.jurisdictions.includes('eu'))     { s += 22; fw.push('MiCA', 'GDPR'); nonCompliant++ }
  if (d.jurisdictions.includes('us'))     { s += 16; fw.push('SEC/FINRA'); nonCompliant++ }
  if (d.jurisdictions.includes('uae'))    { s += 10; fw.push('VARA') }
  if (d.jurisdictions.includes('uk'))     { s += 8;  fw.push('FCA') }
  if (d.jurisdictions.includes('global')) { s += 12; nonCompliant++ }
  if (d.jurisdictions.length > 2)         { s += 6 }

  const rvMap: Record<string, number> = {
    '<50k': 0, '50k-500k': 8, '500k-5m': 18, '5m-50m': 28, '50m+': 36,
  }
  s += rvMap[d.revenue ?? ''] ?? 0

  if (d.hasCustody)   { s += 28; fw.push('AML/KYC') }
  if (d.collectsData && d.jurisdictions.includes('eu')) { s += 12 }

  const final = Math.min(s, 100)

  let level: RiskResult['level'] = 'Low'
  let exposureLow = '€0', exposureHigh = '€25,000'
  if (final >= 75)      { level = 'Critical'; exposureLow = '€2,000,000';   exposureHigh = '€20,000,000+' }
  else if (final >= 55) { level = 'High';     exposureLow = '€500,000';     exposureHigh = '€5,000,000'  }
  else if (final >= 30) { level = 'Moderate'; exposureLow = '€50,000';      exposureHigh = '€500,000'    }

  const isCrypto  = d.bizType === 'crypto'
  const isFintech = d.bizType === 'fintech'

  const aml = d.hasCustody ? 'HIGH' : final > 45 ? 'ELEVATED' : 'LOW'
  const licensing = (isCrypto || isFintech) && d.hasCustody ? 'MISSING' : final > 50 ? 'INCOMPLETE' : 'LOW RISK'
  const dataProtection = d.collectsData && d.jurisdictions.includes('eu') ? 'FAIL' : d.collectsData ? 'REVIEW' : 'PASS'
  const conduct = final > 65 ? 'HIGH RISK' : final > 35 ? 'MEDIUM' : 'LOW'

  const consequences: string[] = []
  if (final >= 55)    consequences.push('Bank account shutdown risk')
  if (d.hasCustody)   consequences.push('Criminal liability for unlicensed custody operations')
  if (final >= 40 && d.jurisdictions.includes('eu')) consequences.push('EU regulator enforcement action likely')
  if (final >= 60)    consequences.push('Regulatory enforcement probability: HIGH')
  if (dataProtection === 'FAIL') consequences.push('GDPR fine: up to 4% of global annual revenue')
  if (final >= 30)    consequences.push('Transaction monitoring obligation triggered')

  return {
    score: final, level, exposureLow, exposureHigh,
    frameworks: [...new Set(fw)], nonCompliant,
    aml, licensing, dataProtection, conduct, consequences,
  }
}

/* ─── Shared UI helpers ──────────────────────────────────────────────────── */
function Logo() {
  return (
    <div style={{ fontFamily: C.mono, fontSize: 22, fontWeight: 500, letterSpacing: '0.12em', color: C.text }}>
      TRA<span style={{ color: C.amber }}>C</span>R
    </div>
  )
}

function AlertBanner({ msg }: { msg: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '12px 16px', borderRadius: 8,
      background: C.redBg, border: `1px solid ${C.redBorder}`,
      marginBottom: 10,
    }}>
      <span style={{ color: C.redLight, fontSize: 13, fontFamily: C.mono, lineHeight: 1.5 }}>{msg}</span>
    </div>
  )
}

function ProgressBar({ step, total = 5 }: { step: number; total?: number }) {
  const pct = ((step - 1) / total) * 100
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Risk Analysis in Progress
        </span>
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.amber }}>Step {step} of {total}</span>
      </div>
      <div style={{ height: 3, background: C.border, borderRadius: 2 }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 2,
          background: `linear-gradient(90deg, ${C.amber}, ${C.red})`,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}

/* ─── PHASE 1: HERO ─────────────────────────────────────────────────────── */
function HeroPhase({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: C.sans, position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 700, height: 500,
        background: `radial-gradient(ellipse, rgba(192,57,43,0.08) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%',
        width: 400, height: 400,
        background: `radial-gradient(ellipse, rgba(212,168,67,0.05) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Nav */}
      <nav style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
        <Logo />
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {['MiCA', 'GDPR', 'SEC', 'VARA'].map(f => (
            <span key={f} style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.12em' }}>{f}</span>
          ))}
        </div>
        <button onClick={onStart} style={{
          padding: '9px 22px', background: C.redBg, border: `1px solid ${C.redBorder}`,
          borderRadius: 6, color: C.red, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: C.sans,
        }}>
          Run Risk Scan →
        </button>
      </nav>

      {/* Hero content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '120px 40px 80px', textAlign: 'center', position: 'relative' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32,
          padding: '6px 16px', borderRadius: 100, border: `1px solid ${C.border}`,
          background: C.surface,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, boxShadow: `0 0 8px ${C.red}` }} />
          <span style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            AI-Powered Compliance Intelligence
          </span>
        </div>

        {/* Main headline */}
        <h1 style={{
          fontFamily: C.serif, fontSize: 'clamp(38px, 7vw, 72px)', fontWeight: 700,
          lineHeight: 1.1, marginBottom: 28, color: C.text, letterSpacing: '-0.02em',
        }}>
          You may be operating{' '}
          <span style={{ color: C.red, fontStyle: 'italic' }}>illegally.</span>
        </h1>

        <p style={{
          fontSize: 19, color: C.muted, lineHeight: 1.7, maxWidth: 600, margin: '0 auto 48px',
          fontWeight: 300,
        }}>
          Check your regulatory exposure in{' '}
          <span style={{ color: C.text, fontWeight: 500 }}>60 seconds</span>.
          AI-powered compliance scan across{' '}
          <span style={{ color: C.amber }}>EU (MiCA), GDPR, SEC, VARA</span> frameworks.
        </p>

        {/* CTA */}
        <button onClick={onStart} style={{
          padding: '18px 48px', background: C.red, color: '#fff', border: 'none',
          borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer',
          fontFamily: C.sans, letterSpacing: '0.02em',
          boxShadow: `0 0 40px rgba(192,57,43,0.35)`,
          transition: 'transform 0.15s ease',
        }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Run Risk Scan — Free
        </button>

        <p style={{ marginTop: 16, fontFamily: C.mono, fontSize: 11, color: C.dim, letterSpacing: '0.08em' }}>
          No credit card • 60 second scan • Instant results
        </p>

        <p style={{ marginTop: 12, fontSize: 13, color: C.muted }}>
          Analyzing a wallet?{' '}
          <a href="/analyze" style={{ color: C.amber, textDecoration: 'none', fontWeight: 600 }}>
            Free Wallet Analysis →
          </a>
        </p>

        {/* Trust bar */}
        <div style={{
          marginTop: 64, padding: '20px 32px', borderRadius: 12,
          background: C.surface, border: `1px solid ${C.border}`,
          display: 'flex', gap: 40, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap',
        }}>
          {[
            'Used by founders & crypto operators',
            'SaaS companies in 30+ jurisdictions',
            'Legal & compliance teams',
            'Fintech startups pre-launch',
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.amber }} />
              <span style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{t}</span>
            </div>
          ))}
        </div>

        {/* Framework badges */}
        <div style={{ marginTop: 48, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['EU MiCA', 'GDPR Art. 13', 'AML/6AMLD', 'SEC Reg S-P', 'VARA Dubai', 'FCA UK'].map(f => (
            <span key={f} style={{
              padding: '5px 12px', borderRadius: 4, border: `1px solid ${C.border}`,
              fontFamily: C.mono, fontSize: 11, color: C.dim,
              background: C.surface,
            }}>{f}</span>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
        background: `linear-gradient(transparent, ${C.bg})`,
        pointerEvents: 'none',
      }} />
    </div>
  )
}

/* ─── PHASE 2: MULTI-STEP FORM ──────────────────────────────────────────── */
const STEP_CONFIG = [
  {
    title: 'What type of business do you operate?',
    subtitle: 'Your business model determines which regulatory frameworks apply.',
  },
  {
    title: 'Which jurisdictions do you operate in?',
    subtitle: 'Select all that apply. Each adds distinct compliance obligations.',
  },
  {
    title: 'What is your annual revenue range?',
    subtitle: 'Higher revenue tiers trigger enhanced regulatory scrutiny.',
  },
  {
    title: 'Do you hold custody of customer funds or assets?',
    subtitle: 'Custody operations are subject to strict licensing requirements.',
  },
  {
    title: 'Do you collect, process, or store personal user data?',
    subtitle: 'Data processing activities trigger GDPR and privacy obligations.',
  },
]

const BIZ_OPTIONS: { id: BizType; label: string; desc: string; icon: string }[] = [
  { id: 'crypto', label: 'Crypto / Web3', desc: 'Exchange, wallet, DeFi, NFT, DAO', icon: '◈' },
  { id: 'fintech', label: 'Fintech / Payments', desc: 'PSP, lending, banking-as-a-service', icon: '⬡' },
  { id: 'saas', label: 'SaaS / Software', desc: 'B2B or B2C software platform', icon: '⬕' },
  { id: 'ecom', label: 'E-Commerce', desc: 'Online marketplace or retail', icon: '◻' },
]

const JURISDICTION_OPTIONS = [
  { id: 'eu',     label: 'European Union', sub: 'MiCA, GDPR, AML6' },
  { id: 'us',     label: 'United States',  sub: 'SEC, FinCEN, CFTC' },
  { id: 'uae',    label: 'UAE / DIFC',     sub: 'VARA, DFSA' },
  { id: 'uk',     label: 'United Kingdom', sub: 'FCA, ICO' },
  { id: 'global', label: 'Global / Other', sub: 'FATF, multiple jurisdictions' },
]

const REVENUE_OPTIONS = [
  { id: '<50k',      label: 'Under $50K',    sub: 'Pre-revenue or early stage' },
  { id: '50k-500k',  label: '$50K – $500K',  sub: 'Seed / Series A' },
  { id: '500k-5m',   label: '$500K – $5M',   sub: 'Growth stage' },
  { id: '5m-50m',    label: '$5M – $50M',    sub: 'Scale-up' },
  { id: '50m+',      label: '$50M+',         sub: 'Enterprise / regulated entity' },
]

function FormPhase({
  step, formData, setFormData, alerts, onAdvance,
}: {
  step: number
  formData: FormState
  setFormData: (d: FormState) => void
  alerts: string[]
  onAdvance: () => void
}) {
  const cfg = STEP_CONFIG[step - 1]
  const canAdvance = (() => {
    if (step === 1) return !!formData.bizType
    if (step === 2) return formData.jurisdictions.length > 0
    if (step === 3) return !!formData.revenue
    if (step === 4) return formData.hasCustody !== null
    if (step === 5) return formData.collectsData !== null
    return false
  })()

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: C.sans }}>
      {/* Top nav */}
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
        <Logo />
        <button
          onClick={() => window.location.reload()}
          style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em' }}
        >
          ← Start Over
        </button>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 24px' }}>
        <ProgressBar step={step} />

        {/* Step header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
            Step {step} — Compliance Assessment
          </div>
          <h2 style={{ fontFamily: C.serif, fontSize: 28, fontWeight: 700, color: C.text, marginBottom: 8, lineHeight: 1.25 }}>
            {cfg.title}
          </h2>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{cfg.subtitle}</p>
        </div>

        {/* Risk alerts */}
        {alerts.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            {alerts.slice(-3).map((a, i) => <AlertBanner key={i} msg={a} />)}
          </div>
        )}

        {/* Step 1 — Business type */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
            {BIZ_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => setFormData({ ...formData, bizType: opt.id })}
                style={{
                  padding: '20px 18px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  background: formData.bizType === opt.id ? C.redBg : C.surface,
                  border: `1px solid ${formData.bizType === opt.id ? C.red : C.border}`,
                  transition: 'all 0.15s ease',
                }}>
                <div style={{ fontSize: 22, marginBottom: 10, color: formData.bizType === opt.id ? C.red : C.muted }}>{opt.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: formData.bizType === opt.id ? C.text : C.text, marginBottom: 4 }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Jurisdictions */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            {JURISDICTION_OPTIONS.map(opt => {
              const sel = formData.jurisdictions.includes(opt.id)
              return (
                <button key={opt.id} onClick={() => {
                  const next = sel
                    ? formData.jurisdictions.filter(j => j !== opt.id)
                    : [...formData.jurisdictions, opt.id]
                  setFormData({ ...formData, jurisdictions: next })
                }}
                  style={{
                    padding: '16px 20px', borderRadius: 10, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: sel ? C.redBg : C.surface,
                    border: `1px solid ${sel ? C.red : C.border}`,
                    transition: 'all 0.15s ease',
                  }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: C.muted, fontFamily: C.mono }}>{opt.sub}</div>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: 4, border: `1.5px solid ${sel ? C.red : C.border}`,
                    background: sel ? C.red : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {sel && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Step 3 — Revenue */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            {REVENUE_OPTIONS.map(opt => {
              const sel = formData.revenue === opt.id
              return (
                <button key={opt.id} onClick={() => setFormData({ ...formData, revenue: opt.id })}
                  style={{
                    padding: '14px 20px', borderRadius: 10, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 16,
                    background: sel ? C.redBg : C.surface,
                    border: `1px solid ${sel ? C.red : C.border}`,
                    transition: 'all 0.15s ease',
                  }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${sel ? C.red : C.border}`,
                    background: sel ? C.red : 'transparent', flexShrink: 0,
                  }} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{opt.sub}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Step 4 — Custody */}
        {step === 4 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            {[
              { val: true,  label: 'Yes', sub: 'We hold / control user funds or digital assets', icon: '⚠' },
              { val: false, label: 'No',  sub: 'We do not hold or control user funds', icon: '✓' },
            ].map(opt => {
              const sel = formData.hasCustody === opt.val
              const isDanger = opt.val === true
              return (
                <button key={String(opt.val)} onClick={() => setFormData({ ...formData, hasCustody: opt.val })}
                  style={{
                    padding: '28px 20px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                    background: sel ? (isDanger ? C.redBg : C.greenBg) : C.surface,
                    border: `1px solid ${sel ? (isDanger ? C.red : C.green) : C.border}`,
                    transition: 'all 0.15s ease',
                  }}>
                  <div style={{ fontSize: 28, marginBottom: 12, color: isDanger ? C.red : C.green }}>{opt.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{opt.sub}</div>
                </button>
              )
            })}
          </div>
        )}

        {/* Step 5 — Data collection */}
        {step === 5 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            {[
              { val: true,  label: 'Yes', sub: 'We collect user data (emails, IDs, browsing, KYC)', icon: '⚠' },
              { val: false, label: 'No',  sub: 'We do not collect or process personal user data', icon: '✓' },
            ].map(opt => {
              const sel = formData.collectsData === opt.val
              const isDanger = opt.val === true
              return (
                <button key={String(opt.val)} onClick={() => setFormData({ ...formData, collectsData: opt.val })}
                  style={{
                    padding: '28px 20px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                    background: sel ? (isDanger ? C.redBg : C.greenBg) : C.surface,
                    border: `1px solid ${sel ? (isDanger ? C.red : C.green) : C.border}`,
                    transition: 'all 0.15s ease',
                  }}>
                  <div style={{ fontSize: 28, marginBottom: 12, color: isDanger ? C.red : C.green }}>{opt.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{opt.sub}</div>
                </button>
              )
            })}
          </div>
        )}

        {/* Continue button */}
        <button onClick={onAdvance} disabled={!canAdvance}
          style={{
            width: '100%', padding: '16px', borderRadius: 10, border: 'none',
            background: canAdvance ? C.red : C.surface,
            color: canAdvance ? '#fff' : C.dim,
            fontSize: 15, fontWeight: 700, cursor: canAdvance ? 'pointer' : 'not-allowed',
            fontFamily: C.sans, transition: 'all 0.15s ease',
            boxShadow: canAdvance ? `0 4px 24px rgba(192,57,43,0.3)` : 'none',
          }}>
          {step === 5 ? 'Complete Scan →' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

/* ─── PHASE 3: EMAIL GATE ────────────────────────────────────────────────── */
function EmailGate({
  email, setEmail, emailErr, alerts, onSubmit,
}: {
  email: string
  setEmail: (v: string) => void
  emailErr: string
  alerts: string[]
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: C.sans, display: 'flex', flexDirection: 'column' }}>
      <nav style={{ padding: '20px 40px', borderBottom: `1px solid ${C.border}` }}>
        <Logo />
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 540, width: '100%' }}>

          {/* Scan complete indicator */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
              background: C.redBg, border: `2px solid ${C.red}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}>⚠</div>
            <div style={{ fontFamily: C.mono, fontSize: 11, color: C.red, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
              Scan Complete
            </div>
            <h2 style={{ fontFamily: C.serif, fontSize: 30, fontWeight: 700, color: C.text, marginBottom: 12, lineHeight: 1.2 }}>
              Your scan detected{' '}
              <span style={{ color: C.red }}>{alerts.length} risk factor{alerts.length !== 1 ? 's' : ''}</span>
            </h2>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.65 }}>
              Enter your email to see your compliance report and risk status updates.
            </p>
          </div>

          {/* Risk flags preview */}
          {alerts.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              {alerts.map((a, i) => <AlertBanner key={i} msg={a} />)}
            </div>
          )}

          {/* Email form */}
          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                Your Email Address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{
                  width: '100%', padding: '14px 16px', boxSizing: 'border-box',
                  background: C.surface, border: `1px solid ${emailErr ? C.red : C.border}`,
                  borderRadius: 8, color: C.text, fontSize: 15, fontFamily: C.sans,
                  outline: 'none',
                }}
              />
              {emailErr && (
                <div style={{ marginTop: 6, fontSize: 12, color: C.red, fontFamily: C.mono }}>{emailErr}</div>
              )}
            </div>

            <button type="submit" style={{
              width: '100%', padding: '16px', background: C.red, color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: C.sans,
              boxShadow: `0 4px 24px rgba(192,57,43,0.3)`,
            }}>
              Get My Compliance Report →
            </button>

            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: C.dim, fontFamily: C.mono }}>
              Free partial report + regulatory update alerts
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ─── PHASE 4: RESULTS + PAYWALL ─────────────────────────────────────────── */
const SEVERITY_COLORS: Record<string, string> = {
  HIGH: '#c0392b', ELEVATED: '#e67e22', MISSING: '#c0392b',
  INCOMPLETE: '#e67e22', FAIL: '#c0392b', REVIEW: '#e67e22',
  MEDIUM: '#e67e22', 'LOW RISK': '#27ae60', LOW: '#27ae60',
  PASS: '#27ae60', 'HIGH RISK': '#c0392b',
}

function ResultsPhase({
  risk, onUnlock, checkoutLoading, checkoutErr,
}: {
  risk: RiskResult
  onUnlock: () => void
  checkoutLoading: boolean
  checkoutErr: string
}) {
  const levelColor = { Critical: C.red, High: C.orange, Moderate: '#f39c12', Low: C.green }[risk.level] || C.red
  const levelBg = { Critical: C.redBg, High: 'rgba(230,126,34,0.08)', Moderate: 'rgba(243,156,18,0.08)', Low: C.greenBg }[risk.level] || C.redBg

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: C.sans }}>
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
        <Logo />
        <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.1em' }}>
          COMPLIANCE SCAN REPORT
        </div>
      </nav>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* ── A. Exposure Summary ─────────────────────────────── */}
        <div style={{
          padding: '32px 36px', borderRadius: 14, marginBottom: 24,
          background: levelBg, border: `1px solid ${levelColor}33`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>
                Estimated Legal Exposure
              </div>
              <div style={{ fontFamily: C.serif, fontSize: 34, fontWeight: 700, color: levelColor, lineHeight: 1.1 }}>
                {risk.exposureLow} – {risk.exposureHigh}
              </div>
              {risk.nonCompliant > 0 && (
                <div style={{ marginTop: 10, fontSize: 14, color: C.muted }}>
                  Non-compliant in{' '}
                  <span style={{ color: C.text, fontWeight: 600 }}>{risk.nonCompliant} jurisdiction{risk.nonCompliant !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, letterSpacing: '0.12em', marginBottom: 6 }}>RISK SCORE</div>
              <div style={{ fontFamily: C.mono, fontSize: 52, fontWeight: 500, color: levelColor, lineHeight: 1 }}>
                {risk.score}
              </div>
              <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, letterSpacing: '0.12em' }}>/100</div>
              <div style={{
                marginTop: 8, display: 'inline-block', padding: '4px 14px',
                background: levelColor + '22', border: `1px solid ${levelColor}55`,
                borderRadius: 4, fontFamily: C.mono, fontSize: 11,
                color: levelColor, letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                {risk.level} Risk
              </div>
            </div>
          </div>

          {/* Frameworks */}
          {risk.frameworks.length > 0 && (
            <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {risk.frameworks.map(f => (
                <span key={f} style={{
                  padding: '4px 10px', borderRadius: 4,
                  background: C.redBg, border: `1px solid ${C.redBorder}`,
                  fontFamily: C.mono, fontSize: 11, color: C.red, letterSpacing: '0.08em',
                }}>{f}</span>
              ))}
            </div>
          )}
        </div>

        {/* ── B. Risk Breakdown ───────────────────────────────── */}
        <div style={{ padding: '28px 32px', borderRadius: 14, marginBottom: 24, background: C.surface, border: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: C.mono, fontSize: 12, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 20 }}>
            Risk Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'AML Risk', val: risk.aml },
              { label: 'Licensing', val: risk.licensing },
              { label: 'Data Protection', val: risk.dataProtection },
              { label: 'Market Conduct', val: risk.conduct },
            ].map((row, i) => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 0',
                borderBottom: i < 3 ? `1px solid ${C.border}` : 'none',
              }}>
                <span style={{ fontSize: 14, color: C.text }}>{row.label}</span>
                <span style={{
                  fontFamily: C.mono, fontSize: 11, fontWeight: 600,
                  color: SEVERITY_COLORS[row.val] || C.muted,
                  letterSpacing: '0.1em',
                }}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── C. Consequences ─────────────────────────────────── */}
        {risk.consequences.length > 0 && (
          <div style={{ padding: '28px 32px', borderRadius: 14, marginBottom: 24, background: C.surface, border: `1px solid ${C.border}` }}>
            <h3 style={{ fontFamily: C.mono, fontSize: 12, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 20 }}>
              Potential Consequences
            </h3>
            {risk.consequences.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                <span style={{ color: C.red, flexShrink: 0, marginTop: 1 }}>▸</span>
                <span style={{ fontSize: 14, color: C.muted, lineHeight: 1.55 }}>{c}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── D. Blurred full report + Paywall ───────────────── */}
        <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}` }}>
          {/* Blurred content */}
          <div style={{ padding: '28px 32px', background: C.surface, filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}>
            <div style={{ fontFamily: C.mono, fontSize: 12, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 20 }}>
              Full Legal Exposure Report
            </div>
            {[
              'Specific legislative articles violated in your jurisdiction',
              'Regulatory enforcement timeline & penalty schedule',
              'Remediation roadmap — 30/60/90 day action plan',
              'Licensing requirements & estimated cost to comply',
              'Required legal disclosures and policy templates',
              'Risk mitigation priority matrix by impact',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'center' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: C.text }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to bottom, transparent 0%, ${C.bg}dd 60%, ${C.bg} 100%)`,
          }} />

          {/* Lock CTA */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '36px 40px 40px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🔒</div>
            <h3 style={{ fontFamily: C.serif, fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              Unlock Full Legal Exposure Report
            </h3>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Get the complete compliance analysis with remediation steps, specific regulatory articles, and a 90-day action plan.
            </p>

            {checkoutErr && (
              <div style={{ marginBottom: 16, padding: '10px 16px', background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 8, fontSize: 13, color: C.red, fontFamily: C.mono }}>
                {checkoutErr}
              </div>
            )}

            <button onClick={onUnlock} disabled={checkoutLoading} style={{
              padding: '16px 48px', background: C.red, color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700,
              cursor: checkoutLoading ? 'wait' : 'pointer', fontFamily: C.sans,
              boxShadow: `0 4px 28px rgba(192,57,43,0.4)`,
            }}>
              {checkoutLoading ? 'Creating order…' : 'Unlock Full Report — $29'}
            </button>

            <p style={{ marginTop: 14, fontFamily: C.mono, fontSize: 11, color: C.dim }}>
              Secure payment · PDF delivered to your email · No subscription
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: 40, padding: '20px 24px', borderRadius: 8, background: C.surface, border: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 11, color: C.dim, lineHeight: 1.7, fontFamily: C.mono }}>
            <strong style={{ color: C.muted }}>DISCLAIMER:</strong> This scan provides indicative risk signals based on your inputs. It does not constitute legal advice and should not be relied upon as a definitive compliance assessment. Consult qualified legal counsel before taking regulatory action.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Scanning animation ─────────────────────────────────────────────────── */
function ScanningOverlay() {
  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: C.mono,
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:0.4 } 50% { opacity:1 } }
      `}</style>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        border: `2px solid ${C.red}`, borderTopColor: 'transparent',
        animation: 'spin 1s linear infinite', marginBottom: 24,
      }} />
      <div style={{ color: C.red, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8 }}>
        Analyzing Regulatory Exposure
      </div>
      {['Checking MiCA licensing gaps…', 'Cross-referencing GDPR obligations…', 'Calculating AML risk score…'].map((msg, i) => (
        <div key={i} style={{
          fontSize: 12, color: C.muted, marginBottom: 4,
          animation: `pulse 1.5s ${i * 0.4}s ease-in-out infinite`,
        }}>{msg}</div>
      ))}
    </div>
  )
}

/* ─── Root component ─────────────────────────────────────────────────────── */
export default function ScanPage() {
  const [phase, setPhase] = useState<Phase>('hero')
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormState>({
    bizType: null, jurisdictions: [], revenue: null, hasCustody: null, collectsData: null,
  })
  const [alerts, setAlerts] = useState<string[]>([])
  const [email, setEmail] = useState('')
  const [emailErr, setEmailErr] = useState('')
  const [risk, setRisk] = useState<RiskResult | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutErr, setCheckoutErr] = useState('')

  function addAlert(msg: string) {
    setAlerts(prev => {
      if (prev.includes(msg)) return prev
      return [...prev, msg]
    })
  }

  function advanceStep() {
    // Inject dynamic risk alerts
    if (step === 1 && formData.bizType === 'crypto')    addAlert('⚠ Potential MiCA licensing gap detected')
    if (step === 1 && formData.bizType === 'fintech')   addAlert('⚠ DORA & PSD2 compliance gaps identified')
    if (step === 2 && formData.jurisdictions.includes('eu')) addAlert('⚠ GDPR & MiCA compliance requirements triggered')
    if (step === 2 && formData.jurisdictions.includes('us')) addAlert('⚠ SEC Regulation S-P exposure detected')
    if (step === 3 && (formData.revenue === '5m-50m' || formData.revenue === '50m+')) addAlert('⚠ High AML exposure risk — reporting thresholds exceeded')
    if (step === 3 && formData.revenue === '500k-5m')   addAlert('⚠ Enhanced due diligence requirements apply')
    if (step === 4 && formData.hasCustody === true)     addAlert('⚠ CRITICAL: Unlicensed custody operations detected')
    if (step === 5 && formData.collectsData && formData.jurisdictions.includes('eu')) addAlert('⚠ GDPR Article 13 disclosure violation likely')

    if (step === 5) {
      setPhase('scanning')
      setTimeout(() => setPhase('email'), 2400)
    } else {
      setStep(s => s + 1)
    }
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailErr('Enter a valid email to see your results.')
      return
    }
    setEmailErr('')
    setRisk(assessRisk(formData))
    setPhase('results')
  }

  async function handleUnlock() {
    if (!email) return
    setCheckoutLoading(true)
    setCheckoutErr('')
    try {
      const res = await fetch('/api/scan/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          wallet_address: `REG-${Date.now()}`,
          network: 'regulatory',
          tier: 'regulatory',
          case_context: JSON.stringify({
            bizType: formData.bizType,
            jurisdictions: formData.jurisdictions,
            revenue: formData.revenue,
            hasCustody: formData.hasCustody,
            collectsData: formData.collectsData,
          }),
        }),
      })
      const data = await res.json()
      if (data.invoice_url) window.location.href = data.invoice_url
      else setCheckoutErr(data.error || 'Checkout failed. Please try again.')
    } catch {
      setCheckoutErr('Network error. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (phase === 'hero')    return <HeroPhase onStart={() => setPhase('form')} />
  if (phase === 'scanning') return <ScanningOverlay />
  if (phase === 'form')    return (
    <FormPhase
      step={step} formData={formData} setFormData={setFormData}
      alerts={alerts} onAdvance={advanceStep}
    />
  )
  if (phase === 'email')   return (
    <EmailGate
      email={email} setEmail={setEmail} emailErr={emailErr}
      alerts={alerts} onSubmit={handleEmailSubmit}
    />
  )
  if (phase === 'results' && risk) return (
    <ResultsPhase
      risk={risk} onUnlock={handleUnlock}
      checkoutLoading={checkoutLoading} checkoutErr={checkoutErr}
    />
  )

  return null
}
