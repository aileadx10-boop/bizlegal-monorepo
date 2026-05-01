'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export function StickyConversionBar() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsVisible(scrollY > 400 && !isDismissed)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isDismissed])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-low)]/95 backdrop-blur-xl border-b border-[var(--outline-var)]"
        >
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-pulse" />
                <span className="text-xs font-bold text-[var(--secondary)] tracking-wider">INSTITUTIONAL GRADE</span>
              </div>

              <div className="h-4 w-px bg-[var(--outline-var)] hidden sm:block" />

              <p className="text-sm text-[var(--on-surface)]">
                <span className="hidden md:inline">Compliance intelligence for digital assets. </span>
                <span className="text-[var(--primary)] font-semibold">Get your risk report.</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/#risk-quiz"
                className="text-sm font-medium text-[var(--primary)] hover:text-white transition-colors"
              >
                Free Assessment
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 bg-[var(--primary-container)] text-white text-sm font-bold px-4 py-2 hover:bg-[var(--primary)] transition-colors"
              >
                View Pricing
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <button
                onClick={() => setIsDismissed(true)}
                className="text-[var(--outline)] hover:text-[var(--on-surface)] transition-colors ml-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
