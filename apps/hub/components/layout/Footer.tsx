'use client'
import Link from 'next/link'
import { useState } from 'react'
import { SOCIAL_DISPLAY } from '@/lib/social'

const PLATFORM = [
  { label: 'Risk Engine', href: '/risk-engine' },
  { label: 'Jurisdiction Arbitrage', href: '/jurisdictions' },
  { label: 'Real-Estate Intelligence', href: '/realestate' },
  { label: 'Intelligence Feed', href: '/posts' },
  { label: 'Pricing', href: '/pricing' },
]

const PRODUCTS = [
  { label: 'TRACR — Wallet & Tx Intelligence', href: 'https://tracr.bizlegal-ai.com' },
  { label: 'BRAI — Counterparty Risk Intelligence', href: 'https://brai.bizlegal-ai.com' },
  { label: 'LexAudit — Compliance Health Score', href: 'https://lexaudit.bizlegal-ai.com' },
  { label: 'DocAI — Contract & SQA Intelligence', href: 'https://docai.bizlegal-ai.com' },
  { label: 'Forge — Compliance Scanner', href: 'https://forge.bizlegal-ai.com' },
  { label: 'LeadForge — Legal Lead Intelligence', href: 'https://leadforge.bizlegal-ai.com' },
]

const LEGAL = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Refund Policy', href: '/refund' },
  { label: 'Acceptable Use', href: '/acceptable-use' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'Trust Center', href: '/trust' },
]

const COMPANY = [
  { label: 'About', href: '/about' },
  { label: 'Newsletter', href: '/newsletter' },
  { label: 'Trust Center', href: '/trust' },
  { label: 'Contact', href: '/contact' },
]

const linkBase: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--muted)',
  textDecoration: 'none',
  transition: 'color 0.15s',
  fontFamily: 'var(--font-body)',
}

function FooterLink({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith('https://')
  const props = {
    style: linkBase,
    onMouseEnter: (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.color = 'var(--on-surface-var)' },
    onMouseLeave: (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)' },
  }
  if (isExternal) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{label}</a>
  }
  return <Link href={href} {...props}>{label}</Link>
}

function ColHead({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 9,
      fontWeight: 500, letterSpacing: '0.18em',
      textTransform: 'uppercase', color: 'var(--gold)',
      marginBottom: 20,
    }}>
      {label}
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="no-print" style={{ borderTop: '1px solid var(--outline-var)' }}>

      {/* ── CTA Band ── */}
      <section style={{
        padding: '96px 32px',
        textAlign: 'center',
        background: 'var(--bg-low)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient orbs */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '20%', left: '15%',
            width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(165,180,252,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '20%', right: '15%',
            width: 260, height: 260, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
        </div>

        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--gold)', marginBottom: 28,
          }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
            Global Regulatory Intelligence
          </div>

          <h2 className="quantum-h2" style={{ marginBottom: 20, color: 'var(--white)' }}>
            Let's Build Something<br />
            <em className="gradient-text-gold" style={{ fontStyle: 'italic' }}>Compliant.</em>
          </h2>

          <p style={{ fontSize: 16, color: 'var(--on-surface-var)', marginBottom: 40, lineHeight: 1.7 }}>
            Regulatory intelligence that moves at the speed of innovation.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/risk-engine"
              className="btn-quantum"
              style={{ '--product-accent': '#a5b4fc', '--product-glow': 'rgba(165,180,252,0.15)' } as React.CSSProperties}
            >
              Analyze Risk
            </Link>
            <Link href="/pricing" className="btn-ghost-quantum">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Main Footer Grid ── */}
      <section style={{ padding: '64px 32px 48px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 40,
            marginBottom: 56,
          }}>
            {/* Brand col */}
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ marginBottom: 16 }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--white)', letterSpacing: '-0.02em' }}>BizLegal</span>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block', margin: '0 1px 3px' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--white)', letterSpacing: '-0.02em' }}>AI</span>
                </Link>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 24, maxWidth: 220 }}>
                Precise. Institutional. Unwavering.<br />Quantum-tier regulatory intelligence.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {SOCIAL_DISPLAY.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    style={{ fontSize: 12, color: 'var(--dim)', transition: 'color 0.2s', textDecoration: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--gold)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--dim)' }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Platform col */}
            <div>
              <ColHead label="Platform" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PLATFORM.map(link => <FooterLink key={link.label} {...link} />)}
              </div>
            </div>

            {/* Legal col */}
            <div>
              <ColHead label="Legal" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {LEGAL.map(link => <FooterLink key={link.label} {...link} />)}
              </div>
            </div>

            {/* Company col */}
            <div>
              <ColHead label="Company" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {COMPANY.map(link => <FooterLink key={link.label} {...link} />)}
              </div>
            </div>
          </div>

          {/* Newsletter signup */}
          <div style={{
            borderTop: '1px solid var(--outline-var)',
            paddingTop: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Newsletter
            </span>
            <FooterNewsletterForm />
          </div>

          {/* Legal entity line */}
          <div style={{
            borderTop: '1px solid var(--outline-var)',
            paddingTop: 28,
            paddingBottom: 16,
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--on-surface-var)',
            lineHeight: 1.7,
            maxWidth: 880,
          }}>
            BizLegal-AI · operated by <strong style={{ color: 'var(--on-surface)' }}>DOR INNOVATIONS</strong> ·
            worldwide remote · <a href="mailto:team@bizlegal-ai.com" style={{ color: 'var(--accent, var(--gold))' }}>team@bizlegal-ai.com</a>.
            We publish regulatory intelligence — not legal advice — and we do not file, certify, or guarantee
            outcomes. UAE FZE registration in progress; this notice will be updated when filing completes.
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid var(--outline-var)',
            paddingTop: 28,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.06em' }}>
              © {new Date().getFullYear()} BizLegal AI. All rights reserved.
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--dim)', letterSpacing: '0.06em' }}>
              Not legal advice · Human-reviewed regulatory intelligence
            </span>
          </div>
        </div>
      </section>
    </footer>
  )
}

function FooterNewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flex: '1 1 300px' }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        style={{
          flex: 1,
          background: 'var(--bg-mid)',
          border: '1px solid var(--outline-var)',
          borderRadius: 6,
          padding: '8px 14px',
          fontSize: 13,
          color: 'var(--on-surface)',
          fontFamily: 'var(--font-body)',
          outline: 'none',
          minWidth: 200,
        }}
      />
      <button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        style={{
          padding: '8px 18px',
          background: status === 'success' ? 'var(--accent)' : 'var(--gold)',
          color: '#08080f',
          border: 'none',
          borderRadius: 6,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: status === 'loading' ? 'wait' : 'pointer',
          transition: 'background 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        {status === 'loading' ? '...' : status === 'success' ? 'Subscribed' : 'Subscribe'}
      </button>
    </form>
  )
}
