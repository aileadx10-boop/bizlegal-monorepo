import Link from 'next/link'

const TOOLS = [
  {
    slug: 'gdpr-fine-estimator',
    title: 'GDPR Fine Estimator',
    desc: 'Estimate potential GDPR fines based on violation type, company size, and severity.',
    icon: '🇪🇺',
  },
  {
    slug: 'sanction-screener',
    title: 'Sanction Screener',
    desc: 'Screen entities against global sanctions lists (OFAC, EU, UN).',
    icon: '🔒',
  },
  {
    slug: 'mica-asset-classifier',
    title: 'MiCA Asset Classifier',
    desc: 'Classify crypto assets under EU MiCA regulation framework.',
    icon: '🪙',
  },
  {
    slug: 'contract-fixer',
    title: 'Contract Fixer',
    desc: 'AI-powered contract clause analysis and improvement.',
    icon: '📝',
  },
]

export default function ToolsPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-on-surface mb-4">
            Compliance Tools
          </h1>
          <p className="text-on-surface-var text-lg max-w-2xl mx-auto">
            Free AI-powered tools for regulatory compliance, contract analysis, and risk assessment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group bg-bg-mid border border-outline-var rounded-xl p-6 hover:border-primary hover:shadow-glow transition-all"
            >
              <div className="text-3xl mb-4">{tool.icon}</div>
              <h3 className="text-xl font-semibold text-on-surface mb-2 group-hover:text-primary transition-colors">
                {tool.title}
              </h3>
              <p className="text-on-surface-var text-sm">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
