import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorBio from '@/components/AuthorBio'

type Props = { params: { slug: string } }

const HUB_DATA: Record<string, any> = {
  sec: {
    tag: 'US Securities Law',
    title: 'SEC Compliance Hub',
    subtitle: 'Navigating U.S. Securities Law for Digital Assets, Token Offerings, and Digital Asset Broker-Dealers',
    authority: 'Securities & Exchange Commission',
    jurisdiction: 'United States',
    maxFine: 'Disgorgement + civil monetary penalties (uncapped)',
    difficulty: 85,
    color: '#2563eb',
    intro: 'The Securities and Exchange Commission has emerged as the dominant enforcement force in the digital asset space, applying 1933 Securities Act frameworks to token offerings, exchange operations, and investment contracts across all fifty states. SEC v. Ripple Labs, decided in July 2023, established a bifurcated framework distinguishing institutional XRP sales from programmatic exchange sales under the Howey Test — a precedent that continues to reverberate across the industry.',
    section1: {
      title: 'What SEC Regulation Covers',
      body: 'The SEC regulates securities offerings, broker-dealer operations, investment advisers, and investment companies. For digital assets, the Commission applies the Howey Test — derived from SEC v. W.J. Howey Co. (1946) — to determine whether a token constitutes a security. The four-prong test requires: (1) investment of money; (2) in a common enterprise; (3) with an expectation of profits; (4) derived primarily from the efforts of others.\n\nBeyond the Howey Test, the SEC has issued enforcement guidance on exchanges (requiring registration as national securities exchanges or ATS platforms), custodians (requiring qualified custodian status), and advisers managing digital asset portfolios.',
    },
    section2: {
      title: 'Who Must Comply',
      checklist: [
        'Token issuers conducting public or private offerings in the U.S.',
        'Platforms facilitating trading of securities tokens',
        'Investment advisers managing digital asset portfolios',
        'Broker-dealers executing securities token transactions',
        'Investment companies holding digital asset securities',
        'Transfer agents for tokenised securities',
      ],
    },
    section3: {
      title: 'Penalties and Enforcement History',
      body: 'SEC enforcement actions against digital asset issuers have resulted in disgorgement of profits plus prejudgment interest, civil monetary penalties, and injunctions against future violations. The Commission has demonstrated willingness to pursue enforcement regardless of issuer domicile — asserting jurisdiction wherever U.S. investors are affected.',
    },
    timeline: [
      { date: 'Jul 2023', event: 'SEC v. Ripple Labs', detail: 'SDNY ruled programmatic XRP sales were unregistered securities. Ripple liable for $125.5M penalty.' },
      { date: 'Jun 2023', event: 'SEC v. Coinbase / Binance', detail: 'SEC filed suits against both exchanges alleging unlicensed securities trading. Over 12 tokens named as securities.' },
      { date: 'Feb 2023', event: 'Kraken Settlement', detail: 'Kraken paid $30M and shut down staking programme following SEC enforcement action.' },
      { date: 'Nov 2022', event: 'Genesis / Gemini', detail: 'SEC charged both entities in connection with unregistered securities offerings via Earn programme.' },
      { date: 'Feb 2020', event: 'Telegram $1.7B Settlement', detail: 'Telegram agreed to return $1.2B to investors and pay $18.5M penalty for unregistered GRAM token offering.' },
    ],
    comparison: {
      headers: ['Dimension', 'SEC', 'MiCA', 'GDPR'],
      rows: [
        ['Applicability', 'U.S. investors globally', 'EU markets', 'EU/EEA data subjects'],
        ['Max Fine', 'Uncapped disgorgement', '€5M or 3% turnover', '€20M or 4% turnover'],
        ['Enforcement Body', 'Securities & Exchange Commission', 'ESMA + NCAs', 'National DPAs'],
        ['Compliance Timeline', 'Immediate (no transition)', 'Dec 2024 full application', 'Since May 2018'],
        ['Officer Requirement', 'Chief Compliance Officer', 'Compliance function', 'Data Protection Officer'],
      ],
    },
    mitigations: [
      { title: 'Conduct a Howey Test Analysis', body: 'For each token or digital asset offering, obtain formal legal opinion applying all four Howey prongs. Document the analysis and maintain it in your compliance file.' },
      { title: 'Register or Identify Exemption', body: 'If a token qualifies as a security, either register the offering with the SEC under the Securities Act or identify an applicable exemption (Reg D, Reg S, Reg A+). Do not offer to U.S. investors without one.' },
      { title: 'Implement Exchange Compliance', body: 'If operating a trading platform for security tokens, apply for ATS registration or national securities exchange status. Engage FINRA-registered broker-dealer infrastructure.' },
    ],
    precedent: 'SEC v. Ripple Labs, No. 20-cv-10832 (S.D.N.Y. 2023): "The Court finds that Ripple\'s programmatic sales of XRP on digital asset exchanges did not constitute the offer or sale of investment contracts... [However] Ripple\'s direct sales to institutional investors did constitute unregistered securities offerings." — Judge Analisa Torres.',
    faqs: [
      { q: 'Does the SEC have jurisdiction over non-U.S. token issuers?', a: 'Yes. The SEC asserts jurisdiction wherever U.S. investors are offered or sold securities. The Dodd-Frank Act extends extraterritorial reach for fraud and manipulation involving U.S. markets, regardless of issuer domicile.' },
      { q: 'What is the difference between a utility token and a security token?', a: 'The distinction is fact-specific under the Howey Test. A token with immediate utility, no expectation of profit, and no reliance on issuer efforts is more likely to be characterised as a commodity or utility. The SEC has declined to provide a bright-line definition, reviewing each token on its facts.' },
      { q: 'What disclosures are required for a Reg D token offering?', a: 'Reg D 506(c) exemption requires filing Form D within 15 days of first sale, general solicitation limited to accredited investors, and reasonable steps to verify accredited investor status. No prescribed disclosure document format, but anti-fraud provisions apply to all material representations.' },
    ],
  },
  mica: {
    tag: 'EU Crypto-Asset Markets',
    title: 'MiCA Framework Hub',
    subtitle: 'Markets in Crypto-Assets Regulation — The EU\'s Comprehensive Framework for Token Issuers and CASPs',
    authority: 'ESMA + National Competent Authorities',
    jurisdiction: 'European Union',
    maxFine: '€5M or 3% of annual global turnover',
    difficulty: 78,
    color: '#b4c5ff',
    intro: 'The Markets in Crypto-Assets Regulation (MiCA), Regulation (EU) 2023/1114, entered into force on 29 June 2023 with phased application: Title III and IV (ART and EMT provisions) applied from 30 June 2024, with full application from 30 December 2024. MiCA represents the world\'s first comprehensive statutory framework for crypto-assets, establishing passport rights across all 27 EU Member States.',
    section1: {
      title: 'What MiCA Covers',
      body: 'MiCA establishes a three-tier classification for crypto-assets: (1) Asset-Referenced Tokens (ARTs) — tokens referencing multiple assets, currencies, or commodities; (2) E-Money Tokens (EMTs) — tokens referencing a single fiat currency; (3) Other crypto-assets — all other tokens not qualifying as ARTs or EMTs and not constituting financial instruments under MiFID II. Each tier carries distinct obligations for issuers and CASPs (Crypto-Asset Service Providers).',
    },
    section2: {
      title: 'Who Must Comply',
      checklist: [
        'Issuers of asset-referenced tokens (ARTs) in the EU',
        'Issuers of e-money tokens (EMTs) in the EU',
        'Crypto-asset service providers (exchanges, brokers, custodians)',
        'Advisers providing crypto-asset advisory services to EU clients',
        'Platforms operating crypto-asset trading facilities',
        'Any entity marketing crypto-assets to EU retail investors',
      ],
    },
    section3: {
      title: 'Penalties and Enforcement',
      body: 'MiCA penalties are administered by National Competent Authorities (NCAs) and coordinated by ESMA. Maximum administrative penalties for ART/EMT issuers: €5M or 3% of global annual turnover. For CASPs: €700,000 for individuals, €5M for legal entities. Criminal sanctions may apply in parallel under national law.',
    },
    timeline: [
      { date: 'Jun 2023', event: 'MiCA Published', detail: 'Regulation (EU) 2023/1114 published in the Official Journal of the European Union.' },
      { date: 'Jun 2024', event: 'ART/EMT Provisions', detail: 'Titles III and IV (ART and EMT obligations) entered application across all 27 Member States.' },
      { date: 'Dec 2024', event: 'Full Application', detail: 'MiCA applies in full, including CASP authorisation requirements under Title V.' },
      { date: 'Q1 2025', event: 'First CASP Licences', detail: 'Multiple CASPs received MiCA authorisations under transitional provisions. Bitpanda among first licensed.' },
      { date: 'H2 2025', event: 'Enforcement Actions', detail: 'NCAs commenced enforcement against unlicensed CASPs operating in EU without authorisation.' },
    ],
    comparison: {
      headers: ['Dimension', 'MiCA', 'SEC', 'VARA'],
      rows: [
        ['Applicability', 'EU/EEA markets', 'U.S. investors globally', 'Dubai operations'],
        ['Max Fine', '€5M or 3% turnover', 'Uncapped disgorgement', 'Unlimited + suspension'],
        ['Enforcement Body', 'ESMA + NCAs', 'SEC', 'VARA'],
        ['Compliance Timeline', 'Dec 2024 full application', 'Immediate', 'Phased 2023-2025'],
        ['Officer Requirement', 'Compliance function', 'Chief Compliance Officer', 'AML/Compliance Officer'],
      ],
    },
    mitigations: [
      { title: 'Classify Your Crypto-Assets', body: 'Apply MiCA\'s three-tier classification to each token. Engage legal counsel in an EU Member State to confirm classification. ARTs and EMTs face the most stringent obligations including whitepaper approval and capital requirements.' },
      { title: 'Apply for CASP Authorisation', body: 'CASPs must obtain authorisation from the NCA of their home Member State. Passporting rights then apply across all 27 EU states. Prepare a comprehensive application including governance, capital, and operational documentation.' },
      { title: 'Prepare MiCA-Compliant Whitepaper', body: 'Token whitepapers must comply with Article 6 (ART), Article 51 (EMT), or Article 6 (other crypto-assets) requirements. Whitepapers must be notified to the NCA and published on ESMA\'s register.' },
    ],
    precedent: 'ESMA Q&A on MiCA Application (2024): "An issuer of crypto-assets that are accessible to retail investors in the EU is subject to MiCA obligations regardless of where the issuer is established, provided that those crypto-assets are offered to the public in the Union or admitted to trading on a trading platform for crypto-assets established in the Union."',
    faqs: [
      { q: 'Does MiCA apply to NFTs?', a: 'Generally no. MiCA recital 10 states that unique and non-fungible crypto-assets are excluded from scope. However, if NFTs are issued in large series or collections rendering them fungible in practice, or if fractionalized, MiCA classification applies. The European Securities and Markets Authority (ESMA) has confirmed a case-by-case analysis is required.' },
      { q: 'Can a non-EU company passport MiCA authorisation?', a: 'No. MiCA passporting is available only to legal entities established in an EU/EEA Member State. Third-country firms may offer services under third-country regime provisions pending future EU equivalence decisions, subject to reverse solicitation rules.' },
      { q: 'What is the MiCA whitepaper liability regime?', a: 'Article 26 MiCA establishes civil liability for material misstatements or omissions in a crypto-asset whitepaper. Issuers are liable to investors who relied on the whitepaper where the information was untrue, inaccurate, or misleading. Liability cannot be excluded by contract.' },
    ],
  },
  vara: {
    tag: 'UAE Virtual Assets',
    title: 'VARA Compliance Hub',
    subtitle: 'Dubai Virtual Assets Regulatory Authority — Licensing, Operations, and Compliance for UAE Virtual Asset Service Providers',
    authority: 'Virtual Assets Regulatory Authority (VARA)',
    jurisdiction: 'Dubai, UAE',
    maxFine: 'Business suspension + criminal prosecution',
    difficulty: 72,
    color: '#e9c349',
    intro: 'The Virtual Assets Regulatory Authority (VARA), established under Dubai Law No. 4 of 2022, is the world\'s first dedicated regulatory authority for virtual assets at emirate level. VARA operates under the Dubai Financial Services Authority (DFSA) framework and maintains exclusive regulatory authority over all virtual asset activities conducted in or from Dubai — including the DIFC and special economic zones.',
    section1: {
      title: 'What VARA Regulates',
      body: 'VARA regulates all Virtual Asset Service Providers (VASPs) offering exchange, brokerage, management, advisory, lending/borrowing, or transfer services in or from Dubai. VARA\'s four licence categories cover: Category 1 (Exchange Services), Category 2 (Broker-Dealer Services), Category 3 (Asset Management and Investment Management), and Category 4 (Advisory Services). Each category carries distinct capital adequacy, governance, and operational requirements.',
    },
    section2: {
      title: 'Who Must Comply',
      checklist: [
        'Virtual asset exchanges operating in Dubai',
        'Crypto broker-dealers serving UAE clients',
        'Virtual asset custody service providers',
        'Digital asset fund managers and advisers',
        'DeFi protocol operators with Dubai nexus',
        'NFT marketplaces operating from Dubai',
      ],
    },
    section3: {
      title: 'Penalties and Enforcement',
      body: 'VARA enforcement actions result in immediate business suspension, financial penalties, and referral to the UAE Public Prosecution for criminal proceedings. VARA has confirmed it will not grant transition periods for unlicensed operations. The UAE criminal code provides for imprisonment and fines for unauthorised financial business.',
    },
    timeline: [
      { date: 'Mar 2022', event: 'VARA Established', detail: 'Dubai Law No. 4 of 2022 established VARA as the standalone virtual asset regulator for Dubai.' },
      { date: 'Feb 2023', event: 'VARA Rulebooks Published', detail: 'VARA published comprehensive rulebooks covering all four licence categories with full compliance requirements.' },
      { date: 'Q4 2023', event: 'First Enforcement Action', detail: 'VARA issued first enforcement action against unlicensed VASP, imposing business suspension and prosecution referral.' },
      { date: 'Q1 2024', event: 'Major VASPs Licensed', detail: 'Binance, OKX, Bybit and others received VARA licences under the full regulatory framework.' },
      { date: 'Q3 2024', event: 'Custody Rulebook', detail: 'VARA published enhanced custody rulebook requiring segregation of client assets and insurance requirements.' },
    ],
    comparison: {
      headers: ['Dimension', 'VARA', 'MiCA', 'SEC'],
      rows: [
        ['Applicability', 'Dubai operations', 'EU/EEA markets', 'U.S. investors globally'],
        ['Max Fine', 'Suspension + prosecution', '€5M or 3% turnover', 'Uncapped disgorgement'],
        ['Enforcement Body', 'VARA', 'ESMA + NCAs', 'SEC'],
        ['Compliance Timeline', 'Phased 2023-2025', 'Dec 2024 full application', 'Immediate'],
        ['Officer Requirement', 'AML Compliance Officer', 'Compliance function', 'Chief Compliance Officer'],
      ],
    },
    mitigations: [
      { title: 'Identify Your VARA Licence Category', body: 'Review all virtual asset activities against VARA\'s four licence categories. Engage UAE-qualified legal counsel to confirm classification. Apply for the broadest category that covers your full business scope.' },
      { title: 'Submit VARA Application', body: 'VARA applications require a comprehensive governance framework, AML/CFT policies, capital adequacy documentation, and key personnel fit-and-proper assessments. Initial application fees range from AED 20,000 to AED 100,000 depending on category.' },
      { title: 'Implement VARA-Compliant AML/KYC', body: 'VARA mandates full FATF Recommendation 16 compliance including Travel Rule implementation. Establish documented CDD, EDD, and transaction monitoring programmes reviewed by UAE-qualified AML compliance officer.' },
    ],
    precedent: '"VARA will not hesitate to take immediate action against entities operating in Dubai without the requisite licence. The authority of VARA extends to all virtual asset activities conducted in or from Dubai, regardless of corporate structure or geographic location of servers." — VARA Regulatory Statement, Q4 2023.',
    faqs: [
      { q: 'Does VARA regulate activities in the DIFC?', a: 'Yes. Dubai Law No. 4 of 2022 explicitly extends VARA jurisdiction to activities conducted in or from the Dubai International Financial Centre (DIFC). Activities may require both VARA licensing and DFSA registration, depending on the nature of services. VARA and DFSA have signed a memorandum of understanding for coordinated supervision.' },
      { q: 'What is the minimum capital requirement for a VARA licence?', a: 'Capital requirements vary by licence category. Category 1 (Exchange) requires minimum paid-up capital of AED 1,000,000. Category 3 (Asset Management) requires AED 500,000. Requirements escalate based on assets under management and transaction volumes. VARA may impose additional capital buffers at its discretion.' },
      { q: 'Can foreign VASPs serve UAE clients without a VARA licence?', a: 'No. Providing virtual asset services to UAE residents without VARA authorisation constitutes unlicensed financial business under UAE law. Reverse solicitation exceptions are narrowly construed by VARA. Regulators have demonstrated willingness to pursue enforcement against offshore operators targeting Dubai residents.' },
    ],
  },
  gdpr: {
    tag: 'EU Data Privacy',
    title: 'GDPR Compliance Hub',
    subtitle: 'EU General Data Protection Regulation — Obligations, Enforcement, and Compliance for Data Controllers and Processors',
    authority: 'National Data Protection Authorities (DPAs)',
    jurisdiction: 'European Union + EEA',
    maxFine: '€20M or 4% of global annual turnover',
    difficulty: 70,
    color: '#10B981',
    intro: 'The General Data Protection Regulation (GDPR), Regulation (EU) 2016/679, has been fully applicable since 25 May 2018 and represents the world\'s most comprehensive data protection framework. With cumulative fines exceeding €4.5 billion by 2024, GDPR enforcement has significantly reshaped how organizations globally process personal data of EU/EEA residents — irrespective of the organisation\'s domicile.',
    section1: {
      title: 'What GDPR Covers',
      body: 'GDPR applies to any organisation that processes personal data of individuals located in the EU/EEA, regardless of where the organisation is established. Core obligations include: identifying a lawful basis for processing (Article 6), fulfilling data subject rights (Articles 15-22), implementing appropriate technical and organisational measures (Article 32), conducting Data Protection Impact Assessments for high-risk processing (Article 35), and appointing a Data Protection Officer where required (Article 37).',
    },
    section2: {
      title: 'Who Must Comply',
      checklist: [
        'Any organisation processing EU/EEA resident data',
        'Data processors acting on behalf of EU controllers',
        'Organisations monitoring EU resident behaviour online',
        'Businesses offering goods/services to EU residents',
        'Organisations transferring EU data to third countries',
        'Healthcare providers, financial institutions, and tech companies with EU users',
      ],
    },
    section3: {
      title: 'Penalties and Enforcement',
      body: 'GDPR penalties operate on two tracks under Article 83. Lower-tier violations (Art. 83.4) — including security breach notification failures and processor obligations — carry fines up to €10M or 2% of global annual turnover. Upper-tier violations (Art. 83.5) — including unlawful processing and data subject rights infringements — carry fines up to €20M or 4% of global turnover.',
    },
    timeline: [
      { date: 'Jul 2021', event: 'Luxembourg: Amazon €746M', detail: 'Luxembourg DPA imposed €746M fine on Amazon for behavioural advertising without adequate consent. Largest GDPR fine at time of issuance.' },
      { date: 'Sep 2021', event: 'Ireland: WhatsApp €225M', detail: 'Irish DPC imposed €225M fine on WhatsApp for transparency failures regarding data sharing with Meta companies.' },
      { date: 'Jan 2023', event: 'France: TikTok €5M', detail: 'CNIL imposed €5M fine on TikTok for cookie consent failures and inadequate user opt-out mechanisms.' },
      { date: 'May 2023', event: 'Ireland: Meta €1.2B', detail: 'Irish DPC imposed record €1.2B fine on Meta Platforms for unlawful EU-U.S. data transfers without adequate safeguards.' },
      { date: 'Nov 2023', event: 'Netherlands: Uber €290M', detail: 'Dutch DPA imposed €290M fine on Uber for transferring EU driver data to the U.S. without standard contractual clauses.' },
    ],
    comparison: {
      headers: ['Dimension', 'GDPR', 'CCPA (US)', 'PDPA (Thailand)'],
      rows: [
        ['Applicability', 'EU/EEA data subjects globally', 'California residents', 'Thailand data subjects'],
        ['Max Fine', '€20M or 4% turnover', '$7,500 per intentional violation', 'THB 5M (~€140K)'],
        ['Enforcement Body', 'National DPAs + EDPB', 'California AG + CPPA', 'Office of PDPC'],
        ['Compliance Timeline', 'Since May 2018', 'Since Jan 2020', 'Since Jun 2022'],
        ['DPO Requirement', 'Mandatory in 3 scenarios', 'No equivalent', 'No equivalent'],
      ],
    },
    mitigations: [
      { title: 'Conduct a Data Processing Audit', body: 'Map all personal data flows and document processing activities in your Article 30 Record of Processing Activities (RoPA). Identify the lawful basis for each processing purpose. Review existing consent mechanisms for compliance with Article 7 requirements.' },
      { title: 'Appoint a Data Protection Officer', body: 'Assess whether your organisation meets any of the three DPO mandate triggers under Article 37. If required, appoint a qualified DPO and register their contact details with the lead supervisory authority. Ensure operational independence under Article 38.' },
      { title: 'Implement Cross-Border Transfer Mechanisms', body: 'For transfers to non-adequate third countries (including the U.S. absent Privacy Shield successor), implement Standard Contractual Clauses (SCCs) with Transfer Impact Assessments (TIAs). Document supplementary measures where required by Schrems II analysis.' },
    ],
    precedent: 'Data Protection Commissioner v. Facebook Ireland (Meta Platforms) — Irish DPC Decision IN-18-5-7 (May 2023): "The DPC finds that Meta Platforms Ireland Limited\'s transfers of personal data to the United States of America... lack a valid legal basis under Chapter V GDPR. The unlawful transfers were carried out on a massive scale over a period of years."',
    faqs: [
      { q: 'Does GDPR apply to U.S. companies without EU offices?', a: 'Yes. Article 3(2) GDPR applies to controllers and processors not established in the EU where processing activities relate to offering goods or services to EU/EEA data subjects, or monitoring their behaviour. U.S. companies serving EU customers are subject to full GDPR compliance obligations and must appoint an EU representative under Article 27.' },
      { q: 'What constitutes a GDPR data breach requiring notification?', a: 'Article 33 requires notification to the competent supervisory authority within 72 hours of becoming aware of a personal data breach that is likely to result in a risk to the rights and freedoms of individuals. Higher-risk breaches additionally require notification to affected data subjects under Article 34. Not all breaches require notification — low-risk incidents may be documented internally only.' },
      { q: 'Can consent be withdrawn after being given?', a: 'Yes. Article 7(3) GDPR provides that data subjects may withdraw consent at any time, and withdrawal must be as easy as giving consent. Processing carried out before withdrawal remains lawful, but processing on the basis of withdrawn consent must cease. Organisations relying solely on consent as the lawful basis must implement robust withdrawal mechanisms.' },
    ],
  },
  aml: {
    tag: 'Global Financial Crime',
    title: 'AML & KYC Compliance Hub',
    subtitle: 'Anti-Money Laundering and Know-Your-Customer Frameworks for Financial Institutions and Virtual Asset Service Providers',
    authority: 'FATF + National Financial Intelligence Units',
    jurisdiction: 'Global (FATF Members)',
    maxFine: 'Unlimited — jurisdiction-dependent',
    difficulty: 75,
    color: '#f87171',
    intro: 'The Financial Action Task Force (FATF), established in 1989 by the G7, sets the international standard for anti-money laundering, counter-terrorist financing, and counter-proliferation financing frameworks. FATF\'s 40 Recommendations — including the critical "Travel Rule" under Recommendation 16 — are implemented by 200+ jurisdictions globally through national legislation. For virtual asset service providers (VASPs), FATF Guidance published in 2019 and updated in 2021 extended full AML obligations to crypto exchanges, custodians, and related service providers.',
    section1: {
      title: 'What AML/KYC Frameworks Cover',
      body: 'AML/KYC obligations for VASPs and financial institutions encompass: (1) Customer Due Diligence (CDD) — verifying the identity of customers before establishing business relationships; (2) Enhanced Due Diligence (EDD) — for high-risk customers, PEPs, and high-risk jurisdictions; (3) Ongoing Transaction Monitoring — detecting unusual or suspicious transaction patterns; (4) Suspicious Activity Reporting (SAR) — mandatory filing with Financial Intelligence Units; (5) Travel Rule compliance under FATF Recommendation 16 — transmitting beneficiary information for transfers above USD 1,000.',
    },
    section2: {
      title: 'Who Must Comply',
      checklist: [
        'Virtual asset exchanges and trading platforms',
        'Crypto custodians and wallet providers',
        'Banks and payment institutions handling crypto',
        'DeFi protocol operators with identifiable control',
        'NFT marketplaces processing significant volumes',
        'Crypto lending and borrowing platforms',
      ],
    },
    section3: {
      title: 'Penalties and Enforcement',
      body: 'AML penalties are uncapped in most jurisdictions and may include criminal prosecution of individuals. The FATF grey-list and black-list mechanisms create significant market access restrictions for jurisdictions failing to implement adequate AML frameworks. Institutional fines have exceeded $10 billion in individual cases.',
    },
    timeline: [
      { date: 'Jun 2019', event: 'FATF VASP Guidance', detail: 'FATF extended AML/CFT obligations to VASPs and introduced Travel Rule for crypto transfers.' },
      { date: 'Nov 2023', event: 'Binance $4.3B Settlement', detail: 'Binance paid $4.3B to CFTC, FinCEN, and OFAC for systemic AML failures and unlicensed money transmission.' },
      { date: 'Q1 2024', event: 'EU 6AMLD Full Application', detail: 'EU\'s 6th Anti-Money Laundering Directive applied, extending AML criminal liability and harmonising EU frameworks.' },
      { date: 'Jun 2024', event: 'EU AML Package', detail: 'EU AMLA (Anti-Money Laundering Authority) established, centralising EU AML supervision from 2025.' },
      { date: 'Q4 2024', event: 'Travel Rule Global Enforcement', detail: 'Multiple jurisdictions commenced Travel Rule enforcement, with Singapore MAS and UK FCA issuing penalties for non-compliance.' },
    ],
    comparison: {
      headers: ['Dimension', 'FATF Rec. 16', '6AMLD (EU)', 'FinCEN (US)'],
      rows: [
        ['Applicability', 'Global VASPs and FIs', 'EU financial institutions', 'U.S. money services businesses'],
        ['Max Fine', 'Jurisdiction-dependent', 'Criminal penalties + license revocation', 'Unlimited civil + criminal'],
        ['Enforcement Body', 'National FIUs', 'EU AMLA + NCAs', 'FinCEN + DOJ'],
        ['Compliance Timeline', 'Varies by jurisdiction', 'Q4 2024 (6AMLD)', 'Immediate (Bank Secrecy Act)'],
        ['Officer Requirement', 'AML Compliance Officer', 'MLRO', 'Bank Secrecy Act Officer'],
      ],
    },
    mitigations: [
      { title: 'Implement Travel Rule Compliance', body: 'Deploy a FATF Recommendation 16-compliant Travel Rule solution for all virtual asset transfers above USD 1,000. Verify counterpart VASP identity and obtain/transmit originator and beneficiary information. Document your Travel Rule policy and maintain records for five years.' },
      { title: 'Establish KYC/CDD Programme', body: 'Implement a risk-based CDD programme including identity verification, beneficial ownership determination, and PEP/sanctions screening. Apply Enhanced Due Diligence to high-risk customers, high-risk jurisdictions, and unusual transaction patterns. Document all CDD decisions.' },
      { title: 'Deploy Transaction Monitoring', body: 'Implement automated transaction monitoring with rules calibrated to your VASP risk profile. Establish a SAR filing process with clear escalation procedures. Train compliance staff on red-flag recognition. Conduct annual independent AML/CFT programme reviews.' },
    ],
    precedent: 'FinCEN, CFTC, OFAC v. Binance Holdings Limited (November 2023): "Binance wilfully failed to implement an effective AML programme, wilfully failed to file Suspicious Activity Reports, and operated an unlicensed money transmitting business... Binance knowingly allowed U.S. users to access its platform while implementing sham compliance programmes designed to create the appearance of compliance while undermining it." — Department of Justice Statement.',
    faqs: [
      { q: 'What is the FATF Travel Rule threshold for crypto?', a: 'FATF Recommendation 16 applies the Travel Rule to virtual asset transfers at or above USD/EUR 1,000. Originating VASPs must transmit originator name, account number, address, national identity number, and date/place of birth. Beneficiary VASPs must obtain and hold beneficiary information. Some jurisdictions apply lower thresholds.' },
      { q: 'Does the Travel Rule apply to DeFi protocols?', a: 'FATF\'s updated 2021 Guidance states that if a DeFi protocol is controlled or influenced by an owner/operator who provides VASP services, Travel Rule obligations apply. Truly decentralised protocols without an identifiable controlling entity remain in regulatory limbo, but FATF has signalled intent to bring all functionally equivalent activities within scope.' },
      { q: 'What constitutes a Suspicious Activity Report trigger?', a: 'SAR filing is triggered by knowledge or suspicion that a transaction involves proceeds of crime, is related to terrorist financing, or involves a sanctioned party. Common triggers include: structuring (breaking transactions to avoid thresholds), sudden large deposits inconsistent with profile, rapid movement to high-risk jurisdictions, and transactions involving mixer/tumbler services.' },
    ],
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hub = HUB_DATA[params.slug]
  if (!hub) return { title: 'Not Found' }
  return {
    title: `${hub.title} 2026 | BizLegal AI`,
    description: `Comprehensive ${hub.title} guide for 2026 — penalties, enforcement history, compliance checklist, and risk assessment tools. ${hub.tag}.`,
    // Absolute self-referencing canonical. A relative path here resolved
    // against metadataBase only fragilely and produced the GSC "duplicate
    // without user-selected canonical" cluster — make it explicit.
    alternates: { canonical: `https://bizlegal-ai.com/regulations/${params.slug}` },
    openGraph: {
      title: `${hub.title} 2026`,
      images: [{ url: `/api/og?title=${encodeURIComponent(hub.title)}&tag=${encodeURIComponent(hub.tag)}`, width: 1200, height: 630 }],
    },
  }
}

export function generateStaticParams() {
  return Object.keys(HUB_DATA).map(slug => ({ slug }))
}

export default function RegulationHubPage({ params }: Props) {
  const hub = HUB_DATA[params.slug]
  if (!hub) notFound()

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${hub.title} 2026`,
    description: `Comprehensive ${hub.title} guide — penalties, enforcement history, compliance checklist, and risk assessment tools. ${hub.tag}.`,
    url: `https://bizlegal-ai.com/regulations/${params.slug}`,
    datePublished: '2026-01-01',
    dateModified: '2026-07-22',
    author: {
      '@type': 'Person',
      name: 'BizLegal AI Senior Counsel',
      url: 'https://bizlegal-ai.com/about',
      jobTitle: 'International Commercial Lawyer',
      description: 'LLB, LLM, 20 years active practice across UAE, EU, US, UK, Singapore',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BizLegal AI',
      url: 'https://bizlegal-ai.com',
      logo: { '@type': 'ImageObject', url: 'https://bizlegal-ai.com/logo.png' },
    },
    about: { '@type': 'Thing', name: hub.tag },
    keywords: hub.tag,
    inLanguage: 'en-US',
    isAccessibleForFree: true,
  }

  const faqLd = hub.faqs?.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: hub.faqs.map((faq: { q: string; a: string }) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  } : null

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Regulations', item: 'https://bizlegal-ai.com/regulations' },
      { '@type': 'ListItem', position: 3, name: hub.title, item: `https://bizlegal-ai.com/regulations/${params.slug}` },
    ],
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {/* Article Hero */}
      <div style={{ padding: '48px 32px', borderBottom: '0.5px solid var(--outline-var)', background: 'var(--bg-low)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <span className="section-label" style={{ color: hub.color }}>{hub.tag}</span>
          <h1 style={{ marginBottom: 12 }}>{hub.title}</h1>
          <p style={{ fontSize: 16, color: 'var(--on-surface-var)', maxWidth: 680, lineHeight: 1.6 }}>{hub.subtitle}</p>
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--outline)' }}>
            Authority: {hub.authority} · Jurisdiction: {hub.jurisdiction}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 48 }}>
        {/* Main content */}
        <div className="article-body">

          {/* Key Facts Infographic */}
          <div style={{ marginBottom: 40 }}>
            <span className="section-label">Key Facts</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, border: '0.5px solid var(--outline-var)' }}>
              {[
                { icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', label: 'Jurisdiction', value: hub.jurisdiction },
                { icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', label: 'Authority', value: hub.authority },
                { icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', label: 'Max Penalty', value: hub.maxFine },
              ].map(fact => (
                <div key={fact.label} style={{ background: 'var(--bg-mid)', padding: '20px 16px', textAlign: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={hub.color} strokeWidth="1.5" style={{ marginBottom: 10 }}>
                    <path d={fact.icon} strokeLinecap="square" />
                  </svg>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 6 }}>{fact.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.3 }}>{fact.value}</div>
                </div>
              ))}
            </div>
            {/* Compliance difficulty */}
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-mid)', border: '0.5px solid var(--outline-var)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Compliance Difficulty</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: hub.color }}>{hub.difficulty}/100</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${hub.difficulty}%`, background: hub.color }} />
              </div>
            </div>
          </div>

          {/* Intro blockquote */}
          <div className="bq-callout">
            {hub.intro}
          </div>

          {/* Section 1 */}
          <h2 id="coverage">{hub.section1.title}</h2>
          {hub.section1.body.split('\n\n').map((para: string, i: number) => (
            <p key={i}>{para}</p>
          ))}

          {/* Section 2 */}
          <h2 id="compliance">Who Must Comply</h2>
          <p>The following entities are subject to {hub.title} obligations:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {hub.section2.checklist.map((item: string, i: number) => (
              <li key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                <span style={{ color: hub.color, fontWeight: 700, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 14, color: 'var(--on-surface-var)' }}>{item}</span>
              </li>
            ))}
          </ul>

          {/* Section 3 */}
          <h2 id="penalties">Penalties and Enforcement History</h2>
          <p>{hub.section3.body}</p>

          {/* Enforcement Timeline */}
          <h2 id="timeline">Enforcement Timeline</h2>
          <div style={{ marginBottom: 32 }}>
            {hub.timeline.map((item: any, i: number) => (
              <div key={i} className="timeline-item">
                <div style={{ fontSize: 10, fontWeight: 700, color: hub.color, letterSpacing: '0.1em', marginBottom: 4, textTransform: 'uppercase' }}>{item.date}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 4 }}>{item.event}</div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-var)', lineHeight: 1.6 }}>{item.detail}</div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <h2 id="comparison">Regulatory Comparison</h2>
          <div style={{ overflowX: 'auto', marginBottom: 32 }}>
            <table className="data-table">
              <thead>
                <tr>{hub.comparison.headers.map((h: string) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {hub.comparison.rows.map((row: string[], i: number) => (
                  <tr key={i}>{row.map((cell, j) => <td key={j} style={j === 0 ? { fontWeight: 700, color: 'var(--on-surface)' } : {}}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mitigation Strategy */}
          <h2 id="mitigation">Mitigation Strategy</h2>
          {hub.mitigations.map((m: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 20, marginBottom: 24, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'Newsreader, serif', fontSize: 36, fontWeight: 700, color: 'var(--primary)', lineHeight: 1, flexShrink: 0 }}>0{i + 1}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 6 }}>{m.title}</div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }}>{m.body}</p>
              </div>
            </div>
          ))}

          {/* Enforcement Blockquote */}
          <div className="bq-callout">
            {hub.precedent}
            <cite>Enforcement Precedent</cite>
          </div>

          {/* FAQ */}
          <h2 id="faq">Frequently Asked Questions</h2>
          {hub.faqs.map((faq: any, i: number) => (
            <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '0.5px solid var(--outline-var)' }}>
              <div style={{ fontFamily: 'Newsreader, serif', fontSize: 16, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 8 }}>Q: {faq.q}</div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }}>A: {faq.a}</p>
            </div>
          ))}

          {(params.slug === 'mica' || params.slug === 'gdpr' || params.slug === 'vara' || params.slug === 'aml') && (
            <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--bg-mid)', border: '0.5px solid var(--outline-var)', borderRadius: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--outline)' }}>Deep Dive Guide</span>
              {params.slug === 'mica' && (
                <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6 }}>
                  <Link href="/guides/mica-regulation-crypto-compliance" style={{ color: 'var(--primary)', fontWeight: 600 }}>MiCA Compliance Guide →</Link>
                  {' '}Full CASP authorization walkthrough, whitepaper requirements, token categories, and AML obligations for crypto startups.
                </p>
              )}
              {params.slug === 'gdpr' && (
                <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6 }}>
                  <Link href="/guides/gdpr-compliance-checklist-saas" style={{ color: 'var(--primary)', fontWeight: 600 }}>GDPR Checklist for SaaS →</Link>
                  {' '}7-phase compliance checklist covering legal bases, DPAs, data subject rights, breach notification, and international transfers.
                </p>
              )}
              {params.slug === 'vara' && (
                <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6 }}>
                  <Link href="/guides/vara-licensing-guide" style={{ color: 'var(--primary)', fontWeight: 600 }}>VARA Licensing Guide →</Link>
                  {' '}License categories, capital requirements, the three-stage application process, and how VARA compares to MiCA and ADGM.
                </p>
              )}
              {params.slug === 'aml' && (
                <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6 }}>
                  <Link href="/guides/aml-kyc-compliance-crypto" style={{ color: 'var(--primary)', fontWeight: 600 }}>AML & KYC for Crypto →</Link>
                  {' '}FATF Travel Rule implementation, transaction monitoring red flags, KYC program requirements, and AML penalties tracker.
                </p>
              )}
            </div>
          )}

          <AuthorBio topics={hub.authorTopics} />
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 100, alignSelf: 'start' }}>
          {/* TOC */}
          <div className="card" style={{ marginBottom: 16 }}>
            <span className="section-label" style={{ marginBottom: 12 }}>Contents</span>
            {[
              ['coverage', 'What It Covers'],
              ['compliance', 'Who Must Comply'],
              ['penalties', 'Penalties'],
              ['timeline', 'Enforcement Timeline'],
              ['comparison', 'Comparison Table'],
              ['mitigation', 'Mitigation Strategy'],
              ['faq', 'FAQ'],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`} style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>
                {label}
              </a>
            ))}
          </div>

          {/* Newsletter widget */}
          <div className="card" style={{ marginBottom: 16, background: 'var(--bg-mid)' }}>
            <span className="section-label" style={{ marginBottom: 8 }}>Stay Updated</span>
            <p style={{ fontSize: 12, color: 'var(--on-surface-var)', marginBottom: 12 }}>Weekly enforcement alerts and compliance updates.</p>
            <Link href="/newsletter" className="btn-primary" style={{ fontSize: 11, padding: '8px 14px', width: '100%', justifyContent: 'center' }}>
              Subscribe →
            </Link>
          </div>

          {/* Related tools */}
          <div className="card">
            <span className="section-label" style={{ marginBottom: 12 }}>Related Tools</span>
            {params.slug === 'gdpr' && (
              <>
                <Link href="/tools/gdpr-fine-estimator" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>GDPR Fine Estimator →</Link>
                <Link href="/tools/gdpr-breach-timer" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Breach Timer →</Link>
              </>
            )}
            {params.slug === 'sec' && (
              <>
                <Link href="/tools/token-classifier" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>Token Classifier (Howey) →</Link>
                <Link href="/tools/sec-10k-readiness" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>SEC 10-K Readiness →</Link>
              </>
            )}
            {params.slug === 'mica' && (
              <>
                <Link href="/tools/mica-asset-classifier" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>MiCA Asset Classifier →</Link>
                <Link href="/tools/mica-whitepaper-cost" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Whitepaper Cost Estimator →</Link>
              </>
            )}
            {params.slug === 'vara' && (
              <>
                <Link href="/tools/vara-licence-finder" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>VARA Licence Finder →</Link>
                <Link href="/tools/vasp-fee-calculator" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>VASP Fee Calculator →</Link>
              </>
            )}
            {params.slug === 'aml' && (
              <>
                <Link href="/tools/kyc-gap-checker" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>KYC Gap Checker →</Link>
                <Link href="/tools/aml-checklist" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>AML Checklist →</Link>
              </>
            )}
          </div>

          {/* Related guides */}
          <div className="card" style={{ marginTop: 16 }}>
            <span className="section-label" style={{ marginBottom: 12 }}>Related Guides</span>
            {params.slug === 'mica' && (
              <>
                <Link href="/guides/mica-regulation-crypto-compliance" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>MiCA Compliance Guide →</Link>
                <Link href="/guides/blockchain-wallet-investigation" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Crypto Wallet Investigation →</Link>
              </>
            )}
            {params.slug === 'gdpr' && (
              <>
                <Link href="/guides/gdpr-compliance-checklist-saas" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>GDPR Checklist for SaaS →</Link>
                <Link href="/guides/compliance-health-score-saas" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Compliance Health Score →</Link>
              </>
            )}
            {params.slug === 'aml' && (
              <>
                <Link href="/guides/aml-kyc-compliance-crypto" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>AML & KYC for Crypto →</Link>
                <Link href="/guides/blockchain-wallet-investigation" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>Blockchain Wallet Investigation →</Link>
                <Link href="/guides/compliance-health-score-saas" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Compliance Health Score →</Link>
              </>
            )}
            {params.slug === 'sec' && (
              <>
                <Link href="/guides/fractional-cco-vs-compliance-retainer" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>Fractional CCO vs Retainer →</Link>
                <Link href="/guides/soc2-compliance-checklist-saas" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>SOC 2 Checklist →</Link>
                <Link href="/guides/compliance-health-score-saas" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Compliance Health Score →</Link>
              </>
            )}
            {params.slug === 'vara' && (
              <>
                <Link href="/guides/vara-licensing-guide" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>VARA Licensing Guide →</Link>
                <Link href="/guides/mica-regulation-crypto-compliance" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>MiCA Regulation Guide →</Link>
                <Link href="/guides/aml-kyc-compliance-crypto" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>AML & KYC for Crypto →</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
