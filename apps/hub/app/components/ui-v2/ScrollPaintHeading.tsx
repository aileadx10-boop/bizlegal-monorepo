'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef, type ReactNode, type CSSProperties } from 'react'

/**
 * ScrollPaintHeading — H2 wrapper with a gradient SVG underline that
 * paints in as the heading enters the viewport. Drop-in replacement for
 * a plain <h2>.
 *
 * Honours prefers-reduced-motion: underline renders statically.
 */
export interface ScrollPaintHeadingProps {
  children: ReactNode
  /** SVG gradient stops — left → right. Defaults to --bl-accent → --bl-accent-grad-to. */
  fromColor?: string
  toColor?: string
  /** Underline pixel height. Default 5. */
  thickness?: number
  /** Optional inline style override on the <h2>. */
  style?: CSSProperties
  /** Optional className on the <h2>. */
  className?: string
}

export function ScrollPaintHeading({
  children,
  fromColor = 'var(--bl-accent)',
  toColor = 'var(--bl-accent-grad-to)',
  thickness = 5,
  style,
  className,
}: ScrollPaintHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const prefersReducedMotion = useReducedMotion()
  const draw = prefersReducedMotion ? 1 : inView ? 1 : 0

  // Use a unique gradient ID per render to avoid SVG collisions when
  // multiple ScrollPaintHeadings appear on the same page.
  const gradId = `spainted-${useId()}`

  return (
    <h2
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
      <svg
        aria-hidden
        width="100%"
        height={thickness + 4}
        viewBox={`0 0 100 ${thickness + 4}`}
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: -Math.floor(thickness / 2) - 4,
          width: '100%',
          height: thickness + 4,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={fromColor} />
            <stop offset="100%" stopColor={toColor} />
          </linearGradient>
        </defs>
        <motion.line
          x1={0}
          y1={(thickness + 4) / 2}
          x2={100}
          y2={(thickness + 4) / 2}
          stroke={`url(#${gradId})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          initial={{ pathLength: prefersReducedMotion ? 1 : 0 }}
          animate={{ pathLength: draw }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
      </svg>
    </h2>
  )
}

// Lightweight unique-id helper. Avoids importing React's useId on
// versions where it might not exist (Next.js 14 React 18 has it but
// keep this file framework-agnostic).
let _idCounter = 0
function useId(): string {
  const ref = useRef<string>('')
  if (!ref.current) {
    _idCounter += 1
    ref.current = `${_idCounter}-${Math.random().toString(36).slice(2, 8)}`
  }
  return ref.current
}
