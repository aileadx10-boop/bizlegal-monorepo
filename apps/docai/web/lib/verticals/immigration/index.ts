import { callClaudeJson } from '../../anthropic'
import { buildShield, type LegalShield } from '../../legal/conductor-shield'
import { IMMIGRATION_KB } from './knowledge-base'
import { VISA_TYPES, findVisaType } from './visa-types'

export interface ImmigrationIntake {
  visa_preference?: string
  petitioner_name: string
  petitioner_ein?: string
  beneficiary_name: string
  beneficiary_nationality: string
  beneficiary_education: string
  position_title: string
  position_duties: string
  salary?: string
  additional_context?: string
}

export interface ImmigrationResult {
  recommended_visa: string
  visa_details: ReturnType<typeof findVisaType>
  petition_draft: string
  checklist: string[]
  citations: { source: string; url: string; relevance: string }[]
  eligibility_assessment: string
  legal_shield: LegalShield
}

export async function draftImmigrationPetition(
  intake: ImmigrationIntake,
  consentTimestamp: string
): Promise<ImmigrationResult> {
  const kbContext = IMMIGRATION_KB
    .filter(item => {
      if (intake.visa_preference) {
        return item.topics.some(t => t.toLowerCase().includes(intake.visa_preference!.toLowerCase()))
      }
      return true
    })
    .slice(0, 8)
    .map(item => `[${item.source_name}]\n${item.text}`)
    .join('\n\n')

  const visaList = VISA_TYPES.map(v => `${v.code}: ${v.name} (${v.category})`).join('\n')

  const result = await callClaudeJson<{
    recommended_visa: string
    eligibility_assessment: string
    petition_draft: string
    checklist: string[]
  }>({
    system: `You are an immigration law specialist AI. Given petitioner/beneficiary information, you must:
1. Recommend the most appropriate visa category
2. Assess eligibility against statutory requirements
3. Draft a petition support letter
4. Provide a document checklist

CRITICAL: Every statement must cite specific INA sections or CFR provisions. If unsure, say "requires attorney verification."

Available visa categories:
${visaList}

Reference material:
${kbContext}

Return JSON with: recommended_visa (visa code), eligibility_assessment (2-3 paragraphs), petition_draft (formal support letter, 3-5 paragraphs), checklist (array of required documents/steps).`,
    user: `Petitioner: ${intake.petitioner_name}${intake.petitioner_ein ? ` (EIN: ${intake.petitioner_ein})` : ''}
Beneficiary: ${intake.beneficiary_name}, ${intake.beneficiary_nationality}
Education: ${intake.beneficiary_education}
Position: ${intake.position_title}
Duties: ${intake.position_duties}
${intake.salary ? `Salary: ${intake.salary}` : ''}
Visa preference: ${intake.visa_preference || 'recommend best fit'}
${intake.additional_context ? `Additional context: ${intake.additional_context}` : ''}

Draft the petition and provide the checklist.`,
    maxTokens: 4000,
  })

  const visa = findVisaType(result.recommended_visa)

  const citations = IMMIGRATION_KB
    .filter(item => item.topics.some(t => result.recommended_visa.toLowerCase().includes(t)))
    .slice(0, 5)
    .map(item => ({ source: item.source_name, url: item.source_url, relevance: item.topics.join(', ') }))

  return {
    recommended_visa: result.recommended_visa,
    visa_details: visa,
    petition_draft: result.petition_draft,
    checklist: result.checklist,
    citations,
    eligibility_assessment: result.eligibility_assessment,
    legal_shield: buildShield('immigration', consentTimestamp),
  }
}
