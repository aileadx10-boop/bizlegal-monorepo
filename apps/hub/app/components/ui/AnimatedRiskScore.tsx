'use client'
import { motion } from 'framer-motion'

interface AnimatedRiskScoreProps {
  score: number
  size?: number
}

export const AnimatedRiskScore = ({ score, size = 160 }: AnimatedRiskScoreProps) => {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer Rotating Dash Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-dashed border-[var(--primary)] opacity-20"
      />
      
      {/* Middle Pulsing Ring */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-2 rounded-full border-2 border-[var(--primary)]"
      />

      {/* Score Text */}
      <div className="relative flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-5xl font-bold font-['Newsreader'] text-white"
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">
          Risk Index
        </span>
      </div>

      {/* SVG Circular Progress */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size / 2) - 4}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={2 * Math.PI * ((size / 2) - 4)}
          strokeDashoffset={2 * Math.PI * ((size / 2) - 4) * (1 - score / 100)}
          className="text-[var(--primary)] opacity-40"
          style={{ transition: "stroke-dashoffset 2s ease-out" }}
        />
      </svg>
    </div>
  )
}
