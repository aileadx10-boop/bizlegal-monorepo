import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'OFAC Sanctions Compliance Guide for Crypto, Fintech, and B2B SaaS (2025): SDN List, 50% Rule, Blocking vs Rejecting, Voluntary Self-Disclosure, Virtual Currency Enforcement | BizLegal AI',
  description: 'OFAC sanctions compliance guide for crypto exchanges, fintech companies, and B2B SaaS platforms: SDN (Specially Designated Nationals) list screening obligations, the 50% Rule (indirect ownership by blocked persons), blocking vs rejecting transactions (distinction and procedures), OFAC voluntary self-disclosure (VSD) program and mitigation, OFAC virtual currency and crypto enforcement actions (Tornado Cash, BitMEX, Bittrex, Poloniex, Bitpay), civil money penalty calculation (base penalty / aggravating / mitigating factors), compliance program elements (risk assessment, SDN screening, transaction monitoring, recordkeeping, employee training), secondary sanctions exposure for non-US persons, and state sanctions from NYDFS.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/ofac-sanctions-compliance-crypto-fintech-saas-guide' },
  openGraph: {
    title: 'OFAC Sanctions Compliance Guide for Crypto, Fintech, and B2B SaaS (2025) — BizLegal AI',
    description: 'OFAC SDN screening, 50% Rule, blocking vs rejecting, voluntary self-disclosure, crypto enforcement (Tornado Cash, Bittrex $29M, BitMEX), civil penalty calculation, and compliance program elements for fintech and crypto companies.',
    url: 'https://bizlegal-ai.com/guides/ofac-sanctions-compliance-crypto-fintech-saas-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What is OFAC, and which companies are subject to US sanctions compliance obligations?',
    a: 'The Office of Foreign Assets Control (OFAC) is a financial intelligence and enforcement agency of the US Treasury Department. OFAC administers and enforces economic and trade sanctions based on US foreign policy and national security goals against targeted foreign countries, governments, regimes, individuals, entities, and organizations. OFAC derives its authority from presidential national emergencies declared under the International Emergency Economic Powers Act (IEEPA), the Trading with the Enemy Act (TWEA), the United Nations Participation Act, and specific legislation targeting Iran, North Korea, Cuba, and other jurisdictions. Who is subject to OFAC sanctions? OFAC sanctions are binding on "US persons," defined as: US citizens and permanent residents (wherever located); entities organized under US law (corporations, LLCs, partnerships — including their foreign branches); any person or entity physically within the United States. Additionally: US financial institutions have broad obligations to block and reject transactions even for foreign persons when the underlying funds transit the US financial system. Non-US companies can be subject to secondary sanctions — penalties for conducting specified transactions with sanctioned persons or countries even without a nexus to the US (see FAQ 5 for secondary sanctions). What this means for tech companies: (a) Any SaaS company incorporated in the US is a US person and must comply with OFAC sanctions regardless of where customers are located. (b) A crypto exchange or fintech platform with US customers, US employees, or US-based servers may be treated as having nexus to US persons even if incorporated offshore. (c) A B2B SaaS platform selling compliance software to law firms, banks, and fintech companies — even if it collects no payments directly — may be used to facilitate transactions with sanctioned persons if it processes customer data containing transactions by SDN-listed individuals. OFAC does not typically provide advance guidance on whether a specific business arrangement is compliant; companies must make their own legal assessments or request an OFAC license. Primary sanctions programs: OFAC administers 30+ sanctions programs as of 2025. The major programs relevant to tech/fintech: Comprehensively sanctioned countries (embargo programs): Cuba (CACR — 31 CFR Part 515); Iran (ITSR — 31 CFR Part 560); North Korea (NKSR — 31 CFR Part 510); Syria (SySR — 31 CFR Part 542); Russia (selective — not a comprehensive embargo, but targeted sanctions programs including EO 14024). Partially sanctioned regions: Crimea/Donetsk/Luhansk regions of Ukraine. Entity-specific programs: SDN List; Sectoral Sanctions Identifications (SSI) List (for Russia). For crypto companies: OFAC\'s 2022 guidance on virtual currency applies SDN screening requirements to cryptocurrency transactions in the same way as fiat, but with additional complexity around blockchain address-level screening.',
  },
  {
    q: 'What is the SDN List and the 50% Rule, and what does it mean for customer screening?',
    a: 'The Specially Designated Nationals and Blocked Persons List (SDN List) is OFAC\'s primary list of individuals, companies, and entities subject to US sanctions. SDN-listed persons are "blocked" — US persons are prohibited from transacting with them, and their property interests in US jurisdiction must be blocked (frozen). SDN-listed addresses appear as "OFAC-designated addresses" in blockchain analytics tools. The SDN List contains approximately 13,000+ entries (individuals, entities, vessels, aircraft, and virtual currency addresses) across all 30+ sanctions programs. Screening the SDN List: companies must screen their customers, counterparties, and — for crypto companies — blockchain addresses against the SDN List before establishing relationships or processing transactions. Many SDN entries include aliases, alternative spellings, and alternate identifications (passport numbers, tax IDs, national ID numbers). Screening must accommodate name variations and cannot rely solely on exact-match searching. The 50% Rule: OFAC\'s 50% Rule (formally stated in multiple SDN FAQs) provides that property of entities owned 50% or more — directly or indirectly — by one or more SDN-listed persons is itself blocked, even if the entity does not appear on the SDN List. This is one of the most commonly overlooked OFAC compliance concepts. The 50% Rule applies: (a) Direct ownership: if an SDN holds 50%+ of the equity in a company, that company\'s property is blocked even if the company is not on the SDN List. (b) Indirect ownership through intermediaries: if an SDN owns 50%+ of Company A, which owns 50%+ of Company B, Company B is blocked even if neither Company A nor Company B appears on the SDN List. The ownership is "aggregated" through the chain. (c) Aggregation of multiple SDNs: if SDN-1 owns 30% of Company X and SDN-2 (a different SDN) owns 25% of Company X, their ownership is aggregated (55%) and Company X is blocked under the 50% Rule. Multiple SDN-owned stakes are added together. The 50% Rule is an OFAC administrative rule, not a statutory requirement — it is based on OFAC regulatory interpretation. However, OFAC enforcement actions make clear that companies relying only on the SDN List without applying the 50% Rule face enforcement risk. Practical implications: a company that onboards a business customer without screening for 50% Rule beneficial ownership (i.e., without checking if any beneficial owner is an SDN) may unknowingly establish a relationship with a blocked entity. For fintech companies with beneficial ownership collection (required under the CDD Rule — see AML/BSA Guide), the beneficial ownership data collected for AML purposes can be used for 50% Rule screening — an important compliance efficiency. Sector-specific additional considerations: the Sectoral Sanctions Identifications (SSI) List for Russia imposes prohibitions on specified transactions (new debt over 14/30/60/90 days, new equity) with entities in specific Russian industry sectors — different from the SDN List, which prohibits all transactions. For B2B SaaS companies with Russian enterprise customers: check both the SDN List and the SSI List.',
  },
  {
    q: 'What is the difference between "blocking" and "rejecting" a transaction, and what procedures apply to each?',
    a: 'OFAC sanctions require different actions depending on the nature of the transaction and the party involved. The fundamental distinction is between blocking (freezing funds and holding them pending OFAC authorization) and rejecting (refusing to process a transaction without blocking). This distinction has significant legal and operational consequences. Blocking transactions — when required: Blocking is required when a transaction directly involves blocked property — that is, property or interests in property of an SDN-listed person or entity subject to a comprehensive sanctions program. When a US financial institution, payment processor, or money transmitter identifies that a transaction: (a) involves an SDN-listed person as a party (originator, beneficiary, or intermediary); (b) involves property that belongs to, is owned by, or is controlled by an SDN-listed person; OR (c) is a transaction with a comprehensively sanctioned country (Cuba, Iran, North Korea, Syria) — the institution must BLOCK the funds. Blocked funds are not returned to the sender or paid to the recipient. Instead, they are frozen in a blocked account at the financial institution. The financial institution must: (1) Maintain the blocked funds in an interest-bearing account; (2) File a "Report of Blocked Property" with OFAC within 10 business days of the blocking; (3) File an annual census of blocked property by September 30 of each year; (4) Hold the funds until OFAC issues a license authorizing their release, the sanctions are lifted, or the funds are unblocked by OFAC. Rejecting transactions — when required: Rejecting is appropriate when a transaction is prohibited but there is no blocked property involved — the transaction simply cannot proceed, but the funds are not frozen. Common rejection scenarios: (a) A transfer involving an SDN-listed country or person where the funds do not yet have a nexus to the US financial system (reject before they enter the US system, not after); (b) Transactions that violate secondary sanctions (e.g., a non-US subsidiary\'s transaction prohibited under the Iran sanctions secondary provisions); (c) Transactions involving prohibited goods, services, or technology (e.g., a software license to a sanctioned party where the software never entered the transaction). When rejecting: the institution returns the funds to the sender or declines to process without holding them; (ii) files a "Report of Rejected Transactions" with OFAC within 10 business days of the rejection. Blocking vs. rejecting for crypto: for blockchain transactions, the distinction is complicated by irreversibility. Once a cryptocurrency transaction is confirmed on-chain, it cannot be "blocked" in the traditional sense — the funds have already moved. OFAC has acknowledged that the concept of "blocking" virtual currency assets is contextually different: a VASP (virtual asset service provider) that identifies a sanctioned wallet address as a transaction counterparty after the transaction confirms should: freeze the customer\'s account/wallet rather than the specific transaction; notify OFAC of the blocked property; consult OFAC counsel on specific procedures. OFAC 10-day reporting requirements: both blocking reports and rejection reports must be filed within 10 business days of the event. Failure to report blocked property is separately sanctionable. Tip: maintain an OFAC transaction log that distinguishes between blocked transactions (with Report of Blocked Property filed) and rejected transactions (with Report of Rejected Transactions filed) — OFAC examiners look for this operational distinction.',
  },
  {
    q: 'What is OFAC\'s Voluntary Self-Disclosure (VSD) program, and how are civil money penalties calculated?',
    a: 'OFAC\'s Voluntary Self-Disclosure (VSD) program allows companies and individuals to report potential sanctions violations to OFAC before OFAC discovers them independently. VSD is one of the most powerful tools for reducing OFAC civil money penalty exposure. Why VSD matters: OFAC treats VSD as a "significant mitigating factor" that can reduce base civil money penalties by 50% or more. In contrast, failure to disclose known violations — or attempting to conceal them — is a significant aggravating factor that can increase penalties substantially. VSD procedure: file with OFAC Compliance Division → include: (1) initial notice (immediate notification of the potential violation, even if full facts are not yet known); (2) full report within 180 days (detailed narrative of facts, legal analysis of whether a violation occurred, disclosure of all transactions potentially in violation, description of remediation taken). OFAC civil money penalty calculation framework: OFAC regulations (31 CFR Part 501, Appendix A) set out the base penalty schedule: Egregious violations: $1,000,000 per violation OR twice the transaction value, whichever is greater. Non-egregious violations: statutory maximum per violation (varies by program — Iran: $358,775; North Korea: $358,775; Cuba: $91,946). Total penalty cap: the sum of all violations, subject to OFAC discretion. "Egregious" vs. "non-egregious": egregious violations involve: willfulness (actual knowledge the conduct violated sanctions); reckless disregard (knowledge that a violation was likely but proceeding anyway); or "no mitigating factors" under OFAC\'s Enforcement Guidelines. For egregious violations with no VSD: base penalty = $1M per violation or 2x transaction value. For egregious violations WITH VSD: base penalty is halved (50% reduction from the egregious base). For non-egregious violations with VSD: base penalty = 1/2 the statutory maximum per violation. Mitigating factors (from OFAC Enforcement Guidelines): substantial cooperation with OFAC (providing documents, full disclosure, prompt response); VSD; remedial measures taken (enhanced compliance program, training, termination of violating transactions); no prior OFAC sanctions history; low transaction value; victim not seriously harmed; little harm to US sanctions program objectives; awareness of the sanctions program but not of the specific violation (honest mistake vs. willful). Aggravating factors: willfulness or recklessness; concealment or obstruction; patterns of conduct (multiple violations, not isolated); managerial involvement; harm to US national security goals; prior OFAC violations within 5 years. OFAC enforcement discretion — "no action" outcomes: OFAC regularly closes investigations with a "no action" determination (analogous to a declination in DOJ enforcement). Factors favoring no action: the violation was technical, isolated, and promptly self-disclosed; no sanctions evasion intent; full remediation; the SDN was a low-risk designation (not a WMD proliferator or narco trafficker). Selected OFAC crypto enforcement highlights: Bittrex (2022): $29M penalty for processing transactions with users in sanctioned jurisdictions (Iran, Syria, Cuba) identified by IP address — the exchange\'s compliance program identified many but failed to block or reject all. OFAC cited Bittrex\'s failure to implement adequate controls despite knowing of the risks. Poloniex (2021): $7.6M — transactions with users in Crimea, Cuba, Iran, Sudan, and Syria. BitPay (2021): $507K — processed crypto payments for merchants where the underlying customer was from a sanctioned country. Tornado Cash (2022): OFAC designated Tornado Cash itself as an SDN — controversial because it was a smart contract (code on Ethereum blockchain), not an entity with a legal personality. Challenged in court (Van Loon v. Treasury, 5th Cir. 2024) — court ruled that OFAC exceeded its authority in sanctioning immutable smart contracts without a person or property interest. OFAC\'s Tornado Cash designation remains contested but has chilling effect on DeFi.',
  },
  {
    q: 'What are the core elements of an OFAC sanctions compliance program, and what does screening actually require?',
    a: 'OFAC does not mandate a specific compliance program by regulation (unlike FinCEN\'s 5-pillar BSA program), but its Enforcement Guidelines (issued September 2019 and updated) describe what OFAC considers adequate and how compliance program quality affects penalty decisions. OFAC\'s "Framework for OFAC Compliance Commitments" (May 2019) outlines 5 essential components of an OFAC sanctions compliance program: (1) Management Commitment: senior management (board of directors, C-suite) must be visibly committed to OFAC compliance. Compliance cannot be solely a legal or operations function. Management commitment evidence: (a) board-level sanctions policy approval; (b) dedicated sanctions compliance budget; (c) escalation path from compliance to CEO/board for high-risk decisions; (d) "tone from the top" messaging on sanctions importance. (2) Risk Assessment: companies must conduct a periodic, enterprise-wide sanctions risk assessment that considers: (a) customer base (geographies, industries, beneficial ownership); (b) products and services (which products could be used by SDN-listed persons or for transactions with sanctioned countries); (c) transactions and payment flows (wire transfers, crypto transactions, subscription payments, marketplaces); (d) counterparties (vendors, partners, acquiring banks, payment processors); (e) geographies (where do customers, employees, and servers operate?). The risk assessment should be the foundation for prioritizing compliance resources. (3) Internal Controls: policies, procedures, and controls to implement and enforce compliance: (a) Customer screening: screen customers at onboarding against the SDN List and applicable country lists. Use OFAC-designated screening tools (major vendors: World-Check, LexisNexis, Dow Jones, Accuity, as well as crypto-specific: Chainalysis, TRM Labs, Elliptic). (b) Transaction screening: screen each transaction (payment, wire, crypto transfer) against SDN List and country of origin/destination. (c) Beneficial ownership screening: apply the 50% Rule — screen all beneficial owners of legal entity customers. (d) Cryptocurrency address screening: for VASPs, screen blockchain addresses against OFAC-designated virtual currency addresses (published in the SDN List). OFAC updates the SDN list of crypto addresses regularly — compliance tools must be updated in real-time. (e) Automated blocking and rejecting: build automated controls that prevent processing sanctioned transactions, not just flag them for manual review. Manual review backlogs without automated hold are a common enforcement finding. (4) Testing and Audit: regular testing of the sanctions compliance program including: (a) screening system testing: send known "true positive" SDN names through the screening system to verify it catches them; (b) false positive rate monitoring (screening that generates too many false positives leads to alert fatigue and missed true positives); (c) independent compliance audit (external assessment at least annually). (5) Training: all relevant employees must be trained on: (a) what OFAC sanctions are and why they matter; (b) how to identify and escalate potential sanctions issues; (c) the specific sanctions risks of the company\'s products and customer base. Crypto-specific screening requirements: OFAC has designated hundreds of specific virtual currency wallet addresses as SDN entries. All VASPs must screen blockchain addresses against OFAC-designated crypto addresses: use blockchain analytics tools (Chainalysis, TRM Labs, Elliptic) that update their SDN address databases in real-time; check counterparty wallet addresses on both the sending and receiving end; for exchanges/OTC desks: check customer deposit addresses as well as withdrawal destinations. OFAC considers failure to screen crypto addresses — even if the company claimed not to know the wallet was SDN-designated — as a willfulness or recklessness factor if adequate tools were available and not used.',
  },
  {
    q: 'What are secondary sanctions, and how do they apply to non-US fintech and crypto companies that have US investors, US employees, or US cloud infrastructure?',
    a: 'Primary OFAC sanctions apply directly to US persons. Secondary sanctions are penalties imposed on non-US persons (foreign companies and individuals) for engaging in specified transactions with US-sanctioned parties — even without any US nexus in the underlying transaction. Secondary sanctions are primarily used in the Iran, Russia, China, and North Korea programs. Secondary sanctions mechanisms: (a) Iran: Executive Orders 13902, 13949, and the Iran Freedom and Counter-Proliferation Act authorize OFAC to impose secondary sanctions (including blocking and designation as SDN) on any foreign person who: provides material support to Iranian SDNs; transacts in Iranian petroleum; provides goods or services to Iran\'s financial, energy, shipping, or shipbuilding sectors; provides correspondent banking access to Iranian financial institutions. The secondary sanctions threat is the reason major European banks largely stopped Iran-related transactions even when EU law did not require them to. (b) Russia: the Russia sanctions program (EO 14024 and related orders) authorizes secondary sanctions against any foreign financial institution that conducts or facilitates "significant transactions" with sanctioned Russian entities. "Significant" is undefined in the statute but OFAC evaluates: transaction value, frequency, connection to sanctioned Russian sectors (defense, aerospace, maritime). (c) North Korea: the North Korea Sanctions Regulations authorize designation of any foreign bank that maintains correspondent accounts with North Korean banks or processes transactions on their behalf. When does a non-US company face OFAC sanctions risk? The US nexus question: a non-US crypto exchange has OFAC exposure if: (i) it onboards US customers (even indirectly); (ii) it uses US dollar-denominated transactions that clear through US correspondent banks; (iii) it processes transactions in US-issued stablecoins (USDC, BUSD) — stablecoins are often issued by US-regulated entities, making every USDC transaction potentially a "US transaction"; (iv) it is majority-owned by US persons (the exchange itself becomes a US person for OFAC purposes through the ownership chain); (v) it uses US-based cloud infrastructure (AWS, Google Cloud, Microsoft Azure) — OFAC has taken the position that use of US-based servers may constitute provision of services by a US person (the cloud provider) and can trigger sanctions liability for the non-US user of those services if SDN-listed persons access the platform. The FinCEN/OFAC overlap for non-US exchanges: BitMEX (2021) was sanctioned by the CFTC/DOJ for operating as an unregistered US exchange by accepting US customers while claiming an offshore domicile. Its founders were criminally charged. The theory: BitMEX actively solicited US customers despite claiming to be offshore. For non-US crypto exchanges: do not accept US customers without registering with FinCEN as an MSB AND complying with OFAC. The "we\'re offshore" defense does not work if the exchange knowingly serves US persons. State-level sanctions supplement: New York\'s Department of Financial Services (NYDFS) requires BitLicense holders to maintain their own sanctions screening programs as part of the BitLicense requirements (23 NYCRR Part 200). NYDFS has cited sanctions compliance failures in multiple BitLicense enforcement actions. Companies holding a BitLicense effectively operate under a dual federal (OFAC) and state (NYDFS) sanctions compliance obligation. OFAC licenses for otherwise-prohibited transactions: OFAC issues general licenses (published, applicable to categories of transactions) and specific licenses (issued case-by-case to named persons for specific transactions). Common general licenses: humanitarian transactions in comprehensively sanctioned countries; certain personal remittances; academic and journalistic activities; OFAC-authorized financial services to certain blocked persons. If a transaction appears sanctionable but may qualify for a general or specific license: review OFAC\'s published general licenses first; apply for a specific license from OFAC if no general license applies and there is a legitimate non-evasion purpose; do not rely on self-help exceptions — contact OFAC counsel.',
  },
]

export default function OFACSanctionsComplianceGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'OFAC Sanctions Compliance Guide for Crypto, Fintech, and B2B SaaS (2025): SDN List, 50% Rule, Blocking vs Rejecting, Voluntary Self-Disclosure, Virtual Currency Enforcement',
    description: 'OFAC compliance guide for fintech, crypto, and B2B SaaS companies: SDN list screening, the 50% Rule for blocked entities, blocking vs rejecting procedures, voluntary self-disclosure (VSD) and penalty mitigation, OFAC civil penalty calculation (egregious vs non-egregious, aggravating/mitigating factors), 5-element compliance program framework, crypto address screening (Chainalysis/TRM/Elliptic), crypto enforcement actions (Tornado Cash designation, Bittrex $29M, Poloniex $7.6M, BitPay $507K), secondary sanctions (Iran EO 13902, Russia EO 14024), and NYDFS BitLicense sanctions requirements.',
    url: 'https://bizlegal-ai.com/guides/ofac-sanctions-compliance-crypto-fintech-saas-guide',
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
      { '@type': 'ListItem', position: 3, name: 'OFAC Sanctions Compliance Guide', item: 'https://bizlegal-ai.com/guides/ofac-sanctions-compliance-crypto-fintech-saas-guide' },
    ],
  }

  const PENALTY_TABLE = [
    { scenario: 'Egregious — no VSD', base: '$1M per violation or 2× transaction value', vsd: 'N/A', note: 'Willful, reckless, or no mitigating factors' },
    { scenario: 'Egregious — with VSD', base: '$500K per violation or 1× transaction value', vsd: '50% reduction', note: 'VSD treated as significant mitigating factor' },
    { scenario: 'Non-Egregious — no VSD', base: 'Statutory maximum per violation (Iran: $358,775)', vsd: 'N/A', note: 'Honest mistake, adequate program' },
    { scenario: 'Non-Egregious — with VSD', base: '½ Statutory maximum per violation', vsd: '50% reduction', note: 'Combines VSD with good-faith mistake' },
    { scenario: 'No Action / Warning Letter', base: '$0', vsd: 'Often VSD + remediation', note: 'Technical, isolated, immediately remediated' },
  ]

  const CRYPTO_ENFORCEMENT = [
    { company: 'Bittrex', year: '2022', penalty: '$29M', finding: 'Transactions with users in Iran, Syria, Cuba identified by IP address; compliance identified issues but failed to block all' },
    { company: 'Poloniex', year: '2021', penalty: '$7.6M', finding: 'Transactions with users in Crimea, Cuba, Iran, Sudan, Syria; inadequate geolocation controls' },
    { company: 'BitPay', year: '2021', penalty: '$507K', finding: 'Processed crypto merchant payments from customers in sanctioned countries; failed to screen customer IP/country data' },
    { company: 'BitGo', year: '2022', penalty: '$98K', finding: 'Provided digital asset custodial services to users in Cuba, Sudan, Iran, and Crimea; weak geographic screening' },
    { company: 'Tornado Cash', year: '2022', penalty: 'SDN designation (not civil $)', finding: 'OFAC designated the protocol itself as SDN; challenged in 5th Circuit (Van Loon, 2024) — court ruled immutable contracts cannot be SDN-listed' },
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
          OFAC Sanctions Compliance Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          OFAC / Sanctions / Crypto Compliance
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          OFAC Sanctions Compliance Guide for Crypto, Fintech, and B2B SaaS (2025): SDN List, 50% Rule, Blocking vs Rejecting, Voluntary Self-Disclosure, and Virtual Currency Enforcement
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          The Office of Foreign Assets Control (OFAC) enforces US economic sanctions on crypto exchanges, fintech companies, and any SaaS platform incorporated in the US or serving US customers. The SDN List screening obligation, the 50% Rule for indirectly blocked entities, blocking vs. rejecting procedures, and OFAC&apos;s voluntary self-disclosure program each carry distinct legal consequences — and $29M–$390M crypto enforcement actions show the stakes.
        </p>

        <div style={{ padding: '1rem 1.25rem', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '8px', marginBottom: '2.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7 }}>
            <strong>The 50% Rule Applies Even When an Entity Is Not on the SDN List:</strong> Property of entities owned 50%+ by one or more SDN-listed persons is blocked — even if the entity itself is not listed. Multiple SDN ownership stakes are aggregated. Relying solely on name-matching against the SDN List without applying the 50% Rule to beneficial owners is a documented enforcement failure.
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>OFAC Civil Money Penalty Calculation Framework</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600 }}>Violation Scenario</th>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600 }}>Base Penalty</th>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600 }}>VSD Impact</th>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600 }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {PENALTY_TABLE.map(({ scenario, base, vsd, note }) => (
                  <tr key={scenario} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '9px 11px', fontWeight: 600, verticalAlign: 'top', fontSize: '0.76rem' }}>{scenario}</td>
                    <td style={{ padding: '9px 11px', verticalAlign: 'top', fontWeight: 700, color: '#dc2626', fontSize: '0.76rem' }}>{base}</td>
                    <td style={{ padding: '9px 11px', verticalAlign: 'top', color: '#059669', fontWeight: 600, fontSize: '0.76rem' }}>{vsd}</td>
                    <td style={{ padding: '9px 11px', verticalAlign: 'top', opacity: 0.75, fontSize: '0.73rem' }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>OFAC Virtual Currency Enforcement Actions (Selected)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '520px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600 }}>Company</th>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600 }}>Year</th>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600 }}>Penalty</th>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600 }}>Key Finding</th>
                </tr>
              </thead>
              <tbody>
                {CRYPTO_ENFORCEMENT.map(({ company, year, penalty, finding }) => (
                  <tr key={company} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '9px 11px', fontWeight: 700, verticalAlign: 'top', fontSize: '0.76rem' }}>{company}</td>
                    <td style={{ padding: '9px 11px', verticalAlign: 'top', opacity: 0.8, fontSize: '0.76rem' }}>{year}</td>
                    <td style={{ padding: '9px 11px', verticalAlign: 'top', fontWeight: 700, color: '#dc2626', fontSize: '0.76rem' }}>{penalty}</td>
                    <td style={{ padding: '9px 11px', verticalAlign: 'top', opacity: 0.8, fontSize: '0.73rem' }}>{finding}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your MSB Agreement, Compliance Policy, or Banking-as-a-Service Contract for OFAC Compliance Gaps</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your sanctions compliance policy, MSB agreement, exchange terms of service, or payment processing agreement. BizLegal AI reviews for OFAC compliance program 5-element framework completeness, SDN screening obligations, 50% Rule beneficial ownership screening requirements, blocking vs. rejecting procedures and reporting timelines (10-day filing requirements), virtual currency address screening requirements, secondary sanctions exposure for international operators, NYDFS BitLicense sanctions obligations, voluntary self-disclosure procedures, and IP-based geolocation controls for sanctioned country exclusion.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Compliance Policy or MSB Agreement →
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
            <Link href="/guides/aml-bsa-compliance-program-fintech-neobank-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>AML/BSA Fintech Guide →</Link>
            <Link href="/guides/mica-regulation-crypto-compliance" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>MiCA Crypto Compliance →</Link>
            <Link href="/guides/payment-processing-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Payment Processing Compliance →</Link>
            <Link href="/guides/beneficial-ownership-information-filing" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>BOI Filing Guide (CTA) →</Link>
            <Link href="/guides/cross-border-data-transfer-scc-bcr-uk-idta-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Cross-Border Data Transfer →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. OFAC sanctions regulations, designated entities, and enforcement guidance change frequently. The SDN List and OFAC program regulations should be verified against current OFAC.treas.gov guidance. The Tornado Cash/Van Loon litigation (5th Circuit 2024) and secondary sanctions implications for virtual currency remain areas of active legal development. Consult qualified OFAC/sanctions counsel before conducting transactions that may have sanctions implications.
          </p>
        </footer>

      </main>
    </>
  )
}
