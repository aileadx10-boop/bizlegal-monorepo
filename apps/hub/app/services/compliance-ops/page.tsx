import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Compliance Ops — Managed Service, $2,500/month | BizLegal AI",
  description: "We run your compliance operations 24/7. 8 WAT agents monitoring, scanning, flagging, drafting. Daily Telegram digest. Monthly 1-page status PDF. First 2 weeks free.",
  keywords: ["compliance operations", "managed compliance", "compliance as a service", "compliance retainer", "AI compliance"],
  openGraph: {
    title: "Compliance Ops Retainer — $2,500/month, 8 AI agents",
    description: "Stop chasing compliance. We run it. 24/7 monitoring + scan + flag + draft. 1 human maintains 8 client systems. $2,500/mo. First 2 weeks free.",
    type: "website",
    url: "https://hub.bizlegal-ai.com/services/compliance-ops",
  },
  alternates: { canonical: "https://hub.bizlegal-ai.com/services/compliance-ops" },
}

const AGENTS = [
  { name: "Monitor", job: "24/7 regulatory update scan (FinCEN, EU AI Act, GDPR, state laws)", cycle: "every 15 min" },
  { name: "Update",  job: "Apply regulatory deltas to your compliance matrix", cycle: "daily 02:00 UTC" },
  { name: "Risk",    job: "Run risk-snapshot across your stack + vendors + contracts", cycle: "weekly + on-change" },
  { name: "Outreach",job: "Draft responses to compliance questions from customers/partners", cycle: "on-demand" },
  { name: "Qualify", job: "Score incoming compliance RFPs and vendor questionnaires", cycle: "on-demand" },
  { name: "Invoice", job: "Send compliance-related invoices to your customers (when applicable)", cycle: "monthly" },
  { name: "Content", job: "Publish 1 compliance thought-leadership post/week to your blog", cycle: "weekly" },
  { name: "Audit",   job: "Maintain the compliance evidence ledger; export on demand", cycle: "always-on" },
]

const FAQ = [
  { q: "What does the 8-agent system actually do?", a: "Monitor scans regulatory sources 24/7. Update applies deltas to your compliance matrix. Risk runs a weekly risk-snapshot across your stack + vendors. Outreach drafts responses to compliance questions. Qualify scores incoming RFPs. Invoice handles compliance-related customer billing. Content publishes 1 post/week to your blog. Audit maintains an evidence ledger you can export anytime." },
  { q: "Why $2,500/month?", a: "It's outcome-priced: a single missed regulatory deadline costs $50K-$500K in fines. The agents catch the deltas. A junior compliance analyst doing this same work costs $5-7K/month. A senior compliance consultant costs $15-25K/month. $2,500/mo is the AI-automated equivalent." },
  { q: "What about the setup fee?", a: "First 2 weeks are free (no setup fee). After that, onboarding is a $5K-15K one-time fee depending on your stack complexity (1 source = $5K, 3 sources = $10K, 5+ sources = $15K). Setup covers the 4-week onboarding. After setup, you pay $2,500/mo — month-to-month, cancel anytime." },
  { q: "How is this different from your $40K Custom Build?", a: "The $40K build creates the system for your stack. The $2,500/mo retainer runs it. Most clients do both: build once, then pay the retainer to keep it running. If you already have a compliance stack, the retainer can plug in directly without a build." },
  { q: "Who else sees my compliance data?", a: "Only you. The agents run in a dedicated namespace per client (your own Supabase project, your own Telegram channel, your own Slack workspace). We don't pool data across clients. The setup fee includes a SOC 2 pre-filled questionnaire for your procurement team." },
  { q: "What if the agents miss something?", a: "If a regulatory delta is missed and you get fined within 60 days, we cover up to $5K of the fine. After 60 days, the 24/7 monitor has caught the delta and the agents have applied it. The risk window is real but small." },
  { q: "Why 8 clients and not more?", a: "The system is calibrated to one human maintaining 8 client systems at 12 hours/week of human touch. Beyond 8, the daily review gets skipped and the systems drift. We'd rather run 8 well than 24 poorly." },
  { q: "Can I get a refund?", a: "First 2 weeks are free, no questions asked. After that, month-to-month: cancel anytime, no annual contract, prorated refund for the unused days in the month you cancel." },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-12 text-center">
        <p className="text-sm font-semibold text-emerald-700 mb-3">MANAGED COMPLIANCE OPS · 8 AI AGENTS · 24/7</p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
          We run your compliance<br />for <span className="text-emerald-700">$2,500</span>/month.
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
          8 AI agents monitoring, scanning, flagging, and drafting — around the clock.
          Daily Telegram digest. Monthly 1-page status PDF. <strong>First 2 weeks free.</strong>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="mailto:moses@bizlegal.ai?subject=Compliance%20Ops%20Retainer%20%E2%80%94%20First%202%20Weeks%20Free"
            className="px-8 py-3.5 rounded-md bg-slate-900 text-white font-semibold hover:bg-slate-800">
            Book a 30-min discovery call
          </a>
          <a href="#how-it-works" className="px-8 py-3.5 rounded-md bg-white text-slate-900 font-semibold border border-slate-300 hover:border-slate-400">
            How it works
          </a>
        </div>
        <p className="text-xs text-slate-500 mt-4">$5K-$15K one-time setup · month-to-month after · cancel anytime</p>
      </section>

      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">The 8 agents that run your compliance</h2>
          <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
            Built on the same BizLegal AI platform that powers our 8 internal WAT agents. Each agent is a dedicated Python service that does one job, well, forever.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {AGENTS.map((a) => (
              <div key={a.name} className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{a.name}</h3>
                  <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">{a.cycle}</span>
                </div>
                <p className="text-sm text-slate-600">{a.job}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">4-week onboarding</h2>
        <div className="space-y-6">
          {[
            { week: "Week 1", title: "Discovery", body: "1-hour call: stack walkthrough, data sources, pain points. We connect your Stripe, Slack, Supabase, CRM. Output: 1-page compliance ops spec with the 8 agents mapped to your stack." },
            { week: "Week 2", title: "Config", body: "Configure the 8 agents to your stack. Set compliance frameworks (GDPR / CCPA / SOC 2 / etc). Set the daily Telegram digest destination. Output: first daily digest in your inbox." },
            { week: "Week 3", title: "Shadow", body: "Run the 8 agents in shadow mode (drafts only, no sends). Daily 15-min standup. Output: 21 days of shadow data, 1-page report on what would have been caught." },
            { week: "Week 4", title: "Live + first invoice", body: "Flip shadow to live (with kill-switch). First 7 days: 5-min daily check-in. Day 14: first month-end report. Day 30: first $2,500 invoice via Stripe." },
          ].map((s) => (
            <div key={s.week} className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-20 text-sm font-bold text-emerald-700 pt-1">{s.week}</div>
              <div className="flex-1 border-l-4 border-emerald-200 pl-6 pb-2">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{s.title}</h3>
                <p className="text-sm text-slate-600">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-3">The math most people get wrong</h2>
          <p className="text-slate-300 text-center max-w-2xl mx-auto mb-12">
            8 clients at $2,500/month is the same $20K as 100 clients at $200. With a fraction of the support load, a fraction of the chasing, and a system that compounds.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">100 × $200 (one-time)</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>200 hr/month of delivery + chasing</li>
                <li>$0 recurring revenue</li>
                <li>Support scales linearly with clients</li>
                <li>"Feast or famine" — no compounding</li>
                <li><strong className="text-red-400">You are the system</strong></li>
              </ul>
            </div>
            <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-6">
              <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wide mb-3">8 × $2,500/month (retainer)</h3>
              <ul className="space-y-2 text-sm text-slate-200">
                <li>48 hr/month total (12 hr/week) of human touch</li>
                <li>$20,000 recurring revenue (compounds)</li>
                <li>Support = 5% of clients' questions (handled by agents)</li>
                <li>"Smooth and predictable" — you sleep, revenue continues</li>
                <li><strong className="text-emerald-300">THE MACHINE is the system; you maintain it</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">FAQ</h2>
        <div className="space-y-6">
          {FAQ.map((f) => (
            <details key={f.q} className="border-b border-slate-200 pb-4">
              <summary className="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between">
                <span>{f.q}</span>
                <span className="text-slate-400 text-xl">+</span>
              </summary>
              <p className="text-sm text-slate-600 mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to stop chasing compliance?</h2>
        <p className="text-slate-600 mb-8">First 2 weeks free. Setup is $5K-$15K one-time. Then $2,500/month, month-to-month, cancel anytime.</p>
        <a href="mailto:moses@bizlegal.ai?subject=Compliance%20Ops%20Retainer%20%E2%80%94%20First%202%20Weeks%20Free"
          className="inline-block px-10 py-4 rounded-md bg-slate-900 text-white font-bold text-lg hover:bg-slate-800">
          Book a 30-min discovery call
        </a>
        <p className="text-xs text-slate-500 mt-4">Or fill in the qualifier chat on the hub home for a self-serve 60-second assessment.</p>
      </section>
    </div>
  )
}
