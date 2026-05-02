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
          className="fixed top-0 left-0 right-0 z-50 bg-forge-card/95 backdrop-blur-xl border-b border-forge-border"
        >
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse" />
                <span className="text-xs font-bold text-indigo-300 tracking-wider">$500/DAY STATUTORY EXPOSURE</span>
              </div>

              <div className="h-4 w-px bg-forge-border hidden sm:block" />

              <p className="text-sm text-forge-text">
                <span className="hidden md:inline">Reduce FinCEN exposure. </span>
                <span className="text-forge-accent font-semibold">Compliance Snapshot in 2–5 minutes.</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/audit"
                className="text-sm font-medium text-forge-accent hover:text-white transition-colors"
              >
                Free Scan
              </Link>

              <Link
                href="/boi"
                className="inline-flex items-center gap-2 bg-forge-accent hover:bg-forge-accent-hover text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
              >
                File BOI Report
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <button
                onClick={() => setIsDismissed(true)}
                className="text-forge-muted hover:text-white transition-colors ml-2"
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
