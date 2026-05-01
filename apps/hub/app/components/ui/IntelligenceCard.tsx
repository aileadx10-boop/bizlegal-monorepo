'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Clock, Tag, TrendingUp, ChevronRight } from 'lucide-react'

interface IntelligenceCardProps {
  title: string
  category: string
  riskImpact: number
  summary: string
  slug: string
  publishedAt?: string
  author?: string
  featured?: boolean
  className?: string
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  SEC: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  MiCA: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  GDPR: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  VARA: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  OFAC: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  FATF: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  DEFAULT: { bg: 'bg-white/5', text: 'text-white/70', border: 'border-white/10' },
}

function getRiskColor(score: number) {
  if (score < 30) return 'text-emerald-400'
  if (score < 60) return 'text-amber-400'
  return 'text-red-400'
}

export function IntelligenceCard({
  title, category, riskImpact, summary, slug,
  publishedAt, author, featured = false, className = ''
}: IntelligenceCardProps) {
  const catStyle = categoryColors[category] || categoryColors.DEFAULT

  return (
    <Link
      href={`/posts/${slug}`}
      className={`group block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden ${featured ? 'md:col-span-2' : ''} ${className}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
              {category}
            </span>
            <span className="flex items-center gap-1 text-xs font-mono text-white/40">
              <Clock size={12} />
              {publishedAt || 'Recent'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp size={14} className={getRiskColor(riskImpact)} />
            <span className={`text-sm font-bold font-mono ${getRiskColor(riskImpact)}`}>{riskImpact}</span>
            <span className="text-xs text-white/30 font-mono">/100</span>
          </div>
        </div>

        <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-indigo-300 transition-colors leading-snug">
          {title}
        </h3>
        <p className="text-sm text-white/50 line-clamp-2 leading-relaxed mb-4">
          {summary}
        </p>

        <div className="flex items-center justify-between">
          {author && (
            <span className="text-xs text-white/30 font-mono">{author}</span>
          )}
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Read Analysis
            <ChevronRight size={14} />
          </span>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  )
}

interface IntelligenceGridProps {
  items: IntelligenceCardProps[]
  className?: string
}

export function IntelligenceGrid({ items, className = '' }: IntelligenceGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {items.map((item, i) => (
        <IntelligenceCard key={item.slug || i} {...item} />
      ))}
    </div>
  )
}

interface CategoryFilterProps {
  categories: string[]
  selected: string
  onSelect: (cat: string) => void
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect('all')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
          selected === 'all'
            ? 'bg-indigo-500 text-white'
            : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
        }`}
      >
        All
      </button>
      {categories.map(cat => {
        const style = categoryColors[cat] || categoryColors.DEFAULT
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              selected === cat
                ? `${style.bg} ${style.text} border ${style.border}`
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border border-transparent'
            }`}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
