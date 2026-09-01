// app/campaign/boi/page.tsx
// High-conversion campaign landing page for the State Transparency Report Kit
// Target: US business owners with LLCs affected by state transparency acts

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
            STATE TRANSPARENCY DUTIES — NY ENACTED, MORE PROPOSED
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            States Now Want to Know Who <span className="text-forge-accent">Owns Your Company.</span>
          </h1>
          <p className="text-xl text-forge-muted max-w-2xl mx-auto mb-8">
            Federal BOI filing for US domestic companies ended under FinCEN&apos;s 2025 rule —
            and states are filling the gap. New York&apos;s LLC Transparency Act is enacted
            (effective January 1, 2026 for new LLCs), with similar bills proposed elsewhere.
            <strong className="text-white"> Know which duties apply to you before they take effect.</strong>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/boi" className="btn-primary text-lg px-8 py-4">
              Get the State Transparency Kit — $149
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
            <div className="text-3xl font-bold text-white">51</div>
            <div className="text-forge-muted text-sm">US jurisdictions monitored</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-300">2026</div>
            <div className="text-forge-muted text-sm">NY LLCTA effective year</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">2–5</div>
            <div className="text-forge-muted text-sm">Minutes to your snapshot</div>
          </div>
        </div>
      </section>

      {/* WHO THIS APPLIES TO */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Who This Applies To</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: '🏢', title: 'LLCs formed 2024–2026', desc: 'New York\'s LLC Transparency Act applies to newly formed LLCs from January 1, 2026 — existing LLCs follow by January 1, 2027' },
            { icon: '🏗️', title: 'Real Estate Holding Companies', desc: 'LLCs holding property in your name, spouse\'s name, or family trust are squarely in scope of state disclosure regimes' },
            { icon: '💼', title: 'Family-Owned Businesses', desc: 'If two or more family members own portions of a company, each 25%+ owner is typically disclosable under state acts' },
            { icon: '📈', title: 'Companies with New Investors', desc: 'Equity changes usually trigger update duties — state acts generally require disclosure within 30 days of a change' },
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
          <h2 className="text-2xl font-bold text-white mb-10 text-center">3 Steps to Mapped</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Answer the Intake', desc: 'Answer 5 questions about your company and ownership structure. Takes 3 minutes.' },
              { step: '02', title: 'We Map Your Duties', desc: 'We match your entity details to enacted and proposed state transparency acts — with statute citations.' },
              { step: '03', title: 'You Decide and Disclose', desc: 'We deliver the duty map and exact disclosure steps. You make the filings — no middleman.' },
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
              Get Your Transparency Kit — $149
            </Link>
          </div>
        </div>
      </section>

      {/* WHY NOW */}
      <section className="border-t border-forge-border bg-indigo-400/5">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">The Disclosure Frontier Moved to the States</h2>
          <p className="text-forge-muted max-w-2xl mx-auto mb-8">
            When FinCEN&apos;s 2025 interim rule ended federal BOI filing for US domestic companies,
            state legislatures picked up the baton. Duties enacted this year can phase in
            <strong className="text-white"> mid-year</strong> — the kit distinguishes enacted law
            from proposed bills so you know what actually binds you.
          </p>
          <div className="inline-block bg-forge-dark border border-indigo-400/30 rounded-xl px-8 py-6">
            <div className="text-forge-muted text-sm mb-1">First enacted state duty</div>
            <div className="text-4xl font-bold text-indigo-300">NY LLCTA</div>
            <div className="text-forge-muted text-xs mt-1">NY LLC Law § 1106 · phases in from January 1, 2026</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Common Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'What is a beneficial owner?', a: 'Anyone who owns 25%+ of your company OR exercises substantial control over it (CEO, CFO, decision-maker). State acts generally follow this model.' },
            { q: 'Is federal BOI filing still required?', a: 'No for US domestic companies — FinCEN\'s March 2025 interim final rule removed them from the CTA reporting requirement. State-level laws are separate and live.' },
            { q: 'Which states have these laws?', a: 'New York\'s LLC Transparency Act is enacted (phases in from January 1, 2026). Disclosure bills are proposed in other states but not yet law — the kit distinguishes enacted from proposed.' },
            { q: 'Can I track this myself?', a: 'Yes — state legislature sites are public. But tracking enacted vs proposed status across 51 jurisdictions is exactly the grunt work the kit does for you, with citations.' },
            { q: 'Is this legal advice?', a: 'No. This is regulatory intelligence — we help you understand which disclosure duties apply. For legal advice, consult a licensed attorney.' },
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
          <h2 className="text-3xl font-bold text-white mb-4">Know Your Duties Before They Bind.</h2>
          <p className="text-forge-muted mb-8">
            $149 one-time. A statute-cited map of the state transparency duties that apply to your LLC.
          </p>
          <Link href="/boi" className="btn-primary text-lg px-10 py-4">
            Get the Kit — $149
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
