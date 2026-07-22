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
  'ai-act': {
    tag: 'EU AI Act',
    title: 'EU AI Act Compliance Hub',
    subtitle: 'Navigating the EU Artificial Intelligence Act for High-Risk AI Systems, GPAI Models, and Technical Documentation',
    authority: 'European AI Office + National Market Surveillance Authorities',
    jurisdiction: 'European Union (extraterritorial)',
    maxFine: '€35M or 7% of global annual turnover',
    difficulty: 90,
    color: '#2563eb',
    intro: 'The EU AI Act (Regulation (EU) 2024/1689) became the world\'s first comprehensive AI law, entering into force on 1 August 2024. It applies a risk-based classification framework — prohibited, high-risk, limited-risk, and minimal-risk — and imposes proportionate obligations on providers, deployers, importers, and distributors across all sectors. GPAI model providers face transparency and systemic-risk obligations from 2 August 2025, with high-risk system requirements phased in through 2 August 2026. The Act has extraterritorial reach: any provider placing AI on the EU market or deployer operating in the EU must comply, regardless of domicile.',
    section1: {
      title: 'What the EU AI Act Covers',
      body: 'The EU AI Act regulates AI systems placed on or put into service in the EU market, and AI systems whose outputs are used in the EU. The risk-based framework assigns obligations by risk tier:\n\nProhibited AI (effective 2 February 2025): Social scoring by public authorities, real-time remote biometric identification in public spaces (with narrow law-enforcement exceptions), AI that exploits vulnerabilities, subliminal manipulation, and emotion-recognition systems in workplaces and educational institutions.\n\nHigh-Risk AI (effective 2 August 2026): Annex III systems including AI used in critical infrastructure, education/vocational training, employment, essential private/public services, law enforcement, migration/asylum, and administration of justice. These systems require conformity assessments, technical documentation, human oversight, and registration in the EU AI database.\n\nGPAI Models (effective 2 August 2025): General-purpose AI models with training compute above 10²³ FLOPs face systemic-risk designation and enhanced obligations including adversarial testing, incident reporting, and cybersecurity measures.\n\nLimited-Risk AI: Chatbots and deepfakes require transparency disclosures — users must be informed they are interacting with AI.',
    },
    section2: {
      title: 'Who Must Comply',
      checklist: [
        'Providers placing AI systems on the EU market (regardless of domicile)',
        'Deployers using AI systems in the EU for professional purposes',
        'Importers bringing non-EU-origin AI systems into the EU market',
        'Distributors making AI systems available in the EU market',
        'GPAI model providers training models with compute above 10²³ FLOPs',
        'High-risk AI providers in Annex III categories (HR, finance, healthcare, law enforcement)',
        'Operators of AI in critical infrastructure (energy, water, transport, financial services)',
        'Providers of AI used in education, employment screening, or credit/insurance decisions',
      ],
    },
    section3: {
      title: 'Penalties and Enforcement',
      body: 'The EU AI Act imposes a three-tier penalty structure calibrated to violation severity. Prohibited AI violations carry the highest penalties: up to €35M or 7% of global annual turnover (whichever is higher). Non-compliance with high-risk AI obligations triggers penalties up to €15M or 3% of turnover. Provision of incorrect, incomplete, or misleading information to authorities is penalised up to €7.5M or 1% of turnover. SMEs and startups benefit from proportionate assessment — penalties reflect company size and market access. National market surveillance authorities (NCAs) enforce the Act within their jurisdictions, with the European AI Office holding overarching supervisory authority for GPAI models.',
    },
    timeline: [
      { date: 'Aug 2024', event: 'EU AI Act Enters Into Force', detail: 'Regulation (EU) 2024/1689 officially entered into force on 1 August 2024, starting the phased implementation clock.' },
      { date: 'Feb 2025', event: 'Prohibited AI Rules Apply', detail: 'Chapter II prohibited AI practices (social scoring, real-time biometric identification, subliminal manipulation) became enforceable on 2 February 2025.' },
      { date: 'Aug 2025', event: 'GPAI Model Obligations Apply', detail: 'Chapter V GPAI obligations and governance rules applicable to general-purpose AI model providers became enforceable on 2 August 2025.' },
      { date: 'Aug 2026', event: 'High-Risk AI Obligations Apply', detail: 'Full Annex III high-risk AI system obligations — conformity assessments, technical documentation, human oversight, EU AI database registration — become mandatory.' },
      { date: 'Aug 2027', event: 'Annex I High-Risk AI', detail: 'AI systems already under EU product safety legislation (Annex I: machinery, medical devices, vehicles) must additionally comply with EU AI Act requirements.' },
    ],
    comparison: {
      headers: ['Dimension', 'EU AI Act', 'NIST AI RMF', 'ISO 42001'],
      rows: [
        ['Applicability', 'Mandatory — EU market', 'Voluntary — U.S. framework', 'Voluntary — global standard'],
        ['Max Fine', '€35M or 7% turnover', 'None (voluntary)', 'None (certification)'],
        ['Enforcement Body', 'European AI Office + NCAs', 'N/A (NIST guidance)', 'ISO certification bodies'],
        ['GPAI Rules', 'Yes — systemic risk designation', 'Partial — foundation model guidance', 'Limited'],
        ['Timeline', '2024–2027 phased rollout', 'Published Jan 2023', '2023 standard (ongoing)'],
        ['Extraterritorial', 'Yes — EU market access trigger', 'No', 'No'],
      ],
    },
    mitigations: [
      { title: 'Conduct an AI System Inventory and Risk Classification', body: 'Map all AI systems your organisation provides, deploys, or imports to the EU AI Act risk tiers. Classify each system using Annex III categories and the Commission\'s classification guidance. High-risk systems require immediate action: conformity assessment, technical documentation, and registration in the EU AI database before deployment. Document the classification rationale — regulators may request it as evidence of good-faith compliance.' },
      { title: 'Build Technical Documentation and Run Conformity Assessments', body: 'For each high-risk AI system, prepare Annex IV technical documentation covering: system description, development methodology, training data characteristics, accuracy and robustness metrics, human oversight measures, and cybersecurity controls. Conduct a conformity assessment — self-assessment applies to most Annex III systems; third-party assessment is required for biometric identification and critical infrastructure AI. Affix CE marking and register in the EU AI Office database before placing the system on the market.' },
      { title: 'Establish Ongoing Post-Market Monitoring and Incident Reporting', body: 'Deploy post-market monitoring for all high-risk AI to detect performance degradation, bias drift, and serious incidents. GPAI model providers must implement adversarial testing (red-teaming) and report serious incidents to the European AI Office within prescribed timeframes. Designate a responsible person for AI compliance, maintain audit logs for at least 6 months, and integrate EU AI Act obligations into procurement, vendor management, and M&A due diligence processes.' },
    ],
    precedent: 'As of 2025, the European AI Office issued its first binding opinions on GPAI model providers under Article 52 of the EU AI Act, establishing that training compute above the 10²³ FLOP threshold triggers systemic-risk designation even for models not publicly released when deployed via API. The first formal investigations under prohibited AI rules were opened in Q2 2025 relating to emotion-recognition systems in EU workplace management software — the sector most affected by the February 2025 prohibited AI rollout.',
    faqs: [
      { q: 'Does the EU AI Act apply to my US-based company?', a: 'Yes, if you place AI systems on the EU market, put AI into service in the EU, or your AI\'s outputs are used in the EU. The Act has extraterritorial reach similar to GDPR. A US company providing an AI-powered HR screening tool to an EU employer is a "provider" subject to full compliance obligations, regardless of where the AI is developed or hosted. Establish EU point-of-contact arrangements and review all products reaching EU customers.' },
      { q: 'What are Annex III high-risk AI categories?', a: 'Annex III lists eight categories: (1) biometric identification and categorisation; (2) critical infrastructure management; (3) education and vocational training; (4) employment and worker management; (5) access to essential private/public services; (6) law enforcement; (7) migration, asylum, and border control; (8) administration of justice. AI systems in these categories require conformity assessment, technical documentation, and EU AI database registration before market placement.' },
      { q: 'When do GPAI model obligations apply and who is affected?', a: 'GPAI model obligations (Chapter V) apply from 2 August 2025 to providers of general-purpose AI models, including models made available via API. The systemic-risk designation applies to models trained with more than 10²³ FLOPs of compute. Systemic-risk GPAI providers face enhanced obligations: adversarial testing (red-teaming), incident reporting to the European AI Office, cybersecurity measures, and energy consumption transparency. Providers below the threshold have lighter transparency and copyright compliance obligations.' },
      { q: 'What is the EU AI Act penalty for a prohibited AI violation?', a: 'The highest penalty tier applies to prohibited AI practices: up to €35,000,000 or 7% of total worldwide annual turnover for the preceding financial year, whichever is higher. For SMEs and startups, the penalty is capped at the lower of the two figures. National market surveillance authorities enforce these penalties within their jurisdictions, with the European AI Office holding overarching authority for GPAI-related violations and cross-border cases.' },
      { q: 'How does the EU AI Act interact with GDPR for AI systems processing personal data?', a: 'The EU AI Act and GDPR operate in parallel — compliance with one does not satisfy the other. GDPR governs all personal data processing (including data used to train or run AI systems), while the EU AI Act governs the AI system itself. A high-risk AI system processing personal data must satisfy both regimes: an Article 35 GDPR Data Protection Impact Assessment (DPIA) and an EU AI Act Annex IV conformity assessment. The AI Act also imposes specific data governance obligations for high-risk AI training datasets.' },
    ],
  },
  boi: {
    tag: 'FinCEN CTA / BOI',
    title: 'BOI / CTA Compliance Hub',
    subtitle: 'Navigating FinCEN Beneficial Ownership Reporting Under the Corporate Transparency Act',
    authority: 'Financial Crimes Enforcement Network (FinCEN)',
    jurisdiction: 'United States',
    maxFine: '$500/day civil (up to $10,000) + 2 years criminal',
    difficulty: 60,
    color: '#dc2626',
    intro: 'The Corporate Transparency Act (CTA), enacted as part of the Anti-Money Laundering Act of 2020, requires millions of U.S. companies and foreign entities registered to do business in the United States to report their beneficial owners to FinCEN. The BOI rule creates a non-public federal database of beneficial ownership information accessible to law enforcement and authorised financial institutions. After a series of federal court injunctions and reinstatements in late 2024 and early 2025, the reporting landscape remains volatile — but companies should maintain compliance readiness, as enforcement posture can shift within days. Penalties for wilful non-compliance are severe: $591/day in civil fines and up to two years\' imprisonment.',
    section1: {
      title: 'What the Corporate Transparency Act Requires',
      body: 'The CTA requires "reporting companies" — domestic and foreign entities formed or registered with a state secretary of state — to file Beneficial Ownership Information (BOI) reports with FinCEN. A BOI report must identify:\n\nThe reporting company: legal name, trade names (DBAs), address, state of formation, and EIN/TIN.\n\nBeneficial owners: any individual who either (1) exercises substantial control over the company, or (2) owns or controls at least 25% of the ownership interests. Substantial control covers senior officers, board authority, and any other significant influence over major decisions.\n\nCompany applicants (new formations only): the individual who filed the formation documents and, if different, the individual who directed the filing.\n\nReports must be updated within 30 days of any change in beneficial ownership or company information. FinCEN maintains the BOI database under strict access controls — available only to law enforcement, national security agencies, and authorised financial institutions for customer due diligence.',
    },
    section2: {
      title: 'Who Must File a BOI Report',
      checklist: [
        'U.S. corporations, LLCs, and similar entities formed by filing with a state secretary of state',
        'Foreign entities registered to do business in any U.S. state or territory',
        'Companies formed or registered on or after 1 January 2024 (30-day filing deadline from formation)',
        'Companies formed or registered before 1 January 2024 (deadline subject to enforcement reinstatement)',
        'Any company with a change in beneficial ownership or company information (30-day update deadline)',
        'DAO LLCs and Web3 structures registered under state law',
        'Holding companies, shell companies, and single-member LLCs (subject to limited exemptions)',
      ],
    },
    section3: {
      title: 'Penalties, Exemptions, and Enforcement',
      body: 'Wilful failure to file or update a BOI report, or wilful provision of false information, carries civil penalties of $591 per day (inflation-adjusted) up to $10,000, and criminal penalties of up to two years\' imprisonment and a $10,000 fine. The "wilful" standard requires knowing or reckless non-compliance — good-faith reliance on FinCEN guidance may be a defence.\n\n23 categories of entities are exempt, including: large operating companies (>20 full-time U.S. employees + >$5M U.S. gross receipts + U.S. physical office), SEC-reporting companies, banks, credit unions, insurance companies, registered investment advisers, registered broker-dealers, and tax-exempt entities. Subsidiaries of exempt entities may or may not qualify separately — subsidiary exemptions have specific qualification criteria.',
    },
    timeline: [
      { date: 'Jan 2021', event: 'CTA Enacted', detail: 'The Corporate Transparency Act was enacted as part of the Anti-Money Laundering Act of 2020, signed into law on 1 January 2021. FinCEN issued proposed rules in December 2021.' },
      { date: 'Jan 2024', event: 'BOI Rule Effective', detail: 'FinCEN\'s Beneficial Ownership Information Reporting Rule became effective 1 January 2024. Existing companies given until 1 January 2025; new 2024 formations given 90 days from formation.' },
      { date: 'Dec 2024', event: 'Texas Federal Injunction', detail: 'A Texas federal district court (Top Cop Shop, Inc. v. Garland) issued a nationwide preliminary injunction, temporarily blocking all BOI reporting enforcement.' },
      { date: 'Jan 2025', event: 'Fifth Circuit Reinstatement + Stay', detail: 'The Fifth Circuit initially reinstated reporting requirements, then granted an administrative stay pending merits review. Enforcement suspended again through Q1 2025.' },
      { date: '2025+', event: 'Enforcement Posture Evolving', detail: 'Treasury announced non-enforcement against U.S. citizens for domestic entities; enforcement focused on foreign reporting companies. Legal challenges continue. Companies should maintain compliance readiness.' },
    ],
    comparison: {
      headers: ['Dimension', 'FinCEN BOI (CTA)', 'EU UBO Registers', 'UK PSC Register'],
      rows: [
        ['Applicability', 'U.S. + foreign entities registered in U.S.', 'EU member state companies', 'UK companies and LLPs'],
        ['Public Access', 'Non-public (law enforcement + authorised FIs)', 'Public (varies by Member State)', 'Public (Companies House)'],
        ['Max Civil Penalty', '$591/day up to $10,000', 'Varies (€5K–€50K)', 'Unlimited fine'],
        ['Ownership Threshold', '25% OR substantial control', '25% (varies by state)', '25% ownership'],
        ['Update Deadline', '30 days from change', '14 days (varies)', '14 days'],
        ['Criminal Exposure', 'Yes — 2 years imprisonment', 'Varies', 'Yes — 2 years imprisonment'],
      ],
    },
    mitigations: [
      { title: 'Build a Corporate Entity Map and Identify Beneficial Owners', body: 'Map every U.S. and foreign entity in your corporate group that was formed or registered by state filing. For each entity, identify: (1) all individuals with 25%+ direct or indirect ownership, (2) all senior officers (CEO, CFO, COO, president, general counsel), and (3) any individual with substantial control (board authority, veto rights, major decision authority). Document the analysis and maintain it as a living record — it must be updated within 30 days of any qualifying change.' },
      { title: 'File BOI Reports via FinCEN\'s BOIT System', body: 'Access FinCEN\'s Beneficial Ownership IT (BOIT) system at fincen.gov/boi to file initial reports. Each beneficial owner must provide: full legal name, date of birth, residential address, and a unique identifying number from an acceptable document (U.S. passport, state driver\'s license, or FinCEN identifier). Retain copies of all filed reports and identification documents for at least 5 years. Use FinCEN identifiers for owners appearing across multiple group entities to simplify future updates.' },
      { title: 'Implement a 30-Day Change Detection and Update Protocol', body: 'Beneficial owners change through M&A transactions, equity transfers, officer appointments or departures, reorganisations, and death or incapacity. Designate a responsible officer to monitor triggering events and file updated BOI reports within 30 days. Integrate BOI update obligations into M&A diligence checklists, employment agreements for senior officers, and equity capitalisation table governance procedures. The BOI-Tracker agent can automate monitoring and provide alerts when ownership events occur.' },
    ],
    precedent: 'Top Cop Shop, Inc. v. Garland (E.D. Tex., Case No. 4:24-cv-478, December 2024): "The Corporate Transparency Act is unconstitutional as applied to the extent it compels domestic reporting companies to disclose beneficial ownership information under threat of civil and criminal penalty." The court issued a nationwide injunction, subsequently stayed and reinstated through competing Fifth Circuit orders, illustrating the extraordinary legal volatility of the BOI regime. Companies should maintain compliance readiness regardless of current injunction status — enforcement posture can shift within days and the underlying filing obligation has never been repealed.',
    faqs: [
      { q: 'Does my single-member LLC need to file a BOI report?', a: 'Yes, in most cases. Single-member LLCs formed by filing with a state secretary of state are "reporting companies" under the CTA, regardless of size or revenue. The exception is if the LLC independently qualifies for one of the 23 statutory exemptions — for example, the large operating company exemption (>20 full-time U.S. employees, >$5M gross receipts, U.S. physical office). A disregarded entity owned by an exempt entity may qualify for the subsidiary exemption, but the owner must independently qualify as exempt — exemption does not automatically pass through.' },
      { q: 'What triggers a BOI report update?', a: 'A company must file an updated BOI report within 30 days of any change in: (1) a beneficial owner\'s legal name, address, or identifying document; (2) the reporting company\'s legal name, trade names, address, or EIN; (3) a previously reported beneficial owner no longer meeting the definition (ownership drops below 25% and substantial control is absent); or (4) a new individual acquiring 25%+ ownership or substantial control. M&A transactions, equity sales, officer appointments or departures, and relocation all commonly trigger update obligations.' },
      { q: 'Who qualifies as a beneficial owner under the CTA?', a: 'A beneficial owner is any individual who, directly or indirectly, either: (1) exercises "substantial control" over the reporting company — serving as a senior officer, having authority over the board, or having significant influence over major business decisions; or (2) owns or controls 25% or more of the ownership interests through any combination of direct and indirect holdings. There is no minimum threshold for substantial control — a 1% owner who controls all major decisions is a beneficial owner. Options, warrants, and convertible instruments count if currently exercisable.' },
      { q: 'Is the BOI database public?', a: 'No. The FinCEN BOI database is strictly non-public. Access is limited to: (1) federal law enforcement agencies; (2) state and local law enforcement with a court order; (3) foreign law enforcement via applicable treaties; (4) Treasury Department personnel for tax administration and national security; and (5) federally regulated financial institutions with customer due diligence obligations, subject to customer consent. Unauthorised disclosure of BOI is itself a criminal violation — up to $500/day civil and 5 years\' imprisonment.' },
      { q: 'How does BOI reporting affect DAO LLCs and crypto companies?', a: 'DAO LLCs and other Web3 entities registered under state law (Wyoming DAO LLCs, Delaware LLCs) are generally reporting companies. Token holders are typically not beneficial owners unless they hold 25%+ of tokens representing ownership interests and those tokens confer economic rights, not merely governance rights. Smart-contract-based ownership structures require specific beneficial ownership analysis — indirect ownership through voting trust, proxy, or contract arrangements all count toward the 25% threshold. FinCEN has not issued specific guidance for DAOs, so analysis must proceed under the general rule with conservative assumptions.' },
    ],
  },
  dora: {
    tag: 'EU Digital Operational Resilience',
    title: 'DORA Compliance Hub',
    subtitle: 'Digital Operational Resilience Act — ICT Risk, Incident Reporting, and Third-Party Oversight for EU Financial Entities',
    authority: 'EBA + EIOPA + ESMA (Joint Committee) + National Competent Authorities',
    jurisdiction: 'European Union',
    maxFine: '€5M or 1% of worldwide daily turnover per violation',
    difficulty: 82,
    color: '#7c3aed',
    intro: 'Regulation (EU) 2022/2554, the Digital Operational Resilience Act, entered force on 16 January 2023 and became fully applicable on 17 January 2025. DORA imposes uniform ICT risk management, major incident reporting, digital operational resilience testing, and ICT third-party risk management obligations across more than 22,000 financial entities in the EU. Critically, DORA applies not just to regulated financial institutions but to any ICT third-party service provider — including cloud providers, data analytics vendors, and software-as-a-service platforms — that provides services to in-scope entities.',
    section1: {
      title: 'What DORA Covers',
      body: 'DORA establishes five core pillars: (1) ICT Risk Management — a comprehensive internal framework covering identification, protection, detection, response, and recovery; (2) ICT-Related Incident Management — classification, internal management procedures, and reporting to regulators; (3) Digital Operational Resilience Testing — annual threat-led penetration testing (TLPT) for significant entities; (4) ICT Third-Party Risk Management — pre-contractual due diligence, contract requirements, and concentration risk monitoring; and (5) Information Sharing — voluntary participation in cyber threat intelligence networks.\n\nDORA\'s scope extends beyond traditional banks. In-scope entities include: credit institutions, payment institutions, e-money institutions, crypto-asset service providers (MiCA CASPs), insurance and reinsurance undertakings, investment firms, trading venues, AIFMs, UCITS management companies, credit rating agencies, and ICT third-party service providers deemed "critical" by the ESAs.',
    },
    section2: {
      title: 'Who Must Comply',
      checklist: [
        'Credit institutions, payment institutions, and e-money institutions operating in the EU',
        'Crypto-asset service providers (CASPs) authorised under MiCA',
        'Investment firms, alternative investment fund managers (AIFMs), and UCITS management companies',
        'Insurance and reinsurance undertakings and insurance intermediaries',
        'Trading venues, central counterparties (CCPs), and central securities depositories (CSDs)',
        'ICT third-party service providers (cloud, SaaS, data analytics) serving in-scope EU financial entities',
        'Critical ICT third-party providers (CTPPs) designated by the Joint Committee of ESAs',
      ],
    },
    section3: {
      title: 'Penalties and Enforcement',
      body: 'DORA confers penalty powers on national competent authorities. For financial entities, penalties can reach €5,000,000 or 1% of the total annual worldwide turnover of the entity for each day of violation, up to 5% of total annual worldwide turnover. For individuals in management, personal penalties of up to €1,000,000 or 2% of annual remuneration apply. Critical ICT third-party providers designated by the ESAs are subject to oversight measures and can be compelled to remediate deficiencies or terminate contracts with EU financial entities.',
    },
    timeline: [
      { date: 'Nov 2022', event: 'DORA Published', detail: 'Regulation (EU) 2022/2554 published in the Official Journal. 24-month implementation clock began for financial entities and regulators.' },
      { date: 'Jan 2023', event: 'Entry into Force', detail: 'DORA entered into force on 16 January 2023. EBA, EIOPA, and ESMA commenced drafting Level 2 Regulatory Technical Standards (RTS) and Implementing Technical Standards (ITS).' },
      { date: 'Jan 2024', event: 'First RTS/ITS Published', detail: 'Joint Committee published the first batch of technical standards covering ICT risk management, incident classification, and TLPT requirements. Entities integrated standards into implementation programs.' },
      { date: 'Jan 2025', event: 'Full Application', detail: 'DORA became fully applicable on 17 January 2025 across all 27 EU Member States. MiCA-authorised CASPs added to scope. Entities without mature ICT risk management programs faced immediate supervisory scrutiny.' },
      { date: '2025–2026', event: 'First Enforcement Actions', detail: 'NCAs commenced supervisory reviews and inspections of DORA compliance frameworks. Entities lacking documented ICT risk policies, incident playbooks, and third-party registers are primary enforcement targets.' },
    ],
    comparison: {
      headers: ['Dimension', 'DORA', 'NIS2 Directive', 'ISO 27001'],
      rows: [
        ['Applicability', 'EU financial entities + ICT providers', 'Essential and important entities broadly', 'Voluntary — any organisation'],
        ['Max Fine', '€5M or 1% daily turnover', '€10M or 2% annual turnover (essential)', 'N/A (certification standard)'],
        ['Enforcement Body', 'EBA + EIOPA + ESMA + NCAs', 'National CERT/NIS authorities', 'UKAS/accredited CBs'],
        ['Testing Mandate', 'Annual TLPT for significant entities', 'Vulnerability scans + audits', 'Internal/external audit'],
        ['Third-Party Rules', 'Mandatory CTPP oversight framework', 'Supply chain security principles', 'Supplier relationships control set'],
        ['Crypto Scope', 'Yes — MiCA CASPs included', 'Indirectly via CASP digital infra', 'Optional add-on'],
      ],
    },
    mitigations: [
      { title: 'Build a DORA-Compliant ICT Risk Management Framework', body: 'The DORA ICT risk management framework (Articles 6-16) must cover: ICT risk strategy, ICT asset inventory, network segmentation, access controls, encryption, business continuity and disaster recovery (BCDR), ICT-related incident management procedures, and a learning-from-incidents review cycle. Document the framework in a board-approved ICT risk management policy. Cross-reference against ISO 27001:2022 Annex A to identify gaps.' },
      { title: 'Implement ICT-Related Incident Reporting Playbooks', body: 'DORA classifies incidents by materiality criteria set in Commission Delegated Regulation (EU) 2024/1772. Major ICT incidents must be reported to the competent authority within 4 hours of classification (initial report), 72 hours of discovery (intermediate report), and 1 month of resolution (final report). Operationalise via an incident response playbook with defined classification thresholds, NCA notification templates, and automated escalation triggers.' },
      { title: 'Register and Manage All ICT Third-Party Providers', body: 'Maintain a register of all ICT third-party service providers under Article 28. For each provider, document: contractual DORA-required clauses (audit rights, incident notification, SLA, data portability, exit), concentration risk assessment, and substitutability analysis. Assess whether any provider qualifies for Critical Third-Party Provider (CTPP) designation by the ESAs — CTPP designation triggers direct ESA oversight.' },
    ],
    precedent: 'EBA DORA Supervisory Guidance (2025): "Entities operating under DORA must demonstrate not merely formal policy adoption but operational resilience through tested and exercised capabilities. The requirements of Regulation (EU) 2022/2554 apply to crypto-asset service providers authorised under MiCA from the date of their authorisation, without prejudice to the application of equivalent requirements previously imposed under applicable national law." — European Banking Authority.',
    faqs: [
      { q: 'Does DORA apply to SaaS companies providing software to EU banks?', a: 'Potentially yes. DORA applies to ICT third-party service providers that provide ICT services to EU financial entities. "ICT services" is defined broadly to include digital and data services, including SaaS. The degree of obligation depends on whether your service is designated "critical" by the ESAs (making you a CTPP, subject to direct oversight) or non-critical (requiring DORA-compliant contractual clauses from your financial entity clients).' },
      { q: 'What is Threat-Led Penetration Testing (TLPT) under DORA?', a: 'TLPT is an advanced form of penetration testing that simulates real-world cyber attacker techniques based on threat intelligence relevant to the specific financial entity. Under DORA Article 26, significant institutions must conduct TLPT at least every 3 years, using approved testers in a live production environment. TLPT results are reported to the competent authority. ICT third-party service providers used by the financial entity may also be in scope for the test.' },
      { q: 'How does DORA interact with GDPR and NIS2?', a: 'DORA, GDPR, and NIS2 are complementary but distinct. An ICT security incident at an EU bank may trigger DORA incident reporting (to NCA within 4 hours), NIS2 incident notification (if the bank is also an essential entity), and GDPR personal data breach notification (to DPA within 72 hours). Compliance officers must map all three notification regimes to avoid missed deadlines.' },
      { q: 'Which EU Member State regulates a DORA entity operating in multiple countries?', a: 'DORA follows the principle of home Member State supervision. A credit institution licensed in France is primarily supervised by the French NCA (ACPR or AMF) for DORA purposes, regardless of branches in other EU states. For ICT third-party providers, the Lead Overseer for CTPP designation is determined by the ESAs based on EU revenue and systemic importance of the client base.' },
      { q: 'What must DORA contracts with ICT third-party providers include?', a: 'Under DORA Article 30, contracts must include: clear service descriptions and SLAs; provisions allowing the financial entity and its regulator to conduct audits and inspections; incident notification obligations aligned with DORA timeframes; data location and portability rights; termination rights triggered by material security breaches; a plan for the orderly exit of services; and cooperation obligations for TLPT testing. Existing contracts must be brought into DORA compliance — a contract remediation exercise covering all in-scope ICT providers is a Day-1 priority.' },
    ],
  },
  ccpa: {
    tag: 'California Privacy Law',
    title: 'CCPA / CPRA Compliance Hub',
    subtitle: 'California Consumer Privacy Act & Privacy Rights Act — US Privacy Compliance for Businesses with California Customers',
    authority: 'California Privacy Protection Agency (CPPA) + California Attorney General',
    jurisdiction: 'California, United States (extraterritorial applicability)',
    maxFine: '$2,500 per unintentional violation · $7,500 per intentional violation',
    difficulty: 65,
    color: '#059669',
    intro: 'The California Consumer Privacy Act (CCPA), Cal. Civ. Code § 1798.100 et seq., enacted in 2018 and effective from 1 January 2020, established the most comprehensive US state consumer privacy law to date. The California Privacy Rights Act (CPRA), passed via Proposition 24 in November 2020, materially amended the CCPA effective 1 January 2023, creating the California Privacy Protection Agency (CPPA) as a dedicated enforcement body, adding sensitive personal information as a distinct category, and introducing a right to correct inaccurate personal information. Together, CCPA/CPRA imposes significant obligations on any business — regardless of where it is incorporated — that processes California consumer personal information at scale.',
    section1: {
      title: 'What CCPA/CPRA Covers',
      body: 'CCPA/CPRA governs the collection, use, disclosure, and sale of personal information (PI) of California consumers by covered businesses. "Personal information" is defined broadly — any information that identifies, relates to, describes, is reasonably capable of being associated with, or could reasonably be linked with a California consumer or household. It explicitly includes IP addresses, browsing history, purchasing history, inferences drawn from PI to create a profile, and biometric data.\n\nThe CPRA introduced "sensitive personal information" (SPI) as a distinct category: social security numbers, driver\'s license numbers, account credentials, precise geolocation, racial or ethnic origin, religious beliefs, health data, sexual orientation, and contents of communications. Consumers have the right to limit the use of SPI to what is necessary for the primary purpose of collection.',
    },
    section2: {
      title: 'Who Must Comply',
      checklist: [
        'For-profit businesses doing business in California with annual gross revenue exceeding $25 million',
        'Businesses buying, selling, sharing, or receiving PI of 100,000+ California consumers or households annually',
        'Businesses deriving 50% or more of annual revenue from selling or sharing California consumers\' PI',
        'Any entity that controls or is controlled by a covered business and shares common branding',
        'Service providers processing PI on behalf of covered businesses under CPRA-compliant contracts',
        'Contractors and third parties receiving PI for a business purpose under written contract',
        'Any company — regardless of state of incorporation — that meets the above thresholds',
      ],
    },
    section3: {
      title: 'Penalties and Enforcement',
      body: 'The California Privacy Protection Agency (CPPA) enforces CCPA/CPRA through administrative action. The California Attorney General retains concurrent enforcement authority. Civil penalties: $2,500 per unintentional violation and $7,500 per intentional violation or any violation involving PI of minors (consumers under 16). Each consumer whose rights are violated represents a separate violation — a single unauthorized disclosure of a 50,000-record dataset can theoretically produce $375,000,000 in maximum exposure. Private right of action applies only to data breaches involving certain categories of nonencrypted PI (Social Security numbers, financial account details, medical information, and others listed in Cal. Civ. Code § 1798.150).',
    },
    timeline: [
      { date: 'Jun 2018', event: 'CCPA Enacted', detail: 'California Consumer Privacy Act signed into law, giving California consumers unprecedented rights over personal information. Gave businesses 18 months to comply.' },
      { date: 'Jan 2020', event: 'CCPA Effective', detail: 'CCPA became operative. Businesses required to implement notice at collection, privacy policies, consumer request procedures, and opt-out of sale mechanisms.' },
      { date: 'Jul 2020', event: 'AG Enforcement Began', detail: 'California Attorney General commenced enforcement. First wave of enforcement letters sent to companies with noncompliant privacy policies, cookie banners, and opt-out flows.' },
      { date: 'Nov 2020', event: 'CPRA Passed', detail: 'Proposition 24 passed with 56% of votes. Created CPPA, added sensitive PI category, right to correct, expanded data minimization requirements.' },
      { date: 'Jan 2023', event: 'CPRA In Force + CPPA Active', detail: 'CPRA amendments became operative. CPPA assumed full enforcement authority. First enforcement actions under CPPA jurisdiction commenced 2024.' },
    ],
    comparison: {
      headers: ['Dimension', 'CCPA/CPRA', 'GDPR', 'Virginia VCDPA'],
      rows: [
        ['Scope Trigger', 'Revenue OR data volume threshold', 'Established in EU OR EU data subjects', 'Controller processing 100k+ VA consumers'],
        ['Max Fine', '$7,500 per intentional violation', '€20M or 4% annual turnover', '$7,500 per violation (AG enforcement)'],
        ['Enforcement Body', 'CPPA + California AG', 'National DPAs', 'Virginia Attorney General'],
        ['Private Right of Action', 'Data breach only (limited categories)', 'No (member state variation)', 'None'],
        ['Employee Data', 'Covered (limited exemptions expired)', 'Covered', 'Excluded'],
        ['Right to Correct', 'Yes (CPRA addition)', 'Yes (GDPR Art. 16)', 'Yes'],
      ],
    },
    mitigations: [
      { title: 'Conduct a California PI Data Map', body: 'Map every category of personal information collected from California consumers: the specific data elements, source, business purpose, retention period, and all third parties to whom the PI is disclosed. Update the data map annually and whenever a new data collection process is introduced. The CCPA privacy policy must disclose all categories collected, purposes of use, categories of third parties to whom PI is disclosed, and the categories sold or shared.' },
      { title: 'Build Consumer Request Procedures and Honour Within Deadlines', body: 'CCPA requires businesses to respond to consumer requests within 45 days (extendable by 45 days with notice). Implement a verified consumer request intake process via at minimum two methods (webform + toll-free number if operating a physical location), identity verification proportionate to sensitivity, a response workflow that retrieves PI from all in-scope systems, and a request log with date tracking. For Sensitive PI requests to limit use, implement a separate "Limit the Use of My Sensitive Personal Information" link.' },
      { title: 'Update Service Provider Contracts and Implement Data Minimization', body: 'Every contract with a service provider receiving PI must include CPRA-required provisions: permitted business purposes, prohibitions on sale/sharing without consent, obligations to assist with consumer requests, deletion obligations, security standards, and audit cooperation rights. Simultaneously implement data minimization — the CPRA makes collecting only PI reasonably necessary for the disclosed purpose a substantive legal obligation.' },
    ],
    precedent: 'Sephora, Inc. — California AG Enforcement Action (2022): "Sephora agreed to pay $1.2 million in penalties and to implement corrective measures after the Attorney General found that Sephora had failed to disclose that it was selling personal information, failed to process opt-out requests via Global Privacy Control (GPC), and failed to cure these violations within the 30-day cure period. This marks the first CCPA enforcement judgment and establishes GPC signal compliance as a mandatory technical implementation requirement." — California AG Press Release, 24 August 2022.',
    faqs: [
      { q: 'Does CCPA/CPRA apply to my company if I\'m not based in California?', a: 'Yes, if you meet the threshold criteria. The CCPA applies to any for-profit business "doing business in California" — which includes selling products or services to California consumers online, taking orders from California residents, or targeting California residents in advertising. The thresholds ($25M revenue, 100k consumers, 50% revenue from selling PI) determine whether CCPA applies — not the business\'s state of incorporation or physical location.' },
      { q: 'What is the difference between "selling" and "sharing" PI under CPRA?', a: 'The CCPA prohibited "selling" PI, defined as transferring PI to a third party for monetary or other valuable consideration. The CPRA added "sharing" to cover disclosure of PI for cross-context behavioral advertising, even if no monetary consideration is paid. This addition captures data disclosures to Google Analytics, Meta Pixel, and other advertising tracking tools. Businesses must honour opt-outs of both sale and sharing via the "Do Not Sell or Share My Personal Information" link and via Global Privacy Control (GPC) signals.' },
      { q: 'How do we honour Global Privacy Control (GPC) signals?', a: 'The CPPA\'s regulations require that if a consumer sends a GPC signal — a browser-level opt-out signal — the business must treat it as a valid opt-out without requiring a separate form submission. Your consent management platform (CMP) must: detect incoming GPC signals from browsers like Firefox, Brave, and DuckDuckGo; honour them by blocking associated data flows to third-party advertising platforms; and maintain records of GPC signals received. The Sephora enforcement action makes GPC compliance mandatory.' },
      { q: 'Do we need a Data Processing Agreement (DPA) like GDPR requires?', a: 'CPRA requires a functionally similar but differently named contract. A "service provider" is only exempt from the definition of a "third party" — and thus from sale/sharing restrictions — if it processes PI pursuant to a written contract that prohibits retaining, using, or disclosing the PI outside the direct business relationship, prohibits selling or sharing the PI, and obligates the service provider to notify the business if it cannot honour the terms. Without this contract, your service provider relationship may be recharacterised as a "sale" of PI.' },
      { q: 'What are the CPRA employee and job applicant PI obligations?', a: 'From 1 January 2023, California employees, independent contractors, and job applicants are "consumers" under CCPA/CPRA with full rights. Businesses must provide Notice at Collection to employees and applicants, disclose all categories of PI collected and business purposes, and honour deletion and portability requests for non-retention-required PI. HR systems holding employee monitoring data, payroll information, performance records, and recruiting data are all in scope.' },
    ],
  },
  soc2: {
    tag: 'AICPA Trust Services',
    title: 'SOC 2 Compliance Hub',
    subtitle: 'System and Organization Controls 2 — The B2B SaaS Security Standard for Enterprise Customer Due Diligence',
    authority: 'American Institute of CPAs (AICPA) · Licensed CPA Firm Auditors',
    jurisdiction: 'United States (universally required for global B2B SaaS)',
    maxFine: 'No regulatory fine — contractual breach + enterprise customer churn',
    difficulty: 72,
    color: '#d97706',
    intro: 'SOC 2 is not a government regulation but a voluntary security framework and audit standard issued by the American Institute of CPAs (AICPA) under the Trust Services Criteria (TSC). Despite being voluntary, SOC 2 Type II has become a de facto contractual requirement for any B2B SaaS company selling to enterprise customers, healthcare organisations, financial institutions, or government contractors. More than 85% of enterprise procurement teams now require a SOC 2 Type II report as a precondition to vendor approval. A SOC 2 report is produced by an independent licensed CPA firm that tests your controls against the AICPA\'s five Trust Service Criteria: Security (mandatory), Availability, Processing Integrity, Confidentiality, and Privacy.',
    section1: {
      title: 'SOC 2 Type I vs Type II',
      body: 'SOC 2 comes in two types. Type I assesses the design of controls at a single point in time — it answers "were the right controls in place on this date?" A Type I report can typically be completed in 2-3 months and is useful for first-time certifications or demonstrating readiness while Type II is underway.\n\nType II assesses the operational effectiveness of controls over a defined observation period, typically 6-12 months. It answers "did the controls work consistently during this period?" Enterprise procurement teams universally require Type II. The observation period clock starts when you implement controls — early implementation is critical to getting your Type II report on a competitive timeline.',
    },
    section2: {
      title: 'Who Needs SOC 2',
      checklist: [
        'B2B SaaS companies selling to enterprise customers (any industry)',
        'Cloud infrastructure and platform providers handling customer data',
        'Healthcare technology companies (often required alongside HIPAA)',
        'Financial technology companies (required by bank and fintech buyers)',
        'HR and payroll platforms (employee PI makes this a procurement requirement)',
        'AI and analytics platforms processing customer behavioral or operational data',
        'Any vendor in an enterprise supply chain requiring annual vendor risk assessments',
      ],
    },
    section3: {
      title: 'Commercial Consequences of Non-Compliance',
      body: 'SOC 2 has no regulatory enforcement body and no government-imposed fine. The consequences are commercial: enterprise procurement teams reject vendors without Type II reports, extend sales cycles by 6-18 months for questionnaire-based alternatives, or require on-site security reviews that are more invasive than a SOC 2 audit. Lost enterprise deals due to missing SOC 2 commonly represent 10-50× the cost of the audit itself. Additionally, enterprise contracts increasingly require annual SOC 2 renewal — a lapsed report triggers immediate contract review and potential termination rights for data security provisions.',
    },
    timeline: [
      { date: '1992', event: 'SAS 70 Era', detail: 'Statement on Auditing Standards No. 70 (SAS 70) was the predecessor audit standard for service organizations. Widely misused as a security certification despite being an auditing scope document.' },
      { date: '2011', event: 'SOC 2 Introduced', detail: 'AICPA replaced SAS 70 with the SOC suite. SOC 2 using Trust Service Principles was introduced as the standard for technology and cloud service providers. Type I and Type II reports defined.' },
      { date: '2017', event: 'Trust Services Criteria Revised', detail: 'AICPA revised the Trust Service Criteria, aligning the CC (Common Criteria / Security) section with COSO framework. SOC 2 + COSO alignment became the accepted enterprise audit standard.' },
      { date: '2020', event: 'Enterprise SaaS Standard', detail: 'SOC 2 Type II became a de facto requirement for enterprise SaaS sales. Vendor risk management programs at Fortune 500 companies formalized SOC 2 as a precondition to vendor onboarding.' },
      { date: '2023–2026', event: 'AI and Data Platform Scope Expansion', detail: 'Enterprise buyers added AI transparency and data governance criteria to SOC 2 supplementary questions. SOC 2 + EU AI Act compliance bundles emerging for EU-facing SaaS providers.' },
    ],
    comparison: {
      headers: ['Dimension', 'SOC 2 Type II', 'ISO 27001', 'HIPAA'],
      rows: [
        ['Type', 'Audit report (attest)', 'Certification (ISMS)', 'Regulatory compliance'],
        ['Enforcement', 'Commercial (contracts)', 'Certification withdrawal', 'HHS/OCR — up to $1.9M/year'],
        ['Audience', 'Customers and prospects', 'Global markets, procurement', 'US healthcare data'],
        ['Scope Flexibility', 'You define in-scope systems', 'Defined ISMS boundary', 'All ePHI systems mandatory'],
        ['Renewal Cycle', 'Annual Type II re-audit', 'Annual surveillance + 3yr recertification', 'Ongoing HIPAA programme'],
        ['AI/Cloud Coverage', 'Yes — via CC6 + supplemental', 'Yes — Annex A 8.25+ (2022)', 'Limited — focused on ePHI'],
      ],
    },
    mitigations: [
      { title: 'Define Your SOC 2 Scope and Choose Trust Service Criteria', body: 'Define which systems, services, and environments are in scope for your SOC 2 audit. Scope should cover systems that process customer data — typically your production environment, identity and access management, and incident response processes. Security (CC) criteria is mandatory. Add Availability (A) if uptime SLAs are contractual commitments. Add Confidentiality (C) if you process customer confidential business data. Add Privacy (P) only if you process significant volumes of end-consumer PI.' },
      { title: 'Implement the 60+ Security Controls Mapped to CC Criteria', body: 'The Security (CC) criteria covers 9 Common Criteria groupings: CC1 (Control Environment), CC2 (Communication), CC3 (Risk Assessment), CC4 (Monitoring), CC5 (Control Activities), CC6 (Logical and Physical Access), CC7 (System Operations), CC8 (Change Management), and CC9 (Risk Mitigation). Key controls enterprise auditors scrutinize: MFA on all production access, encryption at rest and in transit, vulnerability scanning and pen test program, change management approvals, and vendor risk management process. Implement controls at least 6 months before your intended audit window start date.' },
      { title: 'Select a CPA Firm Auditor and Automate Evidence Collection', body: 'SOC 2 auditors must be licensed CPA firms — not just cybersecurity consultancies. Audit fees range from $12,000 to $60,000+ depending on scope and observation period. Use a compliance automation platform (Vanta, Drata, Secureframe, or similar) to continuously collect evidence from cloud providers (AWS, GCP, Azure) and identity providers. Automation reduces manual evidence collection work by 80%. Budget 8-14 months from decision to Type II report issuance.' },
    ],
    precedent: 'AICPA Trust Services Criteria (TSC 2017, as amended 2022): "The auditor evaluates whether the service organization\'s controls as described in the system description were suitably designed and, if a Type 2 examination, operating effectively to provide reasonable assurance that the service organization achieved its service commitments and system requirements throughout the specified period... A description that omits relevant controls, or describes controls that are not placed in operation, will result in a qualified or adverse opinion." — AICPA TSC 2017, Section 1.',
    faqs: [
      { q: 'How long does SOC 2 Type II certification take?', a: 'Plan for 12-16 months total from initial decision to receiving your Type II report. Timeline: 1-2 months for gap assessment and control implementation planning; 2-4 months for controls implementation; 6-12 months of observation period (the window your auditor formally tests controls); 1-3 months for auditor fieldwork and report drafting. Many SaaS companies begin with a SOC 2 Type I (2-3 months) to demonstrate readiness to prospects while the Type II observation period runs concurrently.' },
      { q: 'Do we need SOC 2 if we already have ISO 27001?', a: 'Likely yes, if you sell to US enterprise customers. ISO 27001 is more widely recognised in Europe and Asia-Pacific. US enterprise procurement teams — banks, Fortune 500, healthcare systems — almost universally require SOC 2 Type II specifically, because the report format matches their vendor risk assessment templates. The good news: implementing ISO 27001 controls substantially covers SOC 2 CC requirements, so the marginal cost of adding SOC 2 for ISO-certified companies is lower than starting from scratch.' },
      { q: 'What is the difference between SOC 1 and SOC 2?', a: 'SOC 1 reports on controls relevant to financial reporting — controls at service organizations that affect a customer\'s internal control over financial reporting (ICFR). SOC 1 is relevant for payroll processors, claims processors, and data centres supporting financial statement production. SOC 2 reports on security, availability, processing integrity, confidentiality, and privacy controls — relevant for any technology provider processing customer data. Most B2B SaaS companies need SOC 2, not SOC 1.' },
      { q: 'Can startups get SOC 2 certified?', a: 'Yes. There is no minimum company size, revenue, or headcount requirement for SOC 2. Early-stage startups increasingly pursue SOC 2 as a commercial accelerant — having a Type II report removes a major enterprise sales blocker and accelerates procurement approval from months to days. Cloud-native startups using AWS, GCP, or Azure have a significant advantage: cloud provider compliance certifications inherit controls for the infrastructure layer, reducing the number of controls you must individually implement.' },
      { q: 'How do we share our SOC 2 report with prospects?', a: 'SOC 2 reports are confidential audit documents — not public certifications like ISO 27001. Share the full report under a mutual NDA when the prospect\'s security team requests detailed review. Best practice: maintain a standard one-page SOC 2 summary (auditor name, audit period, trust service criteria, opinion type) for early-stage sharing without NDA. Some companies use the CAIQ (Consensus Assessments Initiative Questionnaire) to pre-answer common vendor risk questions and include their SOC 2 report reference, reducing duplicative questionnaire work.' },
    ],
  },
  hipaa: {
    tag: 'US Healthcare Data Privacy',
    title: 'HIPAA Compliance Hub',
    subtitle: 'Health Insurance Portability and Accountability Act — PHI Rules for US Healthcare and Health-Tech Companies',
    authority: 'HHS Office for Civil Rights (OCR)',
    jurisdiction: 'United States',
    maxFine: '$100–$50,000 per violation · $1.9M per violation category per year',
    difficulty: 77,
    color: '#dc2626',
    intro: 'HIPAA — the Health Insurance Portability and Accountability Act of 1996 — establishes the foundational legal framework governing the privacy, security, and integrity of Protected Health Information (PHI) in the United States. Enforced by the HHS Office for Civil Rights (OCR), HIPAA applies not only to traditional healthcare providers, health plans, and clearinghouses (Covered Entities) but also to any technology vendor, SaaS platform, or cloud provider that creates, receives, maintains, or transmits PHI on their behalf (Business Associates). The HITECH Act of 2009 dramatically expanded enforcement, authorised state attorneys general to bring HIPAA civil actions, and created the public HHS Breach Portal — commonly called the Wall of Shame — which has tracked over 5,000 reportable breaches affecting more than 500 individuals since 2009.',
    section1: {
      title: 'The Three HIPAA Rules',
      body: 'HIPAA compliance is structured around three primary rules. The Privacy Rule (effective April 2003) defines Protected Health Information (PHI), establishes 18 types of individually identifiable health data, requires patient rights to access and amend their records, and imposes the minimum necessary standard on all PHI disclosures. The Security Rule (effective April 2005) applies specifically to electronic PHI (ePHI) and requires covered entities and business associates to implement administrative, physical, and technical safeguards — including risk analysis, workforce training, access controls, audit controls, encryption in transit, and device and media controls.\n\nThe Breach Notification Rule (effective February 2010 under HITECH) requires covered entities to notify affected individuals within 60 days of discovering a breach, notify HHS for breaches affecting 500+ individuals (triggering immediate publication on the Wall of Shame), and notify HHS annually for breaches affecting fewer than 500 individuals. Media notice is required for breaches affecting 500+ individuals in a state or jurisdiction.',
    },
    section2: {
      title: 'Who Must Comply',
      checklist: [
        'Covered Entities: healthcare providers (hospitals, clinics, physicians, pharmacies), health plans (insurers, HMOs), and healthcare clearinghouses',
        'Business Associates: any vendor receiving, maintaining, or transmitting PHI — cloud providers, EHR vendors, billing platforms, analytics companies, SaaS tools',
        'Subcontractors of Business Associates who handle PHI (downstream BAA chain)',
        'Health-tech and digital health startups with access to patient data via API, integration, or data processing agreements',
        'Telemedicine platforms, remote patient monitoring companies, and digital therapeutics providers',
        'Research institutions receiving patient data from covered entities for clinical research',
      ],
    },
    section3: {
      title: 'Penalties and Enforcement History',
      body: 'HIPAA penalties follow a four-tier structure based on culpability. Tier 1 (did not know): $100–$50,000 per violation, $25,000 annual cap per category. Tier 2 (reasonable cause): $1,000–$50,000 per violation, $100,000 annual cap. Tier 3 (willful neglect corrected): $10,000–$50,000 per violation, $250,000 annual cap. Tier 4 (willful neglect uncorrected): $50,000 per violation, $1.9M annual cap per violation category. The 2024 HIPAA Safe Harbor provision reduces penalties for entities that have implemented recognized cybersecurity frameworks (NIST CSF, NIST SP 800-66) in the 12 months preceding a breach. OCR has collected over $135M in settlements and penalties since 2009.',
    },
    timeline: [
      { date: 'Aug 1996', event: 'HIPAA Enacted', detail: 'Health Insurance Portability and Accountability Act signed. Title II Administrative Simplification provisions required patient data privacy standards for the first time.' },
      { date: 'Apr 2003', event: 'Privacy Rule Effective', detail: '18 PHI identifiers defined. Minimum necessary standard established. Patient rights to access, amend, and receive an accounting of disclosures codified.' },
      { date: 'Apr 2005', event: 'Security Rule Effective', detail: 'Technical, administrative, and physical safeguard requirements for ePHI established. Risk analysis mandate and annual review requirements began.' },
      { date: 'Feb 2010', event: 'HITECH Breach Notification', detail: 'Breach Notification Rule began enforcement. HHS Breach Portal (Wall of Shame) launched. State AG enforcement rights created. BA liability expanded directly (not just through covered entities).' },
      { date: 'Mar 2024', event: 'HIPAA Safe Harbor for Cybersecurity', detail: 'HHS clarified Safe Harbor reducing penalties for entities implementing NIST CSF or NIST SP 800-66 frameworks before a breach. Change Healthcare cyberattack (100M+ patients affected) prompted renewed enforcement focus.' },
    ],
    comparison: {
      headers: ['Dimension', 'HIPAA', 'GDPR', 'SOC 2'],
      rows: [
        ['Type', 'US federal regulation', 'EU data protection law', 'Voluntary audit/attestation'],
        ['Enforcement Body', 'HHS Office for Civil Rights', 'National DPAs + EDPB', 'No enforcement — commercial'],
        ['Max Annual Penalty', '$1.9M per violation category', '€20M or 4% global turnover', 'No fine — lost contracts'],
        ['Breach Notification', '60 days (500+ individuals)', '72 hours to supervisory authority', 'Not required (contractual SLA)'],
        ['Scope', 'US PHI only', 'EU/EEA personal data', 'Customer data broadly'],
        ['Privacy Officer', 'Required (Privacy Rule)', 'DPO required for high-risk', 'Not required'],
      ],
    },
    mitigations: [
      { title: 'Conduct and Document an Annual HIPAA Risk Analysis', body: 'The Security Rule requires a formal risk analysis as a foundation of your HIPAA compliance programme. The risk analysis must identify all ePHI created, received, maintained, or transmitted; identify and evaluate the probability and impact of each threat and vulnerability; implement security measures sufficient to reduce risks and vulnerabilities to a reasonable and appropriate level; and document the process. Risk analysis must be reviewed and updated in response to environmental or operational changes. OCR consistently cites missing or inadequate risk analysis as the #1 compliance failure in investigations.' },
      { title: 'Execute Business Associate Agreements with Every PHI-Handling Vendor', body: 'Any vendor that creates, receives, maintains, or transmits PHI on your behalf is a Business Associate. HIPAA requires a written Business Associate Agreement (BAA) before any PHI is shared. The BAA must specify permitted uses and disclosures, require the BA to implement appropriate safeguards, require the BA to report breaches, and require the BA to return or destroy PHI at contract termination. Cloud providers (AWS, GCP, Azure) all offer HIPAA-eligible services with BAAs — but signing the BAA and configuring your environment to be HIPAA-eligible are two separate steps. Failure to execute a BAA before sharing PHI is a per-violation HIPAA violation.' },
      { title: 'Implement Technical Safeguards and Access Controls for ePHI Systems', body: 'Technical safeguards are the most frequently cited area in OCR audits. Required controls: unique user identification (no shared accounts for ePHI systems); automatic logoff after inactivity; encryption and decryption of ePHI in transit (TLS 1.2+ required; TLS 1.3 recommended) and at rest (AES-256 standard); audit logging of all ePHI access, modification, and deletion; and integrity controls to detect unauthorised ePHI alteration. Addressable (required unless documented alternative): encryption at rest, automatic logoff timers, message authentication. The HIPAA Safe Harbor (2024) reduces penalties for entities implementing NIST CSF or NIST SP 800-66 frameworks.' },
    ],
    precedent: 'HHS Office for Civil Rights v. Advocate Health Care Network (2016): "$5.55M settlement — the largest HIPAA settlement at the time — resolved alleged violations stemming from the theft of four unencrypted laptops containing ePHI of 4 million patients. OCR investigation found Advocate failed to conduct an accurate and thorough risk analysis, failed to implement policies and procedures governing workstations that access ePHI, and failed to implement physical safeguards for ePHI systems." — HHS OCR Settlement Agreement, Aug 4, 2016.',
    faqs: [
      { q: 'Does HIPAA apply to my digital health or healthcare SaaS startup?', a: 'HIPAA applies to your startup if you are (1) a covered entity — a healthcare provider who transmits health information electronically, a health plan, or a healthcare clearinghouse — or (2) a Business Associate — any company that creates, receives, maintains, or transmits PHI on behalf of a covered entity. Most healthcare technology companies, EHR vendors, patient portal providers, health analytics platforms, telehealth companies, and healthcare AI companies are Business Associates. If your product stores, processes, or transmits identifiable patient health information in the US, you almost certainly need a HIPAA compliance programme and BAAs with your covered entity customers.' },
      { q: 'What are the 18 types of Protected Health Information?', a: 'PHI is health information that identifies an individual and relates to past, present, or future physical or mental health, health care, or payment for health care. The 18 HIPAA identifiers are: name, address (anything more specific than state), dates (except year), phone, fax, email, SSN, medical record number, health plan beneficiary number, account number, certificate/license number, vehicle identifiers, device identifiers, URLs, IP addresses, biometric identifiers, full face photographs, and any other unique identifying number or code. If health information contains any of the 18 identifiers, it is PHI and HIPAA applies. Safe Harbor de-identification requires removing all 18 identifiers before data can be treated as non-PHI.' },
      { q: 'What is a Business Associate Agreement and when is it required?', a: 'A Business Associate Agreement (BAA) is a written contract that must be executed before a covered entity shares PHI with any Business Associate. The BAA is a HIPAA-mandated document — not just a commercial nicety. It must describe permitted uses and disclosures of PHI, require the BA to implement appropriate safeguards, require reporting of security incidents and breaches, allow the covered entity to terminate the BAA and recover PHI upon violation, and prohibit the BA from further disclosures not permitted by the agreement. Cloud providers (AWS, GCP, Azure) offer BAAs for HIPAA-eligible services — but signing the BAA does not make your entire cloud environment HIPAA-compliant; only HIPAA-eligible services in your specific configuration qualify.' },
      { q: 'What is the difference between a HIPAA breach and a security incident?', a: 'A security incident is any attempted or successful unauthorized access, use, disclosure, modification, or destruction of ePHI — including phishing attempts, ransomware, misconfigured S3 buckets, and accidental disclosures. A breach is a specific type of security incident: the acquisition, access, use, or disclosure of unsecured PHI in a manner not permitted by the Privacy Rule, presumed to be a reportable breach unless the covered entity or BA demonstrates through a risk assessment that there is a low probability that PHI was compromised (the 4-factor test). Breach notification timelines: individuals within 60 days; HHS simultaneously for 500+ individual breaches; HHS annually for smaller breaches; media notice for 500+ individuals in a state.' },
      { q: 'How do HIPAA penalties work and how can they be reduced?', a: 'HIPAA civil monetary penalties follow a four-tier structure tied to culpability: unknown violation ($100–$50K/violation, $25K annual cap per category); reasonable cause ($1K–$50K, $100K cap); willful neglect corrected ($10K–$50K, $250K cap); willful neglect uncorrected ($50K/violation, $1.9M cap). The 2024 HIPAA Safe Harbor provision reduces penalties for entities that have implemented a recognised cybersecurity framework (NIST CSF, NIST SP 800-66, CIS Controls, ISO 27001, etc.) in the 12 months before the breach. Criminal HIPAA violations are referred to the Department of Justice and can result in up to 10 years imprisonment. State attorneys general can also bring parallel civil enforcement actions, compounding penalties.' },
    ],
  },
  dpdpa: {
    tag: 'India Data Privacy Law',
    title: 'India DPDPA Compliance Hub',
    subtitle: 'Digital Personal Data Protection Act 2023 — India\'s Privacy Framework for Data Fiduciaries Processing Indian Personal Data',
    authority: 'Data Protection Board of India (Ministry of Electronics and IT)',
    jurisdiction: 'India + cross-border processors of Indian data subjects\' personal data',
    maxFine: '₹250 crore (≈$30M USD) per violation',
    difficulty: 64,
    color: '#0891b2',
    intro: 'India\'s Digital Personal Data Protection Act 2023 (DPDPA), signed into law on 11 August 2023 as Act No. 22 of 2023, represents India\'s first standalone personal data protection statute — replacing years of reliance on Section 43A of the IT Act 2000. The DPDPA establishes a consent-first framework for "digital personal data" — data collected, stored, or processed in digital form — applying to Data Fiduciaries (analogous to GDPR controllers) operating in India or processing data of Indian Data Principals (data subjects) outside India. Enforcement is phased, with the Data Protection Board of India (DPB) constituted under the Ministry of Electronics and Information Technology (MeitY) responsible for adjudication. As of 2025, the draft DPDPA Rules remain under consultation, with enforcement expected to begin in phases through 2025–2026. Indian companies and multinationals processing Indian user data must begin compliance programmes now — waiting for Rules finalization is a significant governance risk.',
    section1: {
      title: 'What the DPDPA Covers',
      body: 'The DPDPA applies to the processing of "digital personal data" — any data about an individual collected in digital form or digitised after collection. The Act establishes two primary categories of regulated parties. Data Fiduciaries determine the purpose and means of processing personal data. Significant Data Fiduciaries (SDFs) are government-designated entities whose scale, sensitivity, or national security implications warrant heightened obligations: mandatory Data Protection Officer, mandatory Data Audits, mandatory algorithmic impact assessments, and data localisation requirements to be specified by government notification.\n\nThe DPDPA defines seven lawful processing grounds: consent (the primary ground), voluntary provision for contractual performance, compliance with legal obligations, medical emergencies, employment purposes, public interest processing, and research/archiving under prescribed conditions. Unlike GDPR\'s six bases, DPDPA heavily emphasises consent — which must be free, specific, informed, unconditional, and unambiguous. The Act mandates Consent Managers: MeitY-registered intermediaries through which Data Principals can give, manage, review, and withdraw consent across multiple Data Fiduciaries via a single interface.',
    },
    section2: {
      title: 'Who Must Comply',
      checklist: [
        'Indian companies processing digital personal data of individuals in India',
        'Foreign companies processing personal data of Indian Data Principals outside India in connection with goods or services offered to them',
        'Significant Data Fiduciaries (government-designated) — additional obligations apply: DPO, data audit, algorithmic impact assessment, localisation',
        'Data Processors (vendors) acting on behalf of Data Fiduciaries — must enter into written data processing contracts',
        'SaaS platforms and cloud services used by Indian enterprises that process personal data of Indian users',
        'Fintech, healthcare, and e-commerce companies collecting Indian user data for targeting, profiling, or personalisation',
      ],
    },
    section3: {
      title: 'Penalties and Enforcement',
      body: 'The DPDPA establishes a tiered penalty structure adjudicated by the Data Protection Board of India. Schedule 1 specifies penalties: failure to implement reasonable security safeguards resulting in a personal data breach — up to ₹250 crore (≈$30M). Failure to notify Data Principals and the Board of a breach — up to ₹200 crore. Failure by a Significant Data Fiduciary to observe additional obligations — up to ₹150 crore. Violation of children\'s data processing restrictions — up to ₹200 crore. Other violations — up to ₹50 crore per violation. The DPB is empowered to investigate, impose penalties, and order discontinuation of processing. Appeals lie to the Telecom Disputes Settlement and Appellate Tribunal (TDSAT) and then to High Courts.',
    },
    timeline: [
      { date: 'Nov 2022', event: 'Previous Bill Withdrawn', detail: 'The Personal Data Protection Bill 2019 (JPC-reviewed) was withdrawn after 3 years. MeitY began drafting a new, leaner statute to reduce compliance burden while maintaining core protections.' },
      { date: 'Aug 2023', event: 'DPDPA Enacted', detail: 'Digital Personal Data Protection Act 2023 (Act No. 22 of 2023) received Presidential assent and was published in the Official Gazette. A consent-first, digital-first framework with 7 processing grounds.' },
      { date: 'Jan 2024', event: 'Draft Rules Published', detail: 'MeitY published Draft DPDPA Rules for public consultation. Rules specify Consent Manager registration, Data Protection Officer qualifications, and breach notification timelines (72 hours proposed).' },
      { date: '2024–2025', event: 'Rules Finalization', detail: 'MeitY consultation rounds on data localisation, cross-border transfer restrictions, and Significant Data Fiduciary designation criteria. Large tech platforms begin compliance mapping exercises.' },
      { date: '2025–2026', event: 'Phased Enforcement Begins', detail: 'Data Protection Board constituted. First Significant Data Fiduciary designations expected. Grace periods for smaller Data Fiduciaries. Enforcement of breach notification and consent requirements begins.' },
    ],
    comparison: {
      headers: ['Dimension', 'India DPDPA', 'GDPR', 'CCPA / CPRA'],
      rows: [
        ['Enforcement Body', 'Data Protection Board of India', 'National DPAs + EDPB', 'CPPA + California AG'],
        ['Max Penalty', '₹250 crore (≈$30M) per violation', '€20M or 4% global turnover', '$7,500 per intentional violation'],
        ['Data Localisation', 'Required for Significant DFs (to be specified)', 'No — standard SCCs/BCRs', 'No requirement'],
        ['Consent Basis', 'Explicit, purpose-specific, withdrawable', 'One of 6 lawful bases (consent preferred)', 'Opt-out right (not consent-first)'],
        ['Cross-Border Transfer', 'Allowed unless government restricts countries', 'Adequacy decisions/SCCs/BCRs required', 'No specific restriction'],
        ['Children\'s Data', '18+ or guardian consent (age-gating required)', '13+ in most states (member state variation)', '16+ (opt-in for 13–16) under CPRA'],
      ],
    },
    mitigations: [
      { title: 'Classify Your Entity and Assess Significant Data Fiduciary Threshold', body: 'Begin by determining whether your organisation qualifies as a Data Fiduciary under the DPDPA and, if so, whether you are likely to be designated a Significant Data Fiduciary (SDF). SDF designation criteria will be specified by MeitY notification but are expected to include: volume of personal data processed (likely 10M+ users), sensitivity of data, national security or public order implications, risk to electoral democracy, and cross-border transfer volumes. SDFs face additional obligations: Data Protection Officer (must be India-resident), annual data audit, algorithmic impact assessments, and data localisation for specified data categories. Even if you are not an SDF, begin compliance mapping now — the breach notification timeline and consent requirements apply to all Data Fiduciaries.' },
      { title: 'Implement a Consent Management Framework', body: 'The DPDPA\'s primary processing ground is consent — more prominently than GDPR. Consent must be: free (no bundling unrelated consents), specific (for defined purposes), informed (notice explaining purpose, categories, third-party sharing), unconditional (no contingent on service access unless genuinely required), and unambiguous (affirmative act; no pre-ticked boxes). The Draft DPDPA Rules require consent to be given through a "consent artefact" — a machine-readable digital record of each consent, including the entity, purpose, data categories, and withdrawal mechanism. Data Principals have the right to withdraw consent at any time. Withdrawal must be processed within a reasonable time, and post-withdrawal processing must cease (subject to legal retention obligations). Build your consent infrastructure to support artefact generation and withdrawal workflows before enforcement begins.' },
      { title: 'Establish Breach Detection and Notification Infrastructure', body: 'The DPDPA requires Data Fiduciaries to notify both the Data Protection Board and affected Data Principals of a personal data breach "without delay." The Draft Rules propose a 72-hour notification window for the DPB (aligned with GDPR), with Data Principal notification to follow. Breach notification must include: nature of breach, categories and approximate volume of data affected, likely consequences, and remedial measures taken or proposed. Critical first steps: implement security incident detection logging for all personal data systems; define and document what constitutes a "personal data breach" vs a security incident; establish an internal escalation protocol with clear ownership; and engage legal counsel to assess breach notification obligations before your first incident, not after.' },
    ],
    precedent: 'Ministry of Electronics and Information Technology (MeitY) Statement on DPDPA Objectives (Aug 2023): "The Digital Personal Data Protection Act 2023 recognises that data is a valuable resource and that individuals whose data is being processed have a right to have their data protected. The Act seeks to balance the right of individuals to protect their personal data with the need to process personal data for lawful purposes. The Act is designed to be technology-agnostic, principle-based, and focused on accountability of Data Fiduciaries." — MeitY Press Note, August 11, 2023.',
    faqs: [
      { q: 'Does India\'s DPDPA apply to companies outside India?', a: 'Yes. The DPDPA applies extra-territorially when a non-Indian entity processes the personal data of Data Principals located in India in connection with offering goods or services to them. This mirrors the GDPR\'s "establishment or targeting" principle. A US or EU company offering a SaaS product to Indian enterprises, or a consumer app with Indian users, must comply with DPDPA obligations including consent requirements, breach notification, and Data Principal rights — regardless of where the company is incorporated or where the data is stored (subject to cross-border transfer restrictions, which are to be specified by government notification).' },
      { q: 'What is a Significant Data Fiduciary under the DPDPA?', a: 'A Significant Data Fiduciary (SDF) is a category of Data Fiduciary that the central government designates by notification based on: volume and sensitivity of personal data processed, risk to rights of Data Principals, potential impact on sovereignty and integrity of India, risk to electoral democracy, national security implications, and cross-border transfer volumes. SDFs face additional obligations not required of other Data Fiduciaries: appointment of a Data Protection Officer (India-resident), appointment of an independent data auditor, algorithmic impact assessments for processing activities, and data localisation for specified categories. MeitY has not yet published the SDF designation list as of mid-2025, but large tech platforms, payment aggregators, and major consumer internet companies are widely expected to be designated.' },
      { q: 'What are the notice and consent requirements under the DPDPA?', a: 'Before or at the time of collecting personal data, a Data Fiduciary must provide a clear and plain-language notice specifying: what personal data is being collected, the purpose for which it will be processed, the manner in which Data Principal rights may be exercised, and the manner in which the Data Principal can raise a grievance. Consent must be a clear affirmative act — no pre-ticked boxes, no bundled consents for unrelated purposes. The Draft DPDPA Rules require consent to be recorded in a "consent artefact" — a structured machine-readable record. Data Principals may withdraw consent at any time, and withdrawal must be processed within a timeline specified in rules (expected to mirror GDPR\'s "reasonable time" standard). Importantly, the DPDPA does not permit "legitimate interests" as a standalone processing ground — consent or one of the other six specified lawful purposes must always apply.' },
      { q: 'How do DPDPA penalties compare to GDPR in practice?', a: 'The DPDPA\'s maximum penalty is ₹250 crore (approximately $30M USD), applied per violation. GDPR\'s maximum is €20M or 4% of global annual turnover — whichever is higher — meaning a large MNC could face a €500M+ GDPR fine while the same company\'s DPDPA exposure is capped near $30M. For small and medium companies, the DPDPA penalty ceiling is significant relative to revenue. However, the Data Protection Board is a new institution with limited enforcement precedent as of 2025. Unlike GDPR\'s 5+ years of active enforcement with documented fines exceeding €4.5B across the EU, the DPDPA\'s enforcement trajectory is uncertain. Practical compliance posture: treat DPDPA obligations as seriously as GDPR obligations for data collected from Indian users, as the penalty and reputational risk is real even if early enforcement actions are targeted rather than mass-market.' },
      { q: 'What is a Consent Manager and is it required?', a: 'A Consent Manager is a MeitY-registered intermediary through which a Data Principal can provide, manage, review, and withdraw consents across multiple Data Fiduciaries through a single platform. Think of it as an interoperable consent dashboard. Data Fiduciaries are not required to use a Consent Manager for all consent collection — they can maintain their own consent artefacts directly. However, if a Data Principal uses a Consent Manager to withdraw consent, the Data Fiduciary must give effect to that withdrawal. Consent Managers must be registered with MeitY, maintain interoperable standards specified in the Rules, maintain a consent artefact log, and allow Data Principals to review and modify consents. The Consent Manager ecosystem is modelled on the Account Aggregator framework in Indian fintech and is expected to become the dominant consent infrastructure for large consumer-facing platforms.' },
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

          {(params.slug === 'mica' || params.slug === 'gdpr' || params.slug === 'vara' || params.slug === 'aml' || params.slug === 'ai-act' || params.slug === 'boi' || params.slug === 'dora' || params.slug === 'ccpa' || params.slug === 'soc2' || params.slug === 'hipaa' || params.slug === 'dpdpa' || params.slug === 'sec') && (
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
              {params.slug === 'ai-act' && (
                <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6 }}>
                  <Link href="/guides/eu-ai-act-compliance-guide" style={{ color: 'var(--primary)', fontWeight: 600 }}>EU AI Act Compliance Guide →</Link>
                  {' '}Risk tier classification, Annex III categories, GPAI model obligations, conformity assessment checklist, and 2025–2026 implementation timeline.
                </p>
              )}
              {params.slug === 'boi' && (
                <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6 }}>
                  <Link href="/guides/beneficial-ownership-information-filing" style={{ color: 'var(--primary)', fontWeight: 600 }}>BOI Filing Guide →</Link>
                  {' '}Who must file, 23 exemption categories, step-by-step FinCEN BOIT system walkthrough, and 30-day update trigger checklist.
                </p>
              )}
              {params.slug === 'dora' && (
                <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6 }}>
                  <Link href="/guides/dora-ict-compliance-guide" style={{ color: 'var(--primary)', fontWeight: 600 }}>DORA ICT Compliance Guide →</Link>
                  {' '}Five DORA pillars, Article 30 contract checklist, 4h/72h/1-month incident reporting, CTPP designation, and TLPT obligations for ICT vendors serving EU financial entities.
                </p>
              )}
              {params.slug === 'ccpa' && (
                <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6 }}>
                  <Link href="/guides/privacy-policy-compliance-guide" style={{ color: 'var(--primary)', fontWeight: 600 }}>Privacy Policy Compliance Guide →</Link>
                  {' '}How to build a CCPA/CPRA-compliant privacy policy, data map, and consumer request workflow — including GPC signal implementation.
                </p>
              )}
              {params.slug === 'soc2' && (
                <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6 }}>
                  <Link href="/guides/soc2-compliance-checklist-saas" style={{ color: 'var(--primary)', fontWeight: 600 }}>SOC 2 Compliance Checklist →</Link>
                  {' '}Complete control implementation checklist, trust service criteria breakdown, auditor selection guide, and evidence collection playbook for SaaS companies.
                </p>
              )}
              {params.slug === 'hipaa' && (
                <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6 }}>
                  <Link href="/guides/hipaa-compliance-checklist-saas" style={{ color: 'var(--primary)', fontWeight: 600 }}>HIPAA Compliance Checklist →</Link>
                  {' '}Business Associate Agreement requirements, ePHI technical safeguards, breach notification timelines, and the 2024 HIPAA Safe Harbor for cybersecurity frameworks.
                </p>
              )}
              {params.slug === 'dpdpa' && (
                <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6 }}>
                  <Link href="/guides/india-dpdpa-compliance-guide" style={{ color: 'var(--primary)', fontWeight: 600 }}>India DPDPA Compliance Guide →</Link>
                  {' '}Consent management, Data Principal rights, breach notification timelines, and cross-border transfer rules for companies processing Indian personal data.
                </p>
              )}
              {params.slug === 'sec' && (
                <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.6 }}>
                  <Link href="/guides/sec-crypto-compliance-guide" style={{ color: 'var(--primary)', fontWeight: 600 }}>SEC Crypto Compliance Guide →</Link>
                  {' '}Howey Test token classification, Reg D / Reg S / Reg CF exemptions, SAFT structures, broker-dealer registration triggers, and the post-Ripple enforcement landscape for crypto token issuers.
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
            {params.slug === 'ai-act' && (
              <>
                <Link href="/tools/website-compliance" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>Website Compliance Checker →</Link>
                <Link href="/tools/gdpr-fine-estimator" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>GDPR Fine Estimator →</Link>
              </>
            )}
            {params.slug === 'boi' && (
              <Link href="/tools/contract-fixer" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Contract Risk Scanner →</Link>
            )}
            {params.slug === 'dora' && (
              <>
                <Link href="/tools/website-compliance" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>Website Compliance Checker →</Link>
                <Link href="/tools/contract-fixer" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Contract Risk Scanner →</Link>
              </>
            )}
            {params.slug === 'ccpa' && (
              <>
                <Link href="/tools/website-compliance" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>Website Compliance Checker →</Link>
                <Link href="/tools/gdpr-breach-timer" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Breach Timer →</Link>
              </>
            )}
            {params.slug === 'soc2' && (
              <>
                <Link href="/tools/saas-risk-scanner" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>SaaS Risk Scanner →</Link>
                <Link href="/tools/contract-fixer" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Contract Risk Scanner →</Link>
              </>
            )}
            {params.slug === 'hipaa' && (
              <>
                <Link href="/tools/website-compliance" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>Website Compliance Checker →</Link>
                <Link href="/tools/contract-fixer" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Contract Risk Scanner →</Link>
              </>
            )}
            {params.slug === 'dpdpa' && (
              <>
                <Link href="/tools/website-compliance" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>Website Compliance Checker →</Link>
                <Link href="/tools/gdpr-fine-estimator" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>GDPR Fine Estimator →</Link>
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
                <Link href="/guides/sec-crypto-compliance-guide" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>SEC Crypto Compliance Guide →</Link>
                <Link href="/guides/aml-kyc-compliance-crypto" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>AML & KYC for Crypto →</Link>
                <Link href="/guides/mica-regulation-crypto-compliance" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>MiCA Regulation Guide →</Link>
              </>
            )}
            {params.slug === 'vara' && (
              <>
                <Link href="/guides/vara-licensing-guide" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>VARA Licensing Guide →</Link>
                <Link href="/guides/mica-regulation-crypto-compliance" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>MiCA Regulation Guide →</Link>
                <Link href="/guides/aml-kyc-compliance-crypto" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>AML & KYC for Crypto →</Link>
              </>
            )}
            {params.slug === 'ai-act' && (
              <>
                <Link href="/guides/eu-ai-act-compliance-guide" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>EU AI Act Compliance Guide →</Link>
                <Link href="/guides/ai-governance-framework-guide" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>AI Governance Framework Guide →</Link>
                <Link href="/guides/startup-compliance-program-guide" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Startup Compliance Program →</Link>
              </>
            )}
            {params.slug === 'boi' && (
              <>
                <Link href="/guides/beneficial-ownership-information-filing" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>BOI Filing Guide →</Link>
                <Link href="/guides/startup-compliance-program-guide" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Startup Compliance Program →</Link>
              </>
            )}
            {params.slug === 'dora' && (
              <>
                <Link href="/guides/dora-ict-compliance-guide" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>DORA ICT Compliance Guide →</Link>
                <Link href="/guides/mica-regulation-crypto-compliance" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>MiCA Compliance Guide →</Link>
                <Link href="/guides/aml-kyc-compliance-crypto" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>AML & KYC for Crypto →</Link>
              </>
            )}
            {params.slug === 'ccpa' && (
              <>
                <Link href="/guides/privacy-policy-compliance-guide" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>Privacy Policy Compliance Guide →</Link>
                <Link href="/guides/gdpr-compliance-checklist-saas" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>GDPR Checklist for SaaS →</Link>
                <Link href="/guides/startup-compliance-program-guide" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Startup Compliance Program →</Link>
              </>
            )}
            {params.slug === 'soc2' && (
              <>
                <Link href="/guides/soc2-compliance-checklist-saas" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>SOC 2 Compliance Checklist →</Link>
                <Link href="/guides/iso-27001-vs-soc2-guide" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>ISO 27001 vs SOC 2 Guide →</Link>
                <Link href="/guides/compliance-health-score-saas" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Compliance Health Score →</Link>
              </>
            )}
            {params.slug === 'hipaa' && (
              <>
                <Link href="/guides/soc2-compliance-checklist-saas" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>SOC 2 Compliance Checklist →</Link>
                <Link href="/guides/compliance-health-score-saas" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>Compliance Health Score →</Link>
                <Link href="/guides/startup-compliance-program-guide" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Startup Compliance Program →</Link>
              </>
            )}
            {params.slug === 'dpdpa' && (
              <>
                <Link href="/guides/india-dpdpa-compliance-guide" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>India DPDPA Compliance Guide →</Link>
                <Link href="/guides/privacy-policy-compliance-guide" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)', borderBottom: '0.5px solid var(--outline-var)' }}>Privacy Policy Compliance Guide →</Link>
                <Link href="/guides/startup-compliance-program-guide" style={{ display: 'block', padding: '6px 0', fontSize: 12, color: 'var(--on-surface-var)' }}>Startup Compliance Program →</Link>
              </>
            )}
          </div>

          {/* Agent CTA — product upsell per regulation */}
          {(params.slug === 'ai-act' || params.slug === 'boi') && (
            <div className="card" style={{ marginTop: 16, background: 'var(--bg-mid)', border: '0.5px solid var(--outline-var)' }}>
              <span className="section-label" style={{ marginBottom: 8 }}>Automate This</span>
              {params.slug === 'ai-act' && (
                <>
                  <p style={{ fontSize: 12, color: 'var(--on-surface-var)', marginBottom: 12, lineHeight: 1.6 }}>Daily monitoring of EU AI Act implementing regs. Email alert when your risk tier is affected.</p>
                  <Link href="/agents/ai-act" className="btn-primary" style={{ fontSize: 11, padding: '8px 14px', width: '100%', justifyContent: 'center' }}>
                    AI Act Monitor — $49/mo →
                  </Link>
                </>
              )}
              {params.slug === 'boi' && (
                <>
                  <p style={{ fontSize: 12, color: 'var(--on-surface-var)', marginBottom: 12, lineHeight: 1.6 }}>Automated BOI filing tracker + 30-day ownership change alerts for your entity group.</p>
                  <Link href="/agents/boi-tracker" className="btn-primary" style={{ fontSize: 11, padding: '8px 14px', width: '100%', justifyContent: 'center' }}>
                    BOI-Tracker — $149 →
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
