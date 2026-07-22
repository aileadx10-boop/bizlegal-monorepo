import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AML/BSA Compliance Program Guide for Fintech and Neobanks (2025): 5 Pillars, CDD Rule, SAR Filing, CTR Requirements, FinCEN Enforcement | BizLegal AI',
  description: 'AML/BSA compliance program guide for fintech companies, neobanks, and money services businesses: Bank Secrecy Act 5-pillar program requirements (31 USC § 5318), FinCEN CDD Final Rule (31 CFR § 1010.230) including 4th pillar beneficial ownership for legal entity customers, suspicious activity report (SAR) filing thresholds and 30/60-day deadlines, currency transaction reports (CTRs) and the $10K threshold, structuring prohibition (31 USC § 5324), BSA/AML Officer designation, independent testing, FinCEN enforcement actions ($390M Capital One penalty), and the 2024 AML/CFT Program Rule modernization.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/aml-bsa-compliance-program-fintech-neobank-guide' },
  openGraph: {
    title: 'AML/BSA Compliance Program Guide for Fintech and Neobanks (2025) — BizLegal AI',
    description: 'BSA 5-pillar AML program requirements for fintechs: internal controls, BSA Officer, employee training, independent testing, CDD (KYC + beneficial ownership), SAR/CTR filing, structuring prohibition, FinCEN enforcement.',
    url: 'https://bizlegal-ai.com/guides/aml-bsa-compliance-program-fintech-neobank-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What is the Bank Secrecy Act (BSA), who must comply, and what are the five pillars of an AML compliance program?',
    a: 'The Bank Secrecy Act (BSA), formally the Currency and Foreign Transactions Reporting Act (31 U.S.C. §§ 5311-5336), was enacted in 1970 and is administered by the Financial Crimes Enforcement Network (FinCEN), a bureau of the US Department of the Treasury. The BSA requires financial institutions to assist US government agencies in detecting and preventing money laundering, terrorism financing, and other financial crimes. FinCEN\'s BSA regulations are codified at 31 CFR Chapter X. Who must comply: "Financial institutions" under 31 USC § 5312 includes not just banks and credit unions but also: money services businesses (MSBs) — money transmitters, currency dealers or exchangers, check cashers, prepaid access issuers, providers of prepaid access; broker-dealers in securities; mutual funds; insurance companies (life insurance and certain annuity contracts); casinos and card clubs; futures commission merchants and introducing brokers in commodities; non-bank residential mortgage lenders and originators. Fintech companies: a fintech company that conducts money transmission (moving funds between customers or to third parties) is a money services business subject to BSA regulations. This includes payment apps, digital wallets, neobanks operating without a bank charter (through a banking-as-a-service partner), crypto exchanges and virtual currency businesses (see the separate FAQ on VASP requirements), and companies issuing prepaid debit cards. A fintech company that partners with an FDIC-insured bank to offer banking services must understand which party holds the primary BSA/AML obligations — typically the bank, but depending on the partnership structure, the fintech may have independent BSA obligations as an MSB. The 5-pillar BSA/AML compliance program: FinCEN regulations require that covered financial institutions establish, implement, and maintain written policies, procedures, and controls designed to detect and prevent money laundering and terrorist financing. The program must at minimum address 5 pillars: Pillar 1 — Internal Controls: written policies and procedures that identify the financial institution\'s money laundering risks and address those risks through compliance controls. The policies must cover: customer acceptance policy (who you will and won\'t onboard); Know Your Customer (KYC) procedures; risk-based due diligence on customers; monitoring for suspicious activity; SAR and CTR filing procedures; recordkeeping requirements. Pillar 2 — Compliance Officer: designation of a qualified individual (BSA/AML Officer) responsible for day-to-day management of the BSA/AML compliance program. The BSA Officer must: have appropriate expertise in AML regulations; be empowered to directly access senior management and the board; have resources sufficient to implement the program. For fintech companies without in-house BSA expertise, a fractional or third-party BSA Officer is permissible but the board retains ultimate responsibility. Pillar 3 — Employee Training: ongoing employee training on BSA/AML requirements, the institution\'s internal policies, and red flags for suspicious activity. Training must be tailored to each employee\'s role — a customer service representative and a wire transfer processor need different training. Training records must be maintained. Pillar 4 — Independent Testing: periodic independent testing of the BSA/AML program to assess its effectiveness. "Independent" means the testing function cannot be performed by the BSA Officer or operational staff directly responsible for BSA compliance. Options: (a) Internal audit department (if independent of BSA compliance); (b) External auditors or compliance consultants; (c) Regulatory examiners (this is mandatory, not a substitute for internal testing). Pillar 5 — Customer Due Diligence (CDD): the Customer Due Diligence Final Rule (effective May 11, 2018, codified at 31 CFR § 1010.230) added a formal 5th pillar to the AML program requirement: CDD procedures including ongoing monitoring of customer transactions and identification of the beneficial owners of legal entity customers. The CDD pillar is further broken down into 4 elements: (a) Customer identification and verification (CIP); (b) Customer due diligence; (c) Beneficial ownership; (d) Ongoing monitoring for suspicious activity. The 2024 AML/CFT Program Rule (see FAQ below) is expected to codify a formal "risk assessment" pillar as a 6th element, bringing the framework to 6 mandatory elements.',
  },
  {
    q: 'What are the FinCEN Customer Due Diligence (CDD) requirements, and what does the beneficial ownership rule require for legal entity customers?',
    a: 'FinCEN\'s Customer Due Diligence Final Rule (31 CFR § 1010.230, effective May 11, 2018) requires covered financial institutions to collect and verify beneficial ownership information for legal entity customers. This is separate from — but related to — FinCEN\'s beneficial ownership reporting rule under the Corporate Transparency Act (CTA), which requires entities to report their beneficial owners to FinCEN (see the BOI Filing Guide for the CTA filing obligation). The CDD Rule\'s beneficial ownership collection obligation runs from the financial institution TO FinCEN, while the CTA runs from the entity itself TO FinCEN. Under the CDD Rule, covered financial institutions must collect identifying information about individuals who own or control legal entity customers — at the time of account opening — as a condition of establishing the relationship. The CDD Rule four-element framework: (1) Customer Identification and Verification (CIP — 31 CFR Part 1020, Subpart B for banks; similar rules for other covered institutions): Before opening an account, collect at minimum: for individual customers: legal name, date of birth, address (residential street address), identification number (SSN for US persons; passport or alien identification for non-US persons). Verify identity using documentary methods (passport, driver\'s license) or non-documentary methods (credit bureau checks, CIP databases). CIP records must be retained for 5 years after the account closes. (2) Customer Due Diligence (risk-based): assess the money laundering risk each customer represents based on: customer type (individual, corporation, LLC, trust, foreign entity); products and services requested; geographies involved; expected transaction patterns. Assign a risk rating (low, medium, high) and apply appropriate due diligence level: Enhanced Due Diligence (EDD) for high-risk customers. (3) Beneficial Ownership Identification: for legal entity customers (corporations, LLCs, partnerships, trusts), identify and verify the identity of: (a) Ownership Prong: each individual who directly or indirectly owns 25% or more of the equity interests of the legal entity (0 to 4 individuals); AND (b) Control Prong: a single individual with significant responsibility to control, manage, or direct the legal entity (CEO, CFO, COO, managing member, general partner, or equivalent). The same individual may satisfy both prongs. Verification: same documentary/non-documentary methods as CIP — the financial institution must verify the identity of each beneficial owner. FinCEN provides a certification form (FinCEN Form 107) that the legal entity customer can use to certify beneficial ownership information — the financial institution may rely on this certification unless it has reason to question its accuracy. The 25% threshold: if no individual owns 25%+ of the legal entity, the institution must still collect the Control Prong individual. It is possible (and common) that a trust or holding company structure results in no natural person owning 25%+ — in that case, only the Control Prong individual is required. (4) Ongoing Monitoring: the financial institution must monitor customer transactions on an ongoing basis to: detect transactions inconsistent with the customer\'s expected business profile; identify significant changes in the customer\'s risk profile (new beneficial owners, new products, new geographies); update customer information when material changes occur; identify and report suspicious activity. FinCEN beneficial ownership vs CTA beneficial ownership: the two regimes use DIFFERENT definitions and serve different purposes: CDD Rule (CIP) 25% ownership threshold + Control Prong → collected by financial institutions from their customers. CTA (Corporate Transparency Act) 25% ownership threshold + Substantial Control → reported by the entities themselves to FinCEN. The CTA exempts many large companies (>$5M revenue, >20 FTE, physical office) that are not exempt from the CDD Rule — a company can be exempt from CTA BOI reporting while still being required to provide BOI to its financial institution under the CDD Rule. High-risk customer EDD requirements: Politically Exposed Persons (PEPs), customers with suspicious backgrounds, high-cash businesses, and customers in high-risk jurisdictions require Enhanced Due Diligence. EDD may include: source of funds and source of wealth verification; senior management approval for onboarding; more frequent transaction monitoring reviews; additional documentation of the customer relationship\'s business purpose.',
  },
  {
    q: 'When must a Suspicious Activity Report (SAR) be filed, and what are the thresholds and deadlines?',
    a: 'Suspicious Activity Reports (SARs) are filed by financial institutions with FinCEN through the BSA E-Filing System when the institution knows, suspects, or has reason to suspect that a transaction: (a) involves funds derived from illegal activity; (b) is designed to evade BSA reporting requirements; (c) lacks a lawful purpose or has no apparent lawful purpose and the institution cannot identify a reasonable explanation; or (d) involves the use of the institution to facilitate criminal activity. SARs are confidential — the financial institution is prohibited from disclosing to any person involved in the transaction that a SAR has been filed or may be filed (31 USC § 5318(g)(2)). This is the SAR tipping-off prohibition. Filing thresholds by institution type: Banks (31 CFR § 1020.320): $5,000 or more in funds — aggregate transaction amount of $5,000+ involving known or unknown suspect. MSBs (31 CFR § 1022.320): $2,000 or more in funds — lower threshold than banks. Broker-dealers (31 CFR § 1023.320): $5,000 or more in funds. Casino/card clubs: $5,000 or more. For transactions where the suspect is known: the threshold is $5,000 ($2,000 for MSBs). For transactions where the suspect is not known: the threshold is $25,000 for banks. Filing deadlines: standard SAR: 30 calendar days from the date the institution becomes aware of the suspicious transaction. If additional time is needed to identify a suspect: 60 calendar days — but this 60-day extended deadline applies only when the institution initially files a SAR without a known suspect and then subsequently identifies a suspect, requiring a supplemental SAR. For violations requiring immediate attention (e.g., ongoing crimes, terrorist activity): call law enforcement immediately (FBI, DEA, or local) AND file the SAR within 30 days. Continuing activity SARs: when suspicious activity continues over time (e.g., a customer with ongoing suspicious transaction patterns), the institution must file a SAR for the initial activity AND continuing activity SARs every 90 days while the activity continues. The 90-day continuing activity SAR is filed even if no single transaction exceeds the threshold during the 90-day period. SAR recordkeeping: maintain a copy of the SAR and all supporting documentation for 5 years from the date of filing (31 CFR § 1010.430). The documentation includes the SAR narrative — typically a detailed account of who, what, when, where, and why the transaction is suspicious. SAR narrative best practices: the narrative is the most legally significant part of a SAR. A good SAR narrative: identifies who is involved (customer name, account number, address, date of birth, identification numbers); describes what happened (transaction types, amounts, dates, counterparties); explains why the activity is suspicious (in concrete terms, not boilerplate like "transactions appear to be structured"); notes what the institution did to investigate; identifies any law enforcement contacts. Boilerplate or inadequate narratives are a common FinCEN exam finding — regulators expect the narrative to demonstrate the institution actually investigated and considered the specific suspicious indicators, not just checked a box. SAR safe harbor: financial institutions that file SARs in good faith are immune from civil liability to any person for any disclosure made in connection with the SAR (31 USC § 5318(g)(3)). The safe harbor applies whether or not the SAR results in any enforcement action, and protects both the institution and its employees. However: intentionally filing a false SAR or using the SAR process to retaliate against a customer does not receive safe harbor protection.',
  },
  {
    q: 'What are Currency Transaction Reports (CTRs), and what is the structuring prohibition?',
    a: 'Currency Transaction Reports (CTRs) are required when a financial institution conducts a currency transaction exceeding $10,000 in a single business day for or by a single person — or multiple transactions by or on behalf of the same person aggregating to more than $10,000 in cash in a single business day. Filing thresholds and basics: CTR threshold: >$10,000 in cash (currency) — includes US coins and currency, foreign currency, and certain monetary instruments. NOT triggered by: electronic transfers (wire, ACH), check payments, or credit card transactions — CTRs are specifically triggered by physical currency. CTR filer: banks, MSBs, casinos, and other covered financial institutions. Filing deadline: CTR must be filed electronically through FinCEN\'s BSA E-Filing System within 15 calendar days of the transaction. Currency transaction aggregation: The $10,000 threshold applies on an aggregate basis for the same person on the same business day. This means: if a person deposits $6,000 in the morning and $5,000 in the afternoon, the institution must file a CTR for the combined $11,000 in cash transactions. Multiple transactions at different branches on the same day are aggregated — tellers and the monitoring system must be able to link related transactions to the same person. CTR exemptions (FinCEN 31 CFR § 1010.315): certain customers can be exempt from CTR filing through the "Phase I" and "Phase II" exemption process: Phase I exempt persons (automatic exemption after initial designation): banks, government agencies, listed companies, and subsidiaries of listed companies. Phase II exempt persons (financial institution must affirmatively designate): non-listed businesses with a history of large cash transactions (established for 2+ years, incorporated in the US, minimum $10K cash transaction in the prior 12 months). Casinos are never exempt. The exemption does not mean the transactions are not monitored — the institution must still monitor exempt persons for unusual activity and can file SARs on exempt persons. The Structuring Prohibition (31 USC § 5324): one of the most significant and widely prosecuted provisions of the BSA is the prohibition on structuring — deliberately breaking up a currency transaction to avoid the CTR reporting requirement. Structuring is a federal crime regardless of whether the underlying funds are from legitimate sources. Elements of structuring: (1) The person structures a transaction (breaks it into pieces, conducts multiple transactions, arranges transactions to be conducted by or through another person); (2) The purpose is to evade the CTR reporting requirement; (3) The person has knowledge of the CTR reporting requirement and that structuring is a violation. The person does NOT need to know that structuring is illegal — knowledge that the CTR threshold exists and that they are deliberately staying below it is sufficient. Penalties: criminal structuring (31 USC § 5322): up to 5 years imprisonment (up to 10 years if part of a pattern of illegal activity or in furtherance of another federal crime); civil forfeiture of the structured funds. The "innocent structuring" defense: courts have split on whether a person can claim they structured transactions for privacy reasons (not to evade reporting) but knew about the reporting requirement. The Supreme Court in Ratzlaf v. United States (1994) held that the government must prove the person knew structuring was unlawful — but Congress subsequently amended § 5324 to only require knowledge of the reporting requirement, not knowledge that structuring is illegal, narrowing the defense. Structuring enforcement examples: individuals convicted of structuring often receive harsher treatment because structuring indicates knowledge of and deliberate evasion of AML controls. Multiple enforcement actions against small business owners, politicians, and financial industry participants for structuring have resulted in asset forfeiture and imprisonment. FinCEN Order on structuring (2019): FinCEN issued an order requiring banks to pay increased attention to customers who make frequent transactions just below the $10,000 threshold — "sub-threshold" transactions — as a potential structuring indicator.',
  },
  {
    q: 'What are the major FinCEN enforcement actions against fintech companies, and what compliance failures do they reveal?',
    a: 'FinCEN has increasingly focused enforcement on non-bank financial institutions, money services businesses, and fintech companies. The FinCEN enforcement record reveals a consistent pattern of failures — understanding these failures helps fintech companies prioritize compliance investments. FinCEN Civil Money Penalties (selected enforcement actions): (1) Capital One (2021): $390M civil money penalty — the largest MSB-related BSA penalty at the time. Capital One\'s check cashing division failed to file CTRs for tens of thousands of transactions and had systematic BSA failures including not filing SARs on suspicious activity for years. Critically, Capital One had identified the deficiencies internally but failed to remediate them promptly. The failure to remediate known deficiencies is consistently the most aggravating factor in FinCEN enforcement. (2) BitMEX (2021): $100M penalty for operating as an unregistered MSB (money services business). BitMEX argued it was a derivatives exchange and not a money services business — FinCEN and the CFTC disagreed. BitMEX also failed to implement an AML program, failed to file SARs, and facilitated transactions by sanctioned countries (Iran). (3) MoneyGram (2012): $100M penalty (DOJ/FinCEN joint action) for failing to maintain effective AML program and failing to terminate agents engaged in fraud and money laundering. MoneyGram had received thousands of customer complaints about fraud through its network but failed to file SARs or terminate the agents. (4) Western Union (2017): $586M penalty (the largest then for an MSB) for willfully failing to maintain an effective AML program and aiding and abetting wire fraud. Western Union had an AML program in place but failed to implement it effectively at the agent level. (5) Coinbase (2023): $50M settlement with New York Department of Financial Services for BSA/AML program failures — KYC backlogs, inadequate transaction monitoring, failure to file SARs on time. Notably, Coinbase had a known backlog of over 100,000 unreviewed KYC alerts at one point. The Coinbase settlement illustrates the volume challenge for high-growth fintech companies. Common compliance failure patterns from FinCEN enforcement: Pattern 1 — Failure to file SARs despite internal red flags: financial institutions that identified suspicious activity through customer service escalations, internal fraud teams, or transaction monitoring alerts but failed to translate those findings into SAR filings. The internal documentation of known suspicious activity without SAR filing is deeply aggravating to regulators. Pattern 2 — Inadequate transaction monitoring tuning: transaction monitoring systems with alert thresholds that are too high to catch suspicious activity, or systems that generate so many alerts that compliance teams cannot review them within the required timeframes. The volume-velocity problem: high-growth fintech companies often experience rapid customer growth that outpaces the capacity of manual SAR review teams. Pattern 3 — Agent/third-party network failures: MSBs with agent networks (MoneyGram, Western Union) that fail to monitor and terminate agents facilitating fraud or money laundering through their network. The MSB bears BSA responsibility for its agents\' transactions. Pattern 4 — Beneficial ownership collection gaps: institutions that fail to collect beneficial ownership for legal entity customers, or that rely on customer self-certification without any verification. Pattern 5 — Failure to update customer risk ratings: customers who were onboarded as low-risk but whose transaction patterns subsequently became suspicious, without the institution updating the risk rating and applying enhanced monitoring. The 2024 AML/CFT Program Rule (31 CFR Part 1010, proposed and expected to be finalized): FinCEN proposed significant updates to BSA program requirements in 2024, including: (a) Formal risk assessment requirement: institutions must conduct and document enterprise-wide AML risk assessments before designing their controls; (b) Effectiveness standard: AML programs must be "effective" — not just technically compliant — measured against national AML/CFT priorities published by FinCEN; (c) Risk-based resources: institutions must allocate AML resources proportional to their risk profile (not a one-size-fits-all compliance expenditure); (d) Reporting of AML program deficiencies: institutions may be required to proactively report material AML program deficiencies to FinCEN. The 2024 rule modernizes BSA compliance to be explicitly risk-based rather than procedural — shifting from "do you have a program?" to "is your program working?"',
  },
  {
    q: 'What are the specific AML/BSA obligations for crypto and virtual asset service providers (VASPs) under FinCEN guidance?',
    a: 'Virtual asset service providers (VASPs) — crypto exchanges, DeFi platforms, NFT marketplaces, crypto custodians, and virtual currency money transmitters — are subject to BSA/AML obligations through FinCEN\'s interpretation of the MSB definition applied to virtual currency activity. FinCEN\'s application of MSB rules to crypto: FinCEN issued its first guidance on virtual currency in 2013 (FIN-2013-G001), establishing that an "exchanger" (exchanges one type of currency for another, including virtual for real and vice versa) or "administrator" (issues, redeems, or exchanges virtual currency) of virtual currency is a money transmitter subject to BSA/AML obligations. The guidance was reinforced by FinCEN\'s 2019 guidance (FIN-2019-G001) providing additional examples of covered activities. The "money transmission" definitional test: a company is a money transmitter — and thus a covered MSB — if it accepts and transmits "value that substitutes for currency" on behalf of another person. This includes: (a) Centralized exchanges (Coinbase, Kraken, Binance.US) — classic money transmitters; (b) Non-custodial wallet providers — depends on whether they "accept" or transmit value. A wallet that simply holds keys without transferring value on behalf of users may not be a money transmitter; (c) DeFi protocols — FinCEN\'s 2019 guidance stated that a person who performs money transmission services is a money transmitter even if "the person uses distributed ledger technology or otherwise operates through a decentralized or autonomous platform." However, enforcement against truly decentralized protocols remains legally contested. Registration requirement: VASPs that qualify as MSBs must register with FinCEN as MSBs (FinCEN Form 107) within 180 days of establishing the business. Failure to register is a federal crime (18 USC § 1960). VASP BSA/AML program requirements: registered VASP-MSBs must implement the full 5-pillar BSA program. VASP-specific requirements: (a) CIP: collect identifying information (name, date of birth, address, ID number) before opening accounts or wallets for customers who access the exchange. This is the crypto exchange KYC requirement — users cannot remain anonymous on registered exchanges. (b) Transaction monitoring: VASP-specific monitoring for: unusually large transactions; rapid conversion between fiat and crypto; transactions with mixing services or privacy coins (Monero, Zcash); transactions involving high-risk jurisdictions; use of VPN to obscure IP geolocation. (c) Travel Rule compliance (FinCEN 2019 — 31 CFR § 103.33(g)): for transfers of $3,000 or more in virtual currency, the VASP must pass originator and beneficiary information to the receiving VASP (the "Travel Rule"). Implementation: the Bank Secrecy Act\'s Travel Rule requires the sending institution to include: (i) name of originator; (ii) account number; (iii) address; (iv) identity documentation type and number; (v) name of receiving financial institution; (vi) account number and address of beneficiary — transmitted to the receiving institution. Travel Rule compliance for crypto has been challenging because no industry-wide interoperability standard existed. TRISA (Travel Rule Information Sharing Architecture), OpenVASP, and TRUST (Travel Rule Universal Solution Technology) are competing protocols. FinCEN enforcement on Travel Rule for crypto: not yet systematic, but FinCEN has cited Travel Rule gaps as part of broader AML program failures. OFAC obligations for crypto companies: VASPs must comply with OFAC sanctions separately from BSA. OFAC sanctions compliance requires: screening customers and transaction counterparties against OFAC\'s Specially Designated Nationals (SDN) list; blocking transactions with sanctioned individuals and entities; blocking transactions with sanctioned jurisdictions (Cuba, Iran, North Korea, Syria, Crimea/Donetsk/Luhansk). OFAC expects VASPs to use blockchain analytics tools (Chainalysis, TRM Labs, Elliptic) to identify transactions with sanctioned addresses. BitMEX\'s inclusion of sanctioned jurisdictions as a basis for the $100M penalty illustrates the OFAC exposure for unmonitored crypto platforms. DeFi protocol AML questions: the FinCEN 2019 guidance covers "those who perform or facilitate" money transmission through a decentralized exchange. Protocols that do not hold funds, have no central counterparty, and are not "performing" transmission may argue they are not MSBs. However: front-end operators of DeFi protocols (the team that deploys and maintains the website) have been the targets of OFAC sanctions enforcement (Tornado Cash, 2022) and criminal charges (BitMEX founders). FinCEN has not provided definitive guidance on fully decentralized protocols, leaving DAOs and DeFi protocols in significant legal uncertainty.',
  },
]

export default function AMLBSAComplianceFintechGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'AML/BSA Compliance Program Guide for Fintech and Neobanks (2025): 5 Pillars, CDD Rule, SAR Filing, CTR Requirements, FinCEN Enforcement',
    description: 'BSA/AML compliance guide for fintech companies, neobanks, and MSBs: 5-pillar program (internal controls, BSA Officer, training, independent testing, CDD/beneficial ownership), FinCEN CDD Final Rule (31 CFR § 1010.230) 4-element framework, SAR thresholds ($2K-$5K) and 30/60-day deadlines, CTR $10K threshold and aggregation rules, structuring prohibition (31 USC § 5324), FinCEN enforcement (Capital One $390M, BitMEX $100M, Coinbase $50M), and virtual asset / crypto VASP AML obligations (Travel Rule, OFAC screening, DeFi uncertainty).',
    url: 'https://bizlegal-ai.com/guides/aml-bsa-compliance-program-fintech-neobank-guide',
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
      { '@type': 'ListItem', position: 3, name: 'AML/BSA Compliance Program Guide', item: 'https://bizlegal-ai.com/guides/aml-bsa-compliance-program-fintech-neobank-guide' },
    ],
  }

  const PROGRAM_PILLARS = [
    { pillar: '1', name: 'Internal Controls', req: 'Written policies and procedures identifying ML risks and controls', key: 'Customer acceptance policy; KYC procedures; risk-based due diligence; SAR/CTR filing procedures; recordkeeping' },
    { pillar: '2', name: 'BSA/AML Compliance Officer', req: 'Designated qualified individual managing day-to-day program', key: 'Appropriate AML expertise; direct access to board/senior management; adequate resources; independent authority' },
    { pillar: '3', name: 'Employee Training', req: 'Ongoing AML training tailored to each employee\'s role', key: 'Red flags for suspicious activity; internal reporting procedures; SAR tipping-off prohibition; training records maintained' },
    { pillar: '4', name: 'Independent Testing', req: 'Periodic independent audit of program effectiveness', key: 'Cannot be performed by BSA Officer or operational compliance staff; internal audit or external examiner; documented results' },
    { pillar: '5', name: 'Customer Due Diligence (CDD)', req: 'Risk-based KYC including beneficial ownership of legal entity customers', key: 'CIP (name, DOB, address, ID#); risk rating; 25% ownership + Control Prong for entities; ongoing monitoring; EDD for high-risk' },
  ]

  const SAR_THRESHOLDS = [
    { type: 'Banks', minKnownSuspect: '$5,000', minUnknownSuspect: '$25,000', deadline: '30 days; 60 days if identifying suspect' },
    { type: 'Money Services Businesses (MSBs)', minKnownSuspect: '$2,000', minUnknownSuspect: '$2,000', deadline: '30 days; 60 days if identifying suspect' },
    { type: 'Broker-Dealers', minKnownSuspect: '$5,000', minUnknownSuspect: '$25,000', deadline: '30 days; 60 days if identifying suspect' },
    { type: 'Casinos / Card Clubs', minKnownSuspect: '$5,000', minUnknownSuspect: '$25,000', deadline: '30 days; 60 days if identifying suspect' },
    { type: 'Continuing Activity SAR', minKnownSuspect: 'N/A', minUnknownSuspect: 'N/A', deadline: 'Every 90 days while suspicious activity continues' },
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
          AML/BSA Compliance Program Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          AML / FinCEN / Fintech Compliance
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          AML/BSA Compliance Program Guide for Fintech and Neobanks (2025): 5 Pillars, CDD Rule, SAR and CTR Filing Requirements, Structuring Prohibition, and FinCEN Enforcement
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Bank Secrecy Act compliance applies to money services businesses, neobanks, crypto exchanges, and any fintech conducting money transmission. The 5-pillar program framework, CDD beneficial ownership rule, SAR/CTR filing obligations, and FinCEN&apos;s enforcement pattern — including the $390M Capital One penalty — define what &quot;adequate&quot; looks like in examination.
        </p>

        <div style={{ padding: '1rem 1.25rem', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '8px', marginBottom: '2.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7 }}>
            <strong>Structuring is a Federal Crime Regardless of the Underlying Funds&apos; Source:</strong> 31 USC § 5324 prohibits structuring transactions to avoid the $10,000 CTR threshold — even if the money is entirely legitimate. Knowledge that the CTR threshold exists + deliberate sub-threshold splitting = federal structuring offense. The defense that &quot;I just wanted privacy&quot; does not defeat the charge.
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>BSA/AML 5-Pillar Program Requirements</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '520px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600, width: '36px' }}>#</th>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600 }}>Pillar</th>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600 }}>Requirement</th>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600 }}>Key Elements</th>
                </tr>
              </thead>
              <tbody>
                {PROGRAM_PILLARS.map(({ pillar, name, req, key }) => (
                  <tr key={pillar} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '9px 11px', fontWeight: 700, color: '#1a56db', verticalAlign: 'top', fontSize: '0.85rem' }}>{pillar}</td>
                    <td style={{ padding: '9px 11px', fontWeight: 700, verticalAlign: 'top', fontSize: '0.76rem' }}>{name}</td>
                    <td style={{ padding: '9px 11px', verticalAlign: 'top', opacity: 0.85, fontSize: '0.75rem' }}>{req}</td>
                    <td style={{ padding: '9px 11px', verticalAlign: 'top', opacity: 0.75, fontSize: '0.73rem' }}>{key}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>SAR Filing Thresholds and Deadlines by Institution Type</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600 }}>Institution Type</th>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600 }}>Known Suspect</th>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600 }}>Unknown Suspect</th>
                  <th style={{ textAlign: 'left', padding: '9px 11px', fontWeight: 600 }}>Filing Deadline</th>
                </tr>
              </thead>
              <tbody>
                {SAR_THRESHOLDS.map(({ type, minKnownSuspect, minUnknownSuspect, deadline }) => (
                  <tr key={type} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '9px 11px', fontWeight: 600, verticalAlign: 'top', fontSize: '0.76rem' }}>{type}</td>
                    <td style={{ padding: '9px 11px', verticalAlign: 'top', fontWeight: 700, color: '#dc2626', fontSize: '0.76rem' }}>{minKnownSuspect}</td>
                    <td style={{ padding: '9px 11px', verticalAlign: 'top', fontWeight: 700, color: '#dc2626', fontSize: '0.76rem' }}>{minUnknownSuspect}</td>
                    <td style={{ padding: '9px 11px', verticalAlign: 'top', opacity: 0.8, fontSize: '0.75rem' }}>{deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your MSB Agreement, AML Policy, or Banking-as-a-Service Contract for BSA Compliance Gaps</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your AML/BSA policy, money services agreement, or banking-as-a-service (BaaS) contract. BizLegal AI reviews for BSA program 5-pillar completeness, CDD Rule compliance gaps (CIP collection requirements, beneficial ownership 25% + Control Prong), SAR filing procedure adequacy, CTR aggregation obligations, OFAC screening requirements, FinCEN registration status for MSBs, Travel Rule obligations for crypto transfers ($3,000+ threshold), BaaS sponsor bank responsibility allocation, and BSA Officer designation and qualification requirements.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your AML Policy or MSB Agreement →
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
            <Link href="/guides/beneficial-ownership-information-filing" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>BOI Filing Guide (CTA) →</Link>
            <Link href="/guides/mica-regulation-crypto-compliance" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>MiCA Crypto Compliance →</Link>
            <Link href="/guides/payment-processing-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Payment Processing Compliance →</Link>
            <Link href="/guides/regulation-e-electronic-fund-transfer-fintech-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Regulation E EFT Guide →</Link>
            <Link href="/guides/data-breach-response-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Data Breach Response →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. BSA/AML regulations are subject to ongoing FinCEN rulemaking, including the 2024 AML/CFT Program Rule expected to be finalized. Virtual asset and DeFi protocol AML obligations remain an area of active regulatory development. SAR and CTR thresholds, filing deadlines, and penalty amounts should be verified against current FinCEN guidance and regulations at 31 CFR Chapter X. Consult qualified AML counsel and a licensed compliance professional before implementing a BSA/AML program.
          </p>
        </footer>

      </main>
    </>
  )
}
