'use client'
import React from 'react'
import { motion, type AnimationProps } from 'framer-motion'
import { cn } from '@/lib/utils'

const animationProps = {
  initial: { '--x': '100%', scale: 0.98 },
  animate: { '--x': '-100%', scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: 'loop',
    repeatDelay: 1,
    type: 'spring',
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: 'spring',
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
} as AnimationProps

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export default function ShinyButton({ children, className, ...props }: ShinyButtonProps) {
  return (
    <motion.button
      {...animationProps}
      {...(props as any)}
      className={cn(
        'relative rounded-none px-6 py-2 font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out hover:shadow dark:bg-[radial-gradient(circle_at_50%_0%,rgba(180,197,255,0.1)_0%,transparent_60%)] dark:hover:shadow-[0_0_20px_rgba(180,197,255,0.1)]',
        className
      )}
      style={{
        border: '1px solid var(--outline-var)',
        background: 'var(--bg-mid)',
      }}
    >
      <span
        className="relative block h-full w-full text-sm uppercase tracking-wide text-[var(--on-surface)]"
        style={{
          maskImage:
            'linear-gradient(-75deg,rgba(180,197,255,1) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),rgba(180,197,255,1) calc(var(--x) + 100%))',
        }}
      >
        {children}
      </span>
      <motion.span
        initial={{ maskImage: 'linear-gradient(white, transparent)' }}
        className="absolute inset-0 block rounded-none p-px"
        style={{
          maskImage: 'linear-gradient(-75deg,rgba(180,197,255,1) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),rgba(180,197,255,1) calc(var(--x) + 100%))',
        }}
      >
        <div className="absolute inset-0 h-full w-full bg-[var(--primary)]" />
      </motion.span>
    </motion.button>
  )
}
