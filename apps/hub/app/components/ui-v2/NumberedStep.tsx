'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

/**
 * NumberedStep — Gritnova-inspired numbered indicator with scroll-paint
 * underline. Light mode: large purple `01.` numerals + pink underline.
 * Dark mode: large gold + lavender underline (driven by --bl-accent and
 * --bl-accent-grad-to tokens which already swap per data-theme).
 *
 * Honours prefers-reduced-motion: underline is rendered statically (no
 * draw-in animation) and the children fade in without translation.
 */
export interface NumberedStepProps {
  index: number
  eyebrow?: string
  title: string
  body: ReactNode
  /** Optional accent override; defaults to `--bl-accent`. */
  accent?: string
  /** Optional underline accent override; defaults to `--bl-accent-grad-to`. */
  underlineAccent?: string
}

export function NumberedStep({
  index,
  eyebrow,
  title,
  body,
  accent = 'var(--bl-accent)',
  underlineAccent = 'var(--bl-accent-grad-to)',
}: NumberedStepProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inView = useInView(wrapperRef, { once: true, margin: '-100px' })
  const prefersReducedMotion = useReducedMotion()

  const padded = index.toString().padStart(2, '0')

  // Line positions for the accent underline below the numeral
  const underlineLength = 56
  const draw = prefersReducedMotion ? 1 : inView ? 1 : 0

  return (
    <div
      ref={wrapperRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: 'clamp(1.5rem, 1rem + 1vw, 2rem)',
        background: 'var(--bl-surface)',
        border: '1px solid var(--bl-border)',
        borderRadius: 'var(--bl-radius-lg)',
        boxShadow: 'var(--bl-shadow-sm)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          aria-hidden
          style={{
            fontFamily: 'var(--bl-font-display)',
            fontSize: 'clamp(2.5rem, 2rem + 2vw, 3.75rem)',
            fontWeight: 800,
            color: accent,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          {padded}
          <span style={{ color: accent, opacity: 0.5 }}>.</span>
        </div>

        {/* Animated underline — scroll-paint */}
        <svg
          aria-hidden
          width={underlineLength}
          height={5}
          viewBox={`0 0 ${underlineLength} 5`}
          style={{ display: 'block' }}
        >
          <motion.line
            x1={0}
            y1={2.5}
            x2={underlineLength}
            y2={2.5}
            stroke={underlineAccent}
            strokeWidth={3}
            strokeLinecap="round"
            initial={{ pathLength: prefersReducedMotion ? 1 : 0 }}
            animate={{ pathLength: draw }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          />
        </svg>
      </div>

      {eyebrow && (
        <span
          className="bl-label"
          style={{ color: accent, fontSize: 11, letterSpacing: '0.18em', margin: 0 }}
        >
          {eyebrow}
        </span>
      )}

      <h3
        style={{
          fontFamily: 'var(--bl-font-display)',
          fontSize: '1.35rem',
          fontWeight: 700,
          color: 'var(--bl-text)',
          margin: 0,
          letterSpacing: '-0.02em',
          lineHeight: 1.25,
        }}
      >
        {title}
      </h3>

      <div
        style={{
          fontFamily: 'var(--bl-font-body)',
          fontSize: 'var(--bl-text-small)',
          color: 'var(--bl-text-muted)',
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {body}
      </div>

      {/* a11y screen-reader announcement */}
      <span style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
        Step {index} of the process: {title}.
      </span>
    </div>
  )
}
