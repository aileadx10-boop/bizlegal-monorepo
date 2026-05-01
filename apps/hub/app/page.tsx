'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import {
  Search,
  Shield,
  Scale,
  FileText,
  Zap,
  TrendingUp,
  Activity,
} from 'lucide-react'
import TodaysBrief, { TodaysBriefHeader } from '@/components/home/TodaysBrief'
import { Hero } from '@/app/components/ui-v2/Hero'
import { IntelligenceCard } from '@/app/components/ui-v2/IntelligenceCard'
import { NumberedStep } from '@/app/components/ui-v2/NumberedStep'
import { ScrollPaintHeading } from '@/app/components/ui-v2/ScrollPaintHeading'

// ──────────────────────────────────────────────────────────
// Animated counter (Phase H upgrade — count up once + continuous live tick)
// ──────────────────────────────────────────────────────────
function Counter({
  end,
  suffix = '',
  duration = 2.2,
  liveTick = false,
}: {
  end: number
  suffix?: string
  duration?: number
  /** When true, after initial count-up the counter ticks up by small randomised increments every ~10s. */
  liveTick?: boolean
}) {
  const [count, setCount] = useState(0)
  const [tickedExtra, setTickedExtra] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!inView) return
    if (prefersReducedMotion) {
      setCount(end)
      return
    }
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
  }, [inView, end, duration, prefersReducedMotion])

  useEffect(() => {
    if (!liveTick || !inView || prefersReducedMotion || count !== end) return
    const id = setInterval(() => {
      // Small randomised increment so the metric "feels" live without
      // drifting too far from the canonical value over time.
      setTickedExtra((prev) => prev + Math.floor(Math.random() * 3) + 1)
    }, 10_000 + Math.random() * 5_000)
    return () => clearInterval(id)
  }, [liveTick, inView, prefersReducedMotion, count, end])

  const display = liveTick ? count + tickedExtra : count
  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  )
}

function PulsingDot() {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: 'var(--bl-success)',
        marginLeft: 8,
        verticalAlign: 'middle',
        animation: 'bl-live-pulse 2s ease-in-out infinite',
      }}
    />
  )
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

// ──────────────────────────────────────────────────────────
// 6 intelligence surfaces (TRACR, BRAI, LexAudit, DocAI, Forge, LeadForge)
// ──────────────────────────────────────────────────────────
const SURFACES = [
  {
    id: 'tracr',
    category: 'Chain Intel',
    name: 'TRACR',
    tagline: 'Wallet & Transaction Intelligence',
    description:
      'On-chain intelligence snapshots across 9 chains. Sanctions-list match, counterparty graph, composite signal score. Data — not a verdict.',
    features: ['OFAC / UN / EU sanctions match', 'Counterparty graph', '0–100 composite signal', '9 chains'],
    href: 'https://tracr.bizlegal-ai.com',
    icon: <Search size={20} />,
  },
  {
    id: 'brai',
    category: 'Risk Intel',
    name: 'BRAI',
    tagline: 'Counterparty Risk Intelligence',
    description:
      'Automated counterparty intelligence for crypto-native businesses. We flag exposure paths, OFAC proximity, and unusual activity. Intelligence — not advice.',
    features: ['Counterparty graph traversal', 'OFAC proximity scoring', 'Unusual-activity flags', 'API feed'],
    href: 'https://brai.bizlegal-ai.com',
    icon: <Shield size={20} />,
  },
  {
    id: 'lexaudit',
    category: 'Health Score',
    name: 'LexAudit',
    tagline: 'Compliance Health Score',
    description:
      'Continuous monthly composite score for SOC 2, ISO 27001, GDPR, HIPAA, DPDP — 60 signal checks, no auditors. Intelligence indicator, not a certification.',
    features: ['60-signal composite', 'SOC 2 / ISO / GDPR', 'Buyer-shareable page', 'Monthly refresh'],
    href: 'https://lexaudit.bizlegal-ai.com',
    icon: <Scale size={20} />,
  },
  {
    id: 'docai',
    category: 'Doc Intel',
    name: 'DocAI',
    tagline: 'Contract & Security-Questionnaire Intelligence',
    description:
      'Drafts vendor SQAs, fills RFPs, and scans contracts against your policy. Output is structured signals, not legal opinions.',
    features: ['SQA auto-fill', 'Clause risk scoring', 'Policy-aware redlines', 'Export to PDF / DOCX'],
    href: 'https://docai.bizlegal-ai.com',
    icon: <FileText size={20} />,
  },
  {
    id: 'forge',
    category: 'Compliance Scanner',
    name: 'Forge',
    tagline: 'BOI / CTA Compliance Intelligence',
    description:
      'CTA / FinCEN BOI report generation, web-compliance scanner, regulatory passport. The hands-on operator surface for US LLC owners and small fintechs.',
    features: ['BOI report ($149)', 'Regulatory passport', 'Web-compliance scan', 'Annual refresh'],
    href: 'https://forge.bizlegal-ai.com',
    icon: <Zap size={20} />,
  },
  {
    id: 'leadforge',
    category: 'Intent Intel',
    name: 'LeadForge',
    tagline: 'Buyer-Intent Intelligence',
    description:
      'Surfaces accounts likely to buy compliance services — via job postings, regulator-filing volume, audit RFPs, enforcement signals. Not a CRM, an intent feed.',
    features: ['4 signal sources', 'Composite intent score', 'CSV / API feed', 'Outbound-compliance built-in'],
    href: 'https://leadforge.bizlegal-ai.com',
    icon: <TrendingUp size={20} />,
  },
]

// ──────────────────────────────────────────────────────────
// Live metrics row (kept from prior page)
// ──────────────────────────────────────────────────────────
const METRICS = [
  { label: 'Jurisdictions monitored', value: 50, suffix: '+' },
  { label: 'Enforcement actions tracked', value: 1800, suffix: '+' },
  { label: 'Frameworks ingested', value: 12, suffix: '' },
  { label: 'Refresh cadence', value: 24, suffix: 'h' },
]

// ──────────────────────────────────────────────────────────
// Methodology stages
// ──────────────────────────────────────────────────────────
const METHODOLOGY = [
  {
    n: '01',
    title: 'Ingest signals',
    body: 'Regulator filings, enforcement actions, on-chain transactions, primary-source statutes. 50+ jurisdictions, 1,800+ tracked actions, refreshed every 24 hours.',
  },
  {
    n: '02',
    title: 'Score with deterministic logic',
    body: 'Each signal flows through a transparent scoring function — published in /methodology. No black-box LLM verdicts. The math is auditable.',
  },
  {
    n: '03',
    title: 'Layer narrative with AI',
    body: 'Claude Sonnet 4.6 contextualises the score with specific enforcement examples and a personalised action plan. Every claim is sourced.',
  },
  {
    n: '04',
    title: 'Human review on high stakes',
    body: 'Pro tier outputs and tier-3 reports are reviewed by an LLB+LLM-qualified practitioner before delivery. 24–48h turnaround.',
  },
]

// ══════════════════════════════════════════════════════════
export default function HomePage() {
  return (
    <>
      {/* HERO ─────────────────────────────────────────────── */}
      <Hero
        eyebrow="Intelligence Desk · Live · 50+ jurisdictions monitored"
        shimmer
        headline={
          <>
            Compliance intelligence for{' '}
            <span className="bl-grad-text">digital assets.</span>
          </>
        }
        subheadline={
          <>
            We publish signals. You decide. Six intelligence surfaces — wallet
            forensics, counterparty risk, compliance posture, jurisdiction
            arbitrage, security questionnaires, and buyer intent — reviewed by
            humans before they leave the system.{' '}
            <span style={{ color: 'var(--bl-text-subtle)' }}>
              Bloomberg Terminal for digital-asset regulation.
            </span>
          </>
        }
        primaryCta={{ label: 'Free Jurisdiction Snapshot', href: '/snapshot' }}
        secondaryCta={{ label: "Today's Brief", href: '/posts' }}
        trustBullets={['Practitioner-reviewed', 'Source-cited', 'Cancel anytime']}
      />

      {/* LIVE METRICS ROW ─────────────────────────────────── */}
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'clamp(1.5rem, 1rem + 2vw, 3rem)',
          }}
        >
          {METRICS.map((m, i) => (
            <div key={m.label}>
              <div
                style={{
                  fontFamily: 'var(--bl-font-mono)',
                  fontSize: 'clamp(1.75rem, 1rem + 2vw, 2.5rem)',
                  fontWeight: 700,
                  color: 'var(--bl-text)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  display: 'inline-flex',
                  alignItems: 'baseline',
                }}
              >
                <Counter end={m.value} suffix={m.suffix} liveTick={i !== 3} />
                {i !== 3 && <PulsingDot />}
              </div>
              <div
                className="bl-label"
                style={{
                  marginTop: 8,
                  fontSize: 10,
                  color: 'var(--bl-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {i !== 3 && <Activity size={10} aria-hidden style={{ color: 'var(--bl-success)' }} />}
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TODAY'S BRIEF ────────────────────────────────────── */}
      <section className="bl-section">
        <div className="bl-container">
          <Reveal>
            <TodaysBriefHeader />
          </Reveal>
          <Reveal delay={0.05}>
            <TodaysBrief />
          </Reveal>
        </div>
      </section>

      {/* INTELLIGENCE SURFACES (BENTO GRID) ───────────────── */}
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
            <div style={{ marginBottom: 'clamp(2rem, 1.5rem + 2vw, 4rem)', maxWidth: 720 }}>
              <div className="bl-label" style={{ marginBottom: '1rem' }}>
                — Intelligence Surfaces
              </div>
              <ScrollPaintHeading
                style={{
                  fontFamily: 'var(--bl-font-display)',
                  fontSize: 'var(--bl-text-h2)',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                  color: 'var(--bl-text)',
                  margin: '0 0 1rem',
                }}
              >
                Six surfaces.
                <br />
                <span className="bl-grad-text">One intelligence hub.</span>
              </ScrollPaintHeading>
              <p
                style={{
                  fontSize: 'var(--bl-text-body)',
                  color: 'var(--bl-text-muted)',
                  lineHeight: 1.6,
                  margin: 0,
                  maxWidth: '64ch',
                }}
              >
                Each surface ingests a specific data class — chain, counterparty,
                posture, document, deal, intent — and publishes a structured
                intelligence snapshot. Customer acts on the signals. We don&apos;t
                file, certify, or guarantee outcomes.
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
            {SURFACES.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05}>
                <IntelligenceCard
                  category={s.category}
                  name={s.name}
                  tagline={s.tagline}
                  description={s.description}
                  features={s.features}
                  href={s.href}
                  icon={s.icon}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* METHODOLOGY ──────────────────────────────────────── */}
      <section className="bl-section">
        <div className="bl-container">
          <Reveal>
            <div
              style={{
                textAlign: 'center',
                marginBottom: 'clamp(2.5rem, 1.5rem + 2.5vw, 5rem)',
                maxWidth: 720,
                margin: '0 auto clamp(2.5rem, 1.5rem + 2.5vw, 5rem)',
              }}
            >
              <div className="bl-label" style={{ marginBottom: '1rem' }}>
                — How We Produce Intelligence
              </div>
              <ScrollPaintHeading
                style={{
                  fontFamily: 'var(--bl-font-display)',
                  fontSize: 'var(--bl-text-h2)',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                  color: 'var(--bl-text)',
                  margin: '0 0 1rem',
                }}
              >
                Transparent <span className="bl-grad-text">by design.</span>
              </ScrollPaintHeading>
              <p
                style={{
                  fontSize: 'var(--bl-text-body)',
                  color: 'var(--bl-text-muted)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Every intelligence output flows through a four-stage process. The
                methodology is published so a sophisticated reader can
                re-create the analysis from the same sources.
              </p>
            </div>
          </Reveal>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'clamp(1rem, 0.75rem + 1vw, 1.5rem)',
            }}
          >
            {METHODOLOGY.map((stage, i) => (
              <Reveal key={stage.n} delay={i * 0.06}>
                <NumberedStep index={i + 1} title={stage.title} body={stage.body} />
              </Reveal>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'clamp(2rem, 1.5rem + 1vw, 3rem)' }}>
            <Link href="/methodology" className="bl-btn-ghost">
              Read full methodology
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA ────────────────────────────────────────── */}
      <section
        className="bl-section"
        style={{
          background: 'var(--bl-accent-soft)',
          borderTop: '1px solid var(--bl-divider)',
        }}
      >
        <div
          className="bl-container-narrow"
          style={{ textAlign: 'center' }}
        >
          <div className="bl-label" style={{ marginBottom: '1rem' }}>
            — Free Snapshot
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
            Try the platform <span className="bl-grad-text">on us.</span>
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
            One snapshot, two jurisdictions, zero cards. Get a real
            regulatory exposure brief in your inbox in 5 minutes — or use
            it as the input to a Pro subscription.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/snapshot" className="bl-btn-primary">
              Free Jurisdiction Snapshot
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/pricing" className="bl-btn-ghost">
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
