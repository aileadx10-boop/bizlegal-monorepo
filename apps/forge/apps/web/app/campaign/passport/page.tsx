// app/campaign/passport/page.tsx
// High-converting campaign page for Israeli Regulatory Passport
// Target: Israeli SaaS/fintech founders expanding to UK, EU, US, Singapore

import Link from 'next/link'

const MARKETS = [
  { flag: '🇬🇧', name: 'UK', regulator: 'FCA', license: 'FCA Authorization', time: '3-6 months', cost: '$8,000–$25,000' },
  { flag: '🇪🇺', name: 'EU', regulator: 'EBA/NCAs', license: 'MiCA / PSD2 / GDPR DPA', time: '4-8 months', cost: '$15,000–$60,000' },
  { flag: '🇺🇸', name: 'US', regulator: 'FinCEN/SEC', license: 'MSB / CTA / SEC Reg D', time: '2-4 months', cost: '$5,000–$20,000' },
  { flag: '🇸🇬', name: 'Singapore', regulator: 'MAS', license: 'CMS License / PSA', time: '3-5 months', cost: '$10,000–$30,000' },
  { flag: '🇦🇺', name: 'Australia', regulator: 'ASIC', license: 'AFS License / Credit License', time: '2-4 months', cost: '$5,000–$15,000' },
  { flag: '🇨🇦', name: 'Canada', regulator: 'FINTRAC/OSC', license: 'MSB / IIROC Registration', time: '3-5 months', cost: '$5,000–$18,000' },
]

export default function CampaignPassportPage() {
  return (
    <div className="min-h-screen bg-forge-dark">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-forge-accent/10 via-transparent to-purple-900/10" />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-forge-accent/20 border border-forge-accent/30 text-forge-accent text-xs font-bold px-3 py-1.5 rounded-full mb-6">
            🚀 FOR ISRAELI TECH FOUNDERS
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Raising from UK VCs?<br />
            <span className="text-forge-accent">Expanding to the EU or US?</span>
          </h1>
          <p className="text-xl text-forge-muted max-w-2xl mx-auto mb-8">
            Before you sign your next term sheet or launch in a new market — get your Regulatory Passport.
            A complete compliance roadmap covering licenses, AML/KYC, data privacy, and entity requirements.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/passport" className="btn-primary text-lg px-8 py-4">
              Get Your Passport — $297
            </Link>
            <a href="#markets" className="text-forge-muted hover:text-white transition-colors text-sm">
              See all markets →
            </a>
          </div>
          <p className="text-forge-muted text-xs mt-4">Pay via PayPal or ETH · Report in 24 hours</p>
        </div>
      </section>

      {/* MARKET GRID */}
      <section id="markets" className="border-t border-forge-border">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">12 Markets. One Passport.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MARKETS.map((m) => (
              <div key={m.name} className="card hover:border-forge-accent transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{m.flag}</span>
                  <div>
                    <div className="font-bold text-white">{m.name}</div>
                    <div className="text-forge-muted text-xs">{m.regulator}</div>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-forge-muted">
                  <div><span className="text-forge-text">License:</span> {m.license}</div>
                  <div><span className="text-forge-text">Timeline:</span> {m.time}</div>
                  <div><span className="text-forge-text">Est. cost:</span> {m.cost}</div>
                </div>
              </div>
            ))}
            {/* More markets */}
            {['🇩🇪 Germany', '🇳🇱 Netherlands', '🇨🇭 Switzerland', '🇦🇪 UAE', '🇯🇵 Japan', '🇭🇰 Hong Kong'].map((m) => (
              <div key={m} className="card opacity-60">
                <div className="font-bold text-white text-sm">{m}</div>
                <div className="text-forge-muted text-xs mt-1">Included in Passport</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO THIS IS FOR */}
      <section className="border-t border-forge-border">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Who This Is For</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🏦', title: 'Raising from UK/EU Investors', desc: 'UK VCs will ask about your regulatory status in the UK market. Get your roadmap before they do.' },
              { icon: '💳', title: 'Accepting EU or US Customers', desc: 'GDPR, CCPA, AML/KYC obligations kick in before you launch. Know what you need before you need it.' },
              { icon: '🔐', title: 'Hiring Contractors Globally', desc: 'Employment law, payroll taxes, and contractor vs employee rules vary by country. Know your exposure.' },
              { icon: '📱', title: 'Crypto or Blockchain', desc: 'FATF Travel Rule, FinCEN MSB, FCA crypto asset registration — all have specific requirements.' },
              { icon: '📈', title: 'Series A Due Diligence', desc: 'Venture investors now ask about regulatory compliance in target markets. Have your answers ready.' },
              { icon: '🌍', title: 'Multi-Jurisdiction Expansion', desc: 'Running compliance in parallel across markets without a clear priority wastes time and money.' },
            ].map((item) => (
              <div key={item.title} className="card">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-forge-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-forge-border">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">3 Steps to Your Passport</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Complete Intake', desc: 'Tell us about your company, product, entity structure, and target markets. Takes 10 minutes.' },
              { step: '02', title: 'Framework Analysis', desc: 'Forge analyzes your profile against each jurisdiction\'s regulatory requirements before practitioner review.' },
              { step: '03', title: 'Full Roadmap', desc: 'Receive a complete compliance roadmap with licenses, timelines, costs, and 30-day action plan.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-5xl font-bold text-forge-accent/30 mb-3">{s.step}</div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-forge-muted text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/passport" className="btn-primary text-lg px-10 py-4">
              Start Your Passport — $297
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="border-t border-forge-border">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Simple Pricing</h2>
          <div className="card max-w-md mx-auto mb-6">
            <div className="text-forge-muted text-sm mb-1">Regulatory Passport</div>
            <div className="text-4xl font-bold text-white mb-2">$297</div>
            <div className="text-forge-muted text-sm">One-time payment · Delivered in 24 hours</div>
          </div>
          <ul className="space-y-2 text-sm text-forge-muted mb-8">
            {['Up to 3 target markets per assessment', 'Licensing requirements by jurisdiction', 'AML/KYC obligations', 'GDPR, CCPA, data privacy requirements', 'Entity structure recommendations', '30/60/90-day action plan', 'Estimated compliance costs', 'Red flag analysis'] .map((f) => (
              <li key={f} className="flex items-center gap-2 justify-center"><span className="text-forge-accent">✓</span> {f}</li>
            ))}
          </ul>
          <Link href="/passport" className="btn-primary text-lg px-10 py-4">
            Get Started — $297
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-forge-border">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is this legal advice?', a: 'No. This is regulatory intelligence — analysis of regulatory frameworks and compliance obligations. For legal advice, consult a licensed attorney in the relevant jurisdiction.' },
              { q: 'How is this different from a law firm?', a: 'A law firm charges $500-$297/hour to scope what you need. Forge analyzes your specific profile against each market\'s requirements, sends every brief through practitioner review, and delivers a structured roadmap in 24 hours.' },
              { q: 'What if I need a license in a market?', a: 'Your report will tell you exactly which license, from which regulator, with what timeline and cost. We don\'t file the applications — but we tell you exactly what you need.' },
              { q: 'I\'m already in discussions with a UK VC. Is this too late?', a: 'No — a regulatory passport is exactly what UK VCs want to see. It shows you understand your obligations and have a plan.' },
              { q: 'Does this cover the US market?', a: 'Yes — including FinCEN MSB registration, state transparency disclosure duties (NY LLCTA and proposed acts), SEC Reg D considerations, and state-level money transmitter obligations.' },
            ].map((faq) => (
              <div key={faq.q} className="card">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-forge-muted text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="border-t border-forge-border">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Expand?</h2>
          <p className="text-forge-muted mb-8">Get your Regulatory Passport in 24 hours.</p>
          <Link href="/passport" className="btn-primary text-lg px-10 py-4">
            Get Your Passport — $297
          </Link>
          <p className="text-forge-muted text-xs mt-4">PayPal or Ethereum · Not legal advice</p>
        </div>
      </section>

      <footer className="border-t border-forge-border py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-forge-muted">
          <p>Not legal advice. For legal advice, consult a licensed attorney.</p>
          <p className="mt-1">Forge Compliance Engine · Regulatory Intelligence</p>
        </div>
      </footer>
    </div>
  )
}
