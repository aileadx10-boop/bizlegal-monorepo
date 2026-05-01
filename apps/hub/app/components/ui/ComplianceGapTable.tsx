'use client'
import { motion } from 'framer-motion'

interface Gap {
  issue: string
  jurisdiction: string
  severity: 'High' | 'Medium' | 'Low'
  fix: string
}

const GAPS: Gap[] = [
  { issue: 'VARA License Missing', jurisdiction: 'Dubai/UAE', severity: 'High', fix: 'Initialize Application' },
  { issue: 'GDPR Data Mapping', jurisdiction: 'EU', severity: 'Medium', fix: 'Map Cross-Border Flows' },
  { issue: 'SEC Howey Analysis', jurisdiction: 'USA', severity: 'High', fix: 'Legal Opinion Required' },
  { issue: 'MiCA CASP Prep', jurisdiction: 'EU', severity: 'Low', fix: 'Draft Operational Policies' },
]

export const ComplianceGapTable = () => {
  return (
    <div className="overflow-x-auto glass-panel p-6 rounded-2xl">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">
            <th className="pb-4 px-4 font-bold">Issue</th>
            <th className="pb-4 px-4 font-bold">Jurisdiction</th>
            <th className="pb-4 px-4 font-bold">Severity</th>
            <th className="pb-4 px-4 font-bold text-right">Fix</th>
          </tr>
        </thead>
        <tbody>
          {GAPS.map((gap, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="border-b border-white/5 last:border-0 group"
            >
              <td className="py-5 px-4">
                <div className="text-sm font-medium text-white">{gap.issue}</div>
              </td>
              <td className="py-5 px-4">
                <div className="text-xs text-[var(--text-muted)]">{gap.jurisdiction}</div>
              </td>
              <td className="py-5 px-4">
                <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${
                  gap.severity === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  gap.severity === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                }`}>
                  {gap.severity}
                </span>
              </td>
              <td className="py-5 px-4 text-right">
                <button className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] hover:underline">
                  {gap.fix} &rarr;
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
