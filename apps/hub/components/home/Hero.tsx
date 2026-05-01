'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ShinyButton from '@/components/ui/ShinyButton'

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' } },
}

export default function Hero() {
  return (
    <section
      className="dot-grid"
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '80px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div 
        initial="hidden"
        animate="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
        style={{ position: 'relative', maxWidth: 860, width: '100%' }}
      >
        {/* Eyebrow */}
        <motion.span 
          variants={FADE_UP_ANIMATION_VARIANTS}
          className="section-label" 
          style={{ textAlign: 'center', display: 'block' }}
        >
          Compliance Intelligence Platform
        </motion.span>

        {/* H1 */}
        <motion.h1 
          variants={FADE_UP_ANIMATION_VARIANTS}
          style={{ marginBottom: 24, lineHeight: 1.05 }}
        >
          Precise.<br />
          <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Expensive.</em><br />
          Unwavering.
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          variants={FADE_UP_ANIMATION_VARIANTS}
          style={{
            fontSize: 16,
            color: 'var(--on-surface-var)',
            maxWidth: 580,
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}
        >
          Institutional-grade compliance intelligence for fintech and crypto executives navigating
          SEC enforcement, MiCA obligations, VARA licensing, and GDPR exposure.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={FADE_UP_ANIMATION_VARIANTS}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}
        >
          <Link href="/#risk-quiz">
            <ShinyButton>
              Assess My Risk →
            </ShinyButton>
          </Link>
          <a
            href="https://blog.bizlegal-ai.com/snapshot"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            style={{
              fontSize: 14,
              padding: '12px 28px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              position: 'relative',
            }}
          >
            Free Jurisdiction Snapshot
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              background: 'var(--gold)',
              color: '#08080f',
              padding: '2px 6px',
              borderRadius: 3,
            }}>FREE</span>
          </a>
          <Link href="/tools" className="btn-ghost" style={{ fontSize: 14, padding: '12px 28px' }}>
            Explore Tools
          </Link>
        </motion.div>

        {/* Hero SVG: 4-regulation arc meter */}
        <motion.div 
          variants={FADE_UP_ANIMATION_VARIANTS}
          style={{ maxWidth: 480, margin: '0 auto' }}
        >
          <svg viewBox="0 0 480 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
            {/* Background arcs */}
            <path d="M 48 240 A 192 192 0 0 1 432 240" stroke="var(--outline-var)" strokeWidth="1" fill="none" />

            {/* SEC arc — blue */}
            <path d="M 48 240 A 192 192 0 0 1 168 72" stroke="#2563eb" strokeWidth="6" fill="none" strokeLinecap="square">
              <animate attributeName="stroke-dasharray" from="0 300" to="150 150" dur="1.2s" fill="freeze" />
            </path>
            {/* MiCA arc — primary */}
            <path d="M 168 72 A 192 192 0 0 1 312 72" stroke="var(--primary)" strokeWidth="6" fill="none" strokeLinecap="square">
              <animate attributeName="stroke-dasharray" from="0 300" to="144 156" dur="1.4s" fill="freeze" />
            </path>
            {/* VARA arc — secondary */}
            <path d="M 312 72 A 192 192 0 0 1 402 160" stroke="var(--secondary)" strokeWidth="6" fill="none" strokeLinecap="square">
              <animate attributeName="stroke-dasharray" from="0 300" to="100 200" dur="1.6s" fill="freeze" />
            </path>
            {/* GDPR arc — success */}
            <path d="M 402 160 A 192 192 0 0 1 432 240" stroke="var(--success)" strokeWidth="6" fill="none" strokeLinecap="square">
              <animate attributeName="stroke-dasharray" from="0 300" to="80 220" dur="1.8s" fill="freeze" />
            </path>

            {/* Center */}
            <text x="240" y="200" textAnchor="middle" fill="var(--on-surface)" fontFamily="Newsreader, serif" fontSize="28" fontWeight="700">4</text>
            <text x="240" y="218" textAnchor="middle" fill="var(--outline)" fontFamily="Manrope, sans-serif" fontSize="10" fontWeight="700" letterSpacing="2">REGIMES</text>

            {/* Labels */}
            <text x="60" y="268" fill="#2563eb" fontFamily="Manrope, sans-serif" fontSize="9" fontWeight="700" letterSpacing="1">SEC</text>
            <text x="168" y="55" fill="var(--primary)" fontFamily="Manrope, sans-serif" fontSize="9" fontWeight="700" letterSpacing="1" textAnchor="middle">MiCA</text>
            <text x="320" y="55" fill="var(--secondary)" fontFamily="Manrope, sans-serif" fontSize="9" fontWeight="700" letterSpacing="1" textAnchor="middle">VARA</text>
            <text x="415" y="175" fill="var(--success)" fontFamily="Manrope, sans-serif" fontSize="9" fontWeight="700" letterSpacing="1" textAnchor="end">GDPR</text>
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
