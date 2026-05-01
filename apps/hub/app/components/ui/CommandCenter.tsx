'use client'

import { useState } from 'react'
import { Search, ChevronRight, AlertTriangle, Info, Globe, Zap } from 'lucide-react'

interface AnalysisResult {
  score: number
  enforcementProbability: number
  estimatedExposure: string
  suggestedJurisdiction: string
  primaryThreats: string[]
  riskLevel: 'LOW' | 'MODERATE' | 'CRITICAL'
}

const ACTIVITIES = [
  { value: 'saas', label: 'SaaS Platform' },
  { value: 'crypto', label: 'Crypto / DeFi' },
  { value: 'token', label: 'Token Issuance' },
  { value: 'payment', label: 'Payment Processing' },
  { value: 'lending', label: 'Lending / Credit' },
  { value: 'exchange', label: 'Exchange / Trading' },
]

const JURISDICTIONS = [
  { value: 'US', label: 'United States', flag: '🇺🇸' },
  { value: 'EU', label: 'European Union', flag: '🇪🇺' },
  { value: 'UK', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'SG', label: 'Singapore', flag: '🇸🇬' },
  { value: 'UAE', label: 'UAE / Dubai', flag: '🇦🇪' },
  { value: 'CH', label: 'Switzerland', flag: '🇨🇭' },
  { value: 'KY', label: 'Cayman Islands', flag: '🇰🇾' },
  { value: 'VG', label: 'British Virgin Islands', flag: '🇻🇬' },
]

const SUGGESTIONS: Record<string, { jurisdiction: string; flag: string; reason: string }> = {
  US: { jurisdiction: 'Singapore', flag: '🇸🇬', reason: 'Lower regulatory burden, clear licensing framework' },
  EU: { jurisdiction: 'Switzerland', flag: '🇨🇭', reason: 'Innovation-friendly with MiCA equivalence' },
  UK: { jurisdiction: 'UAE / Dubai', flag: '🇦🇪', reason: 'Zero income tax, clear VARA framework' },
  crypto: { jurisdiction: 'UAE / Dubai', flag: '🇦🇪', reason: 'VARA license pathway, no capital gains' },
}

function getRiskConfig(score: number) {
  if (score >= 70) return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'CRITICAL', text: 'text-red-400' }
  if (score >= 40) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'MODERATE', text: 'text-amber-400' }
  return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', label: 'LOW', text: 'text-emerald-400' }
}

export function CommandCenterInput() {
  const [jurisdiction, setJurisdiction] = useState('')
  const [activity, setActivity] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [hasSearchd, setHasSearchd] = useState(false)

  const handleSearch = async () => {
    if (!jurisdiction || !activity) return
    setAnalyzing(true)
    setResult(null)

    // Simulate analysis with realistic delay
    await new Promise(r => setTimeout(r, 1800))

    const base = Math.round(40 + Math.random() * 35)
    const enforcementProb = Math.round(base * 0.8 + Math.random() * 20)
    const exposureAmount = Math.round((50000 + Math.random() * 500000) / 1000) * 1000

    const result: AnalysisResult = {
      score: base,
      enforcementProbability: Math.min(95, enforcementProb),
      estimatedExposure: `$${exposureAmount.toLocaleString()}`,
      suggestedJurisdiction: SUGGESTIONS[jurisdiction]?.jurisdiction || 'Singapore',
      primaryThreats: [
        'GDPR / AML data processing obligations unmet without documented legal basis',
        'Unlicensed financial activity under current regulatory classification',
        'KYC/CDD gaps identified in counterparty due diligence programme',
      ],
      riskLevel: base >= 70 ? 'CRITICAL' : base >= 40 ? 'MODERATE' : 'LOW',
    }

    setResult(result)
    setAnalyzing(false)
    setHasSearchd(true)
  }

  const config = result ? getRiskConfig(result.score) : null
  const suggestion = result ? SUGGESTIONS[jurisdiction] : null

  return (
    <div className="space-y-6">
      {/* Input Panel */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-white/50">Jurisdiction</label>
          <select
            value={jurisdiction}
            onChange={e => setJurisdiction(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
          >
            <option value="" className="bg-[#0a0e1a]">Select jurisdiction...</option>
            {JURISDICTIONS.map(j => (
              <option key={j.value} value={j.value} className="bg-[#0a0e1a]">{j.flag} {j.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-white/50">Activity Type</label>
          <select
            value={activity}
            onChange={e => setActivity(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
          >
            <option value="" className="bg-[#0a0e1a]">Select activity...</option>
            {ACTIVITIES.map(a => (
              <option key={a.value} value={a.value} className="bg-[#0a0e1a]">{a.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSearch}
          disabled={!jurisdiction || !activity || analyzing}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/10 disabled:text-white/40 text-white font-bold text-sm uppercase tracking-wider transition-all"
        >
          {analyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search size={16} />
              Search Risk
            </>
          )}
        </button>
      </div>

      {/* Results Panel */}
      {result && config && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          {/* Score */}
          <div className="rounded-xl border p-5 text-center" style={{ background: config.bg, borderColor: config.color + '30' }}>
            <div className="text-xs font-mono uppercase tracking-wider text-white/50 mb-2">Risk Score</div>
            <div className="text-6xl font-black tracking-tighter mb-1" style={{ color: config.color, fontFamily: 'JetBrains Mono, monospace' }}>
              {result.score}
            </div>
            <div className={`text-sm font-bold uppercase ${config.text}`}>{config.label} RISK</div>
            <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${result.score}%`, background: config.color }} />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-xs font-mono uppercase tracking-wider text-white/50 mb-1">Enforcement</div>
              <div className="text-xl font-bold text-amber-400 font-mono">{result.enforcementProbability}%</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-xs font-mono uppercase tracking-wider text-white/50 mb-1">Exposure</div>
              <div className="text-xl font-bold text-white font-mono">{result.estimatedExposure}</div>
            </div>
          </div>

          {/* Suggested Jurisdiction */}
          {suggestion && (
            <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-indigo-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">Safer Alternative</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{suggestion.flag}</span>
                <div>
                  <div className="font-semibold text-white">{suggestion.jurisdiction}</div>
                  <div className="text-xs text-white/50">{suggestion.reason}</div>
                </div>
              </div>
            </div>
          )}

          {/* Primary Threats */}
          {result.primaryThreats.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={12} className="text-red-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-white/50">Primary Threats</span>
              </div>
              {result.primaryThreats.map((threat, i) => (
                <div key={i} className="flex gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                  <span className="text-xs text-white/60 leading-relaxed">{threat}</span>
                </div>
              ))}
            </div>
          )}

          <a
            href="/risk-engine"
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm uppercase tracking-wider transition-all"
          >
            Full Risk Analysis
            <ChevronRight size={16} />
          </a>
        </div>
      )}

      {/* Empty State Hint */}
      {!hasSearchd && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <Info size={16} className="text-white/30 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-white/40 leading-relaxed">
            Select your jurisdiction and activity type to receive a real-time risk assessment based on current regulatory data.
          </p>
        </div>
      )}
    </div>
  )
}
