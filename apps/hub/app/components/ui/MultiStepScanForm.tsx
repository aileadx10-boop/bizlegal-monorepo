'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { id: 'type', label: 'Company Type', options: ['VASP', 'DeFi Protocol', 'Token Issuer', 'Traditional Fintech'] },
  { id: 'jurisdiction', label: 'Primary Jurisdiction', options: ['EU (MiCA)', 'UAE (VARA)', 'USA (SEC)', 'Singapore (MAS)'] },
  { id: 'data', label: 'Data Usage', options: ['Cross-Border Transfer', 'Retail Processing', 'Institutional Custody', 'Public Blockchain'] },
]

export const MultiStepScanForm = () => {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, string>>({})

  const handleSelect = (option: string) => {
    const currentStep = STEPS[step]
    setFormData(prev => ({ ...prev, [currentStep.id]: option }))
    if (step < STEPS.length - 1) {
      setStep(prev => prev + 1)
    } else {
      setStep(prev => prev + 1) // Final state
    }
  }

  return (
    <div className="p-8 glass-panel border-2 border-[var(--primary)]/20 min-h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">
          {step < STEPS.length ? `Step ${step + 1} of ${STEPS.length}` : 'Analysis Complete'}
        </span>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`w-12 h-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[var(--primary)]' : 'bg-white/10'}`} 
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step < STEPS.length ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <h3 className="text-2xl text-white mb-6 font-serif italic">{STEPS[step].label}</h3>
            <div className="grid grid-cols-1 gap-3">
              {STEPS[step].options.map(option => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="w-full text-left p-4 rounded border border-white/5 bg-white/5 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 transition-all text-sm text-[var(--text-muted)] hover:text-white"
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h3 className="text-2xl text-white mb-2">Ready to Analyze</h3>
            <p className="text-[var(--text-muted)] text-sm mb-8 max-w-xs">
              Based on your company profile, we have identified 12 high-priority gaps.
            </p>
            <button className="btn-premium w-full">
              Generate Intelligence Report
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
