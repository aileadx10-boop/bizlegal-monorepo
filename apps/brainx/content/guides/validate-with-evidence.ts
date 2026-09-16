import type { Guide } from './types'

export const GUIDE: Guide = {
  slug: 'validate-a-legal-tech-idea-with-evidence',
  title: 'How to Validate a Legal-Tech Product Idea With Evidence, Not Vibes',
  description: 'A practical method for testing a legal-tech or compliance-software idea against real sources before you build anything — the same method behind every BrainX opportunity.',
  publishedAt: '2026-09-16',
  paragraphs: [
    "Most legal-tech and compliance-software ideas die for a boring reason: nobody checked whether the underlying premise was still true. A founder reads a headline about a new rule, assumes the pain is durable, and starts building before confirming three things — that the rule is actually in force, that a specific buyer is actually affected, and that the buyer has actually said, in public, that this is a problem worth paying to solve. Skipping any one of the three produces a product built on a guess.",
    "The fix is not more research volume. It is a four-step sequence, in order, with a hard stop at each step if the evidence does not hold up: scan, connect, validate, build. This is the same sequence BrainX runs on every opportunity in its radar, and it works the same way whether you run it by hand over a weekend or as a standing weekly process.",
    "Scan means reading primary sources, not secondary commentary, first. If a rule change is the premise, go to the regulator's own page before reading a law firm's client alert about it. FinCEN's own FAQ page on the Residential Real Estate Rule, for example, states plainly that a federal court vacated the rule on March 19, 2026 and that reporting persons are not currently required to file — a fact that changes the entire shape of any product built on 'title companies must comply with the new FinCEN rule.' A founder who only read the March 2026 law-firm alerts announcing the rule's original effective date, without checking the regulator's own page a few weeks later, would have built the wrong product.",
    "Connect means looking for where the pain, the money, and the regulatory pressure actually intersect — not just where a rule changed, but where a rule changed for a buyer who is identifiable, reachable, and already spending money adjacent to the problem. The National Association of REALTORS' own January 2026 summary of professional-standards changes narrowed a disclosure requirement under Article 7; that is a real, dated change. But the connect step asks a harder question: is there a specific, reachable buyer — a brokerage compliance department, a franchise legal team — who has said this materially affects their workflow? If the honest answer is 'not yet, but it plausibly does,' the opportunity is a watch, not a build.",
    "Validate is where most ideas should die, and that is the point. An opportunity needs at least three independently verifiable sources before it is taken seriously, spanning more than one kind of evidence: a regulatory source confirming the rule or deadline, plus at least one of a demand signal (a job posting, a trade-association resource, a law firm publishing detailed guidance because clients are asking), a customer-voice signal (a real, quoted question or complaint), or a competitor signal (someone already selling into the gap). ABA Formal Opinion 512, issued July 29, 2024, is a clean example of a stable regulatory anchor: it has not been walked back, nine states have layered their own guidance on top of it as of 2026, and a state bar association's own January 2026 post ('Beyond the Ban: Why Your Law Firm Needs a Realistic AI Policy in 2026') is a demand signal from the buyer's own professional association, not from a vendor with something to sell.",
    "Build is the only step that should produce a monetizable artifact — an offer, a buyer profile, a deliverable, and a pricing hypothesis, explicitly labelled a hypothesis rather than a confirmed price point. Skipping straight to build without the first three steps is how a founder ends up with a beautifully designed product nobody asked for, built on a regulatory premise that changed three weeks after launch.",
    "The discipline that makes this method work is refusing to publish an opportunity, or build a product on top of one, without the sources attached. 'No evidence, no opportunity' is not a slogan — it is what keeps a research process honest when the person doing the research is also the person who wants the idea to be true.",
  ],
  citations: [
    { title: 'Residential Real Estate Frequently Asked Questions', url: 'https://www.fincen.gov/rre-faqs', publisher: 'FinCEN (U.S. Department of the Treasury)' },
    { title: '2026 Summary of Key Professional Standards Changes', url: 'https://www.nar.realtor/about-nar/policies/2026-summary-of-key-professional-standards-changes', publisher: 'National Association of REALTORS®' },
    { title: 'Generative Artificial Intelligence Tools: ABA Formal Opinion 512 Provides Needed Guidance', url: 'https://thebarexaminer.ncbex.org/article/fall-2024/generative-artificial-intelligence-tools/', publisher: 'National Conference of Bar Examiners' },
    { title: 'Beyond the Ban: Why Your Law Firm Needs a Realistic AI Policy in 2026', url: 'https://www.ncbar.org/2026/01/13/beyond-the-ban-why-your-law-firm-needs-a-realistic-ai-policy-in-2026/', publisher: 'North Carolina Bar Association' },
  ],
  faqs: [
    { q: 'What counts as "evidence" for an opportunity?', a: 'A source a human can open and verify: a regulator’s own page or filing, a dated news article, a job posting, a trade-association resource, or a verbatim quote from a real forum or review. Not a summary you wrote from memory.' },
    { q: 'How many sources are enough?', a: 'BrainX’s own gate is a minimum of three, spanning at least two evidence kinds (regulatory, demand, customer voice, or competitor). One source is an anecdote; three independent ones, of different kinds, start to look like a pattern.' },
    { q: 'What if the regulatory picture changes after I’ve built something?', a: 'It will, sometimes — the FinCEN example above is the clearest case in this guide. That is exactly why the scan step checks the regulator’s own current page, not a point-in-time announcement, and why a durable opportunity should not depend entirely on one rule staying exactly as written.' },
    { q: 'Does this replace legal advice?', a: 'No. This is a research method for deciding what to build, not legal advice on whether a specific product or claim is compliant. See the disclaimer linked below.' },
  ],
  internalLinks: [
    { label: 'See a real opportunity built this way', href: '/sample' },
    { label: 'How BrainX scores an opportunity', href: '/#score' },
    { label: 'Compliance software opportunities in 2026 rule changes', href: '/guides/compliance-software-opportunities-from-rule-changes' },
    { label: 'Real estate compliance signals worth tracking', href: '/guides/real-estate-compliance-product-signals' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Disclaimer', href: '/disclaimer' },
  ],
}
