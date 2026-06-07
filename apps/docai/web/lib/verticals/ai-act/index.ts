import { callClaudeJson } from '../../anthropic'
import { buildShield, type LegalShield } from '../../legal/conductor-shield'
import { AI_ACT_KB } from './knowledge-base'
import { classifyRiskTier, type AiActQuestionnaire, type ClassificationResult } from './risk-classifier'

export interface AiActAnalysisResult {
  classification: ClassificationResult
  gaps: ComplianceGap[]
  summary: string
  citations: Citation[]
  legal_shield: LegalShield
}

interface ComplianceGap {
  area: string
  requirement: string
  status: 'missing' | 'partial' | 'present'
  article_ref: string
  recommendation: string
}

interface Citation {
  source: string
  url: string
  relevance: string
}

export async function classifyAiSystem(
  questionnaire: AiActQuestionnaire,
  consentTimestamp: string
): Promise<AiActAnalysisResult> {
  const classification = classifyRiskTier(questionnaire)

  const kbContext = AI_ACT_KB
    .filter(item => item.topics.some(t => classification.article_refs.join(' ').includes(t) || classification.annex_refs.join(' ').includes(t) || t === 'risk-tier'))
    .slice(0, 8)
    .map(item => `[${item.source_name}]\n${item.text}`)
    .join('\n\n')

  const result = await callClaudeJson<{ gaps: ComplianceGap[]; summary: string }>({
    system: `You are an EU AI Act compliance analyst. Given a risk classification and system description, identify specific compliance gaps and provide actionable recommendations. Return JSON only with fields: gaps (array of {area, requirement, status, article_ref, recommendation}), summary (2-3 sentence executive summary).

Reference material:
${kbContext}`,
    user: `System: "${questionnaire.system_name}"
Purpose: ${questionnaire.system_purpose}
Sector: ${questionnaire.sector}
Risk Tier: ${classification.risk_tier}
Required Actions: ${classification.required_actions.join('; ')}
Deadline: ${classification.deadline}

Identify compliance gaps for this ${classification.risk_tier}-risk AI system. For each gap, cite the specific EU AI Act article.`,
    maxTokens: 3000,
  })

  const citations = kbContext
    ? AI_ACT_KB.slice(0, 5).map(item => ({ source: item.source_name, url: item.source_url, relevance: item.topics.join(', ') }))
    : []

  return {
    classification,
    gaps: result.gaps,
    summary: result.summary,
    citations,
    legal_shield: buildShield('ai-act', consentTimestamp),
  }
}

export async function analyzeAiActDocument(
  documentText: string,
  consentTimestamp: string
): Promise<AiActAnalysisResult> {
  const kbContext = AI_ACT_KB
    .slice(0, 10)
    .map(item => `[${item.source_name}]\n${item.text}`)
    .join('\n\n')

  const result = await callClaudeJson<{
    classification: { risk_tier: string; rationale: string; article_refs: string[]; annex_refs: string[]; required_actions: string[]; deadline: string }
    gaps: ComplianceGap[]
    summary: string
  }>({
    system: `You are an EU AI Act compliance analyst. Analyze the uploaded AI system documentation and:
1. Classify the risk tier (unacceptable/high/limited/minimal)
2. Identify compliance gaps against EU AI Act requirements
3. Provide actionable recommendations

Return JSON only with fields:
- classification: {risk_tier, rationale, article_refs[], annex_refs[], required_actions[], deadline}
- gaps: [{area, requirement, status: "missing"|"partial"|"present", article_ref, recommendation}]
- summary: executive summary (2-3 sentences)

Reference material:
${kbContext}`,
    user: `Analyze this AI system documentation for EU AI Act compliance:\n\n${documentText.slice(0, 60000)}`,
    maxTokens: 4000,
  })

  return {
    classification: {
      risk_tier: result.classification.risk_tier as ClassificationResult['risk_tier'],
      article_refs: result.classification.article_refs,
      annex_refs: result.classification.annex_refs,
      rationale: result.classification.rationale,
      required_actions: result.classification.required_actions,
      deadline: result.classification.deadline,
    },
    gaps: result.gaps,
    summary: result.summary,
    citations: AI_ACT_KB.slice(0, 5).map(item => ({ source: item.source_name, url: item.source_url, relevance: item.topics.join(', ') })),
    legal_shield: buildShield('ai-act', consentTimestamp),
  }
}
