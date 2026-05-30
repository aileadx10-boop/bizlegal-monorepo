export interface AiActQuestionnaire {
  system_name: string
  system_purpose: string
  sector: string
  uses_biometrics: boolean
  interacts_with_public: boolean
  affects_employment: boolean
  affects_education: boolean
  affects_credit_or_insurance: boolean
  affects_law_enforcement: boolean
  affects_migration: boolean
  generates_deepfakes: boolean
}

export type RiskTier = 'unacceptable' | 'high' | 'limited' | 'minimal'

export interface ClassificationResult {
  risk_tier: RiskTier
  article_refs: string[]
  annex_refs: string[]
  rationale: string
  required_actions: string[]
  deadline: string
}

export function classifyRiskTier(q: AiActQuestionnaire): ClassificationResult {
  if (q.uses_biometrics && q.interacts_with_public) {
    return {
      risk_tier: 'unacceptable',
      article_refs: ['Article 5(1)(d)'],
      annex_refs: [],
      rationale: `"${q.system_name}" uses biometric identification on members of the public. Real-time remote biometric identification in publicly accessible spaces is prohibited under Article 5(1)(d) with narrow law enforcement exceptions.`,
      required_actions: ['Immediately cease deployment or obtain law enforcement exception under Art 5(2)', 'Legal review of Art 5 exceptions applicability'],
      deadline: 'Prohibited since 2 February 2025',
    }
  }

  const highRiskReasons: string[] = []
  const annexRefs: string[] = []
  const articleRefs: string[] = ['Article 6(2)']

  if (q.uses_biometrics) {
    highRiskReasons.push('biometric processing')
    annexRefs.push('Annex III, Area 1 (Biometrics)')
  }
  if (q.affects_employment) {
    highRiskReasons.push('employment-related decision-making')
    annexRefs.push('Annex III, Area 4 (Employment)')
  }
  if (q.affects_education) {
    highRiskReasons.push('education access/assessment')
    annexRefs.push('Annex III, Area 3 (Education)')
  }
  if (q.affects_credit_or_insurance) {
    highRiskReasons.push('creditworthiness or insurance assessment')
    annexRefs.push('Annex III, Area 5 (Essential Services)')
  }
  if (q.affects_law_enforcement) {
    highRiskReasons.push('law enforcement application')
    annexRefs.push('Annex III, Area 6 (Law Enforcement)')
  }
  if (q.affects_migration) {
    highRiskReasons.push('migration/asylum/border control')
    annexRefs.push('Annex III, Area 7 (Migration)')
  }

  if (highRiskReasons.length > 0) {
    return {
      risk_tier: 'high',
      article_refs: articleRefs,
      annex_refs: annexRefs,
      rationale: `"${q.system_name}" is classified as high-risk due to: ${highRiskReasons.join(', ')}. Per Article 6(2) and ${annexRefs.join(', ')}, this system must comply with Chapter 2 requirements before the 2 August 2026 deadline.`,
      required_actions: [
        'Establish risk management system (Art 9)',
        'Implement data governance practices (Art 10)',
        'Prepare technical documentation (Art 11)',
        'Implement automatic logging (Art 12)',
        'Ensure transparency to deployers (Art 13)',
        'Design for human oversight (Art 14)',
        'Ensure accuracy, robustness, cybersecurity (Art 15)',
        'Perform conformity assessment (Art 33)',
        'Affix CE marking',
        'Register in EU database',
      ],
      deadline: '2 August 2026',
    }
  }

  if (q.generates_deepfakes || (q.interacts_with_public && !q.uses_biometrics)) {
    const reasons = []
    const arts = []
    if (q.generates_deepfakes) { reasons.push('generates synthetic content'); arts.push('Article 52(3)') }
    if (q.interacts_with_public) { reasons.push('interacts directly with natural persons'); arts.push('Article 52(1)') }

    return {
      risk_tier: 'limited',
      article_refs: arts,
      annex_refs: [],
      rationale: `"${q.system_name}" has limited-risk transparency obligations because it ${reasons.join(' and ')}. Users must be informed they are interacting with AI.`,
      required_actions: [
        'Ensure clear AI disclosure to users',
        ...(q.generates_deepfakes ? ['Label all AI-generated content as artificially generated'] : []),
      ],
      deadline: '2 August 2025 (GPAI) / 2 August 2026 (general)',
    }
  }

  return {
    risk_tier: 'minimal',
    article_refs: [],
    annex_refs: [],
    rationale: `"${q.system_name}" does not fall into prohibited, high-risk, or limited-risk categories. It is classified as minimal risk. No mandatory obligations, but voluntary codes of conduct are encouraged per Article 69.`,
    required_actions: ['Consider adopting voluntary codes of conduct (Art 69)', 'Monitor regulatory guidance for potential reclassification'],
    deadline: 'No mandatory deadline',
  }
}
