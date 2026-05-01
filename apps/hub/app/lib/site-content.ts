export const baseUrl = 'https://bizlegal-ai.com'

export type CtaType = 'docai' | 'brai' | 'tracr' | 'lexaudit' | 'forge' | 'leadforge'

export type FeaturedGuide = {
  title: string
  href: string
  region: string
  ctaType: CtaType
  summary: string
}

export const productLinks = {
  docai: 'https://docai.bizlegal-ai.com',
  brai: 'https://brai.bizlegal-ai.com',
  tracr: 'https://tracr.bizlegal-ai.com',
  lexaudit: 'https://lexaudit.bizlegal-ai.com',
  forge: 'https://forge.bizlegal-ai.com',
  leadforge: 'https://leadforge.bizlegal-ai.com',
} as const

// Backward compat: docstack → docai
export const docstackRedirect = 'https://docai.bizlegal-ai.com'

export const founderProfile = {
  name: 'BizLegal AI',
  shortLabel: 'Regulatory Intelligence Platform for Digital Assets',
  heroSummary: 'BizLegal AI quantifies regulatory risk across 50+ jurisdictions so founders, operators, and counsel can move with clarity.',
  shortBio: [
    'Regulatory intelligence across 50+ jurisdictions.',
    'Six AI-powered products covering risk, compliance, forensics, and documentation.',
    'Built by practitioners — not a product team guessing at legal workflows.',
  ],
  founderAbout:
    'BizLegal AI is a regulatory intelligence platform built by an international commercial lawyer with 20 years of practice across UAE, UK, EU, and Singapore. Every tool addresses a real compliance gap that legal professionals encounter daily — from wallet risk scoring and compliance certification to contract generation and forensic tracing. The platform exists because founders and counsel need clarity before launch, fundraising, or expansion, not generic compliance advice that collapses under real regulatory pressure.',
} as const

export const companyProfile = {
  name: 'BizLegal AI',
  title: 'Regulatory Intelligence & AI-Powered Risk Analysis',
  summary:
    'BizLegal AI provides structured regulatory risk intelligence for digital asset ventures operating in complex jurisdictions.',
  detail:
    'Our work focuses on identifying regulatory exposure before it becomes structural liability, enabling founders to scale with clarity and reduced uncertainty.',
} as const

export const navigationLinks = [
  { label: 'Agents', href: '/agents' },
  { label: 'About', href: '/about' },
  { label: 'Products', href: '/#products' },
  { label: 'Intelligence Hub', href: '/posts' },
  { label: 'Trust Center', href: '/trust' },
  { label: 'FAQ', href: '/faq' },
] as const

export const trustMetrics = [
  { value: '1,400+', label: 'Risk scans completed' },
  { value: '50+', label: 'Jurisdictions covered' },
  { value: '94%', label: 'Found critical exposure' },
  { value: '$0', label: 'To start scanning' },
] as const

export const productCards = [
  {
    eyebrow: 'AI Contract Generation',
    name: 'DocAI',
    description:
      'Jurisdiction-aware legal document generation. NDAs, SAFTs, terms of service, and privacy policies — drafted in seconds for the jurisdiction you operate in.',
    points: [
      'Built for founders, operators, and counsel who need practical legal documents without law-firm drag.',
      'Covers token launch docs, venture structuring, and cross-border digital asset execution.',
      'Pairs founder clarity with fast, productized delivery for high-friction legal workflows.',
    ],
    href: productLinks.docai,
    ctaLabel: 'Open DocAI',
  },
  {
    eyebrow: 'Wallet Risk Intelligence',
    name: 'BRAI',
    description:
      'Real-time wallet risk scoring across 50+ blockchains. FATF Travel Rule compliance built in. Identifies exposure before it becomes liability.',
    points: [
      'Built to identify regulatory exposure before launch, fundraising, or market expansion.',
      'Scores wallets, transactions, and counterparties against AML/KYC frameworks in real time.',
      'Designed for compliance leads, founders, and legal ops who need structured risk visibility.',
    ],
    href: productLinks.brai,
    ctaLabel: 'Start BRAI Scan',
  },
  {
    eyebrow: 'Forensic Blockchain Intelligence',
    name: 'TRACR',
    description:
      'Litigation-ready blockchain forensics. Full transaction tracing, wallet clustering, and on-chain evidence packages for disputes, enforcement, and recovery.',
    points: [
      'Useful when regulatory uncertainty collides with disputes, asset movement, or enforcement pressure.',
      'Produces court-admissible reports with structured evidence trails.',
      'Keeps the platform positioned for sophisticated founders, counsel, and recovery teams.',
    ],
    href: productLinks.tracr,
    ctaLabel: 'Explore TRACR',
  },
  {
    eyebrow: 'Compliance Health Score',
    name: 'LexAudit',
    description:
      'Continuous Compliance Health Score across SEC, MiCA, VARA, GDPR — 60 signal checks, monthly refresh. An indicator, not a certification.',
    points: [
      'Buyer-shareable compliance score for investors, regulators, and partners.',
      'Covers SEC, MiCA, VARA, FCA, MAS, and GDPR frameworks out of the box.',
      'Reduces audit preparation from weeks to hours via human-in-the-loop gap analysis.',
    ],
    href: productLinks.lexaudit,
    ctaLabel: 'Run LexAudit',
  },
  {
    eyebrow: 'Compliance Scanner',
    name: 'Forge',
    description:
      'Deep compliance scanning for fintechs, crypto firms, and emerging tech. Automated gap reports with jurisdiction-specific remediation priorities.',
    points: [
      'Scans your operations against regulatory frameworks and surfaces compliance gaps ranked by severity.',
      'Covers multi-jurisdiction requirements including VARA, MiCA, SEC, FCA, and MAS.',
      'Designed for compliance teams and founders who need clear remediation roadmaps, not vague risk scores.',
    ],
    href: productLinks.forge,
    ctaLabel: 'Start Forge Scan',
  },
  {
    eyebrow: 'Legal Lead Marketplace',
    name: 'LeadForge',
    description:
      'Verified leads from crypto and fintech companies actively seeking compliance counsel. Real-time demand signals, not cold lists.',
    points: [
      'Connects law firms with companies that have self-identified compliance needs.',
      'Every lead is verified — no scraped contacts, no cold lists, no spam.',
      'Built for law firms and compliance consultants who want inbound, not outbound.',
    ],
    href: productLinks.leadforge,
    ctaLabel: 'Explore LeadForge',
  },
] as const

export const workflowSteps = [
  {
    step: '01',
    title: 'Identify exposure',
    body:
      'Start with the specific regulatory pressure facing the venture, not a vague request for generic compliance help.',
  },
  {
    step: '02',
    title: 'Map jurisdiction friction',
    body:
      'Compare regulatory pressure points across 50+ jurisdictions before they harden into structural mistakes.',
  },
  {
    step: '03',
    title: 'Route to the right product',
    body:
      'Whether you need risk analysis, documentation, compliance certification, or forensic support — each path leads to a concrete deliverable.',
  },
  {
    step: '04',
    title: 'Move with clarity',
    body:
      'Use a tighter decision framework so founders can move faster with less uncertainty and fewer preventable surprises.',
  },
] as const

export const insightStreams = [
  {
    title: 'UAE digital asset intelligence',
    body:
      'Founder-facing guidance on VARA, ADGM, DIFC, and the pressure points that matter before launch.',
  },
  {
    title: 'Cross-border regulatory analysis',
    body:
      'Structured comparisons across complex jurisdictions so expansion decisions are based on exposure, not assumption.',
  },
  {
    title: 'AI-assisted risk assessment',
    body:
      'A legaltech operating layer that helps founders see risk concentration earlier and act before liability compounds.',
  },
] as const

export const companyIntersections = [
  {
    title: 'Commercial legal strategy',
    body: 'Commercial structuring informed by founder reality, transaction pressure, and actual venture execution.',
  },
  {
    title: 'Cross-border regulatory analysis',
    body: 'Comparative exposure mapping across jurisdictions where digital asset ventures face conflicting rules and incentives.',
  },
  {
    title: 'Entrepreneurial execution',
    body: 'Advice shaped by speed, capital constraints, and the practical cost of waiting too long to resolve uncertainty.',
  },
  {
    title: 'AI-assisted risk assessment',
    body: 'A structured intelligence layer that accelerates analysis without collapsing nuance or judgment.',
  },
] as const

export const specializationAreas = [
  {
    title: 'UAE Crypto Regulatory Risk Intelligence',
    body: 'Primary focus on UAE digital asset ventures that need founder-grade clarity before launch, fundraising, or strategic expansion.',
  },
  {
    title: 'VARA & ADGM Exposure Analysis',
    body: 'Detailed attention to jurisdiction fit, licensing pressure, and where exposure is likely to emerge across UAE pathways.',
  },
] as const

export const painPoints = [
  {
    title: 'Regulatory uncertainty before launch',
    body: 'Founders often know there is risk but do not know where it is concentrated or which jurisdiction assumptions are wrong.',
  },
  {
    title: 'Confusion between VARA and ADGM routes',
    body: 'Digital asset ventures need a cleaner view of which UAE path actually fits the model before building around the wrong structure.',
  },
  {
    title: 'Cross-border expansion without a clear exposure map',
    body: 'Growth across jurisdictions creates overlapping obligations that can become structural liability if not analyzed early.',
  },
  {
    title: 'Slow legal work that does not match execution speed',
    body: 'BizLegal is designed to reduce friction, compress analysis time, and move founders toward a clearer next step.',
  },
] as const

export const seoFactoryFeatureCards = [
  {
    eyebrow: 'Autopilot publishing',
    title: '10 dynamic pages per run',
    body:
      'The factory fills missing slugs with jurisdiction-specific regulatory guides, keeping content controlled while compounding reach every day.',
  },
  {
    eyebrow: 'Conversion framing',
    title: 'Every page exits into a product lane',
    body:
      'Search traffic does not end at awareness. Each guide routes into DocAI, BRAI, TRACR, LexAudit, Forge, or LeadForge with a visible next action.',
  },
  {
    eyebrow: 'Structured authority',
    title: 'Features, schema, and trust surfaces included',
    body:
      'Dynamic guide pages expose keyword clusters, workflow visuals, FAQ schema, and trust links so they feel like premium product pages.',
  },
  {
    eyebrow: 'Operator controls',
    title: 'Claude-first, Gemini-ready pipeline',
    body:
      'The generator can stay on Claude for legal precision while keeping Gemini available for broader discovery or expansion campaigns.',
  },
] as const

export const seoFactoryFlow = [
  {
    step: 'Data layer',
    title: 'Topic set and jurisdiction map',
    body:
      'Topics, keywords, jurisdictions, and product destinations define the commercial intent before any draft is generated.',
  },
  {
    step: 'Generation',
    title: 'Model creates the first structured asset',
    body:
      'The prompt enforces title, meta, keywords, article sections, and FAQ output so every draft lands in the same premium shell.',
  },
  {
    step: 'Productization',
    title: 'Guide becomes a designed selling surface',
    body:
      'Each post inherits keyword chips, automation panels, workflow diagrams, and CTA alignment instead of publishing as plain text.',
  },
  {
    step: 'Revenue loop',
    title: 'Traffic flows into products and trust pages',
    body:
      'The experience keeps buyers inside one ecosystem where trust, product, and research reinforce each other.',
  },
] as const

export const providerChoices = [
  {
    name: 'Claude default',
    description:
      'Best fit for legal, compliance, and risk-heavy pages where disciplined structure, restraint, and premium tone matter most.',
  },
  {
    name: 'Gemini optional',
    description:
      'Useful for long-context expansion, broader discovery sweeps, and high-volume experiments when you want a second generation lane.',
  },
] as const

export const securityPillars = [
  {
    title: 'Secure-by-default delivery',
    body:
      'The platform pairs a premium frontend shell with hardened defaults, isolated content access, and minimal client-side bloat.',
  },
  {
    title: 'Controlled publishing workflow',
    body:
      'Publishing is structured, scheduled, and intentionally controlled so content growth does not dilute brand quality or legal clarity.',
  },
  {
    title: 'Trust-first legal pages',
    body:
      'Privacy, terms, FAQ, security, and disclaimer pages stay visible so serious buyers can validate credibility quickly.',
  },
  {
    title: 'Revenue with guardrails',
    body:
      'The platform is conversion-aware, but it still separates intelligence, legal products, and non-legal-advice boundaries clearly.',
  },
] as const

export const faqItems = [
  {
    question: 'What is BizLegal AI?',
    answer:
      'BizLegal AI is a regulatory intelligence platform with six AI-powered products covering risk analysis, compliance certification, contract generation, blockchain forensics, compliance scanning, and legal lead generation — built for digital asset ventures operating in complex jurisdictions.',
  },
  {
    question: 'Who built BizLegal AI?',
    answer:
      'BizLegal AI was built by an LLB, LLM-qualified international commercial lawyer with 20 years of practice across UAE, UK, EU, and Singapore. Every product addresses a real compliance gap encountered in active legal practice.',
  },
  {
    question: 'What is the primary specialization?',
    answer:
      'The core specialization is regulatory risk intelligence for digital asset ventures, with particular depth in UAE (VARA, ADGM, DIFC), EU (MiCA), US (SEC), UK (FCA), and Singapore (MAS) frameworks.',
  },
  {
    question: 'What problems does BizLegal AI solve?',
    answer:
      'BizLegal AI helps founders reduce regulatory uncertainty before launch, fundraising, or expansion by identifying exposure before it becomes structural liability. Each of the six products solves a specific compliance gap: risk scoring, certification, documentation, forensics, scanning, and lead generation.',
  },
  {
    question: 'How should teams use the platform?',
    answer:
      'Founders start with a free risk scan (BRAI). Legal teams use TRACR for transaction tracing and LexAudit for the Compliance Health Score. Operators use Forge for gap analysis and DocAI for contracts + security questionnaires. Law firms use LeadForge for buyer-intent signals.',
  },
  {
    question: 'What jurisdictions does BizLegal AI cover?',
    answer:
      'BizLegal AI covers 50+ jurisdictions including UAE (VARA, ADGM, DIFC), EU (MiCA, GDPR), US (SEC, CFTC, FinCEN), UK (FCA), Singapore (MAS), and cross-border frameworks like FATF Travel Rule. Coverage is continuously expanding through daily automated research.',
  },
  {
    question: 'Is BizLegal AI a law firm?',
    answer:
      'No. BizLegal AI is a legal technology platform, not a law firm. All outputs are AI-generated and verified through a four-layer system (input validation, output verification, expert review, audit trail). For decisions with legal consequences, we recommend independent expert review.',
  },
  {
    question: 'How accurate are the risk assessments?',
    answer:
      'Every output includes a confidence score. Scores above 90% are marked Verified. Scores between 70-89% are marked Review Recommended. Below 70% requires Expert Review. Litigation-tier outputs always include mandatory attorney review.',
  },
  {
    question: 'What is BRAI and who is it for?',
    answer:
      'BRAI (Blockchain Risk AI) provides real-time wallet risk scoring across 50+ blockchains with FATF Travel Rule compliance built in. It is built for compliance leads, founders, and legal ops who need structured risk visibility before onboarding counterparties.',
  },
  {
    question: 'What is TRACR and who is it for?',
    answer:
      'TRACR (Trace, Analyze, Composite Risk Reports) produces forensic blockchain intelligence with full transaction tracing, wallet clustering, and on-chain evidence packages. It is built for disputes counsel, asset recovery teams, and enforcement professionals.',
  },
  {
    question: 'What is LexAudit and who is it for?',
    answer:
      'LexAudit produces a continuous Compliance Health Score across SEC, MiCA, VARA, GDPR, and more — an indicator, not a certification. It is built for compliance officers, legal teams, and auditors who need a buyer-shareable posture indicator rather than a multi-week audit cycle.',
  },
  {
    question: 'What is DocAI and who is it for?',
    answer:
      'DocAI generates jurisdiction-aware legal documents — NDAs, SAFTs, terms of service, privacy policies — in seconds. It is built for founders and operators who need production-ready documents without law-firm turnaround times.',
  },
  {
    question: 'What is Forge and who is it for?',
    answer:
      'Forge is a multi-vertical compliance scanner that audits your operations against regulatory frameworks and surfaces gaps ranked by severity. It is built for compliance teams and founders who need clear remediation roadmaps across jurisdictions.',
  },
  {
    question: 'What is LeadForge and who is it for?',
    answer:
      'LeadForge is a legal lead marketplace connecting verified crypto and fintech companies with compliance counsel. Every lead is verified — no scraped contacts, no cold lists. Built for law firms and compliance consultants who want inbound, not outbound.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. All data is encrypted in transit and at rest. We do not use your data to train AI models. SOC 2 Type II controls are in place, row-level security isolates tenant data, and full audit trails are maintained. Independent penetration testing is conducted regularly.',
  },
  {
    question: 'Can I use BizLegal AI for legal advice?',
    answer:
      'BizLegal AI provides regulatory intelligence and risk analysis, not legal advice. Our outputs are designed to inform decisions, not replace licensed counsel. All outputs include confidence scores and disclaimers. For legal decisions, consult a qualified attorney.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Start with a free risk scan — no credit card required. The BRAI scan takes 60 seconds and gives you a jurisdiction-specific risk score. From there, you can explore TRACR for forensics, LexAudit for certification, Forge for gap analysis, DocAI for documents, or LeadForge for leads.',
  },
  {
    question: 'What pricing plans are available?',
    answer:
      'Free tier includes 3 risk analyses per month and 5 jurisdictions tracked. Pro ($149/mo) includes unlimited analyses and 50+ jurisdictions. Scale ($499/mo) adds custom coverage, dedicated support, and compliance analyst access. Visit /pricing for full details.',
  },
  {
    question: 'How often is regulatory data updated?',
    answer:
      'Regulatory intelligence is updated daily through an automated pipeline that generates 10 new jurisdiction-specific guides per day. Breaking regulatory changes surface within 24 hours through the Intelligence Feed.',
  },
] as const

export const featuredGuides: FeaturedGuide[] = [
  {
    title: 'Share Purchase Agreement UAE',
    href: '/guides/uae/share-purchase-agreement-uae',
    region: 'UAE / DIFC',
    ctaType: 'docai',
    summary:
      'Structure equity transfers with DIFC-aware drafting cues, diligence requirements, and clear buyer-side checkpoints.',
  },
  {
    title: 'SEC Regulation D Compliance',
    href: '/guides/united-states/sec-regulation-d-compliance',
    region: 'United States',
    ctaType: 'brai',
    summary:
      'Navigate Reg D exemptions, accredited investor verification, and Form D filing requirements for token offerings.',
  },
  {
    title: 'MiCA CASP License Requirements',
    href: '/guides/european-union/mica-casp-license-requirements',
    region: 'European Union',
    ctaType: 'brai',
    summary:
      'Give operators and counsel a clean view of licensing stages, regulator expectations, and launch-readiness signals.',
  },
  {
    title: 'MAS DPT License Application',
    href: '/guides/singapore/mas-dpt-license-application',
    region: 'Singapore',
    ctaType: 'brai',
    summary:
      'Navigate Singapore licensing requirements, Payment Services Act exemptions, and VCC structures.',
  },
  {
    title: 'DAO Legal Wrapper Structures',
    href: '/guides/crypto/dao-legal-wrapper-structures',
    region: 'Web3 / Global',
    ctaType: 'docai',
    summary:
      'Compare entity structures, governance implications, and investor expectations for token and DAO projects.',
  },
  {
    title: 'VARA Compliance Rulebook Dubai',
    href: '/guides/uae/vara-compliance-rulebook',
    region: 'UAE',
    ctaType: 'forge',
    summary:
      'Understand VARA market offence regulations, technology requirements, and investor protection rules for virtual asset businesses in Dubai.',
  },
] as const

export const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/bizlegal-ai' },
  { label: 'X / Twitter', href: 'https://x.com/bizlegal_ai' },
  { label: 'Instagram', href: 'https://www.instagram.com/bizlegal_ai/' },
  { label: 'YouTube', href: 'https://www.youtube.com/@bizlegal_ai' },
  { label: 'Facebook', href: 'https://www.facebook.com/bizlegal_ai/' },
] as const

export const legalLinks = [
  { label: 'Trust Center', href: '/trust' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Disclaimer', href: '/disclaimer' },
] as const