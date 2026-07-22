import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Equity Compensation Guide for Startups (2025): ISO vs NSO, 409A, QSBS, 83(b) Election | BizLegal AI',
  description: 'Incentive Stock Options (ISO) vs. Non-Qualified Stock Options (NSO), 409A valuation requirements, QSBS Section 1202 exclusion ($10M gain), 83(b) election window (30 days), and the equity compensation plan provisions that determine your tax outcome at exit.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/equity-compensation-guide-startups' },
  openGraph: {
    title: 'Equity Compensation Guide for Startups — BizLegal AI',
    description: 'ISO vs NSO tax treatment, 409A safe harbor valuations, QSBS $10M gain exclusion, 83(b) election, and the cliff/vesting provisions every startup employee should understand before signing an option agreement.',
    url: 'https://bizlegal-ai.com/guides/equity-compensation-guide-startups',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What is the difference between Incentive Stock Options (ISOs) and Non-Qualified Stock Options (NSOs)?',
    a: 'Incentive Stock Options (ISOs) and Non-Qualified Stock Options (NSOs) are the two primary forms of stock option grants in US startup equity compensation. The key difference is tax treatment: ISOs: (1) No ordinary income tax at grant; (2) No ordinary income tax at exercise (but the spread — the difference between exercise price and fair market value — is an Alternative Minimum Tax (AMT) preference item at exercise); (3) If the employee satisfies the holding period requirements (holds the shares for at least 2 years after the grant date AND at least 1 year after the exercise date), the entire gain at sale is taxed at long-term capital gains rates (currently 0%, 15%, or 20% depending on income level, plus 3.8% Net Investment Income Tax above certain thresholds). This is the key ISO tax advantage — converting what would otherwise be ordinary income into long-term capital gains. (4) ISO disqualifying dispositions: if the employee sells or transfers shares before meeting the holding period, the spread at exercise becomes ordinary income (not capital gains). This is called a "disqualifying disposition." NSOs (also called NQSOs): (1) No ordinary income tax at grant; (2) Ordinary income tax at exercise on the full spread (exercise price minus FMV at exercise date); (3) Any subsequent appreciation after exercise is capital gain (long-term if held >1 year, short-term if sold within 1 year of exercise). WHO CAN RECEIVE EACH: ISOs can only be granted to employees — contractors, consultants, and advisors cannot receive ISOs. NSOs can be granted to employees, contractors, board members, advisors, and any other service providers. ISO $100K annual limit: there is an annual limit of $100K in ISO value (measured by the exercise price, not FMV) that can first become exercisable in any calendar year. Options above this limit automatically convert to NSOs for the excess. This is a common issue for high-option-grant executives. For founders with restricted stock (not options), this ISO/NSO distinction doesn\'t apply — restricted stock grants have their own tax treatment (see 83(b) election below). Tax planning note: for early-exercise ISOs (allowed under some plans), employees can exercise ISOs at a very low FMV spread (ideally immediately after grant when FMV ≈ exercise price) to start the holding period clock early and potentially minimize or eliminate AMT.',
  },
  {
    q: 'What is a 409A valuation and why is it required for stock option grants?',
    a: 'A 409A valuation is an independent appraisal of the fair market value (FMV) of the common stock of a private company, required by the IRS to set the exercise price of stock options at no less than FMV. Section 409A of the Internal Revenue Code imposes severe penalties — 20% additional tax plus interest from the year the option vested — on "deferred compensation" arrangements, and stock options with exercise prices below FMV at grant are treated as deferred compensation subject to Section 409A. By obtaining a 409A valuation from a qualified independent appraiser and setting the exercise price at or above the appraised FMV, the company obtains a "safe harbor" from Section 409A — meaning the IRS will presume the valuation is correct unless it can demonstrate the valuation is "grossly unreasonable." Why 409A matters for startups: (1) Option recipients: if options are granted with an exercise price below FMV (a "discount" option), the option holder owes additional tax (20% penalty + interest) even before exercise, simply because the option vested. This is economically catastrophic for employees. (2) For companies: incorrect 409A valuations expose the company to IRS scrutiny and can create significant tax liability for both option holders and, in some cases, the company. (3) For investors: 409A compliance failures discovered in due diligence can delay or derail financing rounds. When 409A valuations are required: (a) before granting any stock options (or immediately after if options are urgently needed); (b) upon material events that may affect FMV: new financing round (typically requires a new 409A), material changes to company valuation (major new customer, partnership, product launch), and passage of time (409A valuations are generally considered reliable for 12 months, or until a material event triggers a revaluation). How 409A valuations are conducted: independent appraisers (often specialized firms like Carta, Shareworks, or boutique valuation firms) use accepted methods: (a) the Option Pricing Method (OPM) — allocates value across the capital structure using Black-Scholes analysis, appropriate when exit is distant and uncertain; (b) the Probability-Weighted Expected Return Method (PWERM) — models multiple exit scenarios and probability-weights them, appropriate for companies closer to exit. Venture-backed companies at early stages typically have a significant discount between preferred stock price and common stock FMV (often 10-33% of the last preferred price) because preferred stock carries liquidation preferences that reduce common stock value.',
  },
  {
    q: 'What is the 83(b) election and why is the 30-day window critical?',
    a: 'An 83(b) election is a tax election under IRC Section 83(b) that allows a recipient of property subject to vesting (including restricted stock, early-exercised stock options, and LLC membership interests) to pay tax on the fair market value of the property at the time of grant rather than as the property vests over time. The 30-day window: the election must be filed with the IRS within 30 calendar days of receiving the property (the grant date). This deadline is absolute — there are no extensions, no exceptions, and no relief for late filing under current IRS guidance. Missing the window permanently forecloses the ability to make the election for that grant. Why this matters economically: Example — A co-founder receives 1,000,000 shares of restricted stock subject to a 4-year vesting schedule. At grant, the shares are worth $0.0001/share (immediately after incorporation, near-zero FMV). Without an 83(b) election: as shares vest (typically 25%/year), the founder recognizes ordinary income on the then-current FMV of vested shares. If the company is worth $10M at the first anniversary vesting cliff (250,000 shares vest), the founder owes ordinary income tax on $250,000 of income — even without selling a share. If the company grows further, later vesting tranches could trigger enormous ordinary income tax events. With an 83(b) election: the founder elects to recognize all income at grant — when FMV ≈ $0. Tax owed on the entire grant: approximately $0. All future appreciation, from the election date, is capital gain. If the company is eventually sold for $100M, the entire gain is long-term capital gain (assuming held >1 year). Who should file: (1) Founders receiving restricted stock at formation — almost universally should file; (2) Employees who early-exercise stock options (some plans allow exercising unvested options, which triggers 83(b) because shares are still subject to vesting after exercise); (3) Contractors or advisors receiving equity grants subject to vesting. How to file: the election is a letter to the IRS containing: the taxpayer\'s name, address, and SSN; description of the property; the date of transfer; the taxable year of transfer; the FMV at transfer; the consideration paid; and any restriction on the property. Submit by certified mail (retain proof) to the IRS service center where the taxpayer files returns. Some attorneys recommend also filing a copy with the company and retaining a copy in the taxpayer\'s records. No IRS confirmation is issued — the receipt copy of the certified mail submission is the only evidence.',
  },
  {
    q: 'What is QSBS (Qualified Small Business Stock) and how does the Section 1202 exclusion work?',
    a: 'Qualified Small Business Stock (QSBS) is stock of a Qualified Small Business Corporation (QSB) that, if held for more than 5 years, may qualify for a partial or complete federal income tax exclusion on gain at sale under Internal Revenue Code Section 1202. The Section 1202 exclusion: for QSBS acquired after September 27, 2010 (which covers essentially all current startup equity issued since then), the exclusion is 100% of the gain on qualified stock, up to the GREATER of $10 million or 10 times the taxpayer\'s adjusted basis in the stock. This means: if you invest $1M in QSBS (your basis = $1M), and the stock is later worth $12M, the $10M exclusion applies to the first $10M of gain. The additional $2M of gain above the exclusion is taxable. But if your gain is exactly $10M or less, 100% of the gain is excluded from federal income tax. State tax: California and some other states do not conform to the Section 1202 exclusion — California taxes QSBS gain at the California long-term capital gains rate (same as ordinary income, 13.3% at top bracket) regardless of federal exclusion. Requirements for QSBS eligibility — both the company and the shareholder must meet conditions: Company requirements: (a) the company must be a domestic C-corporation at the time of issuance (not S-corp, LLC, or LP); (b) gross assets of the corporation must not exceed $50M immediately before and after issuance; (c) the corporation must be an active business in a qualified trade or business — most tech/software companies qualify, but service businesses (finance, professional services, law, health, hospitality, hotels, restaurants, farming) are excluded; (d) at least 80% of assets (by value) must be used in a qualified active business. Shareholder requirements: (a) must acquire the stock at original issue (not in a secondary market purchase); (b) must be a non-corporate taxpayer (individuals qualify; partnerships, S-corps, and most trusts pass through QSBS status to partners; C-corporations do NOT qualify); (c) must hold the stock for more than 5 years (the holding period begins at issuance for original purchases). Stock option holders: employees who receive stock options do not hold QSBS during the option period. The QSBS holding period starts when the option is exercised (when shares are actually issued). Early exercise strategies allow the 5-year holding period to start earlier. Stacking: founders and early investors with multiple lots of QSBS can each claim their own $10M exclusion. Transferability: QSBS treatment is generally preserved when QSBS stock is gifted to a spouse, transferred to an LLC taxed as a partnership for QSBS holders, or transferred at death — each transferee gets their own $10M exclusion. Important planning note: companies should include QSBS representations in their equity compensation plan and document satisfaction of QSBS requirements at each issuance. Companies that convert from LLC to C-corp and then issue stock do not get credit for the LLC operating period toward the $50M asset test at the time of the LLC-to-C conversion.',
  },
  {
    q: 'What are standard vesting terms for startup equity and what red flags should employees look for?',
    a: 'Standard vesting terms for startup employee equity in the US market: (1) 4-year vesting period with 1-year cliff: the most common structure. No shares vest until the first anniversary of the start date (the "cliff"), at which point 25% of the total grant vests. After the cliff, the remaining 75% vests monthly (1/48 of the total per month for the remaining 36 months). A 4-year/1-year cliff grant of 48,000 shares vests: 0 shares for months 1-11, 12,000 shares on month 12 (cliff), then 1,000 shares per month for months 13-48. (2) Acceleration: some agreements include acceleration provisions: (a) Single-trigger acceleration: all unvested equity vests automatically upon a change of control (acquisition). Preferred by employees; disliked by acquirers who want to retain key employees post-acquisition. (b) Double-trigger acceleration: acceleration requires two events — change of control AND termination without cause or resignation for good reason. More common in negotiated executive offers. (c) Partial acceleration: e.g., 12-month acceleration upon double trigger. (3) Post-termination exercise window: after leaving the company, former employees have a limited window to exercise vested options before they expire. Standard window has historically been 90 days. Some companies have extended this to 1-2 years, which is employee-friendly (allows time to raise money for exercise price + tax). Red flags in option agreements: (1) Short post-termination exercise window (30 days or less): essentially forces immediate exercise or forfeiture upon termination — particularly punishing if the tax bill is large. (2) No acceleration provision at all for any scenario: the company gets all the upside risk management; employees get terminated pre-acquisition with no vested shares. (3) Clawback provisions beyond standard: some agreements allow the company to claw back vested option gains if the employee joins a competitor. California courts generally refuse to enforce non-competes and related clawbacks, but other states may not. (4) No early exercise provision: without early exercise, ISO holders cannot start the 5-year QSBS holding period clock early. Inability to early-exercise is particularly costly for employees at late-stage companies with high FMV — the spread at exercise creates a large ordinary income (NSO) or AMT (ISO) event. (5) Repurchase right at cost: if the company has the right to repurchase shares at exercise price after termination, the employee receives no benefit from appreciation after exercise for shares subject to repurchase. (6) Favorable IPO blackout periods without acceleration: employees who join late may be locked out of selling for 6-12 months post-IPO; if their post-termination window expired during this period, they may have been unable to exercise at all.',
  },
  {
    q: 'What are the key provisions to review in an equity compensation plan before accepting a grant?',
    a: 'An equity compensation plan (often called an Equity Incentive Plan or Stock Incentive Plan) is the legal document governing all option grants at the company. Employees receive a Notice of Grant and an Option Agreement, but these documents are governed by and subject to the Plan. Key provisions to review: (1) Plan share pool: the total number of shares authorized for issuance under the plan. If the pool is nearly exhausted, the company may need to increase it at the next board/shareholder meeting, which could create delay in future grants. Current authorization as a % of fully diluted capitalization tells you the equity pool\'s dilutive power. (2) Non-discretionary vesting or discretionary acceleration: does the board have discretion to accelerate vesting, or is acceleration triggered automatically? Discretionary acceleration is better for the company (they decide) but provides uncertainty for employees. (3) Definition of "Cause" for termination: if termination "for Cause" results in loss of unvested or vested options (some plans allow cancellation of vested options on for-cause termination), the definition of "Cause" is critical. Overly broad definitions (e.g., "any conduct that the board determines to be harmful to the company") can be weaponized. Narrow definitions tied to specific misconduct (criminal conduct, material breach of agreement, etc.) are better for employees. (4) Definition of "Good Reason" for resignation: double-trigger acceleration typically requires termination "without Cause" or resignation for "Good Reason." The definition of Good Reason determines when an employee can resign and still receive double-trigger protection. Common Good Reason triggers: material reduction in base salary, material reduction in role/responsibilities, required relocation by more than 50 miles. (5) Right of first refusal (ROFR) and co-sale rights: many private company plans include ROFR provisions restricting sale of shares on secondary markets. If you want to sell shares in a tender offer or on a secondary market, the company (and potentially investors) have the right to match the offer. This limits liquidity. (6) Board approval of grants: the plan typically requires board approval for each option grant. Ensure your grant is documented in board minutes and that you receive a signed copy of your Option Agreement — some companies issue grants verbally without documentation.',
  },
]

export default function EquityCompensationGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Equity Compensation Guide for Startups (2025): ISO vs NSO, 409A, QSBS, 83(b) Election',
    description: 'ISO vs NSO tax treatment, 409A safe harbor valuation requirements, QSBS Section 1202 $10M exclusion, 83(b) election and the 30-day window, and standard vesting terms for startup employee equity.',
    url: 'https://bizlegal-ai.com/guides/equity-compensation-guide-startups',
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
      { '@type': 'ListItem', position: 3, name: 'Equity Compensation Guide', item: 'https://bizlegal-ai.com/guides/equity-compensation-guide-startups' },
    ],
  }

  const COMPARISON = [
    { feature: 'Who can receive', iso: 'Employees only', nso: 'Employees, contractors, advisors, board members' },
    { feature: 'Tax at grant', iso: 'None', nso: 'None' },
    { feature: 'Tax at exercise', iso: 'No ordinary income (spread is AMT preference)', nso: 'Ordinary income on spread (FMV − exercise price)' },
    { feature: 'Tax at qualifying sale', iso: 'Long-term capital gains on full gain (if holding period met)', nso: 'Long-term capital gains only on appreciation after exercise' },
    { feature: 'Holding period for LTCG', iso: '2 years from grant + 1 year from exercise', nso: '1 year from exercise date' },
    { feature: 'Disqualifying disposition', iso: 'Spread at exercise becomes ordinary income', nso: 'N/A (ordinary income always recognized at exercise)' },
    { feature: '$100K annual limit', iso: 'Yes — options exercisable in excess of $100K/yr auto-convert to NSOs', nso: 'No limit' },
    { feature: 'AMT risk', iso: 'Yes — spread at exercise is AMT preference item', nso: 'No AMT issue (ordinary income recognized at exercise)' },
    { feature: '409A compliance required', iso: 'Yes — exercise price ≥ FMV required', nso: 'Yes — same requirement' },
    { feature: 'Best for', iso: 'Early employees expecting long-term value appreciation', nso: 'Late-stage employees, non-employees, international grantees' },
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
          Equity Compensation Guide for Startups
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Startup Law
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Equity Compensation Guide for Startups (2025): ISO vs NSO, 409A, QSBS, and 83(b) Election
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          The difference between an ISO and an NSO can be the difference between paying 23.8% long-term capital gains and 37% ordinary income on the same equity gain. The 83(b) election window is 30 days and closes permanently. QSBS Section 1202 can exclude $10M in gains — but only if the company was a C-corporation with under $50M in assets when the stock was issued. These details are buried in your option agreement.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>ISO vs. NSO: Tax Treatment Comparison</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Feature</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#16a34a' }}>ISO (Incentive Stock Option)</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#1a56db' }}>NSO (Non-Qualified Stock Option)</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(({ feature, iso, nso }) => (
                  <tr key={feature} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{feature}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, color: '#16a34a', fontSize: '0.82rem' }}>{iso}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, color: '#1a56db', fontSize: '0.82rem' }}>{nso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', padding: '1.25rem', background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 600, color: '#dc2626' }}>
            ⚠ 83(b) election: the window is 30 calendar days from the date you receive the restricted stock or early-exercise shares. No extensions. No exceptions. If you miss it, you owe ordinary income tax as shares vest — potentially on hundreds of thousands of dollars of value you haven't sold — instead of paying taxes on (nearly) zero at grant.
          </p>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Stock Option Agreement for 409A, Acceleration, and Vesting Red Flags</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your stock option agreement, Notice of Grant, or Equity Incentive Plan. BizLegal AI identifies whether you have ISOs or NSOs, the length of your post-termination exercise window (and whether it's dangerously short), whether single or double-trigger acceleration applies, the definition of "Cause" for termination, repurchase rights that could claw back gains, and whether ROFR provisions restrict secondary liquidity.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Stock Option Agreement →
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
            <Link href="/guides/startup-compliance-program-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Startup Compliance Program →</Link>
            <Link href="/guides/contractor-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Contractor Agreement Guide →</Link>
            <Link href="/guides/ip-assignment-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>IP Assignment Agreement →</Link>
            <Link href="/guides/beneficial-ownership-information-filing" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>BOI Filing Guide →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal or tax advice. Stock option taxation, 409A valuation requirements, QSBS eligibility, and 83(b) election procedures depend on the specific facts of each grant, the company's capital structure, state tax law (which may differ materially from federal treatment), and individual tax circumstances. Consult a qualified tax attorney or CPA before making any equity exercise or tax election decisions.
          </p>
        </footer>

      </main>
    </>
  )
}
