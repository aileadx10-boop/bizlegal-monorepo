// app/campaign/boi/page.tsx
// High-conversion campaign landing page for BOI/CTA compliance product
// Target: US business owners with LLCs formed 2024-2026

import Link from 'next/link'

export default function CampaignBOIPage() {
  return (
    <div className="min-h-screen bg-forge-dark">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-forge-accent/10 via-transparent to-purple-900/10" />
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-400/15 border border-indigo-400/30 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
            <span className="animate-pulse">⚠️</span>
            $500/DAY STATUTORY EXPOSURE — TRACKED
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            The US Government Wants to Know Who <span className="text-forge-accent">Owns Your Company.</span>
          </h1>
          <p className="text-xl text-forge-muted max-w-2xl mx-auto mb-8">
            If you own 25%+ of an LLC, corporation, or partnership formed after January 1, 2024 — 
            you are legally required to file Beneficial Ownership Information with FinCEN. 
            <strong className="text-white"> $500/day penalties are already accruing.</strong>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/boi" className="btn-primary text-lg px-8 py-4">
              File My BOI Report — $149
            </Link>
            <a href="#how" className="text-forge-muted hover:text-white transition-colors text-sm">
              How it works →
            </a>
          </div>
          <p className="text-forge-muted text-xs mt-4">Pay via PayPal or ETH · Compliance Snapshot delivered in 2–5 minutes</p>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-forge-border bg-forge-card/50">
        <div className="max-w-4xl mx-auto px-6 py-6 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-white">32M+</div>
            <div className="text-forge-muted text-sm">US businesses required to file</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-300">75%</div>
            <div className="text-forge-muted text-sm">Have not yet filed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">$500</div>
            <div className="text-forge-muted text-sm">Per day per violation</div>
          </div>
        </div>
      </section>

      {/* WHO NEEDS TO FILE */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Who Must File</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: '🏢', title: 'LLCs formed 2024–2026', desc: 'Any LLC, corporation, or LP created after Jan 1, 2024 has a 30-day filing window from formation' },
            { icon: '🏗️', title: 'Real Estate Holding Companies', desc: 'Any LLC holding property in your name, spouse\'s name, or family trust likely has BOI reporting obligations' },
            { icon: '💼', title: 'Family-Owned Businesses', desc: 'If two or more family members own portions of a company, each 25%+ owner must be reported' },
            { icon: '📈', title: 'Companies with New Investors', desc: 'Any company that sold equity to new investors in 2024-2026 likely has new beneficial owners to report' },
          ].map((item) => (
            <div key={item.title} className="card flex gap-4">
              <div className="text-3xl">{item.icon}</div>
              <div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-forge-muted text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-forge-border">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">3 Steps to Compliant</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Take the Quiz', desc: 'Answer 5 questions about your company and ownership structure. Takes 3 minutes.' },
              { step: '02', title: 'We Generate Your Report', desc: 'We identify every beneficial owner and create your FinCEN-compliant BOI report.' },
              { step: '03', title: 'File Directly on FinCEN', desc: 'We deliver your complete report. You file directly on FinCEN.gov — no middleman.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-5xl font-bold text-forge-accent/30 mb-3">{s.step}</div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-forge-muted text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/boi" className="btn-primary text-lg px-8 py-4">
              Get Your BOI Report — $149
            </Link>
          </div>
        </div>
      </section>

      {/* PENALTY EXPOSURE */}
      <section className="border-t border-forge-border bg-indigo-400/5">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Statutory Exposure Compounds Daily</h2>
          <p className="text-forge-muted max-w-2xl mx-auto mb-8">
            If your company was formed in 2024 or earlier and you never filed a BOI report —
            statutory exposure has been accruing since <strong className="text-white">January 1, 2024</strong>.
            Each day of non-compliance adds another $500 to your potential penalty.
          </p>
          <div className="inline-block bg-forge-dark border border-indigo-400/30 rounded-xl px-8 py-6">
            <div className="text-forge-muted text-sm mb-1">Example penalty exposure for an LLC formed Jan 1, 2024</div>
            <div className="text-4xl font-bold text-indigo-300">$547,500+</div>
            <div className="text-forge-muted text-xs mt-1">Accrued through today</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Common Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'What is a beneficial owner?', a: 'Anyone who owns 25%+ of your company OR exercises substantial control over it (CEO, CFO, decision-maker).' },
            { q: 'I filed BOI when I formed my LLC — am I done?', a: 'Maybe not. If you sold equity, added owners, or changed ownership structure — you must file an updated BOI report within 30 days.' },
            { q: 'Is this the same as an EIN?', a: 'No. EIN is your tax ID from the IRS. BOI is a separate filing with FinCEN (Financial Crimes Enforcement Network).' },
            { q: 'Can I do this myself?', a: 'Yes — directly at FinCEN.gov. But most business owners make errors that trigger audits. Our report guides you through exactly what to file.' },
            { q: 'Is this legal advice?', a: 'No. This is regulatory intelligence — we help you understand and meet your compliance obligations.' },
          ].map((faq) => (
            <div key={faq.q} className="card">
              <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
              <p className="text-forge-muted text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-forge-border">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stop the Penalty Clock.</h2>
          <p className="text-forge-muted mb-8">
            $149 today vs. $500/day accruing. File your BOI report and sleep better.
          </p>
          <Link href="/boi" className="btn-primary text-lg px-10 py-4">
            File Now — $149
          </Link>
          <p className="text-forge-muted text-xs mt-4">
            PayPal or Ethereum · Delivered in 2–5 minutes · Not legal advice
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-forge-border py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-forge-muted">
          <p>Not legal advice. For legal advice, consult a licensed attorney.</p>
          <p className="mt-1">Forge Compliance Engine · Regulatory Intelligence</p>
        </div>
      </footer>
    </div>
  )
}
