'use client'

import { motion } from 'framer-motion'

interface AnnouncementPillProps {
  text: string
  href?: string
  className?: string
}

export function AnnouncementPill({ text, href, className = '' }: AnnouncementPillProps) {
  const Wrapper = href ? 'a' : 'div'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={className}
    >
      <Wrapper
        {...(href ? { href } : {})}
        className="eyebrow-pill"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 18px',
          borderRadius: 9999,
          border: '1px solid rgba(212,168,83,0.2)',
          background: 'rgba(212,168,83,0.05)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color: 'var(--gold)',
          textDecoration: 'none',
          cursor: href ? 'pointer' : 'default',
          transition: 'border-color 0.2s, background 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(212,168,83,0.4)'
          e.currentTarget.style.background = 'rgba(212,168,83,0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(212,168,83,0.2)'
          e.currentTarget.style.background = 'rgba(212,168,83,0.05)'
        }}
      >
        {/* Pulsing dot */}
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--gold)',
            animation: 'pill-pulse 2s ease-in-out infinite',
          }}
        />
        {text}
      </Wrapper>

      <style>{`
        @keyframes pill-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </motion.div>
  )
}