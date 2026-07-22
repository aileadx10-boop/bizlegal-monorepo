import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Venture Capital Term Sheet Guide (2025): Liquidation Preference, Anti-Dilution, Pro-Rata, Drag-Along | BizLegal AI',
  description: 'Understanding your VC term sheet: 1× non-participating vs 2× participating liquidation preferences, broad-based weighted-average vs full-ratchet anti-dilution, pro-rata rights, drag-along thresholds, information rights, ROFR/co-sale mechanics, and the provisions founders give away too cheaply.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/venture-capital-term-sheet-guide' },
  openGraph: {
    title: 'Venture Capital Term Sheet Guide (2025) — BizLegal AI',
    description: 'Liquidation preference stacks, participating vs non-participating preferred, anti-dilution mechanics, pro-rata rights, drag-along provisions, and the term sheet clauses that most founders fail to negotiate.',
    url: 'https://bizlegal-ai.com/guides/venture-capital-term-sheet-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What is a liquidation preference and what is the difference between participating and non-participating preferred?',
    a: 'A liquidation preference gives preferred stockholders priority over common stockholders in receiving proceeds when a company is sold, merged, or liquidated. Understanding liquidation preferences is critical because in the most common acquisition scenarios — especially below or near the post-money valuation — founders and common stockholders receive nothing until preferred holders are paid out first. Non-participating preferred (also called "plain preferred" or "straight preferred"): the preferred stockholder receives either (a) their liquidation preference amount OR (b) converts to common and participates pro-rata in the entire proceeds — whichever is higher. This is more founder-friendly because at high exit multiples, preferred converts to common and everyone participates proportionately. Example: 1× non-participating preferred on a $5M investment. At $10M acquisition: preferred holders get $5M (preference) or convert to 40% of $10M = $4M — they choose the preference ($5M). At $20M acquisition: preferred holders choose between $5M or convert to 40% of $20M = $8M — they convert. Participating preferred (also called "double-dip preferred"): the preferred stockholder receives BOTH (a) their liquidation preference AND (b) participates pro-rata in the remaining proceeds alongside common. This is significantly more investor-favorable. Example: 1× participating preferred on a $5M investment. At $10M acquisition: preferred gets $5M preference first, then participates in remaining $5M as if converted = $5M + (40% × $5M) = $7M. Common gets only $3M out of a $10M exit. Uncapped participating (no cap) vs capped participating: some term sheets include a "participation cap" — the preferred holder participates until they have received 3× or 5× their investment, then converts to common. Uncapped participating preferred is extremely investor-favorable and should be negotiated aggressively. Liquidation preference multiples: the multiple (1×, 1.5×, 2×, 3×) affects how much preferred takes before common sees anything. 1× is market-standard for Series A/B. Higher multiples (2×+) were common in down markets and in venture debt conversions — they are red flags that significantly burden the common. Stacking: in a company with multiple rounds (Seed, Series A, Series B), each round typically has its own liquidation preference. The preferences stack — Series B pays first, then Series A, then Seed, then common. In a down-round acquisition, multiple stacked preferences can leave common stockholders (including founders) with $0. Example: Series B invested $20M at 1× non-participating. Series A invested $10M at 1× non-participating. Seed invested $2M at 1× non-participating. Total preference stack: $32M. In a $25M acquisition, founders receive $0 despite owning 30% of the company.',
  },
  {
    q: 'What is anti-dilution protection and what is the difference between broad-based weighted average, narrow-based, and full-ratchet?',
    a: 'Anti-dilution provisions protect preferred stockholders from dilution when a company raises a future funding round at a lower per-share price (a "down round"). They work by adjusting the conversion ratio of preferred shares — increasing the number of common shares that preferred converts into, effectively reducing the price the investor paid retroactively. Without anti-dilution, an investor who paid $5/share in Series A and saw a Series B at $2.50/share would simply hold devalued shares — the anti-dilution adjustment is the mechanism to protect them. Full ratchet anti-dilution: the most extreme form. The preferred conversion price is adjusted to match the lowest price of any subsequent share issuance in a down round, regardless of the number of shares issued. Example: Series A conversion price = $5.00. Down round at $2.50 for 1,000 shares. Full ratchet adjusts Series A conversion price to $2.50 — even if only 1 share was issued in the down round. Full ratchet is extremely punitive to common stockholders and founders. In severe down rounds, it can result in massive dilution of common and trigger "pay-to-play" provisions. Rarely negotiated in founder-friendly deals. Broad-based weighted average: the market standard for Series A and later rounds. The new conversion price is adjusted based on a weighted average of all shares outstanding (including options, warrants, and convertible instruments) against the amount and price of the new issuance. Formula: CP2 = CP1 × (A + B) / (A + C) where CP1 = old conversion price, A = shares outstanding before new issuance (broad-based: include ALL dilutive securities), B = aggregate consideration for new shares / CP1, C = number of new shares issued. Because it uses the fully-diluted share count (including options pool), the dilutive impact of any single down round is spread across a large denominator — the adjustment to the conversion price is much smaller than full ratchet. Narrow-based weighted average: same formula, but A counts only preferred shares (not options, warrants, or other dilutive securities). Because the denominator is smaller, the price adjustment is larger than broad-based — more protective for investors, more dilutive for founders. Why this matters in down rounds: in a significant down round, broad-based anti-dilution means founders and common holders are diluted but survive with meaningful equity. Full-ratchet anti-dilution in a severe down round can wipe out founders\' economic interest entirely. Pay-to-play: often accompanies anti-dilution provisions. If a preferred holder does NOT participate in a down round pro-rata, they lose anti-dilution protection (their preferred converts to common automatically). Pay-to-play pressures existing investors to participate in down rounds. Carve-outs from anti-dilution: most anti-dilution provisions exclude certain issuances from triggering adjustment — options pool, employee grants, strategic partnerships, equipment leases. These carve-outs are heavily negotiated.',
  },
  {
    q: 'What are pro-rata rights, major investor pro-rata rights, and super pro-rata rights, and when do they matter?',
    a: 'Pro-rata rights (also called preemptive rights or participation rights) give investors the right to participate in future funding rounds to maintain their ownership percentage. Without pro-rata rights, an early-stage investor who owns 20% of a company gets diluted every subsequent round. Pro-rata rights let them invest their "pro-rata share" (enough to maintain 20%) in each new round. Standard pro-rata rights: the right to purchase up to the investor\'s pro-rata share of new securities in any future financing round. This applies to all investors with pro-rata rights, typically at the preferred stock price in each new round. Major investor pro-rata rights: a more exclusive version, available only to investors above a threshold (e.g., investors with $500K+ invested, or investors holding 1%+ of the fully diluted capitalization). Major investor status is common for lead investors in early rounds. Key point: pro-rata rights are exercised at the NEW round\'s price — not the investor\'s original price. An investor with pro-rata rights must write a new check at the Series B price to maintain their Series A percentage. Super pro-rata rights: a negotiated right that goes beyond standard pro-rata — the investor can purchase MORE than their percentage would dictate in a future round (e.g., 2× their pro-rata share). Super pro-rata rights are extremely favorable to investors and can prevent a company from running a clean process (because they effectively force the lead in a new round to allocate more of the round to existing investors). When pro-rata matters: (a) in successful companies, pro-rata rights are valuable — lead VCs fight to exercise them to maintain ownership in winners; (b) in less successful companies, pro-rata is exercised rarely; (c) from the founder\'s perspective, pro-rata rights in every round can significantly complicate the allocation process for new lead investors, who typically want to own 15-25% and may be unable to do so if all existing investors exercise pro-rata. Information rights and pro-rata: standard information rights (board meeting access, financial statements, annual budgets) are often tied to major investor status — the same threshold that grants pro-rata rights. When investors fall below major investor status (due to share transfers or dilution), they can lose both information rights and pro-rata simultaneously. Right of first refusal (ROFR) vs pro-rata rights: ROFR is the right to purchase shares being sold by OTHER stockholders (secondary sales). Pro-rata is the right to participate in NEW issuances. These are different rights and operate on different triggers.',
  },
  {
    q: 'What is a drag-along provision and how does it affect founders\'s ability to sell the company?',
    a: 'A drag-along right (also called drag-along agreement) gives a defined majority of stockholders the right to compel all other stockholders to vote in favor of, and participate in, a sale of the company on the same terms. Without drag-along rights, a minority stockholder (a disgruntled former co-founder, an angel investor, a small Series A participant) could block an acquisition that the majority of stockholders — including the founders and lead investors — want to approve. Drag-along mechanics: the standard drag-along requires three approvals before it can be triggered: (1) majority of the Board of Directors; (2) majority of the preferred stockholders (voting as a class); and (3) majority of the common stockholders (or a defined percentage — often 50%+ or sometimes founders specifically). The three-party requirement means no single group (investors alone or founders alone) can force a sale over the objection of the other two groups. Negotiation points: (a) Threshold for drag: lower thresholds (simple majority) make the drag easier to trigger. Higher thresholds (super-majority 67% or 75%) give minority holders more blocking power. (b) Required approvals: who must consent? Some term sheets require only investor majority + board. Others require founder consent as well. Founder consent in the drag-along provision is a significant founder protection — it prevents investors from forcing a sale the founder doesn\'t want. (c) Price floor: some drag-alongs include a minimum price floor — the drag cannot be invoked unless the per-share consideration equals at least $X (the original investment price, or a defined multiple). (d) Carve-outs: common carve-outs from drag-along include (i) any transaction where founders would receive less than $Y per share; (ii) any transaction with a related party of the investor; (iii) any transaction structured as an asset sale vs stock sale. Common founder mistakes with drag-along: (a) Not negotiating the "common stockholder consent" requirement — without it, investors can force a low-priced acquisition that wipes out common while preferred gets their liquidation preference; (b) Not requiring a price floor — allowing drag invocation in any sale price; (c) Agreeing to a drag triggered by investor majority + board alone, without founder or common consent. Drag-along and preferred stock: investors often have both drag-along rights AND liquidation preferences. In a drag-along sale, the liquidation preference stack still applies. So investors can drag founders into a sale AND ensure they take the vast majority of proceeds through their liquidation preference. This is why both drag-along threshold and liquidation preference structure must be negotiated together.',
  },
  {
    q: 'What are the term sheet provisions founders most commonly fail to negotiate, and what should they push back on?',
    a: 'Based on common patterns in early-stage financings, here are the provisions founders give away too cheaply and the pushback that is reasonable to expect in a competitive deal: (1) Participating preferred vs non-participating: always push for non-participating (or at minimum, capped participation at 2-3× return). Uncapped participating preferred significantly reduces founder economics in all but the largest exits. The vast majority of venture-backed startup exits are acquisitions below the most recent valuation — participating preferred has real bite. (2) Option pool shuffle: investors propose a large option pool (15-20%) that must be created BEFORE the investment, increasing the pre-money dilution borne entirely by founders. Push back: propose a smaller option pool based on a 12-month hiring plan. Negotiate the option pool creation AFTER the investment. (3) Board composition: most Series A term sheets propose a 5-member board (2 founders, 2 investors, 1 independent). Founders often give away more control than necessary. Push back: consider a 3-member board (1 founder, 1 investor, 1 independent), especially at seed stage. Ensure the "independent" director selection is jointly approved (not solely by investors). (4) Founder vesting acceleration: standard term sheets include reverse-vesting on founder shares (4-year vest, 1-year cliff) with no acceleration on acquisition. Push back: negotiate single-trigger acceleration (25-50% accelerates on acquisition regardless of termination) or double-trigger acceleration (acceleration if acquired AND terminated within 12 months). (5) Protective provisions / voting rights: investors commonly request veto rights over a broad list of actions (new equity issuances, debt above a threshold, acquisitions, changes to business, budget approval). Push back: narrow the list to material decisions. Dollar thresholds for debt approval should be realistic for the company\'s stage. Acquisitions below a certain value should not require investor approval. (6) Information rights: standard quarterly financials + annual audited accounts + annual budget are reasonable. Push back on investor requests for monthly financials (operational burden) or management rights letters (which can affect qualified small business stock status). (7) Redemption rights: increasingly rare but occasionally seen in term sheets — preferred stockholders can demand the company redeem their shares after a specified period (5-7 years) if no liquidity event occurs. This effectively gives investors a "put option" on the company. Strongly resist redemption rights — they can force a distressed sale or bankruptcy. (8) No-shop provision duration: no-shop clauses (prohibiting the company from discussing alternatives for 30-60 days while the term sheet is finalized) are standard. Push back on no-shop periods longer than 30 days. Ensure the no-shop terminates if the investor fails to deliver a final definitive agreement.',
  },
  {
    q: 'What documents are signed at closing after the term sheet, and what is the legal significance of each?',
    a: 'A term sheet is almost always non-binding (except for the no-shop and confidentiality provisions). The binding legal agreements are the definitive documents signed at closing — typically 4-6 documents for a Series A. Stock Purchase Agreement (SPA): the primary agreement governing the sale of shares from the company to investors. Specifies: number of shares, price per share, aggregate consideration, representations and warranties of the company (founding, capitalization, IP ownership, material contracts, no litigation, financial statements), closing conditions, indemnification provisions, and bring-down certificates. The reps and warranties in the SPA are critical — breaches can give investors indemnification claims against the company or founders. Investors\' Rights Agreement (IRA): governs investors\' ongoing rights post-closing. Contains: registration rights (demand registration, piggyback registration, S-3 registration — rights to force an IPO registration or participate in a company-initiated one), information rights, right of first offer on future financings, and lock-up provisions in an IPO. Registration rights can matter significantly at IPO — demand registration rights let major investors force the company to register their shares at IPO, which affects the IPO underwriting structure. Voting Agreement: governs how stockholders vote on certain matters. Contains: board composition (who nominates which directors), drag-along rights, and often a "key holder agreement" specifying how founders must vote their shares. Right of First Refusal and Co-Sale Agreement (ROFR/Co-Sale): (a) Right of First Refusal (ROFR): before a founder or key holder can sell shares to a third party, the company (and then investors) have the first right to purchase those shares on the same terms. (b) Co-Sale Right (Tag-Along): if a founder sells shares to a third party and the company/investors decline to exercise ROFR, investors have the right to "tag along" and sell a pro-rata portion of their shares to the same buyer on the same terms. These rights significantly restrict founders\' ability to do secondary sales. They can be waived — investors often waive ROFR/co-sale selectively for employee secondary transactions. Certificate of Incorporation / Certificate of Designation: the company\'s articles of incorporation are amended to create the new class of preferred stock with all the liquidation preference, anti-dilution, voting rights, and other terms negotiated in the term sheet. The Certificate is filed with the state (typically Delaware Secretary of State) and is a public document. Management Rights Letter (MRL): a letter agreement giving investors (typically VC funds) "management rights" — the right to attend board meetings as observers, consult with management, and inspect books and records. Management rights letters are required for VC funds to qualify for SBIC or venture capital operating company (VCOC) status for ERISA purposes. Important: having a management rights letter can affect a company\'s QSBS eligibility under certain circumstances — check with counsel.',
  },
]

export default function VCTermSheetGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Venture Capital Term Sheet Guide (2025): Liquidation Preference, Anti-Dilution, Pro-Rata, Drag-Along',
    description: 'Understanding VC term sheets: liquidation preference structures, anti-dilution mechanics, pro-rata rights, drag-along provisions, and the closing documents for Series A financings.',
    url: 'https://bizlegal-ai.com/guides/venture-capital-term-sheet-guide',
    publisher: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    author: { '@type': 'Organization', name: 'BizLegal AI' },
    inLanguage: 'en-US',
    datePublished: '2026-01-01',
    dateModified: '2026-07-22',
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://bizlegal-ai.com/guides' },
      { '@type': 'ListItem', position: 3, name: 'VC Term Sheet Guide', item: 'https://bizlegal-ai.com/guides/venture-capital-term-sheet-guide' },
    ],
  }

  const LIQUIDATION_PREFS = [
    {
      type: '1× Non-Participating',
      mechanism: 'Gets $1 back per $1 invested (or converts to common) — whichever is higher',
      founderImpact: 'Favorable — preferred converts at high exits, founders participate fully',
      investorImpact: 'Standard — investors protected on downside, participate on upside via conversion',
      marketStandard: '✅ Series A market standard',
    },
    {
      type: '1× Participating (Uncapped)',
      mechanism: 'Gets $1 back PLUS participates in remaining proceeds pro-rata as common',
      founderImpact: 'Significant dilution — preferred "double-dips" at every exit level',
      investorImpact: 'Favorable — maximum participation; takes ~40-60% more than non-participating at mid-range exits',
      marketStandard: '⚠️ Negotiate against — push for non-participating or participation cap',
    },
    {
      type: '1× Participating (3× Cap)',
      mechanism: 'Participates until total return = 3× investment, then converts to common',
      founderImpact: 'Moderate — at large exits (>3× valuation), preferred converts and dilution is symmetric',
      investorImpact: 'Balanced — protected on downside and mid-range; capped at large exits',
      marketStandard: '🟡 Compromise outcome — better than uncapped, worse than non-participating',
    },
    {
      type: '2× Non-Participating',
      mechanism: 'Gets $2 back per $1 invested (or converts) — whichever is higher',
      founderImpact: 'Significant in sub-2× exits; at large exits converts and participates normally',
      investorImpact: 'Strong downside protection; return of 2× before common sees anything',
      marketStandard: '🔴 Red flag — typical in down rounds, bridge notes, or distressed financings',
    },
    {
      type: '2× Participating (Uncapped)',
      mechanism: 'Gets 2× back PLUS participates in remaining proceeds — the most investor-favorable structure',
      founderImpact: 'Extremely dilutive — common often receives minimal proceeds even in successful exits',
      investorImpact: 'Maximum protection and participation',
      marketStandard: '🔴 Very aggressive — should be strongly resisted; typical of predatory bridge terms',
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        <nav style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'inherit' }}>Home</a>
          {' → '}
          <a href="/guides" style={{ color: 'inherit' }}>Guides</a>
          {' → '}
          VC Term Sheet Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Startup Law
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Venture Capital Term Sheet Guide (2025): Liquidation Preferences, Anti-Dilution, Pro-Rata Rights, and Drag-Along Provisions
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          A term sheet from a venture fund looks deceptively simple — a few pages, no binding effect (mostly). But the economic terms it contains — liquidation preferences, anti-dilution protections, and drag-along thresholds — will define who actually benefits when the company is eventually sold. Most founders negotiate on valuation and miss the provisions that matter more in the median exit scenario.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Liquidation Preference Structures: Founder Impact Comparison</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: '580px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Structure</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>How It Works</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Founder Impact</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Market Standard?</th>
                </tr>
              </thead>
              <tbody>
                {LIQUIDATION_PREFS.map(({ type, mechanism, founderImpact, marketStandard }) => (
                  <tr key={type} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: '0.8rem', verticalAlign: 'top', minWidth: '160px' }}>{type}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.76rem', verticalAlign: 'top' }}>{mechanism}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.76rem', verticalAlign: 'top' }}>{founderImpact}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.76rem', verticalAlign: 'top' }}>{marketStandard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.82rem', opacity: 0.65, lineHeight: 1.6, marginBottom: 0 }}>
            The most important number: in 2024, the median venture-backed startup acquisition was at approximately 2–3× the post-money valuation of the most recent round (when acquired at all). Participating preferred is most punitive precisely at these median exit multiples — not at the 10× or 20× scenarios founders imagine.
          </p>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Term Sheet or Shareholder Agreement</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your term sheet, shareholder agreement, or existing investment documents. BizLegal AI identifies participating vs non-participating preferred structures, anti-dilution mechanisms (full-ratchet vs weighted average vs narrow-based), drag-along thresholds and required consents, option pool shuffle provisions, founder vesting acceleration carve-outs, and board composition provisions that affect founder control.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Term Sheet →
          </a>
        </div>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem' }}>Frequently Asked Questions</h2>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: i < FAQS.length - 1 ? '1px solid var(--color-border, #e5e7eb)' : 'none' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.4 }}>{faq.q}</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.75, opacity: 0.85, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </section>

        <div style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '2rem', marginTop: '2rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem' }}>Related compliance resources</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link href="/guides/equity-compensation-guide-startups" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Equity Compensation Guide →</Link>
            <Link href="/guides/startup-compliance-program-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Startup Compliance Program →</Link>
            <Link href="/guides/ip-assignment-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>IP Assignment Guide →</Link>
            <Link href="/guides/startup-employment-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Employment Agreement Guide →</Link>
            <Link href="/guides/nda-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>NDA Review Guide →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. Venture capital financing terms, securities laws, and market practice evolve rapidly and vary significantly by stage, geography, and market conditions. All figures (investment thresholds, conversion ratios, option pool percentages) are illustrative examples for educational purposes only. Consult qualified legal counsel before signing any term sheet or definitive investment document.
          </p>
        </footer>

      </main>
    </>
  )
}
