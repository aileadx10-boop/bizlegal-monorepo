import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'EU AI Act High-Risk AI Systems Guide (2025): Annex III Categories, Conformity Assessment, CE Marking, QMS Requirements | BizLegal AI',
  description: 'EU AI Act Annex III high-risk AI system requirements: 8 Annex III categories (biometrics, critical infrastructure, education, employment, essential services, law enforcement, migration, administration of justice), GPAI model obligations, conformity assessment procedures (self-assessment vs notified body), CE marking, quality management system requirements, post-market surveillance, and the compliance timeline for AI providers placing systems on the EU market.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/eu-ai-act-high-risk-ai-systems-guide' },
  openGraph: {
    title: 'EU AI Act High-Risk AI Systems Guide (2025) — BizLegal AI',
    description: 'EU AI Act Annex III high-risk AI: 8 categories, conformity assessment (self-assessment vs notified body), CE marking, QMS, post-market surveillance, and provider vs deployer obligations for high-risk AI systems.',
    url: 'https://bizlegal-ai.com/guides/eu-ai-act-high-risk-ai-systems-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What are the 8 Annex III high-risk AI system categories under the EU AI Act, and how is "high-risk" defined?',
    a: 'The EU Artificial Intelligence Act (Regulation (EU) 2024/1689, published in the Official Journal July 12, 2024) establishes a risk-tiered framework where AI systems are classified as unacceptable risk (prohibited), high-risk, general-purpose (GPAI), or lower-risk (with lighter transparency obligations only). Annex III lists the categories of AI systems that are automatically classified as high-risk under Article 6(2), subject to the Article 6(3) self-assessment exception introduced at final trialogue. Understanding Annex III is the critical compliance task for AI vendors placing systems on the EU market. Annex III Category 1 — Biometrics: (1a) remote biometric identification systems used in publicly accessible spaces (note: real-time RBI in public spaces is prohibited for law enforcement with limited exceptions under Article 5; post-remote RBI used by law enforcement with judicial authorization is high-risk under Annex III). (1b) AI systems intended to be used for emotion recognition. (1c) AI systems for biometric categorization that categorize individuals based on sensitive attributes (race, ethnic origin, political opinions, religion, health data, sexual orientation). Annex III Category 2 — Critical infrastructure: AI systems intended to be used as safety components in the management and operation of critical digital infrastructure, road traffic, and the supply of water, gas, heating, and electricity. AI systems that could cause cascading failures in critical national infrastructure. Annex III Category 3 — Education and vocational training: (3a) AI systems intended to determine access to and assignment to educational and vocational training institutions. (3b) AI systems intended to evaluate learning outcomes, assess students, and steer learning paths. (3c) AI systems for monitoring and detecting prohibited behavior of students during tests. Annex III Category 4 — Employment, workers management, and access to self-employment: (4a) AI systems used for recruitment or selection (screening applications, filtering job candidates, evaluating candidates, making decisions on promotion). (4b) AI systems used for making decisions affecting the terms and manner of work relationships, task allocation, worker performance monitoring and evaluation, behavioral predictive analysis. AI-powered hiring tools (resume screening, video interview analysis, behavioral assessment) are high-risk. Annex III Category 5 — Access to and enjoyment of essential private services and essential public services and benefits: (5a) AI systems used by public authorities to evaluate eligibility for public assistance benefits and services, allocate benefits. (5b) AI systems used to evaluate the creditworthiness of natural persons or establish their credit score (except AI systems used for the purposes of fraud detection). Credit scoring AI systems are high-risk. (5c) AI systems used to dispatch or establish priority in the dispatching of emergency first response services (emergency call routing AI). (5d) AI systems for risk assessment and pricing in relation to natural persons in health insurance and life insurance. Annex III Category 6 — Law enforcement: (6a) AI systems for individual risk assessment (recidivism prediction, crime hotspot analysis targeted at individuals). (6b) AI systems used as polygraphs or truth assessment tools. (6c) AI systems for evaluation of the reliability of evidence in criminal proceedings. (6d) AI systems for profiling of natural persons in the course of detection, investigation, or prosecution of criminal offenses. (6e) AI systems for crime analytics to identify patterns or predict criminal offense occurrence. Annex III Category 7 — Migration, asylum, and border control management: (7a) AI systems used as polygraphs or truth assessment tools in the migration/asylum context. (7b) AI systems for assessment of risks related to irregular immigration. (7c) AI systems for examination of applications for asylum, visa, or residence permits and for border control decisions. (7d) AI systems for the detection, recognition, or identification of persons in the context of border control. Annex III Category 8 — Administration of justice and democratic processes: (8a) AI systems used to assist in researching and interpreting facts and the law, and in applying the law to a concrete set of facts in legal proceedings. (8b) AI systems for influencing the outcome of elections and referendums. The Article 6(3) exception: even if an AI system falls within an Annex III category, the provider may conduct a self-assessment under Article 6(3) to establish that it does not present a significant risk of harm — for example, where the AI system is used for a narrow, well-defined purpose with human oversight and limited autonomy. This self-assessment exception requires documentation and may be reviewed by market surveillance authorities.',
  },
  {
    q: 'What are the conformity assessment procedures for high-risk AI systems — when is self-assessment permitted vs when is a notified body required?',
    a: 'Conformity assessment is the process by which an AI provider demonstrates that their high-risk AI system meets all the Annex III requirements before placing it on the EU market. The EU AI Act establishes two conformity assessment routes, and the choice between them is determined by the Annex III category of the system. Route 1 — Internal conformity assessment (Article 43(1), Annex VI): available for most Annex III high-risk AI systems EXCEPT biometric identification and categorization systems. The provider conducts the conformity assessment independently using the internal control procedures in Annex VI. Annex VI procedure: (a) verify that the quality management system meets the requirements of Article 17; (b) examine the technical documentation to confirm the AI system meets Articles 9-15 (risk management, data governance, technical documentation, record-keeping, transparency, human oversight, accuracy, robustness, cybersecurity); (c) verify that the AI system is designed and developed in conformity with the approved documentation. The internal assessment must be documented in the technical documentation file and the EU Declaration of Conformity. Route 2 — Third-party conformity assessment (notified body): required for: (a) remote biometric identification systems used by law enforcement (real-time RBI with the Article 5(1)(h) exceptions, and all post-remote RBI); (b) AI systems intended to be used as safety components in critical infrastructure (Category 2). Notified bodies are independent third-party conformity assessment bodies that are accredited and notified to the European Commission. The EU AI Act creates a new category of AI-specific notified bodies (distinct from the product notified bodies under New Legislative Framework directives). As of mid-2026, the EU AI Act notified body accreditation process is in early stages across Member States. Article 43(3) for GPAI-based systems: if a high-risk AI system is built on top of a General-Purpose AI (GPAI) model (e.g., an LLM foundation model accessed via API), the provider of the high-risk AI system must still complete conformity assessment — they cannot rely on the GPAI model provider\'s compliance. The GPAI model provider has separate obligations under Chapter V (Articles 51-56). The provider integrating the GPAI model into a high-risk application remains responsible for the full conformity assessment. What conformity assessment covers (requirements from Articles 9-15): (1) Article 9 — Risk management system: a documented, continuous process throughout the AI system lifecycle to identify, analyze, estimate, and mitigate risks. Risk management documentation must include: identification of known and foreseeable risks (including misuse scenarios), estimate and evaluation of risks, adoption of risk mitigation measures, testing procedures. (2) Article 10 — Data and data governance: training, validation, and testing datasets must be subject to appropriate data governance practices: relevance, representativeness, freedom from errors, completeness. Particular attention to bias and errors that could lead to discriminatory outcomes. (3) Article 11 — Technical documentation: the provider must maintain technical documentation demonstrating compliance before placing the system on the market. The required content is set out in Annex IV (general description, design specifications, training data, testing results, monitoring, instructions for use). (4) Article 12 — Record-keeping: high-risk AI systems must automatically record certain events (logs) throughout their operation — particularly for systems with significant autonomy or whose inputs/outputs affect human decisions. (5) Article 13 — Transparency and provision of information to deployers: must include an instructions for use document covering identity of the provider, capabilities and limitations, accuracy metrics and performance on test data, expected lifetime and maintenance requirements, human oversight requirements. (6) Article 14 — Human oversight: the AI system must be designed to allow humans to monitor and, where necessary, interrupt or override the system. (7) Article 15 — Accuracy, robustness, cybersecurity: technical robustness to operate with appropriate levels of accuracy throughout the lifecycle, including resilience to errors and third-party manipulation.',
  },
  {
    q: 'What is the EU AI Act compliance timeline, and what obligations came into force on which dates?',
    a: 'The EU AI Act (Regulation (EU) 2024/1689) entered into force on August 1, 2024 (20 days after publication in the Official Journal on July 12, 2024). The compliance timeline follows a phased approach with multiple application dates. Phase 1 — February 2, 2025 (6 months after entry into force): Chapter I (General Provisions) and Chapter II (Prohibited AI Systems — Article 5) become applicable. What this means: the prohibitions on unacceptable risk AI practices (subliminal manipulation systems, exploitation of vulnerabilities, biometric categorization for sensitive characteristics without authorization, social scoring by public authorities, real-time remote biometric identification in public spaces by law enforcement without authorization) are fully enforceable from February 2025. AI providers whose systems fall into prohibited categories had until February 2025 to discontinue or modify those systems. Phase 2 — August 2, 2025 (12 months after entry into force): GPAI model obligations (Chapter V — Articles 51-56) become applicable. General-purpose AI model providers (providers of foundation models / large language models released for general use) must: (a) maintain up-to-date technical documentation; (b) make available information and documentation to providers building on their models; (c) establish a policy to comply with EU copyright law; (d) publish a summary of training data. GPAI models with "systemic risk" (those trained on compute above 10^25 FLOPs — currently including GPT-4 class models and successors) have additional obligations: adversarial testing (red-teaming), incident reporting, cybersecurity protection. As of August 2025, OpenAI, Google, Anthropic, Meta, and Mistral all have GPAI obligations under the Act. Phase 3 — August 2, 2026 (24 months after entry into force): HIGH-RISK AI SYSTEM obligations for Annex III systems (Chapter III) become fully applicable. This is the most significant application date for AI vendors. By August 2, 2026, providers of high-risk AI systems must: complete conformity assessment (internal or notified body); prepare and maintain technical documentation (Annex IV); establish a quality management system (Article 17); register in the EU AI database (Article 71); affix CE marking; issue EU Declaration of Conformity; implement post-market monitoring; notify serious incidents. Phase 3 exception — AI systems already on the market: high-risk AI systems already placed on the market or put into service before August 2, 2026, have a 2-year grace period (until August 2, 2028) to comply with Chapter III obligations — but only if no substantial modification is made to the system. If a system on the market before August 2, 2026 undergoes a "substantial modification" (significant change to design, intended purpose, performance level, or data used), the system must comply with Chapter III from the date of the modification. Phase 4 — August 2, 2027 (36 months — credit institution specific): high-risk AI systems that are also regulated products covered by specific EU harmonization legislation listed in Annex I (medical devices, machinery, radio equipment, aircraft, vehicles, etc.) have an extended 36-month compliance period for their Chapter III obligations. This delayed timeline applies to AI systems embedded in physical products subject to pre-existing CE marking and product legislation. GPAI model transition: the Article 53 framework for GPAI compliance is being implemented through Codes of Practice developed by the AI Office (established in the European Commission). The GPAI Code of Practice drafting process began in 2024 with input from industry and civil society. EU AI database: the EU AI Act requires registration of high-risk AI systems in a publicly accessible database (Article 71) before the system is placed on the market. The AI Office is establishing this database; providers must register before August 2026.',
  },
  {
    q: 'What Quality Management System (QMS) must AI providers establish for high-risk AI systems, and what does it cover?',
    a: 'Article 17 EU AI Act requires providers of high-risk AI systems to put a quality management system in place before placing their system on the market. The QMS must be documented in writing and cover the entire lifecycle of the AI system. Unlike ISO 9001 or ISO 13485 (the medical device QMS standard), the EU AI Act does not reference a specific international standard — providers may implement the QMS requirements through existing management system frameworks (ISO 9001, ISO/IEC 42001 — the new AI management system standard — or through a bespoke system). Article 17 QMS required elements: (1) A strategy for regulatory compliance — including compliance with conformity assessment procedures and changes management for AI system modifications. The strategy must define how the provider ensures ongoing compliance as the system evolves. (2) Techniques, procedures, and systematic actions to be used for the design, design control, and design verification of the AI system. Includes: a documented development lifecycle (from requirements to deployment), design review processes, and design change control procedures. (3) Techniques, procedures, and systematic actions to be used for the development, quality control, and quality assurance of the AI system. Covers: data quality management for training/validation/test datasets, model performance evaluation methodology, test protocols, performance benchmarking. (4) Examination, test, and validation procedures to be carried out before, during, and after the development of the AI system. Requires documented validation procedures demonstrating the system performs within defined accuracy metrics across the stated intended use cases and user groups. Particular attention to validation across demographic groups to identify and mitigate bias. (5) Technical specifications, including standards to be applied. The EU AI Act anticipates that European harmonized standards will be developed (by CEN/CENELEC) that specify technical requirements for high-risk AI systems. Compliance with harmonized standards creates a presumption of conformity with the corresponding AI Act requirements. ISO/IEC JTC1/SC42 standards (AI trustworthiness, bias, robustness) are relevant reference standards pending harmonized standards development. (6) Systems and procedures for data management, including data collection, data analysis, data labeling, data storage, data filtering, data mining, data aggregation, data retention, and any other operations regarding the data that are performed before and for the purposes of the placing on the market or putting into service of high-risk AI systems. This is a comprehensive data governance requirement covering the entire AI training and validation data lifecycle. (7) The risk management system as set out in Article 9. The QMS must incorporate the Article 9 risk management documentation. (8) The setting-up, implementation, and maintenance of a post-market monitoring system. The QMS must define how post-market performance data will be collected, analyzed, and used to trigger post-market corrective actions. (9) Procedures related to the reporting of serious incidents. Must define incident detection, classification (serious vs non-serious), notification procedures to market surveillance authorities, and corrective action timelines. (10) The handling of communication with national competent authorities, other relevant authorities, customers, and other relevant stakeholders. (11) Systems and procedures for record-keeping. Must define what records are maintained, for how long, and in what format. The EU AI Act requires technical documentation to be maintained for 10 years after the system is last placed on the market. (12) Resource management, including security of supply related measures. Must document adequate resources (human expertise, computational infrastructure, data access) to maintain the system throughout its lifecycle. (13) An accountability framework setting out the responsibilities of the management and other staff with regard to all aspects covered by the QMS. The QMS must assign specific roles and responsibilities — who owns risk management, who signs off on training data decisions, who triggers post-market corrective actions. Relationship between QMS and ISO/IEC 42001: ISO/IEC 42001:2023 (published December 2023) is the first international AI management system standard. It is not specifically harmonized with the EU AI Act (that process is ongoing through CEN/CENELEC), but its structure maps closely to Article 17 requirements and organizations implementing ISO 42001 will have covered most of the QMS foundations. Key practical difference: ISO 42001 covers AI governance at the organizational level; Article 17 requires a product-specific QMS for each individual high-risk AI system placed on the market.',
  },
  {
    q: 'Who is an AI "provider" vs "deployer" under the EU AI Act, and what happens when an AI vendor sells to an enterprise customer who uses the system for high-risk purposes?',
    a: 'The provider/deployer distinction is one of the most commercially significant aspects of the EU AI Act for B2B AI vendors, because it determines who bears the primary compliance obligations. Definitions: "Provider" means a natural or legal person, public authority, agency or other body that develops an AI system or a general-purpose AI model or that has an AI system or a general-purpose AI model developed and places it on the market or puts it into service under its own name or trademark, whether for payment or free of charge. "Deployer" means a natural or legal person, public authority, agency or other body that uses an AI system under its own authority except where the AI system is used in the course of a personal non-professional activity. The B2B AI vendor scenario: Company A (an AI vendor) builds and sells an AI decision-support tool for credit assessment. Company B (a bank) purchases Company A\'s tool and uses it to make credit decisions. In this scenario: Company A is the provider — it has the full Chapter III obligations for high-risk AI systems (QMS, conformity assessment, CE marking, technical documentation, EU AI database registration, post-market surveillance, serious incident reporting). Company B is the deployer — it has a more limited set of obligations. The deployer\'s obligations (Article 26): (a) use the AI system in accordance with the instructions for use provided by the provider; (b) assign human oversight to appropriately trained personnel; (c) ensure inputs relevant to the AI system\'s intended purpose are under human oversight; (d) monitor the system\'s performance and, if the system is a high-risk system, establish relevant policies for such monitoring; (e) notify the provider without undue delay if the deployer identifies a risk or serious incident; (f) maintain logs generated by the high-risk AI system (where the deployer has control over logs) for at least 6 months. The liability shift: if the deployer modifies the AI system\'s intended purpose — using it for a purpose beyond what the provider designed and tested — the deployer effectively becomes a provider for that use case and takes on full provider obligations. Similarly, if the deployer makes a "substantial modification" to the AI system (changing parameters, retraining on new data, modifying the model architecture), the deployer becomes a provider for the modified system. Contractual allocation — provider-deployer agreements: the EU AI Act creates a new category of AI vendor contract obligations. AI vendor agreements sold to EU deployers must: (a) clearly define the intended purpose (the purposes the provider has designed, tested, and for which conformity assessment was conducted); (b) specify the limitations and performance boundaries of the AI system; (c) define what constitutes a "substantial modification" that would shift provider obligations to the deployer; (d) include the instructions for use required by Article 13; (e) specify the logs that the deployer must maintain. The "off-the-shelf" AI tool challenge: providers of general-purpose AI APIs (LLM APIs used by enterprise customers to build applications) occupy a challenging position. If the API is used by an enterprise customer to build a high-risk application (e.g., a credit risk model built on GPT-4 via API), the enterprise customer (who built the application) is typically the provider of the high-risk AI system, not the API vendor. But if the API vendor marketed the API specifically for high-risk use cases (HR screening, credit assessment), the analysis becomes more complex. The Commission\'s position in recital (82) of the AI Act: where a provider places an AI system on the market that can be used by a deployer to develop a high-risk AI system, the deployer who places the resulting system on the market is the provider of that resulting high-risk AI system.',
  },
  {
    q: 'What are the obligations for General-Purpose AI (GPAI) models under the EU AI Act, and which AI providers are subject to systemic risk rules?',
    a: 'Chapter V of the EU AI Act (Articles 51-56) creates a new regulatory framework specifically for General-Purpose AI (GPAI) models — large AI models trained on broad sets of data using self-supervision at scale that can be adapted to a wide range of tasks. This framework became applicable from August 2, 2025. Definition of GPAI model (Article 3(63)): an AI model trained with a large amount of data using self-supervision at scale, that displays significant generality and is capable of competently performing a wide range of distinct tasks regardless of the way the model is placed on the market, including where the model is fine-tuned, updated with further training, distilled, or customized, and that may be used as a component of downstream AI systems or applications. This definition covers: large language models (GPT-4, Claude, Gemini, LLaMA, Mistral, etc.), multimodal foundation models, large image generation models, code generation models. It does NOT typically cover narrow AI models trained for a specific task (spam filters, image classifiers trained for a specific use case, recommendation engines). The two-tier GPAI framework: Tier 1 — All GPAI models (Article 53): all GPAI model providers (including open-source providers, with limited exceptions for open-source models released with open weights) must: (a) draw up and keep up-to-date technical documentation (content defined in Annex XI) including: model architecture, training methodology, training data sources and summary of training data, compute used for training, intended uses, results of evaluations and benchmarking. (b) Make available documentation to providers of AI systems that integrate the GPAI model, to allow them to understand what they are building on. (c) Establish and implement policies to comply with EU copyright law, including the text and data mining rights framework in the DSM Directive — providers must respect rightsholders\' opt-outs under Article 4(3) TDM Directive. (d) Publish a summary of the content used for training (for transparency to the public and to rightsholders to exercise their rights). Open-source model exception: GPAI models released under open-source or free and open-source licenses where the model weights are publicly released may benefit from reduced obligations — specifically, they may be exempt from the documentation-sharing and copyright transparency obligations (but not from systemic risk obligations if applicable). Tier 2 — GPAI models with systemic risk (Articles 51, 55): GPAI models classified as presenting systemic risk have additional obligations. Classification: a GPAI model is classified as having systemic risk if: (a) it is trained on compute exceeding 10^25 floating point operations (FLOPs) — this is a bright-line threshold that currently captures: GPT-4 and successors, Gemini Ultra, Claude 3 Opus and successors, some Llama models. The threshold may be updated by the Commission. (b) The European Commission may also designate a model as systemic risk based on qualitative criteria (actual or reasonably foreseeable impact, capabilities in critical sectors, access by 10,000+ users, concentration risk). Systemic risk additional obligations: (a) Perform model evaluations including adversarial testing (red-teaming) — evaluating the model\'s capabilities and limitations in areas including but not limited to CBRN risks (chemical, biological, radiological, nuclear), cybersecurity, disinformation generation, mass surveillance. (b) Notify the AI Office of serious incidents — incidents attributable to the GPAI model that cause death, serious physical or psychological harm, serious damage to critical infrastructure, or serious harm to the general public — within 2 weeks of becoming aware. (c) Implement cybersecurity measures at a level commensurate with the systemic risk. (d) Maintain energy efficiency documentation. The Codes of Practice: Article 56 of the EU AI Act authorizes the AI Office to facilitate voluntary Codes of Practice for GPAI compliance. Major AI providers (including OpenAI, Google, Anthropic, Meta) have been participating in the GPAI Code of Practice drafting process coordinated by the AI Office. Adherence to the Code of Practice creates a presumption of conformity with the corresponding GPAI obligations. Enforcement: GPAI model providers are primarily supervised by the AI Office at the EU level (not national market surveillance authorities). The AI Office can investigate, sanction, and require corrective actions from GPAI model providers regardless of where in the EU the provider is established.',
  },
]

export default function EuAiActHighRiskGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'EU AI Act High-Risk AI Systems Guide (2025): Annex III Categories, Conformity Assessment, CE Marking, QMS, GPAI',
    description: 'EU AI Act Annex III high-risk AI system compliance: 8 categories, conformity assessment routes (internal vs notified body), QMS requirements, compliance timeline (Feb 2025/Aug 2025/Aug 2026), provider vs deployer obligations, and GPAI model systemic risk rules.',
    url: 'https://bizlegal-ai.com/guides/eu-ai-act-high-risk-ai-systems-guide',
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
      { '@type': 'ListItem', position: 3, name: 'EU AI Act High-Risk AI Systems Guide', item: 'https://bizlegal-ai.com/guides/eu-ai-act-high-risk-ai-systems-guide' },
    ],
  }

  const ANNEX_III_TABLE = [
    { cat: '1', domain: 'Biometrics', examples: 'Remote biometric ID in public spaces (law enforcement), emotion recognition, biometric categorization by sensitive attributes', conformity: 'Notified body required for biometric ID; internal assessment for others', selfAssess: '⚠️ Notified body' },
    { cat: '2', domain: 'Critical Infrastructure', examples: 'Safety components in road traffic, water, gas, electricity, digital infrastructure', conformity: 'Notified body required if safety component', selfAssess: '⚠️ Notified body' },
    { cat: '3', domain: 'Education', examples: 'Admission decisions, exam monitoring, student evaluation, adaptive learning paths', conformity: 'Internal (self-assessment)', selfAssess: '✅ Self-assessment' },
    { cat: '4', domain: 'Employment', examples: 'AI resume screening, video interview analysis, performance monitoring, task allocation', conformity: 'Internal (self-assessment)', selfAssess: '✅ Self-assessment' },
    { cat: '5', domain: 'Essential Services', examples: 'Credit scoring, benefits eligibility, insurance pricing, emergency dispatch routing', conformity: 'Internal (self-assessment)', selfAssess: '✅ Self-assessment' },
    { cat: '6', domain: 'Law Enforcement', examples: 'Recidivism prediction, evidence reliability evaluation, criminal profiling, polygraphs', conformity: 'Internal (self-assessment, but deployer is typically law enforcement)', selfAssess: '✅ Self-assessment' },
    { cat: '7', domain: 'Migration & Border', examples: 'Asylum application analysis, border control ID, visa/permit processing, risk assessment', conformity: 'Internal (self-assessment)', selfAssess: '✅ Self-assessment' },
    { cat: '8', domain: 'Justice & Democracy', examples: 'Legal research AI for court decisions, election influence systems', conformity: 'Internal (self-assessment)', selfAssess: '✅ Self-assessment' },
  ]

  const TIMELINE = [
    { date: 'Aug 1, 2024', event: 'AI Act entered into force', impact: 'Countdown begins' },
    { date: 'Feb 2, 2025', event: 'Prohibited practices (Art. 5) applicable', impact: 'Prohibited AI systems must stop immediately' },
    { date: 'Aug 2, 2025', event: 'GPAI model obligations applicable (Ch. V)', impact: 'All GPAI providers: tech docs, copyright policy, systemic risk rules' },
    { date: 'Aug 2, 2026', event: 'High-risk AI system obligations applicable (Ch. III)', impact: 'Full Chapter III compliance required for new Annex III systems' },
    { date: 'Aug 2, 2027', event: 'Annex I regulated products (extended)', impact: 'AI embedded in CE-marked products (medical devices, machinery, vehicles)' },
    { date: 'Aug 2, 2028', event: 'Grace period ends for pre-market systems', impact: 'Systems placed before Aug 2026 must comply (if not substantially modified)' },
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
          EU AI Act High-Risk AI Systems Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          EU AI Act &amp; AI Regulation
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          EU AI Act High-Risk AI Systems Guide (2025): Annex III Categories, Conformity Assessment, CE Marking, Quality Management Systems, and GPAI Obligations
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          The EU AI Act entered into force August 1, 2024. The Chapter III high-risk AI system obligations — the core regulatory burden for AI vendors — become enforceable August 2, 2026 for new systems. If you are a provider of an AI system used for employment screening, credit assessment, education evaluation, biometric identification, or any of the 8 Annex III categories, conformity assessment, a quality management system, CE marking, and registration in the EU AI database are required before you can legally sell in the EU.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>EU AI Act Compliance Timeline</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '420px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Obligation</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Who Is Affected</th>
                </tr>
              </thead>
              <tbody>
                {TIMELINE.map(({ date, event, impact }) => (
                  <tr key={date} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, verticalAlign: 'top', whiteSpace: 'nowrap' }}>{date}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 500, verticalAlign: 'top' }}>{event}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top', opacity: 0.8 }}>{impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Annex III High-Risk AI System Categories</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '560px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Cat.</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Domain</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Examples</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Conformity Assessment Route</th>
                </tr>
              </thead>
              <tbody>
                {ANNEX_III_TABLE.map(({ cat, domain, examples, conformity, selfAssess }) => (
                  <tr key={cat} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, verticalAlign: 'top' }}>{cat}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, verticalAlign: 'top' }}>{domain}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top', opacity: 0.85 }}>{examples}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top' }}>{selfAssess} {conformity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your AI Vendor Agreement for EU AI Act Compliance</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your AI vendor agreement, model API license, or enterprise AI system purchase agreement. BizLegal AI reviews whether the agreement properly allocates provider vs deployer obligations under the EU AI Act, identifies whether the intended purpose clause is narrow enough to keep the deployer within permissible use and avoid triggering de facto provider status, flags missing instructions-for-use documentation requirements (Article 13), checks whether the agreement addresses substantial modification restrictions, and identifies gaps in post-market surveillance cooperation clauses.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your AI Vendor Agreement →
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
            <Link href="/guides/eu-ai-act-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>EU AI Act Overview →</Link>
            <Link href="/guides/ai-governance-framework-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>AI Governance Framework →</Link>
            <Link href="/guides/ai-vendor-due-diligence-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>AI Vendor Due Diligence →</Link>
            <Link href="/guides/saas-vendor-agreement-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Vendor Agreement Review →</Link>
            <Link href="/guides/gdpr-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR Compliance Checklist →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. EU AI Act compliance obligations, Annex III category boundaries, GPAI model thresholds, conformity assessment procedures, and enforcement guidance continue to evolve through AI Office guidelines, harmonized European standards (CEN/CENELEC), Codes of Practice, and national market surveillance authority interpretation. Consult qualified EU AI Act counsel before making compliance decisions.
          </p>
        </footer>

      </main>
    </>
  )
}
