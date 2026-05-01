'use client'

import { useState, useRef, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  shimmerColor?: string
  variant?: 'default' | 'gold'
}

export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ children, className, variant = 'default', shimmerColor, ...props }, ref) => {
    const [shimmerX, setShimmerX] = useState('-100%')
    const buttonRef = useRef<HTMLButtonElement>(null)

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = buttonRef.current
      if (!button) return
      const rect = button.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      setShimmerX(`${offsetX - 40}px`)
    }

    const handleMouseLeave = () => setShimmerX('-100%')

    const baseStyles: React.CSSProperties = variant === 'gold'
      ? {
          background: 'linear-gradient(135deg, var(--gold) 0%, #c4952e 100%)',
          color: '#08080f',
        }
      : {
          background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
          color: '#08080f',
        }

    return (
      <button
        ref={(node) => {
          (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
        }}
        className={cn(
          'relative inline-flex items-center justify-center rounded-lg font-semibold overflow-hidden cursor-pointer',
          'px-6 py-3 text-sm tracking-wide',
          'transition-all duration-200',
          'hover:brightness-110 active:scale-[0.97]',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]',
          className
        )}
        style={baseStyles}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Shimmer sweep */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
            transform: `translateX(${shimmerX})`,
            transition: 'transform 0.15s ease-out',
            width: '80px',
          }}
        />
        <span className="relative z-10">{children}</span>
      </button>
    )
  }
)

ShimmerButton.displayName = 'ShimmerButton'