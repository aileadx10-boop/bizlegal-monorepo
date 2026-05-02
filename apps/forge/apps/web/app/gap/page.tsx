import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Gap Monitor',
  description: 'Continuous compliance gap monitoring across jurisdictions and frameworks. Coming soon.',
  alternates: { canonical: 'https://forge.bizlegal-ai.com/gap' },
}

export default function GapIndexPage() {
  return (
    <div className="min-h-[70vh] bg-forge-dark py-24">
      <div className="max-w-3xl mx-auto px-6">
        <span className="inline-block text-xs font-bold tracking-widest text-forge-accent uppercase mb-4">
          Coverage
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Gap Monitor — coming soon.
        </h1>
        <p className="text-lg text-forge-muted leading-relaxed mb-8">
          Gap Monitor is the continuous-coverage view of Forge: a published index of regulatory
          frameworks we track, the jurisdictions in scope, and the compliance gaps we have written
          intelligence on. Individual gap briefs are already live at{' '}
          <code className="text-forge-accent">/gap/[jurisdiction]/[slug]</code>. The index page
          aggregating them is in active development and will list every published brief, the
          framework it addresses, and the date the analyst last reviewed it.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/audit"
            className="inline-flex items-center gap-2 bg-forge-accent hover:bg-forge-accent-hover text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Run a compliance scan
            <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 border border-forge-border hover:border-forge-accent text-forge-text hover:text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            See pricing
          </Link>
        </div>
      </div>
    </div>
  )
}
