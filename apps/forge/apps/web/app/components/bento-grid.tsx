'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface BentoCardProps {
  children: ReactNode
  className?: string
  size?: 'small' | 'medium' | 'large' | 'full'
  variant?: 'default' | 'highlight' | 'dark' | 'urgent'
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
    full: 'col-span-1 md:col-span-3 row-span-1'
  }

  const variantClasses = {
    default: 'bg-forge-card border-forge-border',
    highlight: 'bg-gradient-to-br from-forge-accent/20 to-forge-card border-forge-accent/30',
    dark: 'bg-forge-dark border-forge-dark',
    urgent: 'bg-gradient-to-br from-indigo-400/10 to-forge-card border-indigo-400/30'
  }

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden rounded-xl border p-6
        transition-all duration-300
        hover:border-forge-accent/30 hover:shadow-2xl hover:shadow-forge-accent/5
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
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px] ${className}`}>
      {children}
    </div>
  )
}

// Feature Pillar with WAM-style large numbers
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
      transition={{ duration: 0.5 }}
      className={`
        group relative p-8 bg-forge-card border border-forge-border rounded-xl
        hover:border-forge-accent/30 transition-all duration-500
        ${className}
      `}
    >
      <div className="absolute top-6 right-6 text-[100px] font-bold leading-none text-forge-muted/10 select-none">
        {number}
      </div>

      <div className="relative z-10">
        <div className="w-12 h-12 mb-6 flex items-center justify-center bg-forge-accent/10 rounded-xl border border-forge-accent/20 text-2xl">
          {icon}
        </div>

        <h3 className="text-xl font-bold text-forge-text mb-3">{title}</h3>

        <p className="text-sm text-forge-muted leading-relaxed">{description}</p>

        <motion.div
          className="mt-6 flex items-center gap-2 text-forge-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <span>Learn more</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Glassmorphism Card for premium feel
export function GlassCard({
  children,
  className = ''
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`
      relative overflow-hidden rounded-xl
      bg-[rgba(30,41,59,0.7)] backdrop-blur-xl
      border border-[rgba(148,163,184,0.1)]
      ${className}
    `}>
      <div className="absolute inset-0 bg-gradient-to-br from-forge-accent/5 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
