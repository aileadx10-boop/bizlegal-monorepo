import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Vendor Due Diligence Guide (2025): EU AI Act Deployer Obligations, GDPR Article 22, Model Cards | BizLegal AI',
  description: 'How to evaluate AI vendors and AI system contracts: EU AI Act obligations on deployers (high-risk AI system requirements), GDPR Article 22 automated decision-making, what to demand in AI vendor contracts (model cards, bias testing, transparency obligations, data usage restrictions, exit rights), and the 10-question AI vendor assessment framework.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/ai-vendor-due-diligence-guide' },
  openGraph: {
    title: 'AI Vendor Due Diligence Guide (2025) — BizLegal AI',
    description: 'EU AI Act deployer obligations, GDPR Article 22 automated decision-making restrictions, AI vendor contract provisions (model cards, bias testing, transparency), and 10-question AI vendor assessment framework for procurement teams.',
    url: 'https://bizlegal-ai.com/guides/ai-vendor-due-diligence-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What obligations does the EU AI Act impose on deployers (organizations that use AI systems) rather than providers (those who build them)?',
    a: 'The EU AI Act (Regulation (EU) 2024/1689, effective August 2024, with phased compliance dates through August 2026-2027) distinguishes between "providers" (who develop or place AI systems on the market) and "deployers" (who use AI systems in a professional context). Deployers are organizations that use AI systems built by providers — which covers every SaaS company that integrates an AI API, every enterprise using an AI-powered HR tool, and every company running AI-assisted decision making. Deployer obligations under the EU AI Act for HIGH-RISK AI systems (the obligations that matter most commercially): (1) Fundamental Rights Impact Assessment (FRIA): Article 27 requires deployers of certain high-risk AI systems to conduct a Fundamental Rights Impact Assessment before deploying the system — identifying potential impacts on health, safety, fundamental rights, democracy, and rule of law. This is a written document that must be kept and made available to market surveillance authorities upon request. (2) Human oversight: Article 26 requires deployers to implement appropriate human oversight during the period of use of the high-risk AI system. Practically: a human reviewer must be able to understand, monitor, intervene, and stop the AI system. (3) Monitoring: deployers must monitor the operation of high-risk AI systems for risks and significant incidents, and report serious incidents to providers and market surveillance authorities. (4) Log retention: deployers must retain automatically generated logs of high-risk AI systems for the period appropriate to their purpose (minimum 6 months for most systems). (5) Instructions for use: deployers must use high-risk AI systems in accordance with the instructions for use provided by the provider. If you use the system beyond the scope of the instructions, you become a provider with the full provider obligation set. (6) Data governance: for systems trained on deployer data, deployers must ensure training data is relevant, representative, and free from errors affecting the system\'s purpose. (7) Employee transparency: Article 26(7) requires deployers to inform workers and workers\' representatives where high-risk AI systems are used that affect their employment relationship, before introducing such systems. (8) Transparency to natural persons: deployers of AI systems that interact directly with natural persons (chatbots, automated support, scoring systems) must inform individuals that they are interacting with an AI system — unless this is obvious from context. What counts as a HIGH-RISK AI system under Annex III: this is the critical threshold. Annex III lists categories: (a) AI systems used for biometric identification; (b) AI in critical infrastructure management; (c) AI in educational and vocational training assessment; (d) AI used in employment screening, CV screening, monitoring during employment, performance evaluation; (e) AI used in access to essential private services (credit scoring, insurance risk assessment); (f) AI used in law enforcement (risk assessment, evidence evaluation); (g) AI used in migration and asylum (risk assessment, identity verification); (h) AI used in administration of justice. The AI Act also prohibits certain practices outright — real-time facial recognition in public spaces, social scoring, subliminal manipulation, exploitation of vulnerabilities. These prohibited uses apply to ALL AI systems regardless of risk level.',
  },
  {
    q: 'What does GDPR Article 22 require regarding automated decision-making, and how does it interact with AI systems?',
    a: 'GDPR Article 22 gives EU/EEA data subjects the right NOT to be subject to a decision based solely on automated processing that produces legal effects or similarly significant effects concerning them. This applies directly to many AI system deployments. What constitutes "automated decision-making" under Article 22: (1) The decision must be "based solely on automated processing" — meaning a human did not make a meaningful contribution to the decision. A rubber-stamp human review (human who always follows the AI recommendation without meaningful evaluation) does not satisfy the human intervention requirement. (2) The decision must produce "legal effects" (job rejection, loan denial, insurance cancellation) or "similarly significant effects" (credit scoring affecting borrowing terms, health assessment affecting treatment, risk scoring affecting insurance premiums). Common AI system deployments that trigger Article 22: (a) AI-powered CV screening and candidate ranking that automatically rejects candidates; (b) AI credit scoring systems that automatically approve or decline applications; (c) Fraud detection systems that automatically block transactions or freeze accounts; (d) AI content moderation that automatically removes content or bans accounts; (e) Insurance risk assessment that automatically adjusts premiums or denies coverage; (f) AI-based performance management that automatically rates employees. When Article 22 applies, the controller must: (1) Provide the right to obtain human review: the data subject has the right to obtain human intervention in the decision, express their point of view, and contest the decision; (2) Explain the logic: Article 22(3) requires controllers to implement suitable measures to safeguard data subjects\' rights and freedoms, including "at least the right to obtain human intervention on the part of the controller, to express their point of view and to contest the decision" — and Article 13/14/15 information rights require explaining "meaningful information about the logic involved, as well as the significance and the envisaged consequences of such processing"; (3) Only allow automated decisions where one of three legal grounds applies: (a) the decision is necessary for entering into or performance of a contract (e.g., automated credit scoring in a lending contract); (b) the decision is authorized by EU or member state law with suitable safeguards; or (c) the data subject has given explicit consent. Profiling vs automated decision-making: "profiling" under GDPR Article 4(4) is "any form of automated processing of personal data consisting of the use of personal data to evaluate certain personal aspects relating to a natural person." Profiling for targeted advertising (without producing legal/significant effects) is regulated by the Transparency and Accountability framework (Articles 13/14/15) but not by the full Article 22 framework. How to document compliance with Article 22: (a) In your Records of Processing Activities (RoPA), identify every AI-powered process that produces decisions affecting individuals; (b) Classify each as Article 22 automated decision-making or "profiling without legal/significant effects"; (c) For Article 22 ADM: document the legal basis, the human review mechanism, and the transparency information provided to data subjects; (d) Update your privacy policy and privacy notices to disclose the existence of automated decision-making, the logic involved, and the right to contest.',
  },
  {
    q: 'What contractual provisions should you demand from an AI vendor before integrating their system into your product?',
    a: 'AI vendor agreements (also called AI API agreements, platform agreements, or model access agreements) require specific provisions that standard SaaS vendor agreements do not address. These provisions protect you from regulatory exposure, data loss, and vendor lock-in. Data usage and training restrictions — the most important provision: AI vendors frequently include provisions in their terms allowing them to use customer inputs (the data you send through the API) to train or improve their models. This creates: (a) Intellectual property risk: your proprietary information (code, customer data, business logic) may be incorporated into the vendor\'s model and returned to other users; (b) GDPR risk: using personal data to train AI models requires a lawful basis and may trigger special category data restrictions (Article 9) and automated decision-making disclosure obligations; (c) Confidentiality risk: confidential client information submitted through the API may be trained into a model accessible to competitors. What to demand: an explicit written contractual prohibition on using your inputs (and any outputs derived from them) for model training, fine-tuning, or improvement purposes. Verify this prohibition is in the data processing agreement (DPA), not just in public terms of service (which can change unilaterally). Model documentation requirements: (a) Model card: a structured document describing the model\'s intended uses, limitations, performance across different groups, evaluation datasets, and known biases. Google, Hugging Face, and responsible AI frameworks publish model cards. Demand a current model card from any AI vendor before deployment; (b) Bias testing results: evidence that the model has been tested for performance disparities across protected characteristics (race, gender, age, disability status). For high-risk AI systems under the EU AI Act, bias testing is a provider obligation — demand the testing documentation; (c) Training data disclosure: at minimum, a description of what data categories were used for training. This is relevant for copyright risk (training on copyrighted material), bias risk, and data privacy risk. Accuracy and performance guarantees: most AI vendor contracts disclaim all warranties about accuracy. For high-stakes use cases (employment, credit, healthcare): (a) demand quantified accuracy metrics (precision, recall, F1 score, AUC) on representative test datasets; (b) demand notification if model accuracy degrades below agreed thresholds; (c) specify the right to audit accuracy on your data at regular intervals; (d) define what constitutes an "error" and establish SLA-equivalent commitments for error rates. Exit rights and data portability: AI system vendor lock-in can be severe because switching AI vendors may require re-training, re-integrating, or rebuilding workflows. Demand: (a) Data export rights: you can export all your inputs, outputs, fine-tuning data, and any model weights you contributed to or paid for; (b) Model access on termination: if you have paid for fine-tuning or custom model training, you have the right to receive the model weights on termination; (c) Transition assistance: the vendor must provide a minimum number of hours of transition support on termination; (d) Non-termination of API access during dispute: the vendor cannot terminate API access immediately in a billing dispute — minimum 30-day cure period. Security and confidentiality: AI systems process potentially sensitive data through cloud infrastructure. Require: (a) ISO 27001 certification or SOC 2 Type II report (at minimum); (b) Data processing agreement (DPA) compliant with GDPR Article 28 — identifying sub-processors, requiring DPA with each, specifying transfer mechanisms for non-EU processing; (c) Incident notification within 24-72 hours; (d) Data residency options if your industry or customers require EU data to remain in the EU.',
  },
  {
    q: 'What is an algorithmic impact assessment (AIA) and when is it legally required?',
    a: 'An algorithmic impact assessment (AIA) is a structured evaluation of the potential benefits and harms of deploying an AI or automated decision-making system — particularly regarding fairness, bias, transparency, accountability, and fundamental rights. AIAs draw from several established frameworks: the GDPR Data Protection Impact Assessment (DPIA), the EU AI Act Fundamental Rights Impact Assessment (FRIA), and the NIST AI Risk Management Framework (AI RMF). When is an AIA legally required? (1) GDPR Data Protection Impact Assessment (DPIA): required under Article 35 when processing is "likely to result in a high risk to the rights and freedoms of natural persons." The EDPB has identified specific triggers requiring a DPIA, including: systematic and extensive profiling or automated decision-making with significant effects; large-scale processing of sensitive (special category) data; systematic monitoring on a large scale; new technologies; innovative uses. For AI systems: any AI system that profiles individuals, makes automated decisions about individuals, or processes large-scale personal data almost certainly requires a DPIA before deployment. (2) EU AI Act Fundamental Rights Impact Assessment (FRIA): Article 27 requires deployers of HIGH-RISK AI systems used in certain contexts (see FAQ 1) to conduct an FRIA before deployment. The FRIA must: (a) describe the deployer and the AI system; (b) describe the deploying context, purpose, and period of use; (c) identify natural persons and groups at risk; (d) identify risks to fundamental rights and potential remedies; (e) identify measures taken to address identified risks. (3) US regulatory context: no federal law explicitly mandates AIAs, but: (a) Equal Employment Opportunity Commission (EEOC) guidance on AI in hiring suggests employers should assess AI systems for adverse impact on protected classes; (b) Consumer Financial Protection Bureau (CFPB) guidance requires creditors using AI to explain AI-based adverse action reasons; (c) New York City Local Law 144 requires employers using AI in hiring to conduct annual bias audits and publish the results. (4) Colorado AI Act (SB 24-205): effective February 1, 2026. Requires developers and deployers of "high-risk AI systems" to use reasonable care to avoid algorithmic discrimination based on protected characteristics. Deployers must: (a) conduct impact assessments before deploying high-risk AI; (b) maintain records of assessments; (c) notify individuals of consequential decisions; (d) provide explanation of decisions upon request; (e) provide a way to appeal decisions. What an AIA document should contain: (1) System description: what the system does, what data it uses, how decisions are made; (2) Use case scope: what decisions it affects, which individuals are affected, and in what contexts; (3) Benefit analysis: quantified benefits to the organization and potential benefits to affected individuals; (4) Risk identification: potential harms to affected individuals, including physical, financial, psychological, reputational, and societal harms; (5) Bias and fairness analysis: performance metrics disaggregated by protected characteristics (race, gender, age, disability, national origin) — identifying whether the system performs differently for different groups; (6) Mitigation measures: specific measures to reduce identified risks; (7) Residual risk assessment: risks remaining after mitigations; (8) Ongoing monitoring plan: how the system will be monitored post-deployment.',
  },
  {
    q: 'How should AI-generated content and AI-assisted decisions be disclosed to users, and what are the legal requirements?',
    a: 'Transparency about AI-generated content and AI-assisted decisions is increasingly required by law across multiple jurisdictions — and is quickly becoming a baseline consumer expectation regardless of legal mandate. EU AI Act transparency obligations (Article 50): (1) AI systems interacting with natural persons: deployers must inform persons they are interacting with an AI system — unless this is obvious from context. Obligation on deployer. (2) Emotion recognition and biometric categorization systems: persons subject to these systems must be informed. (3) Deep fakes: generated or manipulated image, audio, or video content that creates a false impression must be labeled as artificially generated or manipulated. For legitimate AI-generated artistic or fictional content, a machine-readable disclosure is sufficient. (4) General purpose AI (GPAI) systems: providers of GPAI systems (like GPT-4, Claude, Gemini) must register in the EU database and mark outputs as AI-generated in a way that is machine-detectable. Timing: Article 50 transparency requirements apply from August 2, 2026. US Federal Trade Commission guidance on AI disclosures: the FTC has issued guidance that AI-generated content — particularly in endorsements, testimonials, and marketing materials — must be clearly disclosed. Under the FTC Act\'s prohibition on unfair or deceptive practices: (a) AI-generated reviews presented as authentic human reviews are deceptive; (b) AI-generated social media posts presented as authentic human posts are deceptive; (c) AI avatars or spokespeople presented as real humans are deceptive. The FTC\'s 2023 AI guidance emphasizes that disclosures must be "clear and conspicuous" — a small-print footnote is not sufficient. Employment decisions and AI disclosure: (a) New York City Local Law 144 requires employers to notify all job candidates and employees who reside in NYC at the time of application whether an automated employment decision tool (AEDT) is being used to assess them. Notification must be made before the tool is used, at least 10 business days before using the AEDT to screen candidates or employees. (b) Illinois Artificial Intelligence Video Interview Act: any employer that uses AI to analyze video interviews must notify applicants before the interview that AI may be used to evaluate their facial expression, gestures, and other characteristics. Colorado AI Act: deployers of high-risk AI systems must provide notification to affected individuals before or at the time of a consequential decision (defined as actions that affect health, financial well-being, housing, employment, education, or access to essential services). The notification must explain: what the system is; the type of personal data used; the basis for the decision; and how to appeal. Financial services AI disclosure: CFPB guidance requires that adverse action notices under the Fair Credit Reporting Act (FCRA) and Equal Credit Opportunity Act (ECOA) must explain the specific reasons for adverse decisions — including when those reasons are derived from AI models. "Black box" AI explanations ("your application was declined by our model") do not satisfy adverse action notice requirements. Creditors must identify specific factors (credit utilization, payment history) even when AI drives the decision.',
  },
  {
    q: 'What is the 10-question AI vendor assessment framework, and how should procurement teams use it?',
    a: 'Before signing an AI vendor agreement or integrating an AI API, procurement teams should evaluate the vendor across 10 dimensions. This framework can be used as a vendor assessment checklist for legal review. Question 1 — Data usage policy: Does the vendor\'s contract explicitly prohibit using your inputs to train or improve their models? Does this prohibition apply to all data including queries, prompts, and conversations? Is the prohibition in the DPA (legally binding) not just public terms? Red flags: vague language like "we may use aggregated, de-identified data"; any carve-out for model improvement without your explicit consent. Question 2 — Model documentation: Does the vendor provide a current model card describing intended use, limitations, bias testing results, and training data description? Is the model card updated when the underlying model is updated? Red flags: no model card; "proprietary" refusal to disclose any information about model characteristics. Question 3 — Accuracy and performance metrics: What are the vendor\'s accuracy metrics on representative test datasets? How are accuracy and performance validated for YOUR specific use case? What notification do you receive if model performance degrades? Red flags: no quantified metrics; "accuracy depends on your use case" without further documentation. Question 4 — Bias and fairness testing: Has the vendor tested the model for performance disparities across protected characteristics (race, gender, age, disability)? What bias testing methodology was used? What were the results? Red flags: no bias testing documentation; refusal to share testing results; only aggregate accuracy reported without demographic disaggregation. Question 5 — Sub-processor disclosure: Who processes your data on behalf of the AI vendor? Where is data processed (US, EU, other)? Does the vendor have DPAs with all sub-processors? Do they provide a list of sub-processors and notify you before changes? Red flags: no sub-processor list; "we may use third parties" without identification. Question 6 — Security certifications: Does the vendor hold ISO 27001 certification or SOC 2 Type II report? When were these last issued? Are they available for review? What is the vendor\'s incident response and notification timeline? Red flags: no third-party security audit; certification more than 12 months old. Question 7 — Compliance documentation for high-risk AI systems: For systems you believe are high-risk under the EU AI Act: has the vendor conducted a conformity assessment? Has the system been registered in the EU AI Act database? Is technical documentation available (Article 11)? Red flags: vendor is unaware of EU AI Act requirements; no conformity assessment documentation. Question 8 — Exit and portability rights: Can you export all your data, fine-tuning datasets, and custom model weights on termination? What is the data deletion timeline after termination? What API access is provided during a transition period? Red flags: no data export rights; data deleted within 30 days with no transition period; custom model weights retained by vendor. Question 9 — Intellectual property ownership: Who owns outputs generated by the AI system using your inputs? Do you have the right to use outputs commercially? Does the vendor have any rights to outputs generated from your data? Red flags: ambiguous ownership of outputs; any vendor claim to derivative works created from your data. Question 10 — Insurance and liability: What professional indemnity or cyber liability insurance does the vendor hold? What is the vendor\'s liability cap for AI-related errors (incorrect decisions, bias incidents)? Does the vendor\'s limitation of liability exclude AI-specific harms? Red flags: liability cap limited to fees paid (inadequate for high-stakes AI); no professional indemnity insurance; all AI-related warranties disclaimed.',
  },
]

export default function AIVendorDueDiligenceGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'AI Vendor Due Diligence Guide (2025): EU AI Act Deployer Obligations, GDPR Article 22, Model Cards',
    description: 'EU AI Act deployer obligations, GDPR Article 22 automated decision-making, AI vendor contract provisions, algorithmic impact assessments, AI disclosure requirements, and 10-question vendor assessment framework.',
    url: 'https://bizlegal-ai.com/guides/ai-vendor-due-diligence-guide',
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
      { '@type': 'ListItem', position: 3, name: 'AI Vendor Due Diligence Guide', item: 'https://bizlegal-ai.com/guides/ai-vendor-due-diligence-guide' },
    ],
  }

  const DEPLOYER_OBLIGATIONS = [
    {
      obligation: 'Fundamental Rights Impact Assessment (FRIA)',
      aiActArticle: 'Article 27',
      trigger: 'High-risk AI systems in most Annex III categories (employment, credit, education, critical infrastructure)',
      deadline: 'Before deployment',
      whoMustAct: 'Deployer',
    },
    {
      obligation: 'Human oversight implementation',
      aiActArticle: 'Article 26(1)',
      trigger: 'High-risk AI systems',
      deadline: 'Before and during use',
      whoMustAct: 'Deployer',
    },
    {
      obligation: 'Log retention',
      aiActArticle: 'Article 26(6)',
      trigger: 'High-risk AI systems with automatic log generation',
      deadline: 'Ongoing — minimum 6 months',
      whoMustAct: 'Deployer',
    },
    {
      obligation: 'Worker notification',
      aiActArticle: 'Article 26(7)',
      trigger: 'Any high-risk AI system affecting employment',
      deadline: 'Before introduction of the system',
      whoMustAct: 'Deployer',
    },
    {
      obligation: 'AI interaction disclosure',
      aiActArticle: 'Article 50(1)',
      trigger: 'AI systems that interact with natural persons',
      deadline: 'August 2, 2026',
      whoMustAct: 'Deployer',
    },
    {
      obligation: 'Deep fake / synthetic content labeling',
      aiActArticle: 'Article 50(4)',
      trigger: 'Any AI-generated or AI-manipulated content creating false impression',
      deadline: 'August 2, 2026',
      whoMustAct: 'Deployer and Provider',
    },
    {
      obligation: 'Serious incident reporting',
      aiActArticle: 'Article 73',
      trigger: 'Serious incidents from high-risk AI systems',
      deadline: 'Immediately upon discovery',
      whoMustAct: 'Deployer notifies Provider; Provider reports to market surveillance authority',
    },
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
          AI Vendor Due Diligence Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          AI Compliance
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          AI Vendor Due Diligence Guide (2025): EU AI Act Deployer Obligations, GDPR Article 22, and AI Contract Provisions
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Integrating an AI vendor API is not just a technical decision — it is a compliance decision. As a deployer (the organization using the AI system), the EU AI Act imposes obligations on YOU regardless of what the AI provider has done. GDPR Article 22 restricts how you can use automated decisions. And AI vendor contracts routinely contain provisions allowing vendors to train on your data, disclaim all accuracy warranties, and impose no liability for AI-related errors. Procurement without legal review of these provisions creates regulatory, reputational, and financial exposure.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>EU AI Act Deployer Obligations Summary</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '560px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Obligation</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Article</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Trigger</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {DEPLOYER_OBLIGATIONS.map(({ obligation, aiActArticle, trigger, deadline }) => (
                  <tr key={obligation} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: '0.8rem', verticalAlign: 'top' }}>{obligation}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.7, fontSize: '0.76rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{aiActArticle}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.76rem', verticalAlign: 'top' }}>{trigger}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.76rem', verticalAlign: 'top' }}>{deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your AI Vendor Agreement or AI API Contract</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your AI vendor contract, API terms of service, or data processing agreement. BizLegal AI identifies whether the agreement prohibits training on your data, whether the liability provisions adequately cover AI-related errors, whether the DPA satisfies GDPR Article 28 requirements for AI sub-processors, whether you have adequate exit and data portability rights, and whether the agreement assigns high-risk AI Act obligations appropriately between provider and deployer.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your AI Vendor Contract →
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
            <Link href="/guides/eu-ai-act-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>EU AI Act Compliance Guide →</Link>
            <Link href="/guides/ai-governance-framework-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>AI Governance Framework →</Link>
            <Link href="/guides/gdpr-data-processing-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR DPA Guide →</Link>
            <Link href="/guides/saas-vendor-agreement-review-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SaaS Vendor Agreement Review →</Link>
            <Link href="/guides/data-retention-deletion-policy-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Data Retention Policy Guide →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. EU AI Act compliance timelines, deployer obligations, and the classification of AI systems as high-risk are evolving areas of law subject to guidance from the European AI Office and national market surveillance authorities. GDPR Article 22 requirements are subject to interpretation by the European Data Protection Board and national supervisory authorities. US AI regulatory requirements vary by state and sector. Consult qualified legal counsel before procuring AI systems or finalizing AI vendor contracts.
          </p>
        </footer>

      </main>
    </>
  )
}
