'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PremiumGlassCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export const PremiumGlassCard = ({ children, className, delay = 0 }: PremiumGlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -5,
        transition: { duration: 0.3 },
      }}
      className={cn(
        "glass-panel relative p-6 rounded-none group",
        className
      )}
    >
      {/* Subtle top light sweep */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Hover glow effect */}
      <div className="absolute -inset-px rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-[var(--accent-purple)]/10 blur-xl" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
