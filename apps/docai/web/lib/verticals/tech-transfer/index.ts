import { callClaudeJson } from '../../anthropic'
import { buildShield, type LegalShield } from '../../legal/conductor-shield'
import { TECH_TRANSFER_KB } from './knowledge-base'

export type TemplateType =
  | 'delaware-certificate'
  | 'delaware-bylaws'
  | 'israeli-subsidiary-moa'
  | 'ip-assignment'
  | 'transfer-pricing-policy'
  | 'board-resolution'

export interface TemplateInput {
  template_type: TemplateType
  company_name: string
  parent_jurisdiction?: string
  subsidiary_jurisdiction?: string
  business_description: string
  additional_details?: string
}

export interface TechTransferResult {
  template_type: TemplateType
  generated_template: string
  compliance_checklist: string[]
  tax_considerations: string[]
  citations: { source: string; url: string; relevance: string }[]
  structure_recommendation?: string
  legal_shield: LegalShield
}

const TEMPLATE_LABELS: Record<TemplateType, string> = {
  'delaware-certificate': 'Delaware Certificate of Incorporation',
  'delaware-bylaws': 'Delaware Corporate Bylaws',
  'israeli-subsidiary-moa': 'Israeli Subsidiary Memorandum of Association',
  'ip-assignment': 'IP Assignment Agreement',
  'transfer-pricing-policy': 'Transfer Pricing Policy Document',
  'board-resolution': 'Board Resolution for Cross-Border Transaction',
}

export async function generateTemplate(
  input: TemplateInput,
  consentTimestamp: string
): Promise<TechTransferResult> {
  const kbContext = TECH_TRANSFER_KB
    .filter(item => {
      const typeTopics: Record<string, string[]> = {
        'delaware-certificate': ['delaware', 'incorporation', 'certificate'],
        'delaware-bylaws': ['delaware', 'board', 'governance'],
        'israeli-subsidiary-moa': ['israel', 'subsidiary', 'incorporation'],
        'ip-assignment': ['ip-transfer', 'assignment', 'license'],
        'transfer-pricing-policy': ['transfer-pricing', 'oecd', 'intercompany'],
        'board-resolution': ['board-resolution', 'governance', 'authorization'],
      }
      const relevant = typeTopics[input.template_type] ?? []
      return item.topics.some(t => relevant.includes(t))
    })
    .slice(0, 6)
    .map(item => `[${item.source_name}]\n${item.text}`)
    .join('\n\n')

  const result = await callClaudeJson<{
    generated_template: string
    compliance_checklist: string[]
    tax_considerations: string[]
    structure_recommendation: string
  }>({
    system: `You are a corporate law specialist AI generating standard legal templates for cross-border transactions. Generate a "${TEMPLATE_LABELS[input.template_type]}" template.

CRITICAL RULES:
1. Output is a STANDARD NON-CUSTOMIZED TEMPLATE for founder review
2. Include [PLACEHOLDER] markers for all company-specific details
3. Cite specific statutory provisions (Delaware GCL, Israeli Companies Law, OECD guidelines)
4. Include a compliance checklist and tax considerations
5. Templates are starting points requiring attorney customization

Reference material:
${kbContext}

Return JSON with: generated_template (full template text with placeholders), compliance_checklist (array), tax_considerations (array), structure_recommendation (1-2 paragraphs on optimal structure).`,
    user: `Company: ${input.company_name}
Template: ${TEMPLATE_LABELS[input.template_type]}
Parent Jurisdiction: ${input.parent_jurisdiction || 'Delaware, USA'}
Subsidiary Jurisdiction: ${input.subsidiary_jurisdiction || 'Israel'}
Business: ${input.business_description}
${input.additional_details ? `Additional: ${input.additional_details}` : ''}`,
    maxTokens: 4000,
  })

  const citations = TECH_TRANSFER_KB
    .slice(0, 4)
    .map(item => ({ source: item.source_name, url: item.source_url, relevance: item.topics.join(', ') }))

  return {
    template_type: input.template_type,
    generated_template: result.generated_template,
    compliance_checklist: result.compliance_checklist,
    tax_considerations: result.tax_considerations,
    citations,
    structure_recommendation: result.structure_recommendation,
    legal_shield: buildShield('tech-transfer', consentTimestamp),
  }
}
