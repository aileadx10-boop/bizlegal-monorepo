'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface BentoCardProps {
  children: ReactNode
  className?: string
  size?: 'small' | 'medium' | 'large' | 'full'
  variant?: 'default' | 'highlight' | 'dark'
}

export function BentoCard({
  children,
  className = '',
  size = 'medium',
  variant = 'default'
}: BentoCardProps) {
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 md:col-span-2 row-span-1',
    large: 'col-span-1 md:col-span-2 row-span-2',
    full: 'col-span-1 md:col-span-4 row-span-1'
  }

  const variantClasses = {
    default: 'glass-panel',
    highlight: 'glass-panel !border-[var(--primary)]/30 bg-gradient-to-br from-[var(--primary)]/10 to-transparent',
    dark: 'bg-[var(--bg)] border-white/5'
  }

  return (
    <motion.div
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
      }}
      className={`
        relative overflow-hidden p-8 rounded-[32px]
        transition-all duration-500
        hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6),0_0_20px_var(--primary-glow)]
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

interface BentoGridProps {
  children: ReactNode
  className?: string
}

export function BentoGrid({ children, className = '' }: BentoGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[240px] ${className}`}>
      {children}
    </div>
  )
}

// Feature Pillar with Tier-1 large numbers
export function FeaturePillar({
  number,
  title,
  description,
  icon,
  className = ''
}: {
  number: string
  title: string
  description: string
  icon: string
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`
        group relative p-10 glass-panel rounded-[40px] overflow-hidden
        hover:border-[var(--primary)]/40 transition-all duration-500
        ${className}
      `}
    >
      <div className="absolute -top-4 -right-4 text-[140px] font-serif font-bold leading-none text-white/5 select-none transition-all duration-700 group-hover:text-[var(--primary)]/10 group-hover:scale-110">
        {number}
      </div>

      <div className="relative z-10">
        <div className="w-16 h-16 mb-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl group-hover:border-[var(--primary)]/30 group-hover:bg-[var(--primary)]/10 transition-all duration-500">
          <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">{icon}</span>
        </div>

        <h3 className="text-2xl font-serif font-medium text-white mb-4 group-hover:text-[var(--primary)] transition-colors">{title}</h3>

        <p className="text-base text-[var(--text-muted)] leading-relaxed font-light">{description}</p>

        <motion.div
          className="mt-10 flex items-center gap-3 text-[var(--primary)] text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0"
        >
          <span>Intelligence Deep-Dive</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Glassmorphism Card (Tier-1 Upgrade)
export function GlassCard({
  children,
  className = ''
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`
      relative overflow-hidden
      bg-[rgba(14,21,40,0.6)] backdrop-blur-3xl
      border border-white/10 rounded-[48px]
      ${className}
    `}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--primary)]/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
