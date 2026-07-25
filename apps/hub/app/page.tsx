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
      {/* JSON-LD ─────────────────────────────────────────── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'SoftwareApplication',
        name: 'BizLegal AI Platform', applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Regulatory Compliance Software', operatingSystem: 'Web',
        url: 'https://bizlegal-ai.com',
        description: 'Six intelligence surfaces for compliance teams: Tracr (wallet forensics), BRAI (counterparty risk), LexAudit (compliance health), DocAI (contract analysis), Forge (BOI/CTA), LeadForge (buyer intent).',
        offers: { '@type': 'AggregateOffer', priceCurrency: 'USD', lowPrice: '0', highPrice: '997', offerCount: '6' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        /* GSC fix 2026-07-10: added availability, sku, brand, image, seller
           to every Product/Offer. aggregateRating + review are INTENTIONALLY
           OMITTED — schema.org policy + Google guidelines forbid fabricated
           reviews/ratings. Re-add these once real customer testimonials
           exist (see decisions/REVIEWS-CHECKLIST-2026-07-10.md). */
        '@context': 'https://schema.org', '@type': 'ItemList', name: 'BizLegal AI Product Suite',
        itemListElement: [
          { '@type': 'ListItem', position: 1, item: {
            '@type': 'Product',
            name: 'Tracr — Wallet & Transaction Intelligence',
            description: 'AI-powered compliance scan across EU (MiCA), GDPR, SEC, VARA frameworks. Crypto-wallet forensics, counterparty risk scoring, and transaction intelligence for digital-asset compliance teams.',
            url: 'https://tracr.bizlegal-ai.com',
            sku: 'tracr-wallet-scan',
            brand: { '@type': 'Brand', name: 'BizLegal AI' },
            image: 'https://bizlegal-ai.com/og/tracr.png',
            offers: {
              '@type': 'Offer',
              price: '149',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              availabilityStarts: '2024-01-01T00:00:00Z',
              priceValidUntil: '2027-12-31T23:59:59Z',
              url: 'https://bizlegal-ai.com/checkout?product=tracr_wallet_scan',
              seller: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
            },
          } },
          { '@type': 'ListItem', position: 2, item: {
            '@type': 'Product',
            name: 'BRAI — Counterparty Risk Intelligence',
            description: 'Counterparty risk intelligence for digital-asset ventures. Human-reviewed regulatory posture reports across 50+ jurisdictions, refreshed daily from primary regulator sources.',
            url: 'https://brai.bizlegal-ai.com',
            sku: 'brai-intelligence-report',
            brand: { '@type': 'Brand', name: 'BizLegal AI' },
            image: 'https://bizlegal-ai.com/og/brai.png',
            offers: {
              '@type': 'Offer',
              price: '49',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              availabilityStarts: '2024-01-01T00:00:00Z',
              priceValidUntil: '2027-12-31T23:59:59Z',
              url: 'https://bizlegal-ai.com/checkout?product=brai_intelligence_report',
              seller: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
            },
          } },
          { '@type': 'ListItem', position: 3, item: {
            '@type': 'Product',
            name: 'LexAudit — Compliance Health Score',
            description: 'Continuous 60-signal Compliance Health Score for legal-operations and in-house compliance teams. Deterministic, reproducible, SOC 2-adjacent posture monitoring on 364 days of the year.',
            url: 'https://lexaudit.bizlegal-ai.com',
            sku: 'lexaudit-monitor',
            brand: { '@type': 'Brand', name: 'BizLegal AI' },
            image: 'https://bizlegal-ai.com/og/lexaudit.png',
            offers: {
              '@type': 'Offer',
              price: '99',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              availabilityStarts: '2024-01-01T00:00:00Z',
              priceValidUntil: '2027-12-31T23:59:59Z',
              url: 'https://bizlegal-ai.com/checkout?product=lexaudit_monitor',
              seller: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
            },
          } },
          { '@type': 'ListItem', position: 4, item: {
            '@type': 'Product',
            name: 'DocAI — Contract & Security-Questionnaire Intelligence',
            description: 'Policy-aware AI that redlines contracts and security questionnaires against YOUR standards, not generic best-practice. Version-controlled, audit-ready clause library.',
            url: 'https://docai.bizlegal-ai.com',
            sku: 'docai-sqa-subscription',
            brand: { '@type': 'Brand', name: 'BizLegal AI' },
            image: 'https://bizlegal-ai.com/og/docai.png',
            offers: [
              { '@type': 'Offer', name: 'Starter', price: '29', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: 'https://docai.bizlegal-ai.com/pricing' },
              { '@type': 'Offer', name: 'Team', price: '69', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: 'https://docai.bizlegal-ai.com/pricing' },
              { '@type': 'Offer', name: 'Firm', price: '99', priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: 'https://docai.bizlegal-ai.com/pricing' },
            ],
            seller: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
          } },
          { '@type': 'ListItem', position: 5, item: {
            '@type': 'Product',
            name: 'Forge — BOI / CTA Compliance Intelligence',
            description: 'Multi-framework regulatory compliance briefs for US businesses and Israeli tech companies. BOI (FinCEN), Corporate Transparency Act, and jurisdiction-specific continuous intelligence.',
            url: 'https://forge.bizlegal-ai.com',
            sku: 'forge-boi-kit',
            brand: { '@type': 'Brand', name: 'BizLegal AI' },
            image: 'https://bizlegal-ai.com/og/forge.png',
            offers: {
              '@type': 'Offer',
              price: '149',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              availabilityStarts: '2024-01-01T00:00:00Z',
              priceValidUntil: '2027-12-31T23:59:59Z',
              url: 'https://bizlegal-ai.com/checkout?product=forge_boi_kit',
              seller: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
            },
          } },
          { '@type': 'ListItem', position: 6, item: {
            '@type': 'Product',
            name: 'LeadForge — Buyer-Intent Intelligence',
            description: 'Buyer-intent intelligence and deal-flow scoring. Free public access to qualified-prospect signals; paid tier for enterprise CRM enrichment.',
            url: 'https://leadforge.bizlegal-ai.com',
            sku: 'leadforge-free',
            brand: { '@type': 'Brand', name: 'BizLegal AI' },
            image: 'https://bizlegal-ai.com/og/leadforge.png',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              availabilityStarts: '2024-01-01T00:00:00Z',
              priceValidUntil: '2027-12-31T23:59:59Z',
              url: 'https://leadforge.bizlegal-ai.com',
              seller: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
            },
          } },
        ],
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What does BizLegal AI do?', acceptedAnswer: { '@type': 'Answer', text: 'BizLegal AI is a regulatory research and monitoring software platform for in-house compliance and legal-operations teams. We track 50+ regulators across the US, UK, EU, UAE, Singapore, Hong Kong, Japan, Australia, Canada, and Switzerland. We are a software tool — not a law firm, and not legal advice.' } },
          { '@type': 'Question', name: 'How fresh is your regulatory data?', acceptedAnswer: { '@type': 'Answer', text: 'Our intelligence desk refreshes daily. We ingest 50+ regulator RSS feeds, enforcement press releases, court filings, and consultation papers. Every published brief is timestamped and source-cited inline.' } },
          { '@type': 'Question', name: 'How do you score risk in Tracr?', acceptedAnswer: { '@type': 'Answer', text: 'Tracr combines five signals into a 0-100 composite: sanctions-list match (OFAC, UN, EU, UK HMT), counterparty exposure, mixer/tumbler exposure, exchange-risk grade, and jurisdiction clustering. The score is deterministic and reproducible. Tracr is an intelligence indicator, not a legal verdict.' } },
          { '@type': 'Question', name: 'Is LexAudit a SOC 2 certification?', acceptedAnswer: { '@type': 'Answer', text: 'No. LexAudit is a continuous Compliance Health Score, not a certification. It is a deterministic 60-signal check. For an actual SOC 2 attestation you need a licensed CPA firm — but LexAudit is excellent for the other 364 days of the year.' } },
          { '@type': 'Question', name: 'How is DocAI different from generic AI contract review?', acceptedAnswer: { '@type': 'Answer', text: 'DocAI is policy-aware. You upload your existing contracts and your standard policy library, and DocAI redlines new contracts against YOUR standards — not generic best-practice. The clause library is version-controlled and audit-ready.' } },
          { '@type': 'Question', name: 'Can I cancel anytime?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. All subscription products are month-to-month with no contract. Cancel from your dashboard or by emailing support@bizlegal-ai.com.' } },
          { '@type': 'Question', name: 'Is your platform GDPR compliant?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. We are a data processor (DPA available on request) operating under GDPR Art. 28 terms. We do not sell personal data and do not train AI models on customer-uploaded documents.' } },
        ],
      }) }} />
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
        secondaryCta={{ label: 'Find your tool', href: '/find' }}
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

      {/* MANAGED RETAINER CROSS-SELL ──────────────────────── */}
      <section
        className="bl-section"
        style={{ borderTop: '1px solid var(--bl-divider)' }}
      >
        <div
          className="bl-container-narrow"
          style={{
            display: 'flex',
            gap: '2.5rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: '1 1 340px' }}>
            <div className="bl-label" style={{ marginBottom: '0.75rem' }}>
              Managed Compliance Ops · $2,500/mo
            </div>
            <h2
              style={{
                fontFamily: 'var(--bl-font-display)',
                fontSize: 'var(--bl-text-h3)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                color: 'var(--bl-text)',
                margin: 0,
                marginBottom: '0.75rem',
              }}
            >
              Skip the CCO hire. Get attorney-run compliance ops on a flat fee.
            </h2>
            <p
              style={{
                fontSize: 'var(--bl-text-body)',
                color: 'var(--bl-text-muted)',
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Weekly regulatory briefs, standing contract review, BOI / MiCA / GDPR deadline
              tracking, and on-call attorney Q&amp;A. Everything a $200K CCO does for early-stage
              fintechs — at a fraction of the cost.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Link
              href="https://docai.bizlegal-ai.com/services/compliance-ops-retainer"
              className="bl-btn-primary"
              style={{ whiteSpace: 'nowrap' }}
            >
              View retainer details <span aria-hidden="true">→</span>
            </Link>
            <span style={{ fontSize: 'var(--bl-text-small)', color: 'var(--bl-text-muted)' }}>
              $5,000 setup · $2,500/mo · flat fee
            </span>
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
            <Link href="/find" className="bl-btn-ghost">
              Not sure what you need?
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
