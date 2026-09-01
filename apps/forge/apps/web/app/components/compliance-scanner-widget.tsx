'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, Lock, ArrowRight, Mail } from 'lucide-react'

interface ScanFinding {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  penalty?: string
}

const SCAN_SEQUENCES = [
  { step: 'Initializing compliance engine...', duration: 400 },
  { step: 'Loading state transparency statutes (NY LLCTA, proposed acts)...', duration: 600 },
  { step: 'Checking enacted vs proposed duties...', duration: 800 },
  { step: 'Analyzing corporate structure...', duration: 500 },
  { step: 'Cross-referencing ownership thresholds...', duration: 700 },
  { step: 'Checking disclosure deadlines...', duration: 400 },
  { step: 'Calculating exposure...', duration: 600 },
  { step: 'Generating risk assessment...', duration: 500 },
]

const MOCK_FINDINGS: ScanFinding[] = [
  {
    id: '1',
    severity: 'critical',
    title: 'State Transparency Duty Identified',
    description: 'Entity profile matches an enacted state transparency disclosure law (e.g. NY LLC Transparency Act)',
    penalty: 'Disclosure deadline applies',
  },
  {
    id: '2',
    severity: 'critical',
    title: 'Formation-State Gap',
    description: 'No state transparency disclosure on record for this entity type',
  },
  {
    id: '3',
    severity: 'warning',
    title: 'UBO Documentation Missing',
    description: '25% ownership threshold documentation not on file',
  },
  {
    id: '4',
    severity: 'warning',
    title: 'No Update Mechanism',
    description: 'State acts typically require updates within 30 days of ownership change',
  },
  {
    id: '5',
    severity: 'info',
    title: 'Proposed Legislation Tracker',
    description: 'Additional states have transparency bills pending — duties can appear mid-year',
  },
]

export function ComplianceScannerWidget() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'gated' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [findings, setFindings] = useState<ScanFinding[]>([])
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startScan = useCallback(() => {
    setStatus('scanning')
    setProgress(0)
    setCurrentStep(0)
    setFindings([])

    let stepIndex = 0
    let currentProgress = 0

    intervalRef.current = setInterval(() => {
      if (stepIndex < SCAN_SEQUENCES.length) {
        setCurrentStep(stepIndex)
        currentProgress = Math.min(((stepIndex + 1) / SCAN_SEQUENCES.length) * 80, 80)
        setProgress(currentProgress)

        // Add findings progressively
        if (stepIndex === 2) setFindings([MOCK_FINDINGS[0]])
        if (stepIndex === 4) setFindings(MOCK_FINDINGS.slice(0, 2))
        if (stepIndex === 6) setFindings(MOCK_FINDINGS.slice(0, 4))

        stepIndex++
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setStatus('gated')
        setProgress(80)
        setFindings(MOCK_FINDINGS)
      }
    }, 600)
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleSubmitEmail = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsSubmitting(false)
    setStatus('complete')
    setProgress(100)
  }, [email])

  const resetScan = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setCurrentStep(0)
    setFindings([])
    setEmail('')
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative bg-forge-card/50 backdrop-blur-xl border border-forge-border rounded-2xl p-8 overflow-hidden">
              {/* Ambient glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-forge-accent/10 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-400/10 border border-indigo-400/20 rounded-full mb-6">
                  <span className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse" />
                  <span className="text-xs font-semibold tracking-wider text-indigo-300 uppercase">Continuous Compliance Coverage</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  Free Transparency Duty Scan
                </h2>

                <p className="text-forge-text-secondary mb-8 max-w-md">
                  Surface state-level transparency duties and disclosure gaps in a 2–5 minute Compliance Snapshot.
                  See what a regulator review would surface first.
                </p>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startScan}
                  className="inline-flex items-center gap-3 bg-gradient-accent hover:opacity-90 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-glow"
                >
                  <Shield className="w-5 h-5" />
                  Run Free Compliance Scan
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <p className="text-xs text-forge-text-secondary mt-4 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  No signup required · Compliance Snapshot in 2–5 minutes
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {(status === 'scanning' || status === 'gated') && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-forge-card border border-forge-border rounded-2xl overflow-hidden shadow-glass">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-forge-dark border-b border-forge-border">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-forge-text-secondary font-mono">compliance-scanner.exe</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-forge-accent">{Math.round(progress)}%</span>
                  {status === 'scanning' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Shield className="w-4 h-4 text-forge-accent" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-forge-dark overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-accent"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Terminal Output */}
                  <div className="font-mono text-sm space-y-3">
                    <div className="text-xs text-forge-text-secondary uppercase tracking-wider mb-4">System Log</div>
                    {SCAN_SEQUENCES.slice(0, currentStep + 1).map((seq, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2"
                      >
                        <span className="text-green-500 flex-shrink-0">{'>'}</span>
                        <span className={i === currentStep ? 'text-forge-accent' : 'text-forge-text-secondary'}>
                          {seq.step}
                          {i === currentStep && status === 'scanning' && (
                            <motion.span
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="ml-1"
                            >
                              █
                            </motion.span>
                          )}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Findings Panel */}
                  <div className="space-y-3">
                    <div className="text-xs text-forge-text-secondary uppercase tracking-wider mb-4">Vulnerabilities</div>
                    <AnimatePresence>
                      {findings.map((finding, i) => (
                        <motion.div
                          key={finding.id}
                          initial={{ opacity: 0, x: 20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className={`p-3 rounded-lg border-l-2 ${
                            finding.severity === 'critical'
                              ? 'bg-red-500/10 border-red-500'
                              : finding.severity === 'warning'
                              ? 'bg-yellow-500/10 border-yellow-500'
                              : 'bg-blue-500/10 border-blue-500'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {finding.severity === 'critical' ? (
                              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            ) : finding.severity === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className={`text-sm font-semibold ${
                                finding.severity === 'critical' ? 'text-red-400' :
                                finding.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                              }`}>
                                {finding.title}
                              </div>
                              <div className="text-xs text-forge-text-secondary mt-1">{finding.description}</div>
                              {finding.penalty && (
                                <div className="text-xs text-red-400 mt-2 font-semibold">
                                {'⚠'} {finding.penalty}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Email Gate */}
                {status === 'gated' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 pt-6 border-t border-forge-border"
                  >
                    <div className="text-center">
                      <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-forge-accent/10 border border-forge-accent/20 rounded-full">
                        <Lock className="w-4 h-4 text-forge-accent" />
                        <span className="text-sm font-semibold text-forge-accent">80% Complete — Unlock Full Report</span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2">Get Your Complete Compliance Report</h3>

                      <p className="text-forge-text-secondary text-sm mb-6 max-w-md mx-auto">
                        Enter your email to receive the full analysis with detailed remediation steps 
                        and penalty mitigation strategies.
                      </p>

                      <form onSubmit={handleSubmitEmail} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forge-text-secondary" />
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="your@company.com"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-forge-dark border border-forge-border rounded-lg text-white placeholder-forge-text-secondary focus:border-forge-accent focus:outline-none focus:ring-2 focus:ring-forge-accent/20 transition-all"
                          />
                        </div>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isSubmitting}
                          className="px-6 py-3 bg-gradient-accent hover:opacity-90 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            <>
                              Unlock Report
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </motion.button>
                      </form>

                      <p className="text-xs text-forge-text-secondary mt-4">
                        We respect your privacy. No spam, unsubscribe anytime.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {status === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-forge-card/50 backdrop-blur-xl border border-forge-border rounded-2xl p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-6"
              >
                <CheckCircle className="w-8 h-8 text-green-400" />
              </motion.div>

              <h3 className="text-2xl font-bold text-white mb-3">Report Unlocked!</h3>
              <p className="text-forge-text-secondary mb-6">
                Check your inbox for the complete compliance analysis.
              </p>

              <div className="bg-forge-dark border border-forge-border rounded-lg p-4 text-left">
                <div className="text-sm font-semibold text-white mb-2">Summary of Findings:</div>
                <div className="space-y-2">
                  {MOCK_FINDINGS.map(f => (
                    <div key={f.id} className="flex items-start gap-2 text-sm">
                      {f.severity === 'critical' ? (
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      ) : f.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-forge-text-secondary">{f.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/boi" className="btn-primary inline-flex items-center gap-2">
                  Get the Transparency Kit — $149
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  onClick={resetScan}
                  className="px-4 py-2 text-forge-text-secondary hover:text-white border border-forge-border rounded-lg hover:border-forge-accent transition-all"
                >
                  Scan Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
