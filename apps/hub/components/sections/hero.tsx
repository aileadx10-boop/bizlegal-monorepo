'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import '@/lib/animations'

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!heroRef.current) return
    gsap.from(heroRef.current.querySelector('h1'), {
      opacity: 0, y: 40, duration: 0.8, delay: 0.2,
    })
    gsap.from(heroRef.current.querySelectorAll('[data-cta]'), {
      opacity: 0, y: 20, duration: 0.6, stagger: 0.1, delay: 0.5,
    })
  }, [])

  return (
    <div
      ref={heroRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, var(--bg), var(--bg-mid), var(--bg))' }}
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, var(--cta), transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s', background: 'radial-gradient(circle, var(--secondary), transparent)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center" style={{ paddingTop: 80 }}>
        <span style={{
          display: 'inline-block', marginBottom: 24,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.2em',
          color: 'var(--cta)', textTransform: 'uppercase',
          border: '1px solid var(--cta)', borderRadius: 999,
          padding: '4px 16px',
        }}>
          Regulatory Intelligence Command Center
        </span>

        <h1 style={{
          fontFamily: 'Newsreader, Georgia, serif',
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 700, lineHeight: 1.15,
          color: 'var(--on-surface)', marginBottom: 24,
        }}>
          Forensic-Grade Compliance.<br />AI-Powered Forensics.
        </h1>

        <p style={{ fontSize: 18, color: 'var(--on-surface-var)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Blockchain forensics reports. AI compliance certificates. Regulatory arbitrage intelligence. Elite legal intelligence for global operations.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/risk-engine" data-cta className="btn-primary">Start Free Scan</a>
          <a href="https://calendly.com/ai-leadx10" target="_blank" rel="noopener noreferrer" data-cta className="btn-ghost">
            Book Demo
          </a>
        </div>

        {/* Dashboard preview */}
        <div style={{
          marginTop: 64, height: 420,
          borderRadius: 16, border: '1px solid var(--outline-var)',
          background: 'var(--bg-mid)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Dashboard Preview — Live Product Screenshots Coming
          </span>
        </div>
      </div>
    </div>
  )
}
