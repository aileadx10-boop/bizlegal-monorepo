import type { Metadata } from 'next'
import Link from 'next/link'

const PAGES = [
  { slug: 'gdpr-fine-estimator', title: 'GDPR Fine Estimator' },
  { slug: 'sanction-screener', title: 'Sanction Screener' },
  { slug: 'mica-asset-classifier', title: 'MiCA Asset Classifier' },
  { slug: 'contract-fixer', title: 'Contract Fixer' },
]

export function generateStaticParams() {
  return PAGES.map(p => ({ slug: p.slug }))
}

// Self-referencing canonical so these are NOT excluded as "Alternate page
// with proper canonical tag" (they previously inherited the root layout's
// homepage canonical).
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = PAGES.find(p => p.slug === params.slug)
  return {
    title: tool ? `${tool.title} | BizLegal AI` : 'Tool | BizLegal AI',
    alternates: { canonical: `/tools/${params.slug}` },
  }
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = PAGES.find(p => p.slug === params.slug)
  
  if (!tool) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-on-surface mb-4">Tool Not Found</h1>
          <Link href="/tools" className="text-primary hover:underline">← Back to Tools</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/tools" className="text-primary hover:underline mb-8 inline-block">
          ← Back to Tools
        </Link>
        <h1 className="text-4xl font-bold text-on-surface mb-6">{tool.title}</h1>
        <div className="bg-bg-mid border border-outline-var rounded-xl p-8 text-center">
          <p className="text-on-surface-var mb-6">
            This tool is under development. Check back soon or contact us for early access.
          </p>
          <a
            href="mailto:intelligence@bizlegal-ai.com"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Request Early Access
          </a>
        </div>
      </div>
    </div>
  )
}
