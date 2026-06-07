export interface KbItem {
  id: string
  source_name: string
  source_url: string
  jurisdiction: string
  topics: string[]
  text: string
}

export const AI_ACT_KB: KbItem[] = [
  {
    id: 'aiact-art5',
    source_name: 'EU AI Act Article 5 — Prohibited AI Practices',
    source_url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
    jurisdiction: 'EU',
    topics: ['prohibited', 'unacceptable', 'risk-tier'],
    text: 'Article 5 prohibits: (a) subliminal manipulation causing harm, (b) exploiting vulnerabilities of specific groups, (c) social scoring by public authorities, (d) real-time remote biometric identification in public spaces by law enforcement (with exceptions). These constitute "unacceptable risk" AI systems that may not be placed on the market or put into service.',
  },
  {
    id: 'aiact-art6',
    source_name: 'EU AI Act Article 6 — Classification Rules for High-Risk AI',
    source_url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
    jurisdiction: 'EU',
    topics: ['high-risk', 'classification', 'annex-iii', 'risk-tier'],
    text: 'Article 6(1): AI systems that are safety components of products covered by Union harmonisation legislation listed in Annex I are high-risk. Article 6(2): AI systems referred to in Annex III are high-risk, unless they do not pose a significant risk of harm to health, safety, or fundamental rights. Classification depends on intended purpose, severity of harm, probability of materialisation, and number of affected persons.',
  },
  {
    id: 'aiact-art9',
    source_name: 'EU AI Act Article 9 — Risk Management System',
    source_url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
    jurisdiction: 'EU',
    topics: ['high-risk', 'risk-management', 'compliance'],
    text: 'High-risk AI providers must establish and maintain a risk management system that: (a) identifies and analyses known/foreseeable risks, (b) estimates and evaluates risks when the system is used as intended or reasonably foreseeable misuse, (c) evaluates risks from post-market monitoring data, (d) adopts appropriate and targeted risk management measures. Must be iterative and updated throughout the AI system lifecycle.',
  },
  {
    id: 'aiact-art10',
    source_name: 'EU AI Act Article 10 — Data and Data Governance',
    source_url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
    jurisdiction: 'EU',
    topics: ['high-risk', 'data-governance', 'training-data'],
    text: 'Training, validation, and testing datasets shall be subject to data governance including: (a) relevant design choices, (b) data collection processes, (c) data preparation operations, (d) formulation of relevant assumptions, (e) assessment of availability/quantity/suitability, (f) examination for possible biases likely to affect health/safety/fundamental rights, (g) identification of data gaps or shortcomings and mitigation.',
  },
  {
    id: 'aiact-art13',
    source_name: 'EU AI Act Article 13 — Transparency and Information to Deployers',
    source_url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
    jurisdiction: 'EU',
    topics: ['high-risk', 'transparency', 'deployer-obligations'],
    text: 'High-risk AI systems must be designed and developed to ensure their operation is sufficiently transparent for deployers to interpret output and use it appropriately. Must include concise, complete, correct, and clear information covering: intended purpose, level of accuracy/robustness/cybersecurity, known/foreseeable circumstances of misuse, and technical capabilities/limitations.',
  },
  {
    id: 'aiact-art14',
    source_name: 'EU AI Act Article 14 — Human Oversight',
    source_url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
    jurisdiction: 'EU',
    topics: ['high-risk', 'human-oversight', 'hitl'],
    text: 'High-risk AI systems must be designed to allow effective oversight by natural persons during use. Human oversight shall aim to minimise risks to health, safety, or fundamental rights. Oversight measures must enable the person to: (a) fully understand system capacities/limitations, (b) remain aware of automation bias, (c) correctly interpret output, (d) decide not to use the system, (e) intervene or interrupt the system.',
  },
  {
    id: 'aiact-art52',
    source_name: 'EU AI Act Article 52 — Transparency Obligations for Certain AI Systems',
    source_url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
    jurisdiction: 'EU',
    topics: ['limited-risk', 'transparency', 'chatbots', 'deepfakes'],
    text: 'Article 52(1): Providers of AI systems intended to interact with natural persons must ensure the system is designed so that persons are informed they are interacting with an AI system (unless obvious). Article 52(3): Users of AI systems that generate deepfakes must disclose that content has been artificially generated or manipulated. These are "limited risk" transparency obligations.',
  },
  {
    id: 'aiact-annex-iii',
    source_name: 'EU AI Act Annex III — High-Risk AI Areas',
    source_url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
    jurisdiction: 'EU',
    topics: ['high-risk', 'annex-iii', 'classification'],
    text: 'Annex III high-risk areas: (1) Biometrics — remote biometric identification, emotion recognition, biometric categorisation. (2) Critical infrastructure — safety components, digital infrastructure. (3) Education — access determination, performance assessment. (4) Employment — recruitment, job ads, CV screening, promotion, termination. (5) Essential services — creditworthiness, insurance pricing, emergency dispatch. (6) Law enforcement — polygraphs, evidence reliability, profiling. (7) Migration — lie detection, risk assessment. (8) Justice — sentencing, recidivism.',
  },
  {
    id: 'aiact-art27',
    source_name: 'EU AI Act Article 27 — Fundamental Rights Impact Assessment',
    source_url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
    jurisdiction: 'EU',
    topics: ['high-risk', 'fria', 'impact-assessment', 'deployer-obligations'],
    text: 'Before deploying high-risk AI, deployers that are bodies governed by public law or private entities providing public services must perform a fundamental rights impact assessment (FRIA). Assessment must include: description of processes, period/frequency of use, categories of persons/groups affected, specific risks of harm, human oversight measures, measures if risks materialise. Must be notified to the relevant market surveillance authority.',
  },
  {
    id: 'aiact-art33',
    source_name: 'EU AI Act Article 33 — Conformity Assessment',
    source_url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
    jurisdiction: 'EU',
    topics: ['high-risk', 'conformity', 'ce-marking', 'compliance'],
    text: 'Providers of high-risk AI systems must carry out conformity assessment before placing on market or putting into service. For systems in Annex III areas (1) biometrics and (6a) law enforcement: conformity assessment by notified body. For all other high-risk: internal conformity assessment (Annex VI) is sufficient. Must affix CE marking following successful assessment.',
  },
  {
    id: 'aiact-timeline',
    source_name: 'EU AI Act Implementation Timeline',
    source_url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
    jurisdiction: 'EU',
    topics: ['timeline', 'enforcement', 'deadlines'],
    text: 'Key dates: Entry into force: 1 August 2024. Prohibited AI practices (Art 5): apply from 2 February 2025. GPAI rules (Chapter V): apply from 2 August 2025. High-risk AI (Annex III): apply from 2 August 2026. High-risk AI in Annex I products: apply from 2 August 2027. Full penalties regime: fines up to €35M or 7% global turnover for prohibited AI violations; €15M or 3% for other violations.',
  },
  {
    id: 'aiact-gpai',
    source_name: 'EU AI Act Chapter V — General-Purpose AI Models',
    source_url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
    jurisdiction: 'EU',
    topics: ['gpai', 'foundation-models', 'systemic-risk'],
    text: 'GPAI providers must: provide technical documentation, provide information to downstream providers, comply with Copyright Directive, publish summary of training data. GPAI with systemic risk (>10^25 FLOPs threshold): must additionally perform model evaluations, assess/mitigate systemic risks, report serious incidents, ensure adequate cybersecurity. Codes of practice shall be developed by the AI Office.',
  },
]
