// Forge homepage — Phase D8 rebuild with Direction C v2 components.

'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Zap, FileCheck, Globe, ShieldCheck, Award } from 'lucide-react'
import { Hero } from './components/ui-v2/Hero'
import { IntelligenceCard } from './components/ui-v2/IntelligenceCard'

function Counter({ end, suffix = '', duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const frame = (now: number) => {
      const elapsed = (now - start) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(frame)
      else setCount(end)
    }
    requestAnimationFrame(frame)
  }, [inView, end, duration])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

const PRODUCTS = [
  {
    id: 'boi',
    category: 'BOI / CTA',
    name: 'BOI Report Kit',
    tagline: 'FinCEN BOI / CTA filing — $149',
    description:
      'CTA Beneficial Ownership Information report generated from your LLC details + FinCEN-ready PDF. Filing-ready in 5 minutes. Reduce $500/day non-filing exposure.',
    features: [
      'FinCEN-ready BOIR PDF',
      'Beneficial owner walkthrough',
      'Annual refresh reminder',
      'Practitioner-reviewed template',
    ],
    href: '/boi',
    icon: <FileCheck size={20} />,
  },
  {
    id: 'passport',
    category: 'Cross-border',
    name: 'Regulatory Passport',
    tagline: 'Multi-framework operating brief',
    description:
      'For founders expanding across US / EU / UK / UAE / SG. One brief, 8 frameworks, scored against your business model. Refresh quarterly or on-demand.',
    features: [
      '8 regulatory frameworks',
      'GDPR / CIPA / FCA / VARA / MAS',
      'Per-jurisdiction risk score',
      'Quarterly refresh option',
    ],
    href: '/passport',
    icon: <Globe size={20} />,
  },
  {
    id: 'audit',
    category: 'Web Compliance',
    name: 'Web Compliance Scanner',
    tagline: 'Crawl + score your public surface',
    description:
      'Automated audit of cookie banners, privacy policy, terms, accessibility, CIPA disclosures, and dark patterns. Output: prioritised remediation list.',
    features: [
      'Cookie / GDPR audit',
      'Privacy policy gap scan',
      'CIPA disclosure check',
      'Accessibility (WCAG AA)',
    ],
    href: '/audit',
    icon: <ShieldCheck size={20} />,
  },
  {
    id: 'gap',
    category: 'Gap monitor',
    name: 'Gap Monitor',
    tagline: 'Continuous regulatory gap watching',
    description:
      'Subscribes you to a feed of regulator changes that affect your operating profile. We monitor; you act. No daily noise — only material updates.',
    features: [
      'Custom jurisdiction watch',
      'Material-change alerts',
      'Monthly digest',
      'Source-cited every claim',
    ],
    href: '/gap',
    icon: <Zap size={20} />,
  },
]

const METRICS = [
  { value: 8, suffix: '', label: 'Frameworks covered' },
  { value: 500, suffix: '/day', label: 'BOI penalty avoided', dollar: true },
  { value: 5, suffix: ' min', label: 'BOI report turnaround' },
  { value: 2026, suffix: '', label: 'CTA reporting year' },
]

export default function ForgeHomepage() {
  return (
    <>
      <Hero
        eyebrow="Forge · Compliance scanner for US LLC owners + cross-border founders"
        headline={
          <>
            File the BOI report. Pass the audit.{' '}
            <span className="bl-grad-text">In an afternoon.</span>
          </>
        }
        subheadline={
          <>
            Forge generates your FinCEN BOI report, scans your website for
            CIPA / GDPR gaps, and tracks regulator changes across 8 frameworks
            — all from one operator workspace.{' '}
            <span style={{ color: 'var(--bl-text-subtle)' }}>
              Built for the founder who would rather ship product than read 73 pages of
              FinCEN guidance.
            </span>
          </>
        }
        primaryCta={{ label: 'File BOI Report — $149', href: '/boi' }}
        secondaryCta={{ label: 'See pricing', href: '/pricing' }}
      />

      {/* Live metrics */}
      <section
        style={{
          background: 'var(--bl-bg-low)',
          borderTop: '1px solid var(--bl-divider)',
          borderBottom: '1px solid var(--bl-divider)',
          padding: 'clamp(2rem, 1.5rem + 1vw, 3rem) 0',
        }}
      >
        <div
          className="bl-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'clamp(1.5rem, 1rem + 2vw, 3rem)',
          }}
        >
          {METRICS.map((m) => (
            <div key={m.label}>
              <div
                style={{
                  fontFamily: 'var(--bl-font-mono)',
                  fontSize: 'clamp(1.75rem, 1rem + 2vw, 2.5rem)',
                  fontWeight: 700,
                  color: 'var(--bl-text)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {m.dollar && '$'}<Counter end={m.value} />{m.suffix}
              </div>
              <div
                className="bl-label"
                style={{
                  marginTop: 8,
                  fontSize: 10,
                  color: 'var(--bl-text-muted)',
                }}
              >
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products grid */}
      <section className="bl-section">
        <div className="bl-container">
          <Reveal>
            <div style={{ marginBottom: 'clamp(2rem, 1.5rem + 2vw, 4rem)', maxWidth: 720 }}>
              <div className="bl-label" style={{ marginBottom: '1rem' }}>
                — Operator products
              </div>
              <h2
                style={{
                  fontFamily: 'var(--bl-font-display)',
                  fontSize: 'var(--bl-text-h2)',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                  color: 'var(--bl-text)',
                  margin: 0,
                  marginBottom: '1rem',
                }}
              >
                Four products.
                <br />
                <span className="bl-grad-text">One operator workspace.</span>
              </h2>
              <p
                style={{
                  fontSize: 'var(--bl-text-body)',
                  color: 'var(--bl-text-muted)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Each product solves one filing or scan in one sitting. Buy the
                BOI Kit one-time, the Passport on subscription, the Audit per
                scan, and the Gap Monitor as ongoing intelligence.
              </p>
            </div>
          </Reveal>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 'clamp(1rem, 0.75rem + 1vw, 1.5rem)',
            }}
          >
            {PRODUCTS.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <IntelligenceCard
                  category={p.category}
                  name={p.name}
                  tagline={p.tagline}
                  description={p.description}
                  features={p.features}
                  href={p.href}
                  icon={p.icon}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section
        className="bl-section"
        style={{
          background: 'var(--bl-bg-low)',
          borderTop: '1px solid var(--bl-divider)',
          borderBottom: '1px solid var(--bl-divider)',
        }}
      >
        <div className="bl-container">
          <Reveal>
            <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
              <Award size={32} style={{ color: 'var(--bl-accent)', margin: '0 auto 1rem' }} />
              <h2
                style={{
                  fontFamily: 'var(--bl-font-display)',
                  fontSize: 'var(--bl-text-h2)',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: 'var(--bl-text)',
                  margin: 0,
                  marginBottom: '1rem',
                }}
              >
                Practitioner-reviewed.{' '}
                <span className="bl-grad-text">Always.</span>
              </h2>
              <p
                style={{
                  fontSize: 'var(--bl-text-body)',
                  color: 'var(--bl-text-muted)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Every Forge output template is reviewed by a qualified
                commercial attorney before publication. AI generates the
                content from your inputs; the framework is human-vetted.
                Intelligence — not legal advice.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="bl-section"
        style={{ background: 'var(--bl-accent-soft)' }}
      >
        <div className="bl-container-narrow" style={{ textAlign: 'center' }}>
          <div className="bl-label" style={{ marginBottom: '1rem' }}>
            — Most popular
          </div>
          <h2
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h2)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--bl-text)',
              margin: 0,
              marginBottom: '1rem',
            }}
          >
            File the BOI report{' '}
            <span className="bl-grad-text">in 5 minutes.</span>
          </h2>
          <p
            style={{
              fontSize: 'var(--bl-text-body)',
              color: 'var(--bl-text-muted)',
              lineHeight: 1.6,
              margin: 0,
              marginBottom: '2rem',
            }}
          >
            $149 one-time. Practitioner-reviewed FinCEN BOIR template.
            Generated PDF, ready to file. 14-day money back.
          </p>
          <Link href="/boi" className="bl-btn-primary">
            File BOI Report — $149
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  )
}
