'use client'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { forwardRef } from 'react'

export interface SectionHeadingProps {
  badge: string
  heading: string
  description?: string
  icon?: LucideIcon
  size?: 'sm' | 'md' | 'lg' | 'xl'
  align?: 'left' | 'center' | 'right'
  className?: string
  headingClassName?: string
  badgeClassName?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  id?: string
}

const sizes = {
  sm: { heading: 'text-xl sm:text-2xl', gap: 'gap-2' },
  md: { heading: 'text-2xl sm:text-3xl md:text-4xl', gap: 'gap-3' },
  lg: { heading: 'text-3xl sm:text-4xl md:text-5xl', gap: 'gap-4' },
  xl: { heading: 'text-4xl sm:text-5xl md:text-6xl', gap: 'gap-5' },
}

const SectionHeading = forwardRef<HTMLDivElement, SectionHeadingProps>(
  ({ badge, heading, description, icon: Icon, size = 'md', align = 'center', className, headingClassName, badgeClassName, as: Tag = 'h2', id }, ref) => {
    const s = sizes[size]
    const alignClass = align === 'center' ? 'text-center items-center' : align === 'right' ? 'text-right items-end' : 'text-left items-start'

    return (
      <div ref={ref} className={cn('flex flex-col', s.gap, alignClass, className)}>
        {/* Badge */}
        <div className={cn('section-label flex items-center gap-1.5', badgeClassName)} style={{ display: 'inline-flex', marginBottom: 0 }}>
          {Icon && <Icon size={11} aria-hidden />}
          {badge}
        </div>

        {/* Heading */}
        <Tag
          id={id}
          className={cn('font-bold leading-tight tracking-tight', s.heading, headingClassName)}
          style={{ fontFamily: 'Newsreader, Georgia, serif', color: 'var(--on-surface)' }}
        >
          {heading}
        </Tag>

        {/* Description */}
        {description && (
          <p style={{ color: 'var(--on-surface-var)', fontSize: 15, lineHeight: 1.75, maxWidth: '56ch' }}>
            {description}
          </p>
        )}
      </div>
    )
  }
)

SectionHeading.displayName = 'SectionHeading'
export { SectionHeading }
