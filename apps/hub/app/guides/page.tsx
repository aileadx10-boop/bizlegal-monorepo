import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compliance Guides for SaaS, Fintech & Crypto Startups | BizLegal AI',
  description: 'Practitioner-written compliance guides for founders. BOI, GDPR, MiCA, EU AI Act, DORA, HIPAA, SEC crypto, India DPDPA, SOC 2, AML/KYC, VARA licensing, privacy policy monitoring, marketplace 1099-K, AI governance frameworks, and more.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides' },
  openGraph: {
    title: 'Compliance Guides — BizLegal AI',
    description: 'Step-by-step compliance guides written by practicing attorneys. BOI, GDPR, MiCA, CCO vs retainer, forensic wallet analysis, and more.',
    url: 'https://bizlegal-ai.com/guides',
    type: 'website',
  },
}

const GUIDES = [
  {
    href: '/guides/beneficial-ownership-information-filing',
    title: 'BOI Filing Guide: Beneficial Ownership Information Report (2025)',
    description: 'Who must file, what information is required, filing deadlines, the 23 exemptions, and penalties for non-compliance.',
    tag: 'Corporate Compliance',
    product: null,
  },
  {
    href: '/guides/gdpr-compliance-checklist-saas',
    title: 'GDPR Compliance Checklist for SaaS Startups (2025)',
    description: 'Legal bases for processing, privacy notices, data processor agreements, breach notification, and international transfers — all 7 phases.',
    tag: 'Privacy & Data',
    product: null,
  },
  {
    href: '/guides/mica-regulation-crypto-compliance',
    title: 'MiCA Regulation: What Crypto Startups Must Do',
    description: 'CASP authorization requirements, token whitepaper rules, ART/EMT obligations, and MiCA extraterritorial reach for non-EU companies.',
    tag: 'Crypto Regulation',
    product: null,
  },
  {
    href: '/guides/fractional-cco-vs-compliance-retainer',
    title: 'Fractional CCO vs Compliance Retainer: Which Do You Need?',
    description: 'Cost comparison, use-case matrix, and when each model fits — for pre-Series B teams with real compliance obligations but not enough for a full-time hire.',
    tag: 'Compliance Strategy',
    product: null,
  },
  {
    href: '/guides/blockchain-wallet-investigation',
    title: 'How to Investigate a Crypto Wallet: Forensic Analysis Guide',
    description: 'What on-chain forensics reveals, when to commission a blockchain investigation, what data sources are used, and how to use wallet reports for legal proceedings.',
    tag: 'Crypto Forensics',
    product: null,
  },
  {
    href: '/guides/compliance-health-score-saas',
    title: 'Compliance Health Score for SaaS Startups: What It Means',
    description: 'What a compliance health score measures, why enterprise customers ask for it, which frameworks it covers, and how to improve your score before an audit.',
    tag: 'Compliance Posture',
    product: null,
  },
  {
    href: '/guides/soc2-compliance-checklist-saas',
    title: 'SOC 2 Compliance Checklist for SaaS Startups (2025)',
    description: 'Type I vs Type II, the five Trust Service Criteria, what auditors collect as evidence, the timeline from zero to report, and the controls most SaaS companies are missing.',
    tag: 'Security & Compliance',
    product: null,
  },
  {
    href: '/guides/aml-kyc-compliance-crypto',
    title: 'AML & KYC Compliance Checklist for Crypto Companies (2025)',
    description: 'FATF Travel Rule implementation, FinCEN MSB registration, EU AMLD obligations, transaction monitoring red flags, and the AML program components regulators require.',
    tag: 'Crypto Compliance',
    product: null,
  },
  {
    href: '/guides/vara-licensing-guide',
    title: 'VARA Licensing Guide: Getting Licensed in Dubai for Crypto (2025)',
    description: 'VARA license categories, capital requirements, the three-stage application process, mandatory insurance, and how VARA compares to MiCA and ADGM for crypto businesses.',
    tag: 'Crypto Licensing',
    product: null,
  },
  {
    href: '/guides/eu-ai-act-compliance-guide',
    title: 'EU AI Act Compliance Guide for SaaS & AI Companies (2025)',
    description: 'Article 6 + Annex III risk classification, GPAI model obligations, the 10 high-risk system requirements, conformity assessment, and the 2026-08-02 deadline — for SaaS founders and AI product teams.',
    tag: 'AI Regulation',
    product: null,
  },
  {
    href: '/guides/india-dpdpa-compliance-guide',
    title: 'India DPDPA Compliance Guide for B2B SaaS (2025)',
    description: 'Does DPDPA apply to you? Notice + consent requirements, data principal rights, Significant Data Fiduciary criteria, and the ₹250 crore fine schedule — for SaaS with India-resident users.',
    tag: 'Privacy Law',
    product: null,
  },
  {
    href: '/guides/privacy-policy-compliance-guide',
    title: 'Privacy Policy Compliance Guide for SaaS Startups (2025)',
    description: '7 frameworks, 6 policy sections, 6 events that make your policy stale immediately. GDPR, CCPA, CPRA, Quebec Law 25, Colorado, Connecticut, Texas DPSA. Real enforcement cases, real fines.',
    tag: 'Privacy & Data',
    product: null,
  },
  {
    href: '/guides/marketplace-tax-compliance-guide',
    title: 'Marketplace Tax & 1099-K Compliance Guide for Platforms (2025)',
    description: '1099-K threshold drops to $600 in 2025. Platform-by-platform reporting rules, marketplace facilitator laws in 45 states, and the per-form penalty schedule for getting it wrong.',
    tag: 'Tax Compliance',
    product: null,
  },
  {
    href: '/guides/ai-governance-framework-guide',
    title: 'AI Governance Framework Guide for SaaS & Enterprises (2025)',
    description: 'NIST AI RMF vs ISO/IEC 42001 vs EU AI Act: who needs what, the 6-component governance program, the 8 high-risk use cases, and penalty comparison across all three frameworks.',
    tag: 'AI Regulation',
    product: null,
  },
  {
    href: '/guides/contract-risk-analysis-guide',
    title: 'Contract Risk Analysis Guide: 7 Red Flags in Every Vendor Agreement (2025)',
    description: 'Unlimited liability, unilateral modification, auto-renewal traps, perpetual data license grants. The 7 clauses that destroy startups — and the counter-position for each.',
    tag: 'Contracts',
    product: null,
  },
  {
    href: '/guides/iso-27001-vs-soc2-guide',
    title: 'ISO 27001 vs SOC 2: Which Does Your SaaS Startup Need? (2025)',
    description: 'ISO 27001 takes 9-18 months and costs $40-80K. SOC 2 takes 4-9 months and costs $20-50K. Which one enterprise customers actually require — and when you need both.',
    tag: 'Security & Compliance',
    product: null,
  },
  {
    href: '/guides/startup-compliance-program-guide',
    title: 'Startup Compliance Program Guide: When You Need One and How to Build It (2025)',
    description: '6 triggers that make a compliance program non-negotiable. 7 program components. 4 staffing models. The 12-month compliance calendar every fintech founder needs.',
    tag: 'Compliance Strategy',
    product: null,
  },
  {
    href: '/guides/hipaa-compliance-checklist-saas',
    title: 'HIPAA Compliance Checklist for Healthcare SaaS (2025)',
    description: 'The three HIPAA rules, Business Associate Agreement requirements, ePHI technical safeguards, breach notification timelines, and the 2024 HIPAA Safe Harbor for cybersecurity frameworks.',
    tag: 'Healthcare Privacy',
    product: null,
  },
  {
    href: '/guides/dora-ict-compliance-guide',
    title: 'DORA Compliance Guide for ICT Vendors and EU Financial Entities (2025)',
    description: 'Five DORA pillars, Article 30 contract checklist (audit rights, incident notification, exit strategies), 4h/72h/1-month incident reporting, CTPP designation, and TLPT obligations.',
    tag: 'EU Financial Regulation',
    product: null,
  },
  {
    href: '/guides/sec-crypto-compliance-guide',
    title: 'SEC Crypto Compliance Guide for Token Issuers and Web3 Startups (2025)',
    description: 'Howey Test token classification, Reg D / Reg S / Reg CF exemptions, SAFT structures, broker-dealer registration triggers, and the post-Ripple SEC enforcement landscape for crypto founders.',
    tag: 'US Securities Law',
    product: null,
  },
  {
    href: '/guides/pci-dss-compliance-guide-saas',
    title: 'PCI DSS Compliance Guide for SaaS Startups (2025)',
    description: 'Merchant level tiers, SAQ A vs SAQ D scope, PCI DSS v4.0 changes (script integrity, MFA requirements), tokenization scope reduction, and what your merchant service agreement says about breach liability.',
    tag: 'Payment Security',
    product: null,
  },
  {
    href: '/guides/cftc-crypto-regulation-guide',
    title: 'CFTC Crypto Regulation Guide: Commodity vs Security Classification (2025)',
    description: 'CFTC jurisdiction over Bitcoin and Ethereum, crypto derivatives exchange registration (DCM, SEF), ECP requirements, CFTC enforcement record (BitMEX, Binance), and the FIT21 digital commodity framework.',
    tag: 'US Commodities Law',
    product: null,
  },
  {
    href: '/guides/gdpr-data-processing-agreement-guide',
    title: 'GDPR Data Processing Agreement (DPA) Guide: Article 28 Requirements (2025)',
    description: 'The 12 mandatory DPA terms under Article 28 GDPR, controller-processor role analysis, sub-processor chain management, SCC integration for international transfers, and enterprise DPA negotiation strategy.',
    tag: 'Privacy & Data',
    product: null,
  },
  {
    href: '/guides/fincen-msb-registration-guide',
    title: 'FinCEN MSB Registration Guide for Crypto and Fintech Startups (2025)',
    description: 'When your crypto exchange, wallet, or payments product qualifies as a Money Services Business, FinCEN Form 107 registration, state money transmitter licenses, VASP/Travel Rule obligations, and criminal penalties for unregistered operation.',
    tag: 'US Financial Regulation',
    product: null,
  },
  {
    href: '/guides/saas-vendor-agreement-review-guide',
    title: 'SaaS Vendor Agreement Review Guide: What to Check Before Signing (2025)',
    description: 'Uncapped liability exposure, broad AI training data rights, auto-renewal traps, IP ownership of work product, uptime SLA gaps, and termination rights — the 10 highest-risk clauses in SaaS vendor agreements and how to negotiate each one.',
    tag: 'Contract Risk',
    product: null,
  },
  {
    href: '/guides/nda-review-guide',
    title: 'NDA Review Guide: Red Flags and What to Negotiate Before Signing (2025)',
    description: 'One-way vs mutual NDAs, overbroad confidentiality scope, perpetual duration, residuals clauses, uncapped liquidated damages, permitted disclosure gaps, and the 8 provisions every legal team should check before signing a non-disclosure agreement.',
    tag: 'Contract Risk',
    product: null,
  },
  {
    href: '/guides/contractor-agreement-guide',
    title: 'Independent Contractor Agreement Guide: Avoiding Misclassification (2025)',
    description: 'The ABC test (California AB5), IRS 20-factor test, UK IR35, and EU Platform Work Directive — misclassification penalties and the 5 contractor agreement clauses that most often trigger reclassification findings.',
    tag: 'Employment Law',
    product: null,
  },
  {
    href: '/guides/terms-of-service-guide-saas',
    title: 'Terms of Service Compliance Guide for SaaS Startups (2025)',
    description: 'FTC Click-to-Cancel rule (2024), limitation of liability caps, DMCA safe harbor registration, class action waiver enforceability, EU Digital Services Act obligations, and clickwrap vs. browsewrap assent — the 14 ToS provisions every SaaS company must address.',
    tag: 'Contract Risk',
    product: null,
  },
  {
    href: '/guides/ccpa-cpra-compliance-checklist',
    title: 'CCPA / CPRA Compliance Checklist for SaaS Startups (2025)',
    description: 'CCPA applicability thresholds ($25M revenue / 100K consumers), 6 consumer rights (including CPRA right to correct and sensitive PI limits), service provider DPA requirements, GPC signal compliance, and CPPA $7,500-per-violation enforcement powers.',
    tag: 'Privacy Law',
    product: null,
  },
  {
    href: '/guides/data-breach-response-guide',
    title: 'Data Breach Response Guide: Notification Timelines and Legal Obligations (2025)',
    description: 'GDPR 72-hour supervisory authority notification, HIPAA 60-day breach reporting, CCPA breach obligations, 50-state notification laws (30-90 day patchwork), DPA breach clauses, and the first 72-hour legal response playbook.',
    tag: 'Incident Response',
    product: null,
  },
  {
    href: '/guides/ip-assignment-agreement-guide',
    title: 'IP Assignment Agreement Guide: Who Owns Code, Inventions, and Work Product (2025)',
    description: 'Work-for-hire doctrine only covers 9 statutory categories — standalone software is not one of them. Employee PIIA requirements, contractor IP assignment clauses, co-founder IP gaps that kill Series A due diligence, and the timing of execution relative to when work begins.',
    tag: 'Intellectual Property',
    product: null,
  },
  {
    href: '/guides/open-source-license-compliance-guide',
    title: 'Open Source License Compliance Guide for SaaS (2025): GPL, AGPL, MIT, Apache 2.0',
    description: 'Does AGPL require you to open-source your SaaS product? GPL copyleft propagation, MIT vs Apache 2.0 patent clauses, LGPL dynamic linking rules, SSPL and BSL source-available licenses, and the SBOM compliance program every SaaS company needs before acquisition diligence.',
    tag: 'Intellectual Property',
    product: null,
  },
  {
    href: '/guides/uk-fca-crypto-compliance-guide',
    title: 'UK FCA Crypto Compliance Guide (2025): Financial Promotions, VASP Registration, PSR Travel Rule',
    description: 'UK Financial Promotions Regime for crypto (October 2023), mandatory risk warning text, Section 21 approval process, FCA VASP/MLR registration, PSR Travel Rule (all transfers, no threshold), incentives ban, 24-hour cooling-off period, and comparison with EU MiCA.',
    tag: 'Crypto Regulation',
    product: null,
  },
  {
    href: '/guides/eu-us-data-transfer-guide',
    title: 'EU-US Data Transfer Guide (2025): SCCs, DPF, UK IDTA, and Schrems II Compliance',
    description: 'EU-US Data Privacy Framework (DPF) 2023 — valid but under Schrems III challenge. Standard Contractual Clauses 2021 (Module 2 for SaaS), Transfer Impact Assessments, UK IDTA and UK Data Bridge, Binding Corporate Rules, and the practical fallback strategy if DPF is invalidated again.',
    tag: 'Privacy & Data',
    product: null,
  },
  {
    href: '/guides/equity-compensation-guide-startups',
    title: 'Equity Compensation Guide for Startups (2025): ISO vs NSO, 409A, QSBS, 83(b) Election',
    description: 'Incentive Stock Options vs Non-Qualified Stock Options (ordinary income vs long-term capital gains), 409A safe harbor valuation requirements, QSBS Section 1202 $10M exclusion, the 30-day 83(b) election window, and the vesting red flags every startup employee should identify before signing.',
    tag: 'Startup Law',
    product: null,
  },
  {
    href: '/guides/saas-master-subscription-agreement-guide',
    title: 'SaaS MSA Guide for Vendors (2025): Drafting Your Customer Agreement',
    description: 'Limitation of liability caps as a % of ARR, IP indemnification carve-outs, SLA credit caps and exclusive remedy clauses, DPA/GDPR Article 28 requirements, auto-renewal price escalation rights, and how to respond to the 8 most common enterprise legal team redlines.',
    tag: 'Contract Law',
    product: null,
  },
  {
    href: '/guides/crypto-token-launch-compliance-guide',
    title: 'Crypto Token Launch Compliance Guide (2025): Howey Test, Reg D, SAFT, MiCA',
    description: 'Whether your token is a security (Howey test), Reg D 506(c) accredited investor exemption, Reg S offshore exemption, the SAFT framework and why it fails as a legal shield, MiCA whitepaper requirements for EU launches, utility token myths, and the jurisdictions favored for compliant 2025 token launches.',
    tag: 'Crypto Regulation',
    product: null,
  },
  {
    href: '/guides/startup-employment-agreement-guide',
    title: 'Startup Employment Agreement Guide (2025): At-Will, PIIA, Non-Competes, Worker Classification',
    description: 'At-will employment and its exceptions, the 6 required PIIA provisions (and why "agrees to assign" is weaker than "hereby assigns"), non-compete enforceability by state (void in California, Minnesota, Oklahoma, and North Dakota), the IRS 20-factor test for W-2 vs 1099 misclassification, and the offer letter provisions that preserve at-will status.',
    tag: 'Employment Law',
    product: null,
  },
  {
    href: '/guides/payment-processing-compliance-guide',
    title: 'Payment Processing Compliance Guide (2025): Chargebacks, High-Risk Merchants, MSB, PCI DSS',
    description: 'Visa (0.9% VDMP) and Mastercard (1.5% ECM) chargeback thresholds and MATCH-listing consequences, payment facilitator vs merchant of record legal liability, high-risk merchant category codes, FinCEN MSB registration triggers, PCI DSS SAQ scope for SaaS, and cross-border OFAC screening and VAT/GST obligations.',
    tag: 'Fintech Compliance',
    product: null,
  },
  {
    href: '/guides/dao-legal-structure-guide',
    title: 'DAO Legal Structure Guide (2025): Wyoming DAO LLC, Marshall Islands, Unincorporated DAO Risks',
    description: 'Why an unincorporated DAO is a general partnership (bZx DAO, Ooki DAO precedents), Wyoming DAO LLC SF 0038 formation requirements, Marshall Islands DAO LLC comparison, SEC investment contract risk for governance tokens, DAO operating agreement required provisions, and the tax obligations of DAO members.',
    tag: 'Crypto Regulation',
    product: null,
  },
  {
    href: '/guides/venture-capital-term-sheet-guide',
    title: 'Venture Capital Term Sheet Guide (2025): Liquidation Preferences, Anti-Dilution, Pro-Rata, Drag-Along',
    description: '1× non-participating vs participating preferred (and why participation matters more than valuation in median exits), broad-based weighted average vs full-ratchet anti-dilution, pro-rata and super pro-rata rights, drag-along thresholds, the option pool shuffle, founder vesting acceleration, and the 5 Series A closing documents and what each one governs.',
    tag: 'Startup Law',
    product: null,
  },
  {
    href: '/guides/data-retention-deletion-policy-guide',
    title: 'Data Retention and Deletion Policy Guide (2025): GDPR Article 17, CCPA, HIPAA, Litigation Holds',
    description: 'GDPR Article 17 right to erasure (when you can refuse and when you cannot), CCPA deletion request 45-day deadline and 9 exemptions, HIPAA 6-year minimum retention vs GDPR conflict, building a data retention schedule by category, litigation hold obligations when legal proceedings are anticipated, and the 3 common gaps that expose SaaS companies to enforcement.',
    tag: 'Privacy & Data',
    product: null,
  },
  {
    href: '/guides/ai-vendor-due-diligence-guide',
    title: 'AI Vendor Due Diligence Guide (2025): EU AI Act Deployer Obligations, GDPR Article 22, AI Contract Provisions',
    description: 'EU AI Act deployer obligations (FRIA, human oversight, log retention, worker notification), GDPR Article 22 automated decision-making restrictions, AI vendor contract provisions to demand (data training prohibition, model cards, bias testing, exit rights, sub-processor disclosure), algorithmic impact assessments, AI disclosure requirements, and the 10-question AI vendor procurement framework.',
    tag: 'AI Compliance',
    product: null,
  },
  {
    href: '/guides/saas-billing-compliance-guide',
    title: 'SaaS Billing Compliance Guide (2025): FTC Click-to-Cancel Rule, Automatic Renewal Laws, EU Omnibus Directive',
    description: 'FTC Click-to-Cancel Rule requirements (effective January 2025), California ARL affirmative consent and 30-day renewal notice, New York automatic renewal statute, EU Omnibus Directive 30-day prior price disclosure for discounts, CFPB unfair billing enforcement patterns (Adobe $13M, Peloton $19.2M, Amazon $25M), free trial to paid conversion disclosure requirements, and subscription agreement drafting to satisfy all frameworks simultaneously.',
    tag: 'Consumer Protection',
    product: null,
  },
  {
    href: '/guides/hipaa-business-associate-agreement-guide',
    title: 'HIPAA Business Associate Agreement Guide (2025): 9 Required Provisions, SaaS Vendor Templates, Cloud Provider BAAs',
    description: 'Who qualifies as a covered entity vs business associate, 9 required BAA provisions under 45 C.F.R. §164.504(e)(2), OCR enforcement actions for missing BAAs (OHSU $2.7M, North Memorial $1.55M, Anthem $16M), what a SaaS vendor BAA must include beyond the minimum, cloud provider BAA coverage (AWS, Azure, Google Cloud), and the 30-point BAA review checklist for covered entities.',
    tag: 'HIPAA Compliance',
    product: null,
  },
  {
    href: '/guides/non-compete-agreement-guide',
    title: 'Non-Compete Agreement Guide (2025): State Enforcement Map, FTC Rule Update, California SB 699, Non-Solicitation Alternatives',
    description: 'Non-compete enforceability by state (California void / SB 699 applies nationwide, Minnesota void 2023, Florida employer-favorable, Texas blue-pencil), FTC rule blocked by federal court, California AB 1076 notification obligation, 5 drafting errors that void enforcement, garden leave vs non-compete, non-solicitation enforceability when non-compete fails, and founder/VC non-compete drafting in M&A and investment contexts.',
    tag: 'Employment Law',
    product: null,
  },
  {
    href: '/guides/cryptocurrency-tax-compliance-guide',
    title: 'Cryptocurrency Tax Compliance Guide (2025): IRS Virtual Currency Rules, Cost Basis, DeFi Staking Income, Form 1099-DA',
    description: 'IRS treats crypto as property (Notice 2014-21) — every trade, swap, and payment is taxable. Cost basis methods (FIFO vs Specific Identification), staking rewards as ordinary income (Rev. Rul. 2023-14), DeFi and liquidity pool tax treatment, Form 1099-DA broker reporting starting 2025, FBAR obligations for offshore exchange accounts, and 7 common crypto tax errors that trigger IRS audits.',
    tag: 'Crypto Tax',
    product: null,
  },
  {
    href: '/guides/gdpr-legitimate-interests-guide',
    title: 'GDPR Legitimate Interests Guide (2025): Legitimate Interests Assessment (LIA), B2B Direct Marketing, Right to Object',
    description: 'GDPR Article 6(1)(f) legitimate interests is the most misused legal basis. How to conduct a 3-part LIA balancing test, when B2B direct marketing can rely on legitimate interests (vs B2C where consent is required), EDPB guidance on using legitimate interests for profiling and analytics, the absolute right to object to direct marketing under Article 21, and the 6 LIA mistakes that create DPA enforcement risk.',
    tag: 'GDPR & Privacy',
    product: null,
  },
  {
    href: '/guides/soc2-type-1-vs-type-2-guide',
    title: 'SOC 2 Type I vs Type II Guide (2025): Trust Service Criteria, Audit Timeline, How to Read a Vendor SOC 2 Report',
    description: 'SOC 2 Type I is a point-in-time assessment; Type II proves controls operated over 6-12 months — and enterprise buyers require Type II. The 5 Trust Service Criteria and what auditors actually test in each, readiness timeline and cost (13-22 months to first Type II report), how to read a vendor\'s SOC 2 report including exceptions and carve-outs, and SOC 2 vs ISO 27001 comparison.',
    tag: 'Security Compliance',
    product: null,
  },
  {
    href: '/guides/software-development-agreement-guide',
    title: 'Software Development Agreement Guide (2025): IP Ownership, Work-for-Hire, Source Code Escrow, Acceptance Testing',
    description: 'Paying for software development does not transfer IP ownership — the developer owns the code by default under US copyright law. Work-for-hire doctrine does not cover standalone software created by contractors. IP assignment must use present-tense language ("hereby assigns"), cover all IP categories, and include a defined Background IP carve-out. Plus: acceptance testing frameworks, open source GPL/AGPL contamination risk, source code escrow triggers, and 5 dangerous red flags in developer agreements.',
    tag: 'Contract Law',
    product: null,
  },
  {
    href: '/guides/wire-transfer-fraud-prevention-guide',
    title: 'Wire Transfer Fraud Prevention Guide (2025): Business Email Compromise (BEC), Financial Fraud Kill Chain, Legal Liability',
    description: 'BEC caused $2.9 billion in 2023 US losses — the highest-loss cybercrime category. Under UCC Article 4A, the business that sends the fraudulently-induced wire bears the loss, not the bank. The 5 BEC attack vectors (CEO impersonation, vendor payment change, real estate hijacking, attorney impersonation, payroll diversion), the 72-hour Financial Fraud Kill Chain response, cyber insurance BEC requirements, and vendor contract provisions that create BEC risk.',
    tag: 'Financial Crime Prevention',
    product: null,
  },
  {
    href: '/guides/ma-due-diligence-compliance-guide',
    title: 'M&A Legal Due Diligence Guide (2025): IP Audit, Data Privacy, Employment, Change-of-Control, and Representation & Warranty Insurance',
    description: 'The 8 most common deal-killing findings in technology M&A: IP chain-of-title gaps, open source contamination, worker misclassification, PIIA deficiencies, undisclosed regulatory exposure, data privacy violations, change-of-control triggers in material contracts, and option plan administration errors. IP diligence data room requirements, data privacy due diligence scope, employment law M&A issues, COC provisions management, and RWI policy structure.',
    tag: 'M&A & Corporate',
    product: null,
  },
  {
    href: '/guides/gdpr-dsar-response-guide',
    title: 'GDPR Data Subject Rights & DSAR Response Guide (2025): 30-Day Deadline, Exemptions, Identity Verification, and Operational Process',
    description: '8 GDPR data subject rights taxonomy (which are absolute vs conditional), the 1-month response deadline (3-month extension conditions), proportionate identity verification without creating unnecessary barriers, Article 15 DSAR response content requirements (all 9 elements), 12 Article 23 exemption categories, and how to build an operational DSAR process (intake, data mapping, templates, records).',
    tag: 'GDPR & Privacy',
    product: null,
  },
  {
    href: '/guides/gdpr-cookie-consent-eprivacy-guide',
    title: 'GDPR Cookie Consent & ePrivacy Guide (2025): Valid Consent, Strictly Necessary Exemption, Google Analytics, IAB TCF, and PECR',
    description: 'Cookie consent governed by ePrivacy Directive (PECR in UK) + GDPR — both apply. CJEU Planet49 consent standard (no pre-ticked boxes, no "browsing as consent"), 7 cookie categories with consent requirements, Google Analytics DPF compliance update (post-Austrian DSB decisions), IAB TCF vs custom CMP, strictly necessary exemption (session cookies/security tokens qualify; analytics/social sharing do NOT), and UK PECR post-Brexit divergence.',
    tag: 'GDPR & Privacy',
    product: null,
  },
]

export default function GuidesIndexPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://bizlegal-ai.com/guides' },
    ],
  }

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'BizLegal AI Compliance Guides',
    description: 'Practitioner-written compliance guides for SaaS, fintech, and crypto startups',
    url: 'https://bizlegal-ai.com/guides',
    numberOfItems: GUIDES.length,
    itemListElement: GUIDES.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: g.title,
      url: `https://bizlegal-ai.com${g.href}`,
      description: g.description,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        <nav style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'inherit' }}>Home</a>
          {' → '}
          Guides
        </nav>

        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
          Compliance Guides
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.8, marginBottom: '3rem' }}>
          Practical, practitioner-written guides for founders and compliance teams navigating BOI filing, GDPR, MiCA, crypto forensics, and compliance program structure. No jargon without explanation. No advice without context.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          {GUIDES.map((guide) => (
            <a
              key={guide.href}
              href={guide.href}
              style={{
                display: 'block',
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: '12px',
                padding: '1.5rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.15s',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  opacity: 0.5,
                  marginBottom: '0.6rem',
                }}
              >
                {guide.tag}
              </span>
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  lineHeight: 1.4,
                  marginBottom: '0.6rem',
                  marginTop: 0,
                }}
              >
                {guide.title}
              </h2>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.65, opacity: 0.7, margin: 0 }}>
                {guide.description}
              </p>
            </a>
          ))}
        </div>

        <div
          style={{
            borderTop: '1px solid var(--color-border, #e5e7eb)',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p style={{ margin: 0, opacity: 0.65, fontSize: '0.9rem' }}>
            Need compliance support beyond what a guide can provide?
          </p>
          <a
            href="https://docai.bizlegal-ai.com"
            style={{
              padding: '0.65rem 1.5rem',
              background: 'var(--primary, #1a56db)',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
            }}
          >
            Scan a Contract — $97
          </a>
        </div>
      </main>
    </>
  )
}
