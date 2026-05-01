'use client'
import { motion } from 'framer-motion'
import { RiskScoreRing } from './RiskScoreRing'
import { MorphingBlob } from './MorphingBlob'
import Link from 'next/link'

export const Tier1Hero = () => {
  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden dot-grid">
      {/* Motion Layer: Background Elements */}
      <div className="absolute inset-0 z-0">
        <MorphingBlob color="var(--primary)" size={600} opacity={0.15} />
        <div 
          className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 animate-pulse-glow"
          style={{ background: 'var(--accent-purple)' }}
        />
        <div 
          className="absolute -bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 animate-pulse-glow"
          style={{ background: 'var(--secondary)' }}
        />
      </div>

      <div className="container relative z-10 px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Intelligence Layer: Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex justify-center lg:justify-start items-center gap-3 mb-6">
                <span className="w-8 h-[1px] bg-[var(--primary)] opacity-50" />
                <span className="section-label !m-0">
                  Tier-1 Compliance Intelligence
                </span>
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-9xl mb-8 leading-[0.85] text-white tracking-tighter">
                Precise.<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] via-[var(--accent-cyan)] to-[var(--accent-purple)] italic font-serif">
                  Expensive.
                </span><br />
                Unwavering.
              </h1>
              
              <p className="text-[var(--text-muted)] text-xl md:text-2xl max-w-xl mb-12 leading-relaxed font-light">
                Institutional-grade intelligence for high-stakes digital asset ventures. 
                Managed jurisdictional analysis across UAE, EU, US, and Singapore.
              </p>
              
              {/* Conversion Layer: CTAs */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                <Link href="/scan" className="btn-premium group relative">
                  <span className="relative z-10">Initialize Intelligence Scan</span>
                  <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                </Link>
                <Link href="/marketplace" className="px-10 py-4 border border-white/10 hover:border-[var(--primary)] transition-all duration-500 text-xs font-bold uppercase tracking-widest text-white flex items-center gap-3 bg-white/5 backdrop-blur-sm group">
                  Access Marketplace 
                  <span className="opacity-50 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </motion.div>

            {/* Trust Layer: Metrics */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto lg:mx-0 border-t border-white/5 pt-10"
            >
              {[
                { label: 'Jurisdictions', value: '4+' },
                { label: 'Intelligence Nodes', value: '160+' },
                { label: 'Data Points', value: '2.4M' },
              ].map((m) => (
                <div key={m.label}>
                  <div className="text-3xl font-bold text-white mb-2 tracking-tight">{m.value}</div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold">{m.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Product Layer: Visual */}
          <div className="flex-1 relative flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotateY: 20 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 perspective-[1000px]"
            >
              <div className="p-16 glass-panel border-2 border-white/10 rounded-[40px] relative">
                <div className="absolute -inset-0.5 bg-gradient-to-tr from-[var(--primary)]/20 to-transparent rounded-[40px] blur-sm -z-10" />
                
                <RiskScoreRing score={72} size={280} strokeWidth={12} />
                
                {/* Floating Intelligence Badges */}
                <motion.div
                  animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -right-16 p-5 glass-panel border border-[var(--primary)]/40 rounded-2xl shadow-2xl"
                >
                  <div className="flex items-center gap-3 text-[var(--primary)] mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_10px_var(--primary)]" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">Live Scan</span>
                  </div>
                  <div className="text-white font-mono text-sm font-bold uppercase tracking-tighter">MiCA GAP DETECTED</div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 15, 0], x: [0, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-10 -left-16 p-5 glass-panel border border-[var(--accent-purple)]/40 rounded-2xl shadow-2xl"
                >
                  <div className="text-[var(--text-muted)] text-[10px] font-bold tracking-widest uppercase mb-2">UAE/VARA COMPLIANCE</div>
                  <div className="text-[var(--success)] font-bold text-sm flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                    VERIFIED
                  </div>
                </motion.div>

                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute top-1/2 -left-20 -translate-y-1/2 p-4 glass-panel border border-white/10 rounded-xl"
                >
                  <div className="text-[20px] font-bold text-white leading-none">98%</div>
                  <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest mt-1">Confidence</div>
                </motion.div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
