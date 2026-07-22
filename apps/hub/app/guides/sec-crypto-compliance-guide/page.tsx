import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SEC Crypto Compliance Guide for Token Issuers and Web3 Startups (2025) | BizLegal AI',
  description: 'SEC enforcement against crypto startups, the Howey Test for token classification, securities registration exemptions (Reg D, Reg S, Reg CF), the 2025 post-Ripple regulatory landscape, and what crypto founders must do before fundraising.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/sec-crypto-compliance-guide' },
  openGraph: {
    title: 'SEC Crypto Compliance Guide — BizLegal AI',
    description: 'Howey Test, Reg D 506(c), Reg S, broker-dealer registration, token classification, and the SEC enforcement framework every crypto founder needs to understand before the first raise.',
    url: 'https://bizlegal-ai.com/guides/sec-crypto-compliance-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'Is my token a security under US law?',
    a: 'The primary test for determining whether a token is a security under US law is the Howey Test, derived from SEC v. W.J. Howey Co. (1946). Under Howey, a transaction is an investment contract (and therefore a security) if it involves: (1) an investment of money; (2) in a common enterprise; (3) with an expectation of profits; (4) derived primarily from the efforts of others. Courts and the SEC apply this test to token sales holistically — considering the marketing, the economic realities, the role of the issuer post-launch, and the reasonable expectations of purchasers. Tokens that function purely as utility (consumable access to a deployed, functional network) with no investment expectation are less likely to satisfy all four prongs. Tokens sold in pre-launch states, marketed with return expectations, or sold to investors who are relying on the team\'s ongoing efforts almost always satisfy Howey. The SEC has brought over 200 crypto enforcement actions since 2018. The 2023 Ripple ruling (SEC v. Ripple Labs) held that XRP sold programmatically to retail buyers on exchanges was NOT a security, but institutional sales of XRP directly to sophisticated buyers (Institutional Sales) WERE securities. This distinction — based on the reasonable expectations of specific buyer categories — is now widely applied in structuring crypto token sales.',
  },
  {
    q: 'What are the registration exemptions available to crypto token issuers?',
    a: 'Token issuers who conclude their tokens are securities have several exemption paths to raise capital without full SEC registration: (1) Regulation D, Rule 506(b): No general solicitation; sell to up to 35 non-accredited sophisticated investors and unlimited accredited investors; no SEC filing until Form D; no dollar cap. Most common path for token SAFTs (Simple Agreements for Future Tokens) and equity raises. (2) Regulation D, Rule 506(c): Unlimited fundraising from accredited investors only; general solicitation and advertising allowed; must verify accredited status through third-party verification (not self-certification); file Form D within 15 days. Common for marketed token presales where you want to post publicly. (3) Regulation S: Offshore offering exemption for sales occurring outside the US to non-US persons; complex flow-back restrictions prevent resale into the US for 1 year; often combined with 506(c) for a parallel US tranche. (4) Regulation CF (Crowdfunding): Up to $5M raised from any investor (accredited or not) via SEC-registered funding portal; requires financial statements; single 12-month cap of $5M across all issuers using CF. Limited for token sales due to restrictions on secondary trading. (5) Regulation A+ (Mini-IPO): Up to $75M from non-accredited investors after SEC qualification review; 2-tier structure; more compliance burden but creates a freely tradeable security. SEC qualification takes 3-6 months. Each exemption carries conditions on resale restrictions, disclosures, investor eligibility, and Form D filing. None permit indefinite resale — most 506(b/c) tokens are restricted securities for 12 months minimum.',
  },
  {
    q: 'What is a SAFT and is it still a valid fundraising structure in 2025?',
    a: 'A Simple Agreement for Future Tokens (SAFT) is a contractual instrument where investors provide capital in exchange for the right to receive tokens in the future, typically at a discount and contingent on a network launch. SAFTs were popularized in 2017-2018 as a way to raise funds from accredited investors under Reg D while deferring the securities question to the future delivered token. In 2025, the SAFT\'s legal status is contested. SEC enforcement actions against companies that used SAFTs (including Telegram in 2020 — the $1.7B Gram token offering — and multiple others) established that the SEC can treat the SAFT and the eventual token delivery as a single integrated securities offering. The Telegram order found that SAFTs were unregistered securities regardless of subsequent planned utility. Post-2020 SAFTs are still used but require: a genuine securities exemption (usually Reg D 506(b) or 506(c)) covering both the SAFT and the token delivery; a legally sound legal opinion on the nature of the eventual token; and a network launch that meaningfully decentralizes control before token distribution so delivered tokens may qualify as utility. Without a well-reasoned opinion on ultimate token classification, SAFTs remain high-risk in the current enforcement environment.',
  },
  {
    q: 'When is a crypto exchange or token project required to register as a broker-dealer?',
    a: 'Under the Securities Exchange Act of 1934, any person who is "in the business of effecting transactions in securities for the accounts of others" must register as a broker-dealer with the SEC and FINRA (or a state equivalent). For crypto platforms, the broker-dealer analysis applies whenever: (a) the platform trades securities tokens (tokens that satisfy Howey); (b) the platform facilitates transactions between buyers and sellers of those tokens; and (c) the platform earns transaction-based compensation (fees per trade). SEC guidance and enforcement actions have established that the analysis is fact-specific — a DEX (decentralized exchange) with no matching algorithm and purely smart-contract-based execution may not be a "broker" in the traditional sense, but any platform that holds customer assets, matches orders, or routes transactions will face scrutiny. The 2023 SEC Wells Notices to Coinbase and enforcement against Binance both included broker-dealer allegations. The SEC\'s proposed rule on digital asset exchange registration (February 2023) extended the "exchange" definition to DEXs — a contested position. Platforms facilitating trades of securities tokens without registration face disgorgement, civil penalties, and injunctive relief. FinCEN registration as a Money Services Business (MSB) is a separate obligation that does not satisfy the SEC broker-dealer requirement.',
  },
  {
    q: 'What happened in the SEC v. Ripple Labs case and what does it mean for my project?',
    a: 'In SEC v. Ripple Labs (S.D.N.Y.), Judge Analisa Torres issued a landmark July 2023 summary judgment holding: (1) Ripple\'s institutional sales of XRP directly to sophisticated buyers under written contracts were investment contracts (securities) because buyers had reasonable expectations of profits from Ripple\'s efforts; but (2) Ripple\'s programmatic sales of XRP on public exchanges to retail buyers were NOT investment contracts because retail buyers could not know they were buying from Ripple and had no reasonable expectation tied to Ripple\'s specific efforts. The ruling was affirmed in the remedies phase in 2024. The Ripple ruling has two major implications for token projects: First, the context and method of distribution matters. Selling to institutional investors directly, with pitch decks and discussions about the team\'s plans, creates Howey-satisfying expectations even for tokens that eventually function as utilities. Second, public exchange trading to anonymous retail buyers may not constitute a securities offering — but this analysis depends on the specific facts and is not a safe harbor. In 2025, the SEC under new leadership has taken a more collaborative posture toward crypto, establishing a Crypto Task Force to develop regulatory clarity, withdrawing certain staff guidance, and settling several enforcement actions. Founders should not interpret this as a free pass — the Howey test remains the law, and violations are still being prosecuted.',
  },
  {
    q: 'What specific legal documents does a crypto startup need before its first token sale?',
    a: 'Before conducting any token sale or fundraise, a crypto startup should have the following reviewed by qualified securities counsel: (1) Token classification opinion: A written legal opinion from US securities counsel analyzing whether the token constitutes a security under the Howey Test based on the specific economic realities of the sale and the project. This is the foundational document — everything else depends on it. (2) Offering documents: If selling securities, a Private Placement Memorandum (PPM) for Reg D offerings covering risks, the business, the use of proceeds, and investor eligibility requirements. (3) Investor agreements: SAFT (for future token delivery), token purchase agreement, or SAFE with token conversion rights — drafted specifically for the offering structure and exemption used. (4) Terms of Service and Privacy Policy: Jurisdiction-specific; should include geographic restrictions (blocking US access for Reg S offshore offerings), KYC/AML procedures, and anti-money laundering representations. (5) Accreditation verification procedures (for 506(c)): Third-party verification of investor accredited status through a qualified attorney, CPA, registered broker-dealer, or investment adviser. (6) Form D filing: Required within 15 days of first sale for Reg D offerings. Failure to file Form D is itself a violation. BizLegal AI can review your offering documents, investor agreements, and terms for red flags before you sign or launch — flagging missing securities representations, overbroad risk disclaimers, and inadequate accreditation verification procedures.',
  },
]

export default function SECCryptoGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'SEC Crypto Compliance Guide for Token Issuers and Web3 Startups (2025)',
    description: 'SEC crypto enforcement, Howey Test token classification, Reg D / Reg S / Reg CF exemptions, SAFT structures, broker-dealer registration, and the post-Ripple compliance landscape for crypto founders.',
    url: 'https://bizlegal-ai.com/guides/sec-crypto-compliance-guide',
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
      { '@type': 'ListItem', position: 3, name: 'SEC Crypto Compliance Guide', item: 'https://bizlegal-ai.com/guides/sec-crypto-compliance-guide' },
    ],
  }

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
          SEC Crypto Compliance
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          US Securities Law
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          SEC Crypto Compliance Guide for Token Issuers and Web3 Startups (2025)
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          The SEC has brought over 200 crypto enforcement actions since 2018, targeting token issuers, exchanges, staking providers, and lending platforms. The Howey Test remains the law. This guide covers what makes a token a security, what exemptions allow you to raise without registration, and what documents you must have before your first sale — based on the current post-Ripple enforcement environment.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>SEC Jurisdiction Over Crypto: What the Law Actually Says</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The Securities Act of 1933 requires the registration of any "security" offered or sold in the US, unless an exemption applies. The Securities Exchange Act of 1934 requires registration of securities exchanges, broker-dealers, and investment advisers. The SEC's position, consistently held since the 2017 DAO Report, is that many crypto tokens satisfy the statutory definition of a security — specifically, an investment contract as interpreted by the Supreme Court in SEC v. W.J. Howey Co. (1946).
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The Howey Test asks whether a transaction involves: (1) an investment of money, (2) in a common enterprise, (3) with an expectation of profits, (4) derived from the efforts of others. All four elements must be satisfied. Courts apply this test to the economic realities of the transaction — not the label applied to the token by its issuer. Calling a token a "utility token" does not make it one under the law if buyers purchase it primarily for investment return.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            The SEC's enforcement posture under Gensler (2021–2025) was broadly expansive — treating most tokens and nearly all crypto exchanges as securities and regulated entities, respectively. Under current SEC leadership (post-January 2025), the agency has signaled a more targeted enforcement approach focused on outright fraud, established clearer regulatory pathways for compliant crypto activities, and dismissed or settled several high-profile enforcement actions. However, the underlying legal framework has not changed — the Howey Test remains the law, and Congress has not yet passed comprehensive crypto market structure legislation as of mid-2026.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Securities Exemptions for Token Sales: Your Compliance Path</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            If your token constitutes a security, you have two options: register with the SEC (expensive, typically $500K–$2M in legal and audit fees for a traditional offering; no clear process exists for tokenized securities in 2025) or qualify for an exemption. The most commonly used exemptions for crypto token sales:
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Exemption</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Investor Eligibility</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Dollar Cap</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>General Solicitation</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Reg D 506(b)', 'Accredited + up to 35 sophisticated non-accredited', 'None', 'No'],
                  ['Reg D 506(c)', 'Accredited only (must verify)', 'None', 'Yes — publicly advertise'],
                  ['Regulation S', 'Non-US persons (offshore offering)', 'None', 'Restricted'],
                  ['Reg CF', 'Any investor (accredited or not)', '$5M / 12 months', 'Yes (via portal)'],
                  ['Reg A+ Tier 2', 'Any investor', '$75M / 12 months', 'Yes (after qualification)'],
                ].map(([ex, elig, cap, sol]) => (
                  <tr key={ex} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{ex}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8 }}>{elig}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8 }}>{cap}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8 }}>{sol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ lineHeight: 1.75, fontSize: '0.9rem', opacity: 0.75 }}>
            Note: "Accredited investor" = individuals with $1M+ net worth (excluding primary residence) or $200K+ income ($300K joint) for the past 2 years with expectation of same; entities with $5M+ assets; certain licensed professionals. SEC staff proposed expanding the definition in 2023 but no rule has been finalized.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>High-Risk Activities That Trigger SEC Registration Requirements</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '0.75rem' }}>
            Beyond token sales, crypto companies trigger SEC registration requirements through:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li><strong>Operating a crypto exchange that trades securities tokens:</strong> Requires registration as a national securities exchange or alternative trading system (ATS). No crypto exchange has successfully registered as a national securities exchange. The SEC proposed expanding the exchange definition to DEXs in 2023.</li>
            <li><strong>Acting as a broker-dealer in securities tokens:</strong> Earning transaction-based compensation for facilitating securities trades requires broker-dealer registration with the SEC and FINRA membership.</li>
            <li><strong>Staking and lending programs:</strong> The SEC's suit against Coinbase (2023) explicitly targeted staking programs as unregistered securities offerings. Crypto lending programs (BlockFi, Celsius, Nexo) have all settled SEC enforcement actions for unregistered securities offerings.</li>
            <li><strong>Running a crypto fund or investment vehicle:</strong> Managing capital invested in crypto tokens by third-party investors typically requires registration as an investment adviser and may require fund registration.</li>
            <li><strong>Providing investment advice about crypto securities:</strong> Recommending specific crypto securities to investors for compensation requires investment adviser registration under the Investment Advisers Act of 1940.</li>
          </ul>
          <p style={{ lineHeight: 1.75, marginTop: '1rem', padding: '1rem', background: 'var(--color-bg-secondary, #f9fafb)', borderRadius: '8px', borderLeft: '3px solid #dc2626' }}>
            <strong>Enforcement note:</strong> The SEC has used disgorgement (return of all proceeds), civil monetary penalties (up to $220K per violation for individuals / $1.1M per violation for entities), injunctions, and officer bars in crypto enforcement actions. In egregious cases, criminal referrals to DOJ (which prosecuted Binance's CZ under BSA violations) result in imprisonment.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>What Changed in 2024–2025: The Post-Ripple Landscape</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Several developments have materially shifted the SEC crypto enforcement landscape since mid-2023:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li><strong>SEC v. Ripple (July 2023 / 2024):</strong> XRP programmatic exchange sales ≠ securities; XRP institutional direct sales = securities. The ruling established that the same token can have different securities status depending on distribution context.</li>
            <li><strong>Bitcoin and Ethereum spot ETF approvals (January 2024 / May 2024):</strong> SEC approved Bitcoin spot ETFs (January 2024) and Ethereum spot ETFs (May 2024), signaling that BTC and ETH are not securities — at least in the context of ETF registration.</li>
            <li><strong>New SEC leadership (January 2025):</strong> Commissioner Mark Uyeda became acting chair, subsequently replaced by Paul Atkins. The new leadership dissolved the crypto enforcement unit structure, withdrew certain staff guidance letters, and launched a Crypto Task Force to develop regulatory clarity through rulemaking rather than enforcement.</li>
            <li><strong>SEC dismissed multiple pending enforcement actions (2025):</strong> Voluntary dismissals against Coinbase, Ripple (penalty disputes settled), Binance (ongoing), and others — signaling enforcement pivot.</li>
            <li><strong>Congress drafting comprehensive market structure legislation:</strong> The Fit21 (Financial Innovation and Technology for the 21st Century Act) passed the House in 2024. Senate action and enactment pending as of mid-2026.</li>
          </ul>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Review Your Token Sale Documents for SEC Compliance Gaps in 60 Seconds</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            SAFTs, token purchase agreements, investor PPMs, and platform terms of service all contain securities compliance provisions that SEC staff review in enforcement investigations. BizLegal AI scans your token sale documents for missing accreditation verification procedures, deficient risk disclosures, overbroad utility token representations, and geographic restriction gaps that create registration liability.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Token Sale Documents →
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
            <Link href="/regulations/sec" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SEC Compliance Hub →</Link>
            <Link href="/guides/aml-kyc-compliance-crypto" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>AML & KYC for Crypto →</Link>
            <Link href="/guides/mica-regulation-crypto-compliance" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>MiCA Compliance Guide →</Link>
            <Link href="/guides/vara-licensing-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>VARA Licensing Guide →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Compliance Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. US securities law analysis is highly fact-specific and the regulatory landscape for crypto is actively evolving. Engage qualified US securities counsel before conducting any token sale, token distribution, or operating a crypto platform that may involve regulated activities.
          </p>
        </footer>

      </main>
    </>
  )
}
