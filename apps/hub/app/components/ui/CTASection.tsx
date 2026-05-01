'use client'

import Link from 'next/link'
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react'

interface CTASectionProps {
  headline?: string
  subheadline?: string
  primaryCTA?: { label: string; href: string }
  secondaryCTA?: { label: string; href: string }
  variant?: 'default' | 'hero' | 'dark' | 'minimal'
  className?: string
}

export function CTASection({
  headline = 'Ready to Quantify Your Risk?',
  subheadline = 'Join institutional compliance teams using BizLegal AI to navigate global regulatory complexity.',
  primaryCTA = { label: 'Start Free Analysis', href: '/risk-engine' },
  secondaryCTA = { label: 'Compare Plans', href: '/pricing' },
  variant = 'default',
  className = ''
}: CTASectionProps) {
  const variants = {
    default: 'bg-gradient-to-b from-transparent via-white/[0.03] to-transparent border-y border-white/10',
    hero: 'bg-gradient-to-r from-indigo-500/10 via-transparent to-amber-500/10 border border-white/10 rounded-2xl',
    dark: 'bg-black/40 border border-white/5',
    minimal: '',
  }

  return (
    <section className={`py-20 px-6 ${variants[variant]} ${className}`}>
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
          <Zap size={12} />
          <span>Start for Free</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {headline}
        </h2>

        <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto leading-relaxed">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={primaryCTA.href}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm uppercase tracking-wider transition-all"
          >
            {primaryCTA.label}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          {secondaryCTA && (
            <Link
              href={secondaryCTA.href}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/20 hover:border-white/40 text-white/70 hover:text-white text-sm font-medium transition-all"
            >
              {secondaryCTA.label}
            </Link>
          )}
        </div>

        <div className="flex items-center justify-center gap-8 mt-10 text-xs text-white/40 font-mono uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <Shield size={12} className="text-emerald-400" />
            No credit card required
          </span>
          <span className="flex items-center gap-2">
            <Globe size={12} className="text-indigo-400" />
            50+ jurisdictions
          </span>
          <span>Setup in 2 minutes</span>
        </div>
      </div>
    </section>
  )
}

interface PricingCardProps {
  name: string
  price: string
  description: string
  features: string[]
  cta: { label: string; href: string }
  highlighted?: boolean
  badge?: string
}

export function PricingCard({ name, price, description, features, cta, highlighted = false, badge }: PricingCardProps) {
  return (
    <div className={`relative rounded-2xl border backdrop-blur-xl overflow-hidden ${highlighted ? 'bg-gradient-to-b from-indigo-500/10 to-transparent border-indigo-500/30' : 'bg-white/5 border-white/10'}`}>
      {badge && (
        <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-indigo-500 to-amber-500 text-white text-xs font-bold uppercase tracking-wider text-center py-1.5">
          {badge}
        </div>
      )}
      <div className={`p-8 ${badge ? 'pt-14' : ''}`}>
        <h3 className="text-sm font-mono uppercase tracking-wider text-white/50 mb-2">{name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{price}</span>
        </div>
        <p className="text-sm text-white/50 mb-6">{description}</p>
        <ul className="space-y-3 mb-8">
          {features.map(f => (
            <li key={f} className="flex items-start gap-3 text-sm text-white/70">
              <svg className="w-4 h-4 mt-0.5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
        <Link
          href={cta.href}
          className={`block w-full text-center py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
            highlighted
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
              : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/20'
          }`}
        >
          {cta.label}
        </Link>
      </div>
    </div>
  )
}
