'use client'

import { motion } from 'framer-motion'

export function Skeleton({
  className = '',
  variant = 'rectangular',
  animation = 'pulse',
}: {
  className?: string
  variant?: 'rectangular' | 'circular' | 'text'
  animation?: 'pulse' | 'wave' | false
}) {
  const baseClasses = 'bg-forge-border/50 rounded'
  const variantClasses = {
    rectangular: '',
    circular: 'rounded-full',
    text: 'h-4 rounded',
  }

  const getAnimationClass = () => {
    if (animation === 'pulse') return 'animate-pulse'
    if (animation === 'wave') return 'animate-shimmer bg-gradient-to-r from-transparent via-forge-border/30 to-transparent bg-[length:200%_100%]'
    return ''
  }

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${getAnimationClass()} ${className}`}
    />
  )
}

export function CardSkeleton({
  lines = 3,
  includeHeader = true,
  includeFooter = false,
  className = '',
}: {
  lines?: number
  includeHeader?: boolean
  includeFooter?: boolean
  className?: string
}) {
  return (
    <div className={`bg-forge-card border border-forge-border rounded-2xl p-6 ${className}`}>
      {includeHeader && (
        <div className="mb-6">
          <Skeleton variant="text" className="w-3/4 h-6 mb-2" />
          <Skeleton variant="text" className="w-1/2 h-4" />
        </div>
      )}
      <div className="space-y-4 mb-6">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      {includeFooter && (
        <Skeleton className="h-12 w-full rounded-xl" />
      )}
    </div>
  )
}

export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" className="w-1/4 h-4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-12 w-32 rounded-lg" />
    </div>
  )
}

export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="min-h-[60vh] py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header skeleton */}
        <div className="text-center mb-16">
          <Skeleton variant="text" className="w-48 h-6 mx-auto mb-4" />
          <Skeleton variant="text" className="w-96 h-12 mx-auto mb-4" />
          <Skeleton variant="text" className="w-72 h-5 mx-auto" />
        </div>

        {/* Cards skeleton */}
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: cards }).map((_, i) => (
            <CardSkeleton key={i} lines={4} includeHeader includeFooter />
          ))}
        </div>
      </div>
    </div>
  )
}
