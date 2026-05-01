'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const STATS = [
  { value: 130, suffix: '+', label: 'Compliance Articles', sublabel: 'AI-generated, attorney-reviewed' },
  { value: 24, suffix: '', label: 'Live Tools', sublabel: 'Calculators & assessments' },
  { value: 5, suffix: '', label: 'Regulatory Hubs', sublabel: 'SEC · MiCA · VARA · GDPR' },
  { value: 100, suffix: '%', label: 'Uptime', sublabel: 'Automated via GitHub Actions' },
]

function CountUp({ target, suffix, active }: { target: number; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = 0
    const end = target
    const duration = 2000
    const increment = end / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      setCount(Math.floor(start))
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [active, target])

  return (
    <span className="font-serif italic">
      {count}{suffix}
    </span>
  )
}

export default function StatsRow() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative z-10 px-6 -mt-10 mb-20">
      <div className="max-w-7xl mx-auto glass-panel rounded-[32px] overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
        {STATS.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1 + 0.5, duration: 0.8 }}
            className="p-10 hover:bg-white/[0.02] transition-colors group"
          >
            <div className="text-5xl font-bold text-[var(--primary)] mb-4 tracking-tighter group-hover:scale-110 transition-transform origin-left duration-500">
              <CountUp target={stat.value} suffix={stat.suffix} active={isInView} />
            </div>
            <div className="text-sm font-bold text-white mb-2 uppercase tracking-widest">{stat.label}</div>
            <div className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">{stat.sublabel}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
